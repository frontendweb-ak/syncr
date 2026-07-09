// packages/db/drizzle.config.ts

import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
import * as path from "node:path";

// Load env based on APP_ENV
const env = process.env.APP_ENV ?? "development";
dotenv.config({
  path: path.resolve(process.cwd(), `../../.env.${env}`),
});

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL is not set for APP_ENV=${env}`);
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/index.ts",
  out: "./migrations",

  dbCredentials: {
    // Always use DATABASE_URL for migrations — never PgBouncer
    url: process.env.DATABASE_URL,
  },

  verbose: true,
  strict: true,

  tablesFilter: [
    "!_realtime*",
    "!realtime*",
    "!supabase_migrations*",
    "!pg_*",
    "!information_schema*",
  ],
});
