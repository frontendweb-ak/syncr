// ─────────────────────────────────────────────────────────────────
// src/lib/email/email.types.ts
// ─────────────────────────────────────────────────────────────────
// Canonical shapes shared by every provider and the mail service.
// This file owns data types ONLY — the `EmailProvider` contract lives
// in providers/email.provider.ts. (Your pasted draft defined
// `EmailProvider` in both files, which is a duplicate-identity bug:
// two structurally-identical-but-separate interfaces make TS unable
// to tell them apart at the call site and is confusing for anyone
// grepping for "where is this defined". One source of truth here.)
// ─────────────────────────────────────────────────────────────────

export interface SendEmailInput {
  to: string | string[];
  cc?: string[];
  bcc?: string[];

  subject: string;

  html: string;
  text: string;

  replyTo?: string;

  /** Free-form key/value pairs — providers that support tagging
   *  (SES, Brevo) attach these for analytics/webhook correlation. */
  tags?: Record<string, string>;

  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  content: ArrayBuffer | Uint8Array | string;
}

export interface EmailSendResult {
  provider: string;
  messageId: string;
}

/** Thrown by providers on a definitive send failure (bad request,
 *  auth failure, non-retryable rejection). Providers should NOT throw
 *  this for something a retry could fix — see `EmailTransientError`. */
export class EmailSendError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly statusCode?: number,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "EmailSendError";
  }
}

/** Thrown for retryable failures (timeout, 429, 5xx). The mail
 *  service's retry wrapper specifically looks for this type. */
export class EmailTransientError extends EmailSendError {
  constructor(
    message: string,
    provider: string,
    statusCode?: number,
    requestId?: string,
  ) {
    super(message, provider, statusCode, requestId);
    this.name = "EmailTransientError";
  }
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}