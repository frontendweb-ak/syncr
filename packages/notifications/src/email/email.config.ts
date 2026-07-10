// ─────────────────────────────────────────────────────────────────
// src/lib/email/email.config.ts
// ─────────────────────────────────────────────────────────────────
// Resolves which provider to use and validates exactly the env vars
// that provider needs — fail fast at boot, not on the first send.
//
// Resolution order for the active provider:
//   1. Explicit `EMAIL_PROVIDER` env var, if set — always wins. This
//      is what lets you run `EMAIL_PROVIDER=ses` on your laptop to
//      test real SES sending, or `EMAIL_PROVIDER=console` in preview
//      if you don't want preview deploys sending real mail.
//   2. Otherwise, derived from `APP_ENV`:
//        development → console   (no network call, safe by default)
//        preview     → brevo     (real delivery, cheap, no SES
//                                  sending-reputation risk from
//                                  ephemeral preview deploys)
//        production  → ses       (cheapest at volume, already the
//                                  verified sending identity)
// ─────────────────────────────────────────────────────────────────
import { z } from "zod";

export const EmailProviderName = z.enum(["ses", "brevo", "console"]);
export type EmailProviderName = z.infer<typeof EmailProviderName>;

const RawEnvSchema = z.object({
  APP_ENV: z
    .enum(["development", "preview", "production"])
    .default("development"),
  EMAIL_PROVIDER: EmailProviderName.optional(),

  EMAIL_FROM_ADDRESS: z.email(),
  EMAIL_FROM_NAME: z.string().min(1).default("Syncr"),
  EMAIL_REPLY_TO: z.email().optional(),

  // SES
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  SES_CONFIGURATION_SET: z.string().optional(),

  // Brevo
  BREVO_API_KEY: z.string().optional(),
});

export interface EmailConfig {
  appEnv: "development" | "preview" | "production";
  provider: EmailProviderName;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  ses?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    configurationSetName?: string;
  };
  brevo?: {
    apiKey: string;
  };
}

function defaultProviderFor(appEnv: EmailConfig["appEnv"]): EmailProviderName {
  if (appEnv === "production") return "ses";
  if (appEnv === "preview") return "brevo";
  return "console";
}

/**
 * Build and validate email config from a plain env-like object.
 * Works with `process.env` (Node) or a Cloudflare Workers `env`
 * bindings object — anything with string values.
 */
export function loadEmailConfig(
  rawEnv: Record<string, string | undefined>,
): EmailConfig {
  const parsed = RawEnvSchema.parse(rawEnv);
  const provider = parsed.EMAIL_PROVIDER ?? defaultProviderFor(parsed.APP_ENV);

  const cfg: EmailConfig = {
    appEnv: parsed.APP_ENV,
    provider,
    fromEmail: parsed.EMAIL_FROM_ADDRESS,
    fromName: parsed.EMAIL_FROM_NAME,
    ...(parsed.EMAIL_REPLY_TO ? { replyTo: parsed.EMAIL_REPLY_TO } : {}),
  };

  if (provider === "ses") {
    const missing = (
      ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"] as const
    ).filter((key) => !parsed[key]);
    if (missing.length > 0) {
      throw new Error(
        `Email provider is "ses" but missing env vars: ${missing.join(", ")}. ` +
          `Set EMAIL_PROVIDER=console to run locally without AWS credentials.`,
      );
    }
    cfg.ses = {
      region: parsed.AWS_REGION!,
      accessKeyId: parsed.AWS_ACCESS_KEY_ID!,
      secretAccessKey: parsed.AWS_SECRET_ACCESS_KEY!,
      ...(parsed.SES_CONFIGURATION_SET
        ? { configurationSetName: parsed.SES_CONFIGURATION_SET }
        : {}),
    };
  }

  if (provider === "brevo") {
    if (!parsed.BREVO_API_KEY) {
      throw new Error(
        'Email provider is "brevo" but BREVO_API_KEY is not set. ' +
          "Set EMAIL_PROVIDER=console to run locally without a Brevo key.",
      );
    }
    cfg.brevo = { apiKey: parsed.BREVO_API_KEY };
  }

  return cfg;
}
