import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { syncEventType } from "../../enums";
import { users } from "../auth";
import { syncProposals } from "./sync-proposal";

export const syncActorTypeEnum = pgEnum("sync_actor_type", [
  "USER",
  "SYSTEM",
  "PROVIDER",
]);

export const syncEvents = pgTable(
  "sync_events",
  {
    id: uuid("sync_event_id").defaultRandom().primaryKey(),

    syncProposalId: uuid("sync_proposal_id")
      .notNull()
      .references(() => syncProposals.id, {
        onDelete: "cascade",
      }),

    event: syncEventType("event").notNull(),

    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),

    actorType: syncActorTypeEnum("actor_type").notNull().default("SYSTEM"),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("sync_events_proposal_idx").on(table.syncProposalId),

    index("sync_events_event_idx").on(table.event),

    index("sync_events_created_at_idx").on(table.createdAt),
  ],
);
