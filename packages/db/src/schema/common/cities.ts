import { sql } from "drizzle-orm";
import {
  decimal,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { states } from "./states";
import { timestamps } from "./timestamps";

export const cities = pgTable(
  "cities",
  {
    id: integer("city_id").generatedAlwaysAsIdentity().primaryKey(),
    stateId: integer("state_id")
      .notNull()
      .references(() => states.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    name: text("city_name").notNull(),
    slug: text("slug"),
    latitude: decimal("latitude", {
      precision: 10,
      scale: 8,
    }),
    longitude: decimal("longitude", {
      precision: 11,
      scale: 8,
    }),
    timezone: text("timezone"),
    population: integer("population"),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("cities_slug_unique").on(table.slug),
    uniqueIndex("cities_name_state_unique").on(
      sql`lower(${table.name})`,
      table.stateId,
    ),
    index("cities_state_idx").on(table.stateId),
    index("cities_name_idx").on(table.name),
    index("cities_location_idx").on(table.latitude, table.longitude),
  ],
);
