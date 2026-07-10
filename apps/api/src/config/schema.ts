import { z } from "zod";
export const envSchema = z.object({
  APP_ENV: z.enum(["development", "preview", "staging", "production"]),
  PORT: z.coerce.number().default(4200),
  APP_URL: z.url(),

  DATABASE_URL: z.url(),

  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),

  // JWT
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("30d"),
  JWT_ISSUER: z.string().default("syncr-api"),
  JWT_AUDIENCE: z.string().default("syncr-mobile"),

  // Cashfree (optional until payment module is enabled)
  CASHFREE_APP_ID: z.string().optional(),
  CASHFREE_SECRET_KEY: z.string().optional(),
  CASHFREE_WEBHOOK_SECRET: z.string().optional(),

  // R2
  // When running inside Cloudflare Workers you already have env.STORAGE,
  // so these S3 credentials are only needed if using the S3 API elsewhere.
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),

  R2_BUCKET_NAME: z.string().default("aim-files"),
  R2_PUBLIC_URL: z.url().optional(),

  // ── Google OAuth (PRD §2.3) ──────────────────────────────────
  // Two separate client IDs because mobile (native Google Sign-In SDK)
  // and web (Google Identity Services) issue ID tokens with different
  // `aud` claims — both must be accepted, since both are equally
  // legitimate AIM clients. Optional until the OAuth module is enabled,
  // matching the existing pattern for other third-party integrations.
  GOOGLE_WEB_CLIENT_ID: z.string().optional(),
  GOOGLE_MOBILE_CLIENT_ID: z.string().optional(),

  // ── SMS / OTP (MSG91) ────────────────────────────────────────
  // Optional until the OTP module is enabled, matching the existing
  // pattern for Cashfree/Resend above. See Technical Design §6.
  MSG91_AUTH_KEY: z.string().optional(),
  // DLT-registered template ID — mandatory for any commercial OTP SMS
  // sent to an Indian number (TRAI/DLT regulation), distinct from the
  // auth key itself.
  MSG91_OTP_TEMPLATE_ID: z.string().optional(),
  MSG91_SENDER_ID: z.string().default("AIMAPP"),
  MSG91_DEFAULT_COUNTRY_CODE: z.string().default("91"),

  // ── Field-level encryption (Technical Design §10, future MFA secrets;
  // also used for any other field requiring application-layer encryption
  // at rest, e.g. mentor_payout_accounts) ─────────────────────────
  FIELD_ENCRYPTION_KEY: z.string().min(32).optional(),
  // ── Monitoring (Sentry) ──────────────────────────────────────
  SENTRY_DSN: z.url().optional(),

  // ── AWS SES ────────────────────────────────────────────────
  AWS_REGION: z.string().default("ap-south-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  SES_FROM_EMAIL: z.email().default("noreply@allindiamentors.com"),
  SES_CONFIGURATION_SET: z.string().optional(),
  SES_REPLY_TO: z.string().optional(),

  // RESEND
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().optional(),

  // google
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
});

export type AppConfig = z.infer<typeof envSchema>;
