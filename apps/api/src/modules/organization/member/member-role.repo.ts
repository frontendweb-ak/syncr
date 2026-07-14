// src/modules/rbac/member-role.repo.ts

import { memberRoles, roles } from "@syncr/db";
import { and, eq } from "drizzle-orm";
import { BaseRepo } from "../../../core/base/base.repo";

export class MemberRoleRepo extends BaseRepo {
  async assign(input: {
    organizationMemberId: string;
    roleId: string;
    assignedByUserId?: string;
  }) {
    // Composite PK on (organizationMemberId, roleId) — re-assigning the
    // same role is a no-op conflict, not an error. onConflictDoNothing
    // keeps "accept invite" idempotent if it's ever retried.
    await this.db
      .insert(memberRoles)
      .values(input)
      .onConflictDoNothing({
        target: [memberRoles.organizationMemberId, memberRoles.roleId],
      });
  }

  async revoke(organizationMemberId: string, roleId: string) {
    await this.db
      .delete(memberRoles)
      .where(
        and(
          eq(memberRoles.organizationMemberId, organizationMemberId),
          eq(memberRoles.roleId, roleId),
        ),
      );
  }

  async revokeAll(organizationMemberId: string) {
    await this.db
      .delete(memberRoles)
      .where(eq(memberRoles.organizationMemberId, organizationMemberId));
  }

  // Slugs of every role this member currently holds. Used both for
  // permission resolution (future) and for picking the JWT's display
  // role (see OrganizationMemberService.getPrimaryRoleSlug).
  async listSlugsForMember(organizationMemberId: string): Promise<string[]> {
    const rows = await this.db
      .select({ slug: roles.slug, priority: roles.priority })
      .from(memberRoles)
      .innerJoin(roles, eq(memberRoles.roleId, roles.id))
      .where(eq(memberRoles.organizationMemberId, organizationMemberId))
      .orderBy(roles.priority);

    return rows.map((r) => r.slug);
  }

  async listForMember(organizationMemberId: string) {
    return this.db
      .select({
        id: roles.id,
        name: roles.name,
        slug: roles.slug,
        priority: roles.priority,
      })
      .from(memberRoles)
      .innerJoin(roles, eq(memberRoles.roleId, roles.id))
      .where(eq(memberRoles.organizationMemberId, organizationMemberId))
      .orderBy(roles.priority);
  }
}
