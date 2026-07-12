// src/modules/organization/workspace.repo.ts
//
// Deliberately minimal — full workspace CRUD (rename, archive, non-default
// workspace creation) isn't part of this flow. This exists only to
// support "every new org gets exactly one default workspace," which
// organization creation depends on.

import { workspaces } from "@syncr/db";
import { and, eq, type InferInsertModel } from "drizzle-orm";
import { BaseRepo } from "../../core/base/base.repo";
import { Errors } from "../../errors";

export class WorkspaceRepo extends BaseRepo {
  async createDefault(input: {
    organizationId: string;
    slug: string;
    name: string;
  }) {
    const rows = await this.db
      .insert(workspaces)
      .values({
        organizationId: input.organizationId,
        slug: input.slug,
        name: input.name,
        isDefault: true,
      } satisfies InferInsertModel<typeof workspaces>)
      .returning();

    // Relies on workspace_one_default_per_org_uidx (partial unique
    // index, WHERE isDefault = true) — if this ever throws a unique
    // violation, that means createDefault was called twice for the same
    // org, which is a caller bug, not a data problem.
    return this.firstOrThrow(rows, Errors.organization.workspaceCreateFailed());
  }

  async findDefaultForOrg(organizationId: string) {
    const rows = await this.db
      .select()
      .from(workspaces)
      .where(
        and(
          eq(workspaces.organizationId, organizationId),
          eq(workspaces.isDefault, true),
        ),
      );

    return this.first(rows);
  }

  async grantAccess(input: {
    workspaceId: string;
    organizationMemberId: string;
    isDefault?: boolean;
  }) {
    await this.db
      .insert(workspaceAccess)
      .values(input)
      .onConflictDoNothing({
        target: [
          workspaceAccess.workspaceId,
          workspaceAccess.organizationMemberId,
        ],
      });
  }
}
