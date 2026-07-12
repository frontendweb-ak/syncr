import { roles } from "@syncr/db";
import {
  and,
  eq,
  type InferInsertModel,
  type InferSelectModel,
  isNull,
  sql,
} from "drizzle-orm";
import { BaseRepo } from "../../core/base/base.repo";

export type Role = InferSelectModel<typeof roles>;
export type NewRole = InferInsertModel<typeof roles>;

export class RoleRepo extends BaseRepo {
  async create(data: NewRole) {
    const [role] = await this.db.insert(roles).values(data).returning();

    return role;
  }

  async findById(id: string) {
    return this.db.query.roles.findFirst({
      where: and(eq(roles.id, id), isNull(roles.deletedAt)),
    });
  }

  async findBySlug(slug: string, organizationId?: string | null) {
    return this.db.query.roles.findFirst({
      where: and(
        organizationId
          ? eq(roles.organizationId, organizationId)
          : isNull(roles.organizationId),
        sql`lower(${roles.slug}) = lower(${slug})`,
        isNull(roles.deletedAt),
      ),
    });
  }

  async list(organizationId?: string | null) {
    return this.db.query.roles.findMany({
      where: and(
        organizationId
          ? eq(roles.organizationId, organizationId)
          : isNull(roles.organizationId),
        isNull(roles.deletedAt),
      ),
      orderBy: (roles, { asc }) => [asc(roles.priority)],
    });
  }

  async update(id: string, data: Partial<typeof roles.$inferInsert>) {
    const [role] = await this.db
      .update(roles)
      .set(data)
      .where(eq(roles.id, id))
      .returning();

    return role;
  }

  async softDelete(id: string) {
    await this.db
      .update(roles)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(roles.id, id));
  }
}
