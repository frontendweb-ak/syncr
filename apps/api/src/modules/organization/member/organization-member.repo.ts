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
      );

    return this.first(rows);
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
      .select({
        id: organizationMembers.id,
        userId: organizationMembers.userId,
        status: organizationMembers.status,
        joinedAt: organizationMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, organizationId))
      .orderBy(organizationMembers.joinedAt);
  }

  // Orgs a user actually belongs to (ACTIVE only) — joined with the org
  // row itself, since "list my orgs" is always what the caller wants
  // this for, never the bare membership row.
  async listActiveOrgsForUser(userId: string) {
    return this.db
      .select({
        membershipId: organizationMembers.id,
        organization: organizations,
      })
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
