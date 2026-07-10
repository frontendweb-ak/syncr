// src/auth/auth.ts

import type { Db } from "@syncr/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { AppConfig } from "../../config";

export function createAuth(db: Db, config: AppConfig) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    secret: config.BETTER_AUTH_SECRET,
    baseURL: config.BETTER_AUTH_URL,
    trustedOrigins: config.CORS_ORIGINS,
    emailAndPassword: { enabled: true },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  });
}

export type BetterAuthState = ReturnType<typeof createAuth>;
