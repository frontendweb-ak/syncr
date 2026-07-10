// ─────────────────────────────────────────────────────────────────
// src/lib/email/providers/brevo.provider.ts
// ─────────────────────────────────────────────────────────────────
// Brevo (ex-Sendinblue) REST provider. Good fit for preview/staging
// deploys: generous free tier, no domain-reputation warmup needed the
// way a fresh SES sending identity does.
//
// Fixed from the original draft:
//   • `messageId: result` returned the whole parsed JSON body as the
//     id (type error waiting to happen, and useless for correlating
//     webhooks) — now pulls `result.messageId` specifically.
//   • Added a timeout (AbortController) — same rationale as SES.
//   • Non-2xx now throws EmailSendError/EmailTransientError with the
//     response body attached, instead of a bare status-only message.
// ─────────────────────────────────────────────────────────────────
import type { EmailSendResult, SendEmailInput } from "../email.types";
import { EmailSendError, EmailTransientError } from "../email.types";
import type { EmailProvider } from "./email.provider";

export interface BrevoProviderConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  timeoutMs?: number;
}

interface BrevoSendResponse {
  messageId: string;
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export class BrevoProvider implements EmailProvider {
  readonly name = "brevo";
  private readonly timeoutMs: number;

  constructor(private readonly cfg: BrevoProviderConfig) {
    this.timeoutMs = cfg.timeoutMs ?? 10_000;
  }

  async send(input: SendEmailInput): Promise<EmailSendResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          "api-key": this.cfg.apiKey,
        },
        body: JSON.stringify({
          sender: { email: this.cfg.fromEmail, name: this.cfg.fromName },
          to: (Array.isArray(input.to) ? input.to : [input.to]).map(
            (email) => ({ email }),
          ),
          ...(input.cc?.length
            ? { cc: input.cc.map((email) => ({ email })) }
            : {}),
          ...(input.bcc?.length
            ? { bcc: input.bcc.map((email) => ({ email })) }
            : {}),
          ...(input.replyTo ? { replyTo: { email: input.replyTo } } : {}),
          subject: input.subject,
          htmlContent: input.html,
          textContent: input.text,
          ...(input.tags && Object.keys(input.tags).length > 0
            ? { tags: Object.values(input.tags) }
            : {}),
        }),
        signal: controller.signal,
      });
    } catch (error) {
      throw new EmailTransientError(
        `Brevo request failed: ${error instanceof Error ? error.message : String(error)}`,
        this.name,
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errText = await response
        .text()
        .catch(() => String(response.status));
      const message = `Brevo send failed (${response.status}): ${errText}`;
      if (RETRYABLE_STATUS.has(response.status)) {
        throw new EmailTransientError(message, this.name, response.status);
      }
      throw new EmailSendError(message, this.name, response.status);
    }

    const result = (await response.json()) as BrevoSendResponse;
    if (!result.messageId) {
      throw new EmailSendError(
        "Brevo returned 2xx without a messageId",
        this.name,
        response.status,
      );
    }
    return { provider: this.name, messageId: result.messageId };
  }
}
