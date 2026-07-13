// src/modules/organization/organization-member.repo.ts

import { organizationMembers, organizations, users } from "@syncr/db";
import {
  and,
  eq,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import { BaseRepo } from "../../../core/base/base.repo";
import { Errors } from "../../../errors";

export type OrganizationMember = InferSelectModel<typeof organizationMembers>;
export type NewOrganizationMember = InferInsertModel<
  typeof organizationMembers
>;

export class OrganizationMemberRepo extends BaseRepo {
  async create(data: NewOrganizationMember) {
    const rows = await this.db
      .insert(organizationMembers)
      .values(data)
      .returning();
    return this.firstOrThrow(rows, Errors.organization.memberCreateFailed());
  }

  async findByOrgAndUser(organizationId: string, userId: string) {
    const rows = await this.db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.userId, userId),
        ),
      )
      .limit(1);

    return this.first(rows);
  }

  /**
   * The core authorization check every org-scoped route ultimately relies
   * on: is this user an ACTIVE member of this org? Called from the new
   * orgMiddleware below, not just from organization.service.ts directly.
   */
  async isActiveMember(organizationId: string, userId: string): Promise<boolean> {
    const member = await this.findByOrgAndUser(organizationId, userId);
    return member?.status === "ACTIVE";
  }
 
  async findById(id: string) {
    const rows = await this.db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.id, id));
    return this.first(rows);
  }

  async listForOrg(organizationId: string) {
    return this.db
      .select()
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(
        and(
          eq(organizationMembers.organizationId, organizationId),
          eq(organizationMembers.status, "ACTIVE"),
        ),
      )
      .orderBy(organizationMembers.joinedAt);
  }

  // Orgs a user actually belongs to (ACTIVE only) — joined with the org
  // row itself, since "list my orgs" is always what the caller wants
  // this for, never the bare membership row.
  async listActiveOrgsForUser(userId: string) {
    return this.db
      .select()
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.status, "ACTIVE"),
        ),
      );
  }

  async activate(id: string) {
    const rows = await this.db
      .update(organizationMembers)
      .set({ status: "ACTIVE", joinedAt: new Date(), updatedAt: new Date() })
      .where(eq(organizationMembers.id, id))
      .returning();

    return this.firstOrThrow(rows, Errors.organization.memberNotFound());
  }

  async suspend(id: string) {
    await this.db
      .update(organizationMembers)
      .set({
        status: "SUSPENDED",
        suspendedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(organizationMembers.id, id));
  }

  async remove(id: string) {
    await this.db
      .update(organizationMembers)
      .set({ status: "REMOVED", removedAt: new Date(), updatedAt: new Date() })
      .where(eq(organizationMembers.id, id));
  }
}
