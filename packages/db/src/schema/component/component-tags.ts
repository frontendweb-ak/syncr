import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { components } from "./components";
export const componentTags = pgTable(
  "component_tags",
  {
    id: uuid("component_tag_id").primaryKey().defaultRandom(),
    componentId: uuid("component_id")
      .notNull()
      .references(() => components.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("component_tags_unique").on(t.componentId, t.tag),
    index("component_tags_tag_idx").on(t.tag),
  ],
);
