// src/config/constants/cookie.constants.ts

export const COOKIE = {
  /* -------------------------------------------------------------------------- */
  /* Cookie Names                                                                */
  /* -------------------------------------------------------------------------- */

  NAME: {
    ACCESS_TOKEN: "__Host-access_token",

    REFRESH_TOKEN: "__Host-refresh_token",

    CSRF_TOKEN: "__Host-csrf",

    SESSION: "__Host-session",

    DEVICE: "__Host-device",

    LOCALE: "syncr-locale",

    THEME: "syncr-theme",
  },

  /* -------------------------------------------------------------------------- */
  /* Security                                                                    */
  /* -------------------------------------------------------------------------- */

  SECURE: true,

  HTTP_ONLY: true,

  SAME_SITE: "lax" as const,

  PATH: "/",

  DOMAIN: undefined as string | undefined,

  /* -------------------------------------------------------------------------- */
  /* Expiration                                                                  */
  /* -------------------------------------------------------------------------- */

  MAX_AGE: {
    ACCESS_TOKEN: 15 * 60,

    REFRESH_TOKEN: 30 * 24 * 60 * 60,

    CSRF_TOKEN: 2 * 60 * 60,

    SESSION: 30 * 24 * 60 * 60,

    DEVICE: 365 * 24 * 60 * 60,

    LOCALE: 365 * 24 * 60 * 60,

    THEME: 365 * 24 * 60 * 60,
  },

  /* -------------------------------------------------------------------------- */
  /* CSRF                                                                        */
  /* -------------------------------------------------------------------------- */

  CSRF: {
    COOKIE_NAME: "__Host-csrf",

    HEADER_NAME: "x-csrf-token",
  },

  /* -------------------------------------------------------------------------- */
  /* Prefixes                                                                    */
  /* -------------------------------------------------------------------------- */

  PREFIX: {
    HOST: "__Host-",

    SECURE: "__Secure-",
  },
} as const;