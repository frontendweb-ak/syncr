// src/modules/auth/password/password-strength.ts
//
// Server-side password strength enforcement (Technical Design §4.2).
// Client-side strength meters are UX only — this is the source of truth
// and is never skipped, regardless of what the client already validated.

import { Errors } from "../../../errors";

const MIN_LENGTH = 8
const MAX_LENGTH = 256

// A small, bundled list of the most common passwords. Deliberately NOT a
// live breach-database API call (e.g. HaveIBeenPwned) — that would mean
// sending a user's password, even hashed/k-anonymized, to a third party
// during registration, which is both a privacy question and an external
// dependency in the critical registration path. This list is intentionally
// short (the highest-frequency entries only) — it exists to block the
// most trivially guessable passwords, not to replace Argon2id as the real
// defense.
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "12345678",
  "123456789",
  "1234567890",
  "qwertyuiop",
  "qwerty123",
  "letmein123",
  "welcome123",
  "admin1234",
  "iloveyou1",
  "abc123456",
  "india1234",
  "changeme1",
  "password!",
]);

export interface PasswordStrengthResult {
  valid: boolean
  reason?: string
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  if (password.length < MIN_LENGTH) {
    return { valid: false, reason: `Password must be at least ${MIN_LENGTH} characters` }
  }

  if (password.length > MAX_LENGTH) {
    return { valid: false, reason: `Password must not exceed ${MAX_LENGTH} characters` }
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, reason: 'This password is too common. Please choose a stronger one.' }
  }

  // Require at least 2 of: lowercase, uppercase, digit, symbol — not a
  // full composition-rules regime (NIST/OWASP guidance has moved away
  // from mandatory complexity rules toward length as the primary
  // control), but enough to block "aaaaaaaaaa" (passes length, common-list
  // checks, but is not meaningfully resistant to guessing).
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/]
  const matched = classes.filter((re) => re.test(password)).length

  if (matched < 2) {
    return {
      valid: false,
      reason: 'Password must include at least two of: lowercase, uppercase, numbers, symbols',
    }
  }

  return { valid: true }
}

/** Throws Errors.auth.passwordTooWeak() if the password fails strength checks. */
export function assertPasswordStrength(password: string) {
  const result = checkPasswordStrength(password)
  if (!result.valid) {
    throw Errors.auth.passwordTooWeak(result.reason ?? 'Password does not meet requirements')
  }
  return result
}
