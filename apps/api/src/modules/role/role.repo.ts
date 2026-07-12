import { roles } from "@syncr/db";
import {
  and,
  eq,
  type InferInsertModel,
  type InferSelectModel,
  isNull,
} from "drizzle-orm";
import { BaseRepo } from "../../core/base/base.repo";

export type Role = InferSelectModel<typeof roles>;
export type NewRole = InferInsertModel<typeof roles>;

export class RoleRepo extends BaseRepo {
  async create(data: NewRole) {
    const [role] = await this.db.insert(roles).values(data).returning();

    return role;
  }

  // System roles have organizationId = NULL by design (shared templates,
  // not cloned per org — see roles.ts schema notes). This is exactly the
  // slot the roles_system_slug_uidx partial index protects.
  async findSystemBySlug(slug: string) {
    const rows = await this.db
      .select()
      .from(roles)
      .where(and(eq(roles.slug, slug), isNull(roles.organizationId)))
      .limit(1);

    return this.first(rows);
  }

  async findById(id: string) {
    return this.db.query.roles.findFirst({
      where: and(eq(roles.id, id), isNull(roles.deletedAt)),
    });
  }

  // Org-scoped custom roles (isSystem = false). Not wired into any
  // service yet — MVP only assigns system roles — but listed here so
  // "list assignable roles for this org" has somewhere to live once
  // custom roles ship, rather than repo methods getting bolted onto
  // OrganizationService later.
  async findByOrgAndSlug(organizationId: string, slug: string) {
    const rows = await this.db
      .select()
      .from(roles)
      .where(
        and(eq(roles.organizationId, organizationId), eq(roles.slug, slug)),
      )
      .limit(1);

    return this.first(rows);
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
