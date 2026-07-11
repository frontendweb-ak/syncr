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
    // Password
    passwordHash: text("password_hash").notNull(),
    passwordChangedAt: timestamp("password_changed_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    mustResetPassword: boolean("must_reset_password").default(false).notNull(),
    // Brute-force protection
    failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until", {
      withTimezone: true,
    }),
    // ---------------------------------------------------------
    // Multi-Factor Authentication
    // ---------------------------------------------------------
    mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
    mfaType: mfaTypeEnum("mfa_type"),
    /**
     * Permanent encrypted TOTP secret.
     * Exists only after successful MFA enrollment.
     */
    mfaSecretEncrypted: text("mfa_secret_encrypted"),
    /**
     * Temporary secret while MFA enrollment is in progress.
     * Promoted to mfaSecretEncrypted only after OTP verification.
     */
    mfaPendingSecretEncrypted: text("mfa_pending_secret_encrypted"),
    /**
     * Enrollment expiration.
     */
    mfaPendingExpiresAt: timestamp("mfa_pending_expires_at", {
      withTimezone: true,
    }),

    /**
     * One-time recovery codes.
     *
     * Store encrypted JSON array:
     * [
     *   "...",
     *   "...",
     * ]
     *
     * Generated when MFA is enabled.
     */
    mfaRecoveryCodesEncrypted: text("mfa_recovery_codes_encrypted"),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("auth_credentials_user_unique").on(table.userId),
    index("auth_credentials_locked_until_idx").on(table.lockedUntil),
    check(
      "auth_credentials_mfa_type_check",
      sql`
        (${table.mfaEnabled} = false  AND ${table.mfaType} IS NULL)
        OR
        (${table.mfaEnabled} = true  AND ${table.mfaType} IS NOT NULL)
      `,
    ),

    check(
      "auth_credentials_mfa_secret_check",
      sql`
        (  ${table.mfaEnabled} = false)
        OR
        ( ${table.mfaSecretEncrypted} IS NOT NULL)
      `,
    ),
  ],
);
