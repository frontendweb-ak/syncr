// src/db/schema/auth/password-reset-tokens.ts
//
// Link-based password reset ("click the link in your email"), used by the
// web app. Distinct from otp_codes (which already supports
// otpPurposeEnum.RESET_PASSWORD for the 6-digit-code flow mobile uses) —
// the two are different UX patterns for the same underlying action, so
// they get different storage rather than overloading one table to mean
// two different things (a 6-digit code a user types vs. a long random
// token embedded in a URL).
//
// The token itself is never stored — only its hash (same principle as
// otp_codes.codeHash and devices.refreshTokenHash) — so that a database
// read (backup leak, replication lag exposure, etc.) can never directly
// yield a usable reset token.

import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { passwordResetTokenStatusEnum } from "../../enums";
import { timestamps } from "../common/timestamps";
import { users } from "./users";

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("password_reset_token_id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // SHA-256 hash of the raw token embedded in the reset link. The raw
    // token is generated with a CSPRNG, shown to the user exactly once
    // (in the email link), and never persisted.
    tokenHash: text("token_hash").notNull(),

    status: passwordResetTokenStatusEnum("status").default("PENDING").notNull(),

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),

    ...timestamps,
  },
  (table) => [
    // Not unique on tokenHash alone — a user requesting reset twice in a
    // row produces two PENDING rows; the older one is explicitly revoked
    // (not deleted) when a new one is issued, so there's always an audit
    // trail of every reset request, not just the most recent.
    index("password_reset_tokens_hash_idx").on(table.tokenHash),
    index("password_reset_tokens_user_idx").on(table.userId, table.createdAt),
    index("password_reset_tokens_expiry_idx").on(table.expiresAt),
    index("password_reset_tokens_status_idx").on(table.status),
  ],
);
