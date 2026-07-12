// src/modules/organization/organization.repo.ts

import { organizations } from "@syncr/db";
import {
  and,
  eq,
  type InferInsertModel,
  type InferSelectModel,
  isNull,
} from "drizzle-orm";
import { BaseRepo } from "../../core/base/base.repo";
import { Errors } from "../../errors";

export type Organization = InferSelectModel<typeof organizations>;
export type NewOrganization = InferInsertModel<typeof organizations>;

export class OrganizationRepo extends BaseRepo {
  async create(data: NewOrganization) {
    const rows = await this.db.insert(organizations).values(data).returning();
    return this.firstOrThrow(rows, Errors.organization.createFailed());
  }

  async findById(id: string) {
    const rows = await this.db
      .select()
      .from(organizations)
      .where(and(eq(organizations.id, id), isNull(organizations.deletedAt)));

    return this.first(rows);
  }

  async findBySlug(slug: string) {
    const rows = await this.db
      .select()
      .from(organizations)
      .where(
        and(
          eq(organizations.slug, slug.toLowerCase()),
          isNull(organizations.deletedAt),
        ),
      );

    return this.first(rows);
  }

  // Relies on organizations_one_personal_per_owner_uidx (partial unique
  // index, WHERE isPersonal = true) to guarantee at most one row can
  // ever match — see organizations.ts schema notes.
  async findPersonalByOwner(ownerUserId: string) {
    const rows = await this.db
      .select()
      .from(organizations)
      .where(
        and(
          eq(organizations.ownerUserId, ownerUserId),
          eq(organizations.isPersonal, true),
        ),
      );

    return this.first(rows);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug.toLowerCase()))
      .limit(1);

    return rows.length > 0;
  }

  async update(id: string, data: Partial<NewOrganization>) {
    const rows = await this.db
      .update(organizations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();

    return this.firstOrThrow(rows, Errors.organization.notFound());
  }

  async softDelete(id: string) {
    await this.db
      .update(organizations)
      .set({ deletedAt: new Date(), status: "SUSPENDED" })
      .where(eq(organizations.id, id));
  }
}
