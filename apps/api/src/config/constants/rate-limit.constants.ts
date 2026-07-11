// src/config/constants/rate-limit.constants.ts

export const RATE_LIMIT = {
  /* -------------------------------------------------------------------------- */
  /* Defaults                                                                    */
  /* -------------------------------------------------------------------------- */

  DEFAULT: { REQUESTS: 60, WINDOW_SECONDS: 60 },
  /* -------------------------------------------------------------------------- */
  /* Authentication                                                              */
  /* -------------------------------------------------------------------------- */

  LOGIN: { REQUESTS: 5, WINDOW_SECONDS: 60, LOCKOUT_MINUTES: 15 },
  REGISTER: { REQUESTS: 5, WINDOW_SECONDS: 60 },
  REFRESH_TOKEN: { REQUESTS: 30, WINDOW_SECONDS: 60 },
  LOGOUT: { REQUESTS: 30, WINDOW_SECONDS: 60 },
  LOGOUT_ALL: { REQUESTS: 5, WINDOW_SECONDS: 300 },
  FORGOT_PASSWORD: { REQUESTS: 5, WINDOW_SECONDS: 3600 },
  RESET_PASSWORD: { REQUESTS: 5, WINDOW_SECONDS: 3600 },
  VERIFY_EMAIL: { REQUESTS: 10, WINDOW_SECONDS: 3600 },
  RESEND_EMAIL: { REQUESTS: 5, WINDOW_SECONDS: 3600 },
  OTP_REQUEST: { REQUESTS: 5, WINDOW_SECONDS: 600 },
  OTP_VERIFY: { REQUESTS: 10, WINDOW_SECONDS: 600 },
  MAGIC_LINK: { REQUESTS: 5, WINDOW_SECONDS: 3600 },
  MFA_CHALLENGE: { REQUESTS: 10, WINDOW_SECONDS: 300 },
  MFA_VERIFY: { REQUESTS: 10, WINDOW_SECONDS: 300 },

  /* -------------------------------------------------------------------------- */
  /* OAuth / SSO                                                                 */
  /* -------------------------------------------------------------------------- */

  OAUTH: { REQUESTS: 30, WINDOW_SECONDS: 60 },
  SSO: { REQUESTS: 20, WINDOW_SECONDS: 60 },

  /* -------------------------------------------------------------------------- */
  /* API                                                                         */
  /* -------------------------------------------------------------------------- */
  API: { REQUESTS: 300, WINDOW_SECONDS: 60 },
  GRAPHQL: { REQUESTS: 300, WINDOW_SECONDS: 60 },
  REST: { REQUESTS: 300, WINDOW_SECONDS: 60 },

  /* -------------------------------------------------------------------------- */
  /* Uploads                                                                     */
  /* -------------------------------------------------------------------------- */
  UPLOAD: { REQUESTS: 20, WINDOW_SECONDS: 60 },
  /* -------------------------------------------------------------------------- */
  /* Notifications                                                               */
  /* -------------------------------------------------------------------------- */
  EMAIL: { REQUESTS: 20, WINDOW_SECONDS: 3600 },
  SMS: { REQUESTS: 10, WINDOW_SECONDS: 3600 },
  PUSH: { REQUESTS: 60, WINDOW_SECONDS: 60 },

  /* -------------------------------------------------------------------------- */
  /* Messaging                                                                   */
  /* -------------------------------------------------------------------------- */
  MESSAGE: { REQUESTS: 120, WINDOW_SECONDS: 60 },
  /* -------------------------------------------------------------------------- */
  /* Payments                                                                    */
  /* -------------------------------------------------------------------------- */
  PAYMENT: { REQUESTS: 30, WINDOW_SECONDS: 60 },
  /* -------------------------------------------------------------------------- */
  /* Webhooks                                                                    */
  /* -------------------------------------------------------------------------- */
  WEBHOOK: { REQUESTS: 1000, WINDOW_SECONDS: 60 },
  /* -------------------------------------------------------------------------- */
  /* CLI                                                                         */
  /* -------------------------------------------------------------------------- */
  CLI: { REQUESTS: 300, WINDOW_SECONDS: 60 },
  /* -------------------------------------------------------------------------- */
  /* Admin                                                                       */
  /* -------------------------------------------------------------------------- */
  ADMIN: { REQUESTS: 600, WINDOW_SECONDS: 60 },
  /* -------------------------------------------------------------------------- */
  /* Search                                                                      */
  /* -------------------------------------------------------------------------- */
  SEARCH: { REQUESTS: 120, WINDOW_SECONDS: 60 },
  /* -------------------------------------------------------------------------- */
  /* Public APIs                                                                 */
  /* -------------------------------------------------------------------------- */
  PUBLIC: { REQUESTS: 60, WINDOW_SECONDS: 60 },
} as const;

export type RateLimitPolicy = keyof typeof RATE_LIMIT;
