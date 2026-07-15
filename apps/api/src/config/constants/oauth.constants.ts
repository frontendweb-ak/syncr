// src/config/constants/oauth.constants.ts

export const OAUTH = {
  /* -------------------------------------------------------------------------- */
  /* General                                                                     */
  /* -------------------------------------------------------------------------- */

  ENABLED: true,
  DEFAULT_REDIRECT_PATH: "/auth/oauth/callback",

  STATE: {
    LENGTH: 32,
    TTL_SECONDS: 10 * 60, // 10 minutes
  },

  NONCE: {
    LENGTH: 32,
    TTL_SECONDS: 10 * 60,
  },

  PKCE: {
    ENABLED: true,
    METHOD: "S256",
    CODE_VERIFIER_MIN_LENGTH: 43,
    CODE_VERIFIER_MAX_LENGTH: 128,
  },

  /* -------------------------------------------------------------------------- */
  /* Supported Providers                                                         */
  /* -------------------------------------------------------------------------- */

  PROVIDERS: { GOOGLE: "google", GITHUB: "github" },

  GITHUB: {
    REFRESH_MARGIN_MS: 2 * 60 * 1000,
  },
  /* -------------------------------------------------------------------------- */
  /* Google                                                                      */
  /* -------------------------------------------------------------------------- */

  // google

  GOOGLE: {
    JWKS_URL: "https://www.googleapis.com/oauth2/v3/certs",
    ISSUERS: ["accounts.google.com", "https://accounts.google.com"],
    SCOPES: ["openid", "email", "profile"],
    PROMPT: "select_account",
    ACCESS_TYPE: "offline",
  },
} as const;

export type OAuthProvider =
  (typeof OAUTH.PROVIDERS)[keyof typeof OAUTH.PROVIDERS];
