// src/modules/organization/organization.service.ts
//
// Owns organization creation end-to-end — org row + OWNER membership +
// OWNER role assignment + default workspace + workspace access, all in
// one transaction. This is intentionally one service method per
// "moment" (personal org on register, explicit team org creation)
// rather than exposing the individual repo calls to controllers —
// getting the sequence right (and atomic) is the whole point.

import { SYSTEM_ROLE_SLUGS } from "@syncr/types";
import type { Logger } from "pino";
import type { AppConfig } from "../../config";
import type { RepoContext } from "../../core/base/base.repo";
import { LoggedService } from "../../core/base/logger.service";
import { Errors } from "../../errors";
import type { JwtService } from "../../lib";
import { MemberRoleRepo } from "../rbac/member-role.repo";
import { RoleRepo } from "../role/role.repo";
import { OrganizationMemberRepo } from "./member/organization-member.repo";
import { type Organization, OrganizationRepo } from "./organization.repo";
import { WorkspaceRepo } from "./workspace.repo";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export class OrganizationService extends LoggedService {
  private readonly orgRepo: OrganizationRepo;
  private readonly memberRepo: OrganizationMemberRepo;
  private readonly workspaceRepo: WorkspaceRepo;
  private readonly roleRepo: RoleRepo;
  private readonly memberRoleRepo: MemberRoleRepo;

  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger?: Logger,
  ) {
    super(db, jwt, config, logger);
    this.orgRepo = new OrganizationRepo(db);
    this.memberRepo = new OrganizationMemberRepo(db);
    this.workspaceRepo = new WorkspaceRepo(db);
    this.roleRepo = new RoleRepo(db);
    this.memberRoleRepo = new MemberRoleRepo(db);
  }

  private async uniqueSlug(desired: string): Promise<string> {
    const base = slugify(desired) || "org";
    let candidate = base;
    let suffix = 0;

    // Collision handling matters more here than almost anywhere else in
    // the schema — this runs on every single registration, not an
    // occasional admin action.
    while (await this.orgRepo.existsBySlug(candidate)) {
      suffix += 1;
      candidate = `${base}-${suffix}`;
    }

    return candidate;
  }

  // Called once, from AuthService.registerEmail and the new-user branch
  // of loginWithGoogle — both already run inside withTransaction, so
  // this method does NOT open its own transaction. It assumes it's
  // already inside one; calling it standalone outside a transaction is
  // a caller bug, not something this method guards against, because
  // BaseService.withTransaction already throws clearly if misused (see
  // core/base/base.service.ts).
  async createPersonalOrganization(input: {
    userId: string;
    userName: string;
  }): Promise<Organization> {
    const slug = await this.uniqueSlug(`${input.userName}-personal`);

    const org = await this.orgRepo.create({
      ownerUserId: input.userId,
      slug,
      name: `${input.userName}'s Workspace`,
      isPersonal: true,
      plan: "FREE",
    });

    await this.bootstrapOwnerMembership(org, input.userId);

    return org;
  }

  // The explicit "create a team org" action — an already-authenticated
  // user spinning up Acme Inc. Same bootstrap, different trigger.
  async createOrganization(input: {
    userId: string;
    name: string;
    slug?: string;
  }): Promise<Organization> {
    const slug = input.slug
      ? slugify(input.slug)
      : await this.uniqueSlug(input.name);

    if (input.slug && (await this.orgRepo.existsBySlug(slug))) {
      throw Errors.organization.slugTaken();
    }

    return this.withTransaction(async (tx) => {
      const scoped = new OrganizationService(
        tx,
        this.jwt,
        this.config,
        this.logger,
      );

      const org = await scoped.orgRepo.create({
        ownerUserId: input.userId,
        slug,
        name: input.name,
        isPersonal: false,
        plan: "FREE",
      });

      await scoped.bootstrapOwnerMembership(org, input.userId);

      return org;
    });
  }

  // Shared by both creation paths: membership + OWNER role + default
  // workspace + workspace access. Private because "create an org
  // without an owner membership" should never be a thing a caller can
  // reach for.
  private async bootstrapOwnerMembership(org: Organization, userId: string) {
    const member = await this.memberRepo.create({
      organizationId: org.id,
      userId,
      status: "ACTIVE",
      joinedAt: new Date(),
    });

    const ownerRole = await this.roleRepo.findSystemBySlug(
      SYSTEM_ROLE_SLUGS.OWNER,
    );
    if (!ownerRole) {
      // System roles are seed data, not user input — if this fires, the
      // seed migration didn't run, and every org creation from this
      // point on is silently missing its owner's permissions. Fail loud.
      throw Errors.organization.systemRoleMissing(SYSTEM_ROLE_SLUGS.OWNER);
    }

    await this.memberRoleRepo.assign({
      organizationMemberId: member.id,
      roleId: ownerRole.id,
    });

    const workspace = await this.workspaceRepo.createDefault({
      organizationId: org.id,
      slug: "default",
      name: "Default",
    });

    await this.workspaceRepo.grantAccess({
      workspaceId: workspace.id,
      organizationMemberId: member.id,
      isDefault: true,
    });
  }

  async getById(id: string) {
    const org = await this.orgRepo.findById(id);
    if (!org) throw Errors.organization.notFound();
    return org;
  }

  async getBySlug(slug: string) {
    const org = await this.orgRepo.findBySlug(slug);
    if (!org) throw Errors.organization.notFound();
    return org;
  }

  async listForUser(userId: string) {
    return this.memberRepo.listActiveOrgsForUser(userId);
  }

  async listMembers(organizationId: string) {
    return this.memberRepo.listForOrg(organizationId);
  }

  // Used by AuthService to populate the JWT's role claim — replaces the
  // hardcoded role: "owner" that was there before. "Primary" = highest
  // roles.priority among every role the member holds in their FIRST
  // active org membership (registration guarantees at least one: their
  // personal org). This is a display convenience for the token only —
  // every real authorization decision still has to re-check
  // memberRoles/rolePermissions at request time, never trust the JWT
  // claim as authoritative. A stale JWT with a stale role claim is
  // exactly why authMiddleware's tokenVersion check exists.
  async getPrimaryRoleSlug(userId: string): Promise<string> {
    const memberships = await this.memberRepo.listActiveOrgsForUser(userId);
    const first = memberships[0];
    if (!first) return SYSTEM_ROLE_SLUGS.MEMBER; // no org yet — shouldn't happen post-registration

    const slugs = await this.memberRoleRepo.listSlugsForMember(
      first.membershipId,
    );
    return slugs[0] ?? SYSTEM_ROLE_SLUGS.MEMBER;
  }

  // Guard used by controllers/services gating member/invite/role
  // management. Deliberately a flat role check, not a call into a
  // generic permission-resolution engine — that engine doesn't exist
  // yet (see roadmap: RBAC beyond basic org membership is post-MVP).
  // This is the same shape of decision as ApiKeyService's ownership
  // check: hardcoded for the one rule MVP actually needs, not built as
  // a general-purpose framework speculatively.
  async requireOrgManager(
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const member = await this.memberRepo.findByOrgAndUser(
      organizationId,
      userId,
    );
    if (member == null || member.status !== "ACTIVE") {
      throw Errors.organization.notAMember();
    }

    const slugs = await this.memberRoleRepo.listSlugsForMember(member.id);
    const isManager = slugs.some(
      (s) => s === SYSTEM_ROLE_SLUGS.OWNER || s === SYSTEM_ROLE_SLUGS.ADMIN,
    );

    if (!isManager) {
      throw Errors.auth.permissionDenied("organization:manage_members");
    }
  }

  // Guards against orphaning an org: the member row corresponding to
  // organizations.ownerUserId can never be removed or lose OWNER while
  // still being the recorded owner — ownership transfer (changing
  // ownerUserId) would need to happen first, and isn't built yet. Without
  // this check, "remove member" + "the removed member happened to be the
  // owner" silently produces an org with a full member list and zero
  // OWNERs, which the resource matrix has no defined behavior for.
  async removeMember(
    organizationId: string,
    memberId: string,
    requestingUserId: string,
  ) {
    await this.requireOrgManager(organizationId, requestingUserId);

    const member = await this.memberRepo.findById(memberId);
    if (!member || member.organizationId !== organizationId) {
      throw Errors.organization.memberNotFound();
    }

    const org = await this.getById(organizationId);
    if (org.ownerUserId === member.userId) {
      throw Errors.organization.cannotRemoveOwner();
    }

    await this.memberRoleRepo.revokeAll(memberId);
    await this.memberRepo.remove(memberId);
  }
}
