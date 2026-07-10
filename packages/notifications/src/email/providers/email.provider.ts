// ─────────────────────────────────────────────────────────────────
// src/lib/email/providers/email.provider.ts
// ─────────────────────────────────────────────────────────────────
import type { EmailSendResult, SendEmailInput } from "../email.types";

export interface EmailProvider {
  readonly name: string;
  send(input: SendEmailInput): Promise<EmailSendResult>;
}
