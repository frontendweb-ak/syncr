// src/modules/registry/component/component.repo.ts

import { components } from "@syncr/db";
import {
  and,
  eq,
  type InferInsertModel,
  type InferSelectModel,
  isNull,
  sql,
} from "drizzle-orm";
import { BaseRepo } from "../../core/base/base.repo";
import { Errors } from "../../errors";

export type Component = InferSelectModel<typeof components>;
export type NewComponent = InferInsertModel<typeof components>;

export class ComponentRepo extends BaseRepo {
  async create(data: NewComponent): Promise<Component> {
    const rows = await this.db.insert(components).values(data).returning();
    return this.firstOrThrow(rows, Errors.component.createFailed());
  }

  async findBySlug(
    organizationId: string,
    slug: string,
  ): Promise<Component | null> {
    const rows = await this.db
      .select()
      .from(components)
      .where(
        and(
          eq(components.organizationId, organizationId),
          eq(components.slug, slug),
          isNull(components.deletedAt),
        ),
      )
      .limit(1);
    return this.first(rows);
  }

  async findBySlugOrThrow(
    organizationId: string,
    slug: string,
  ): Promise<Component> {
    const component = await this.findBySlug(organizationId, slug);
    if (!component) throw Errors.component.notFound();
    return component;
  }

  async findById(id: string): Promise<Component | null> {
    const rows = await this.db
      .select()
      .from(components)
      .where(and(eq(components.id, id), isNull(components.deletedAt)))
      .limit(1);
    return this.first(rows);
  }

  async listForOrg(
    organizationId: string,
    opts: { includeDeprecated?: boolean } = {},
  ): Promise<Component[]> {
    const conditions = [
      eq(components.organizationId, organizationId),
      isNull(components.deletedAt),
    ];
    if (!opts.includeDeprecated)
      conditions.push(eq(components.isDeprecated, false));

    return this.db
      .select()
      .from(components)
      .where(and(...conditions));
  }

  /**
   * Called after a new version publishes — keeps the denormalised
   * latestVersion/latestVersionId in sync. Callers must pass the new
   * version's ID and string; this repo doesn't know about
   * component_versions to avoid a circular import (components.ts has no
   * FK to component_versions for the same reason, per the schema
   * comment).
   */
  async updateLatestVersion(
    componentId: string,
    latestVersionId: string,
    latestVersion: string,
  ): Promise<void> {
    await this.db
      .update(components)
      .set({ latestVersionId, latestVersion, updatedAt: new Date() })
      .where(eq(components.id, componentId));
  }

  async incrementRepoUsageCount(
    componentId: string,
    delta: 1 | -1,
  ): Promise<void> {
    await this.db
      .update(components)
      .set({
        repoUsageCount: sql`${components.repoUsageCount} + ${delta}`,
        updatedAt: new Date(),
      })
      .where(eq(components.id, componentId));
  }

  async update(
    organizationId: string,
    slug: string,
    data: Partial<Pick<NewComponent, "name" | "description">>,
  ): Promise<Component> {
    const rows = await this.db
      .update(components)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(components.organizationId, organizationId),
          eq(components.slug, slug),
        ),
      )
      .returning();
    return this.firstOrThrow(rows, Errors.component.notFound());
  }

  async deprecate(
    organizationId: string,
    slug: string,
    note: string,
  ): Promise<Component> {
    const rows = await this.db
      .update(components)
      .set({
        isDeprecated: true,
        deprecatedAt: new Date(),
        deprecationNote: note,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(components.organizationId, organizationId),
          eq(components.slug, slug),
        ),
      )
      .returning();
    return this.firstOrThrow(rows, Errors.component.notFound());
  }

  async softDelete(organizationId: string, slug: string): Promise<void> {
    await this.db
      .update(components)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(components.organizationId, organizationId),
          eq(components.slug, slug),
        ),
      );
  }
}
