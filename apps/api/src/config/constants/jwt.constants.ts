// src/config/constants/jwt.constants.ts

export const JWT = {
  /* -------------------------------------------------------------------------- */
  /* Algorithms                                                                  */
  /* -------------------------------------------------------------------------- */

  ALGORITHM: "HS256",
  SUPPORTED_ALGORITHMS: ["HS256", "RS256", "ES256", "EdDSA"] as const,

  /* -------------------------------------------------------------------------- */
  /* Header                                                                      */
  /* -------------------------------------------------------------------------- */

  TYPE: "JWT",
  KEY_ID: "v1",

  /* -------------------------------------------------------------------------- */
  /* Clock                                                                       */
  /* -------------------------------------------------------------------------- */

  CLOCK_TOLERANCE_SECONDS: 5,
  MAX_TOKEN_AGE: "30d",

  /* -------------------------------------------------------------------------- */
  /* Audiences                                                                   */
  /* -------------------------------------------------------------------------- */

  AUDIENCE: {
    API: "syncr-api",
    AUTH: "syncr-auth",
    ACTION: "syncr-action",
    CLI: "syncr-cli",
    MOBILE: "syncr-mobile",
    WEB: "syncr-web",
    MCP: "syncr-mcp",
    SERVICE: "syncr-service",
  },

  /* -------------------------------------------------------------------------- */
  /* Issuers                                                                     */
  /* -------------------------------------------------------------------------- */

  ISSUER: {
    DEFAULT: "syncr",
    AUTH: "syncr-auth",
  },

  /* -------------------------------------------------------------------------- */
  /* Expiration                                                                  */
  /* -------------------------------------------------------------------------- */
  EXPIRY_SECONDS: {
    ACCESS: 15 * 60,
    REFRESH: 30 * 24 * 60 * 60,
    EMAIL_VERIFICATION: 24 * 60 * 60,
    PASSWORD_RESET: 30 * 60,
    MAGIC_LINK: 15 * 60,
    MFA_CHALLENGE: 5 * 60,
    GITHUB_INSTALL_STATE: 10 * 60,
  },
  EXPIRY: {
    ACCESS: "15m",
    REFRESH: "30d",
    EMAIL_VERIFICATION: "24h",
    PASSWORD_RESET: "30m",
    MAGIC_LINK: "15m",
    MFA_CHALLENGE: "5m",
    DEVICE_VERIFICATION: "10m",
    INVITATION: "7d",
    IMPERSONATION: "30m",
    API_KEY: "365d",
    PERSONAL_ACCESS_TOKEN: "365d",
    SERVICE_ACCOUNT: "365d",
    CLI: "30d",
  },

  /* -------------------------------------------------------------------------- */
  /* Claims                                                                      */
  /* -------------------------------------------------------------------------- */

  CLAIMS: {
    SUBJECT: "sub",
    SESSION_ID: "sessionId",
    DEVICE_ID: "deviceId",
    ORGANIZATION_ID: "organizationId",
    WORKSPACE_ID: "workspaceId",
    USER_TOKEN_VERSION: "userTokenVersion",
    DEVICE_TOKEN_VERSION: "deviceTokenVersion",
    ROLE: "role",
    PERMISSIONS: "permissions",
    SCOPES: "scopes",
    TOKEN_TYPE: "type",
    IMPERSONATOR_ID: "impersonatorId",
    AUTH_METHOD: "amr",
    AUTH_CONTEXT: "acr",
  },

  /* -------------------------------------------------------------------------- */
  /* Token Types                                                                 */
  /* -------------------------------------------------------------------------- */

  TOKEN_TYPE: {
    ACCESS: "access",

    REFRESH: "refresh",

    EMAIL_VERIFICATION: "email_verification",

    PASSWORD_RESET: "password_reset",

    MAGIC_LINK: "magic_link",

    MFA_CHALLENGE: "mfa_challenge",

    DEVICE_VERIFICATION: "device_verification",

    INVITATION: "invitation",

    IMPERSONATION: "impersonation",

    API_KEY: "api_key",

    PERSONAL_ACCESS_TOKEN: "personal_access_token",

    SERVICE_ACCOUNT: "service_account",

    CLI: "cli",
  },

  /* -------------------------------------------------------------------------- */
  /* Rotation                                                                    */
  /* -------------------------------------------------------------------------- */

  ROTATION: {
    ENABLE_REFRESH_ROTATION: true,
    REVOKE_REFRESH_ON_USE: true,
    KEY_ROTATION_DAYS: 90,
  },
} as const;

export type JwtAlgorithm = (typeof JWT.SUPPORTED_ALGORITHMS)[number];
export type JwtTokenType = (typeof JWT.TOKEN_TYPE)[keyof typeof JWT.TOKEN_TYPE];
