import { permissions } from "@syncr/db";
import {
  and,
  eq,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";

import { BaseRepo } from "../../core/base/base.repo";

export type Permission = InferSelectModel<typeof permissions>;
export type NewPermission = InferInsertModel<typeof permissions>;

export class PermissionRepo extends BaseRepo {
  async create(data: NewPermission) {
    const [permission] = await this.db
      .insert(permissions)
      .values(data)
      .returning();

    return permission;
  }

  async findById(id: string) {
    return this.db.query.permissions.findFirst({
      where: eq(permissions.id, id),
    });
  }

  async findByResourceAndAction(resource: string, action: string) {
    return this.db.query.permissions.findFirst({
      where: and(
        eq(permissions.resource, resource),
        eq(permissions.action, action),
      ),
    });
  }

  async list() {
    return this.db.query.permissions.findMany({
      orderBy: (permissions, { asc }) => [
        asc(permissions.priority),
        asc(permissions.resource),
        asc(permissions.action),
      ],
    });
  }

  async update(id: string, data: Partial<NewPermission>) {
    const [permission] = await this.db
      .update(permissions)
      .set(data)
      .where(eq(permissions.id, id))
      .returning();

    return permission;
  }

  async delete(id: string) {
    await this.db.delete(permissions).where(eq(permissions.id, id));
  }
}
