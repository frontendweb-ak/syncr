// src/modules/organization/organization-invite.service.ts

import { randomBytes, createHash } from "node:crypto";
import type { EmailService } from "@syncr/notifications";
import type { Logger } from "pino";
import type { AppConfig } from "../../config";
import type { RepoContext } from "../../core/base/base.repo";
import { LoggedService } from "../../core/base/logger.service";
import { Errors } from "../../errors";
import type { JwtService } from "../../lib";
import { MemberRoleRepo } from "../rbac/member-role.repo";
import { RoleRepo } from "../rbac/role.repo";
import { SYSTEM_ROLE_SLUGS } from "../rbac/role-slugs";
import { OrganizationMemberRepo } from "./organization-member.repo";
import { OrganizationInviteRepo, type OrganizationInvite } from "./organization-invite.repo";
import { OrganizationRepo } from "./organization.repo";
import { OrganizationService } from "./organization.service";
import { WorkspaceRepo } from "./workspace.repo";

const INVITE_EXPIRY_DAYS = 7;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export class OrganizationInviteService extends LoggedService {
  private readonly inviteRepo: OrganizationInviteRepo;
  private readonly memberRepo: OrganizationMemberRepo;
  private readonly orgRepo: OrganizationRepo;
  private readonly roleRepo: RoleRepo;
  private readonly memberRoleRepo: MemberRoleRepo;
  private readonly workspaceRepo: WorkspaceRepo;
  private readonly orgService: OrganizationService;
  private readonly email: EmailService;

  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
    email: EmailService,
  ) {
    super(db, jwt, config, logger);
    this.inviteRepo = new OrganizationInviteRepo(db);
    this.memberRepo = new OrganizationMemberRepo(db);
    this.orgRepo = new OrganizationRepo(db);
    this.roleRepo = new RoleRepo(db);
    this.memberRoleRepo = new MemberRoleRepo(db);
    this.workspaceRepo = new WorkspaceRepo(db);
    this.orgService = new OrganizationService(db, jwt, config, logger);
    this.email = email;
  }

  private async sendInviteEmail(invite: OrganizationInvite, rawToken: string) {
    const org = await this.orgRepo.findById(invite.organizationId);
    if (!org) return; // shouldn't happen — org FK is NOT NULL — but email is never worth crashing the request over

    const acceptUrl = `${this.config.APP_URL}/invites/accept?token=${rawToken}`;

    // TODO: organizationInviteTemplate doesn't exist in @syncr/notifications
    // yet — it needs the same treatment as verifyEmailTemplate /
    // forgotPasswordTemplate (subject/html/text, org name + inviter name
    // + acceptUrl). Stubbing the call shape here so the service is
    // correct once that template lands, rather than inlining raw HTML
    // in a service file (every other email in this codebase goes
    // through a template function, not ad hoc markup).
    const template = {
      subject: `You've been invited to join ${org.name} on Syncr`,
      html: `<p>You've been invited to join ${org.name}. <a href="${acceptUrl}">Accept invite</a></p>`,
      text: `You've been invited to join ${org.name}. Accept: ${acceptUrl}`,
    };

    await this.email.send({
      to: invite.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: { type: "organization_invite" },
    });
  }


  async create(input: {
    organizationId: string;
    invitedByUserId: string;
    email: string;
    roleId?: string;
  }): Promise<{ invite: OrganizationInvite; rawToken: string }> {
    await this.orgService.requireOrgManager(input.organizationId, input.invitedByUserId);

    const email = input.email.trim().toLowerCase();

    // NOTE: not checking "is this email already an active member" here
    // because that needs a users-by-email lookup this service doesn't
    // own. The intended flow is: controller/UserService checks that
    // first if it wants a nicer error message ("already a member" vs a
    // generic invite). This service's job starts at "send an invite,"
    // and it still works correctly even if that pre-check is skipped —
    // accept() re-validates membership state regardless, so this is a
    // UX nicety, not a correctness gap.

    const existingInvite = await this.inviteRepo.findPendingByOrgAndEmail(
      input.organizationId,
      email,
    );
    if (existingInvite) {
      // Per the schema's own design comment: don't error, revoke the old
      // one and issue a new one — preserves the audit trail of every
      // invite ever sent rather than silently updating in place.
      await this.inviteRepo.markRevoked(existingInvite.id);
    }

    if (input.roleId) {
      const role = await this.roleRepo.findById(input.roleId);
      if (!role) throw Errors.organization.roleNotFound();
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const invite = await this.inviteRepo.create({
      organizationId: input.organizationId,
      email,
      invitedByUserId: input.invitedByUserId,
      roleId: input.roleId,
      tokenHash,
      expiresAt,
    });

    await this.sendInviteEmail(invite, rawToken);

    return { invite, rawToken };
  }

  async resend(inviteId: string, requestingUserId: string) {
    const invite = await this.inviteRepo.findById(inviteId);
    if (!invite) throw Errors.organization.inviteNotFound();

    await this.orgService.requireOrgManager(invite.organizationId, requestingUserId);

    if (invite.status !== "PENDING") {
      throw Errors.organization.inviteNotPending();
    }

    // BUG (caught while writing this): the raw token is never persisted
    // — only tokenHash is, correctly, matching password_reset_tokens'
    // own design. That means "resend" can't actually re-send the
    // ORIGINAL link; there is no original raw token left anywhere to
    // put in an email. It has to mint a fresh token, store its hash
    // (replacing the old one — the old link stops working, which is
    // arguably correct: only the latest email should be valid), and
    // send that. A version of this method that only bumped
    // resentCount without doing this would compile fine and silently
    // send no email at all.
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);

    await this.inviteRepo.recordResend(inviteId);
    const updated = await this.inviteRepo.updateTokenHash(inviteId, tokenHash);

    await this.sendInviteEmail(updated, rawToken);

    return updated;
  }

  async revoke(inviteId: string, requestingUserId: string) {
    const invite = await this.inviteRepo.findById(inviteId);
    if (!invite) throw Errors.organization.inviteNotFound();

    await this.orgService.requireOrgManager(invite.organizationId, requestingUserId);

    if (invite.status !== "PENDING") {
      return; // idempotent — revoking twice, or revoking an already-accepted invite, is a no-op
    }

    await this.inviteRepo.markRevoked(inviteId);
  }

  async listPending(organizationId: string, requestingUserId: string) {
    await this.orgService.requireOrgManager(organizationId, requestingUserId);
    return this.inviteRepo.listPendingForOrg(organizationId);
  }

  // The whole reason organizationInvites.roleId exists. Runs inside a
  // transaction: flip membership to ACTIVE (or create it, for a user
  // accepting their very first invite to this org), assign the invited
  // role (falling back to MEMBER if the invite didn't specify one),
  // grant default-workspace access, mark the invite ACCEPTED. Any
  // failure partway must not leave "accepted invite, but no role" —
  // that's the empty-permission-set trap flagged earlier.
  async accept(rawToken: string, acceptingUserId: string) {
    const tokenHash = hashToken(rawToken);
    const invite = await this.inviteRepo.findByTokenHash(tokenHash);

    if (!invite) throw Errors.organization.inviteInvalid();
    if (invite.status !== "PENDING") throw Errors.organization.inviteNotPending();
    if (invite.expiresAt < new Date()) throw Errors.organization.inviteExpired();

    return this.withTransaction(async (tx) => {
      const scoped = {
        memberRepo: new OrganizationMemberRepo(tx),
        roleRepo: new RoleRepo(tx),
        memberRoleRepo: new MemberRoleRepo(tx),
        workspaceRepo: new WorkspaceRepo(tx),
        inviteRepo: new OrganizationInviteRepo(tx),
      };

      let member = await scoped.memberRepo.findByOrgAndUser(
        invite.organizationId,
        acceptingUserId,
      );

      if (member) {
        if (member.status === "ACTIVE") {
          throw Errors.organization.alreadyMember();
        }
        member = await scoped.memberRepo.activate(member.id);
      } else {
        member = await scoped.memberRepo.create({
          organizationId: invite.organizationId,
          userId: acceptingUserId,
          invitedByUserId: invite.invitedByUserId,
          status: "ACTIVE",
          joinedAt: new Date(),
        });
      }

      const role = invite.roleId
        ? await scoped.roleRepo.findById(invite.roleId)
        : await scoped.roleRepo.findSystemBySlug(SYSTEM_ROLE_SLUGS.MEMBER);

      if (!role) {
        // Either the invite pointed at a role that's since been deleted,
        // or the MEMBER system role is missing from seed data. Either
        // way, this must not silently produce an active member with no
        // role — fail the whole transaction instead.
        throw Errors.organization.systemRoleMissing(SYSTEM_ROLE_SLUGS.MEMBER);
      }

      await scoped.memberRoleRepo.assign({
        organizationMemberId: member.id,
        roleId: role.id,
        assignedByUserId: invite.invitedByUserId,
      });

      const defaultWorkspace = await scoped.workspaceRepo.findDefaultForOrg(
        invite.organizationId,
      );
      if (defaultWorkspace) {
        await scoped.workspaceRepo.grantAccess({
          workspaceId: defaultWorkspace.id,
          organizationMemberId: member.id,
          isDefault: true,
        });
      }

      await scoped.inviteRepo.markAccepted(invite.id, acceptingUserId);

      return { member, organizationId: invite.organizationId, roleSlug: role.slug };
    });
  }
}
