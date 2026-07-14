// src/modules/organization/organization-invite.repo.ts

import { organizationInvites, organizations, roles, users } from "@syncr/db";
import {
  and,
  eq,
  gt,
  type InferInsertModel,
  type InferSelectModel,
  sql,
} from "drizzle-orm";
import { BaseRepo } from "../../../core/base/base.repo";
import { Errors } from "../../../errors";

export type OrganizationInvite = InferSelectModel<typeof organizationInvites>;
export type NewOrganizationInvite = InferInsertModel<
  typeof organizationInvites
>;

export class OrganizationInviteRepo extends BaseRepo {
  async create(data: NewOrganizationInvite) {
    const rows = await this.db
      .insert(organizationInvites)
      .values(data)
      .returning();
    return this.firstOrThrow(rows, Errors.organization.inviteCreateFailed());
  }

  async findById(id: string) {
    const rows = await this.db
      .select()
      .from(organizationInvites)
      .where(eq(organizationInvites.id, id));

    return this.first(rows);
  }

  async findByTokenHash(tokenHash: string) {
    const rows = await this.db
      .select()
      .from(organizationInvites)
      .where(eq(organizationInvites.tokenHash, tokenHash));

    return this.first(rows);
  }

  // Only ONE pending invite per (org, email) should exist at a time —
  // enforced here at read time, not by a DB constraint, because the
  // schema's own comment explains why: a second invite request revokes
  // the first explicitly rather than being blocked, preserving an audit
  // trail of every invite ever sent (see organization-invites.ts).
  async findPendingByOrgAndEmail(organizationId: string, email: string) {
    const rows = await this.db
      .select()
      .from(organizationInvites)
      .where(
        and(
          eq(organizationInvites.organizationId, organizationId),
          sql`lower(${organizationInvites.email}) = lower(${email})`,
          eq(organizationInvites.status, "PENDING"),
        ),
      );

    return this.first(rows);
  }

  async listPendingForOrg(organizationId: string) {
    return this.db
      .select()
      .from(organizationInvites)
      .where(
        and(
          eq(organizationInvites.organizationId, organizationId),
          eq(organizationInvites.status, "PENDING"),
          gt(organizationInvites.expiresAt, new Date()),
        ),
      )
      .orderBy(organizationInvites.createdAt);
  }

  async markAccepted(id: string, acceptedByUserId: string) {
    const rows = await this.db
      .update(organizationInvites)
      .set({
        status: "ACCEPTED",
        acceptedByUserId,
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(organizationInvites.id, id))
      .returning();

    return this.firstOrThrow(rows, Errors.organization.inviteNotFound());
  }

  async markRevoked(id: string) {
    await this.db
      .update(organizationInvites)
      .set({ status: "REVOKED", revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(organizationInvites.id, id));
  }

  // Used by resend() — a new token means a new hash; the old link stops
  // working the moment this runs, which is the correct behavior (only
  // the most recently sent email should ever be valid).
  async updateTokenHash(id: string, tokenHash: string) {
    const rows = await this.db
      .update(organizationInvites)
      .set({ tokenHash, updatedAt: new Date() })
      .where(eq(organizationInvites.id, id))
      .returning();

    return this.firstOrThrow(rows, Errors.organization.inviteNotFound());
  }

  // Atomic increment — this is exactly the operation that was impossible
  // when resentCount was typed text (see organization-invites.ts fix).
  async recordResend(id: string) {
    await this.db
      .update(organizationInvites)
      .set({
        resentCount: sql`${organizationInvites.resentCount} + 1`,
        lastSentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(organizationInvites.id, id));
  }

  async markDeclined(id: string) {
    const [invite] = await this.db
      .update(organizationInvites)
      .set({
        status: "DECLINED",
        updatedAt: new Date(),
      })
      .where(eq(organizationInvites.id, id))
      .returning();

    return invite;
  }

  async findPreviewByTokenHash(tokenHash: string) {
    const [row] = await this.db
      .select({
        invite: organizationInvites,
        organization: {
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
          avatarUrl: organizations.avatarUrl,
        },
        inviter: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        role: {
          id: roles.id,
          name: roles.name,
          slug: roles.slug,
        },
      })
      .from(organizationInvites)
      .innerJoin(
        organizations,
        eq(organizationInvites.organizationId, organizations.id),
      )
      .innerJoin(users, eq(organizationInvites.invitedByUserId, users.id))
      .leftJoin(roles, eq(organizationInvites.roleId, roles.id))
      .where(eq(organizationInvites.tokenHash, tokenHash));

    return row;
  }
}
