import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { timestamps } from "../common";
import { providerConnections } from "../providers";

export const githubWebhookEvents = pgTable(
  "github_webhook_events",
  {
    id: uuid("github_webhook_event_id").primaryKey().defaultRandom(),
    providerConnectionId: uuid("provider_connection_id").references(
      () => providerConnections.id,
      { onDelete: "set null" },
    ),
    // X-GitHub-Delivery header. Prevents double-processing GitHub retries.
    deliveryId: text("delivery_id").notNull(),
    // X-GitHub-Event header: "push" | "installation" | "pull_request" etc.
    event: text("event").notNull(),
    payload: jsonb("payload").notNull(),
    processed: boolean("processed").notNull().default(false),
    processedAt: timestamp("processed_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    error: text("error"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("github_webhook_events_delivery_unique").on(t.deliveryId),
    index("github_webhook_events_processed_idx").on(t.processed),
  ],
);
