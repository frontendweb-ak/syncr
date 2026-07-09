// src/db/schema/auth/auth-credentials.ts
//
// Dedicated table for secrets — password hash today, MFA (TOTP) secret in
// the future. Deliberately NOT merged into user_auth_providers, which
// models identity claims (provider + providerId, e.g. "this user owns
// google subject 12345") rather than secrets. Keeping secrets in their own
// table means:
//
//   - A query that lists/joins a user's linked sign-in methods for display
//     (Settings -> "Connected accounts") can never accidentally select a
//     password hash column by joining the wrong table.
//   - Access to this table can be locked down independently (e.g. a
//     stricter Postgres role/RLS policy, or — see AUTH_TECHNICAL.md — a
//     future move to a separate encrypted store) without touching the
//     identity-provider linkage data at all.
//   - The blast radius of a bug that over-selects columns is smaller: an
//     accidental `SELECT *` on user_auth_providers can never leak a hash.
//
// One row per user (not per provider) — a user has at most one password,
// regardless of how many OAuth providers are also linked via
// user_auth_providers. Email/password and Google sign-in are NOT mutually
// exclusive: a user can have both, and either can be used to authenticate
// the same account.

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { mfaTypeEnum } from "../../enums";
import { timestamps } from "../common/timestamps";
import { users } from "./users";

export const authCredentials = pgTable(
  "auth_credentials",
  {
    id: uuid("auth_credential_id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Argon2id hash (see AUTH_TECHNICAL.md for parameters). A row only
    // exists here once a user has set a password — a Google/Apple-only
    // user has no row at all, not a row with a null hash. The application
    // layer enforces "row exists implies password auth is enabled."
    passwordHash: text("password_hash").notNull(),

    // Bumped on every password hash write (initial set, change, reset).
    // Used purely for audit/display ("password last changed 3 months ago")
    // — NOT the same as users.tokenVersion, which is what actually
    // invalidates issued access tokens. See users.ts / devices.ts.
    passwordChangedAt: timestamp("password_changed_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    // Forces a password reset on next login — set by an admin action
    // (suspected compromise) or by the system. The login flow checks this
    // BEFORE issuing tokens and routes to the reset flow instead.
    mustResetPassword: boolean("must_reset_password").default(false).notNull(),

    // ── Brute-force lockout ──────────────────────────────────────
    // Tracked here (not in a separate table) because lockout state is
    // 1:1 with "this user's password," not a historical log — login_history
    // already provides the audit trail of individual attempts. This is
    // just the current counter/lock state derived from that history,
    // kept denormalized for a fast check on every login attempt without
    // an aggregate query over login_history.
    failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),

    // ── MFA (reserved, not active in v1) ─────────────────────────
    mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
    mfaType: mfaTypeEnum("mfa_type"),
    // Encrypted at the application layer before storage — same field-level
    // encryption pattern as mentor_payout_accounts' account number, never
    // stored in plaintext. Null until MFA is actually enabled.
    mfaSecretEncrypted: text("mfa_secret_encrypted"),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("auth_credentials_user_unique").on(table.userId),
    index("auth_credentials_locked_until_idx").on(table.lockedUntil),
    check(
      "auth_credentials_mfa_type_consistency_check",
      sql`(${table.mfaEnabled} = false AND ${table.mfaType} IS NULL) OR (${table.mfaEnabled} = true AND ${table.mfaType} IS NOT NULL)`,
    ),
  ],
);
