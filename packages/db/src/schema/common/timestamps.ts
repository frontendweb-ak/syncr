import { boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const id = {
  id: uuid("id").defaultRandom().primaryKey(),
};

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
};
