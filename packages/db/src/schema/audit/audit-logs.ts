import {
  bigserial,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { auditActionEnum, auditResourceTypeEnum } from "../../enums";
import { users } from "../auth/users";
import { organizations } from "../organization";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial("audit_log_id", {
      mode: "bigint",
    }).primaryKey(),

    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
      }),

    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    action: auditActionEnum("action").notNull(),
    resourceType: auditResourceTypeEnum("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    resourceName: text("resource_name"),
    before: jsonb("before"),
    after: jsonb("after"),
    metadata: jsonb("metadata"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    requestId: text("request_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_logs_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    index("audit_logs_actor_idx").on(table.actorUserId),
    index("audit_logs_resource_idx").on(table.resourceType, table.resourceId),
    index("audit_logs_action_idx").on(table.action),
  ],
);
