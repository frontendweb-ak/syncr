import { sql } from 'drizzle-orm'
import { boolean, index, pgTable, serial, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { timestamps } from './timestamps'

export const languages = pgTable(
  'languages',
  {
    id: serial('language_id').primaryKey(),
    name: text('name').notNull(),
    code: text('language_code'),
    flagEmoji: text('flag_emoji'),
    isActive: boolean('is_active').default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('languages_name_unique').on(sql`lower(${table.name})`),
    uniqueIndex('languages_code_unique').on(sql`lower(${table.code})`),
    index('languages_code_idx').on(table.code),
    index('languages_active_idx').on(table.isActive),
  ],
)
