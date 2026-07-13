// src/modules/registry/component/component-version.repo.ts

import { componentVersions } from "@syncr/db";
import {
  and,
  desc,
  eq,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import { BaseRepo } from "../../core/base/base.repo";
import { Errors } from "../../errors";

export type ComponentVersion = InferSelectModel<typeof componentVersions>;
export type NewComponentVersion = InferInsertModel<typeof componentVersions>;

export class ComponentVersionRepo extends BaseRepo {
  async create(data: NewComponentVersion): Promise<ComponentVersion> {
    const rows = await this.db
      .insert(componentVersions)
      .values(data)
      .returning();
    return this.firstOrThrow(rows, Errors.component.versionCreateFailed());
  }

  async findByComponentAndVersion(
    componentId: string,
    version: string,
  ): Promise<ComponentVersion | null> {
    const rows = await this.db
      .select()
      .from(componentVersions)
      .where(
        and(
          eq(componentVersions.componentId, componentId),
          eq(componentVersions.version, version),
        ),
      )
      .limit(1);
    return this.first(rows);
  }

  async findLatest(componentId: string): Promise<ComponentVersion | null> {
    const rows = await this.db
      .select()
      .from(componentVersions)
      .where(eq(componentVersions.componentId, componentId))
      .orderBy(desc(componentVersions.createdAt))
      .limit(1);
    return this.first(rows);
  }

  /**
   * Used to reject no-op republishes — if the new tarball's hash matches
   * ANY existing version of this component (not just the latest; someone
   * might republish an old version's exact content by mistake), refuse.
   */
  async findByContentHash(
    componentId: string,
    contentHash: string,
  ): Promise<ComponentVersion | null> {
    const rows = await this.db
      .select()
      .from(componentVersions)
      .where(
        and(
          eq(componentVersions.componentId, componentId),
          eq(componentVersions.contentHash, contentHash),
        ),
      )
      .limit(1);
    return this.first(rows);
  }

  async listForComponent(componentId: string): Promise<ComponentVersion[]> {
    return this.db
      .select()
      .from(componentVersions)
      .where(eq(componentVersions.componentId, componentId))
      .orderBy(desc(componentVersions.createdAt));
  }

  /**
   * Content-hash lookup across an ENTIRE org, not one component — this is
   * the exact index the drift-detection algorithm's tier-2 (hash match)
   * needs. Not used by this CRUD module directly; exposed here because
   * ComponentVersionRepo is the natural owner of it, and detection.service.ts
   * (delivered earlier) expects a `getContentHashIndex(orgId)`-shaped call.
   */
  async getContentHashIndex(
    organizationId: string,
  ): Promise<Map<string, { componentId: string; version: string }>> {
    // Requires a join back to components for org scoping — BaseRepo's
    // raw query builder access (this.db) is used directly here since this
    // is a cross-table read, not a simple single-table CRUD op.
    const { components } = await import("@syncr/db");
    const rows = await this.db
      .select({
        contentHash: componentVersions.contentHash,
        componentId: componentVersions.componentId,
        version: componentVersions.version,
      })
      .from(componentVersions)
      .innerJoin(components, eq(components.id, componentVersions.componentId))
      .where(eq(components.organizationId, organizationId));

    const index = new Map<string, { componentId: string; version: string }>();
    for (const row of rows) {
      index.set(row.contentHash, {
        componentId: row.componentId,
        version: row.version,
      });
    }
    return index;
  }
}
