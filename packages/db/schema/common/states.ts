import { sql } from 'drizzle-orm'
import { index, integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core'

import { timestamps } from './timestamps'

export const states = pgTable(
  'states',
  {
    id: integer('state_id').generatedAlwaysAsIdentity().primaryKey(),
    name: text('state_name').notNull(),
    // UP, MH, DL, KA...
    code: text('state_code').notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('states_name_unique').on(sql`lower(${table.name})`),
    uniqueIndex('states_code_unique').on(sql`lower(${table.code})`),
    index('states_name_idx').on(table.name),
  ],
)
