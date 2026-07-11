// src/config/constants/auth.constants.ts

export const AUTH = {
  /* -------------------------------------------------------------------------- */
  /* Login                                                                       */
  /* -------------------------------------------------------------------------- */

  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15,
  LOCKOUT_MULTIPLIER: 2,
  FAILED_LOGIN_WINDOW_MINUTES: 15,
  MAX_DEVICES_PER_USER: 5,

  /* -------------------------------------------------------------------------- */
  /* Password Policy                                                             */
  /* -------------------------------------------------------------------------- */

  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHARACTER: true,
    PREVENT_USERNAME: true,
    HISTORY_COUNT: 5,
    MAX_AGE_DAYS: 365,
    MIN_AGE_HOURS: 0,
  },

  /* -------------------------------------------------------------------------- */
  /* Sessions                                                                    */
  /* -------------------------------------------------------------------------- */

  SESSION: {
    MAX_ACTIVE_SESSIONS: 10,
    MAX_DEVICES: 10,
    IDLE_TIMEOUT_MINUTES: 60 * 24 * 30,
    ABSOLUTE_TIMEOUT_DAYS: 30,
    SLIDING_EXPIRATION: true,
    ALLOW_CONCURRENT_SESSIONS: true,
    REVOKE_ALL_ON_PASSWORD_CHANGE: true,
    REVOKE_ALL_ON_EMAIL_CHANGE: true,
    REVOKE_ALL_ON_MFA_RESET: true,
    UPDATE_LAST_ACTIVITY_INTERVAL_SECONDS: 300,
  },

  /* -------------------------------------------------------------------------- */
  /* Remember Me                                                                 */
  /* -------------------------------------------------------------------------- */

  REMEMBER_ME: {
    ENABLED: true,
    EXPIRY_DAYS: 30,
  },

  /* -------------------------------------------------------------------------- */
  /* Trusted Devices                                                             */
  /* -------------------------------------------------------------------------- */

  TRUSTED_DEVICE: {
    ENABLED: true,
    EXPIRY_DAYS: 90,
    MAX_DEVICES: 20,
  },

  /* -------------------------------------------------------------------------- */
  /* Account Verification                                                        */
  /* -------------------------------------------------------------------------- */

  EMAIL_VERIFICATION: {
    REQUIRED: true,
    MAX_RESENDS: 5,
  },

  PHONE_VERIFICATION: {
    REQUIRED: false,
    MAX_RESENDS: 5,
  },

  /* -------------------------------------------------------------------------- */
  /* Account Recovery                                                            */
  /* -------------------------------------------------------------------------- */

  PASSWORD_RESET: {
    MAX_REQUESTS_PER_DAY: 10,
    MAX_ATTEMPTS: 5,
  },

  MAGIC_LINK: {
    ENABLED: true,
    MAX_REQUESTS_PER_HOUR: 10,
  },

  /* -------------------------------------------------------------------------- */
  /* Refresh Tokens                                                              */
  /* -------------------------------------------------------------------------- */

  REFRESH_TOKEN: {
    ROTATE_ON_USE: true,
    REVOKE_PREVIOUS: true,
    MAX_TOKEN_FAMILY_SIZE: 100,
  },

  /* -------------------------------------------------------------------------- */
  /* Device Authentication                                                       */
  /* -------------------------------------------------------------------------- */

  DEVICE: {
    BIND_TOKEN_TO_DEVICE: true,
    REQUIRE_DEVICE_VERIFICATION: false,
    ALLOW_UNKNOWN_DEVICE_LOGIN: true,
  },

  /* -------------------------------------------------------------------------- */
  /* Impersonation                                                               */
  /* -------------------------------------------------------------------------- */

  IMPERSONATION: {
    ENABLED: true,
    REQUIRE_REASON: true,
    MAX_DURATION_MINUTES: 30,
    AUDIT_ALL_ACTIONS: true,
  },

  /* -------------------------------------------------------------------------- */
  /* Security Features                                                           */
  /* -------------------------------------------------------------------------- */

  SECURITY: {
    ENABLE_BREACHED_PASSWORD_CHECK: true,
    ENABLE_DEVICE_FINGERPRINT: true,
    ENABLE_GEO_LOCATION_CHECK: true,
    ENABLE_IMPOSSIBLE_TRAVEL_CHECK: true,
    ENABLE_RISK_BASED_MFA: true,
    ENABLE_LOGIN_NOTIFICATIONS: true,
  },
} as const;
