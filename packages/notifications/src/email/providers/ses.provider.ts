// ─────────────────────────────────────────────────────────────────
// src/lib/email/providers/ses.provider.ts
// ─────────────────────────────────────────────────────────────────
// Thin adapter: EmailProvider contract → SesClient. All retry/timeout/
// signing logic lives in ses.client.ts; this file just adapts shapes.
// (Your pasted draft used `SesClient` as a type without importing it
// — would fail to compile. Fixed here.)
// ─────────────────────────────────────────────────────────────────
import { SesClient, type SesClientConfig } from "../clients/ses.client";
import type { EmailSendResult, SendEmailInput } from "../email.types";
import type { EmailProvider } from "./email.provider";

export class SesProvider implements EmailProvider {
  readonly name = "ses";
  private readonly client: SesClient;

  constructor(config: SesClientConfig) {
    this.client = new SesClient(config);
  }

  async send(input: SendEmailInput): Promise<EmailSendResult> {
    const result = await this.client.send(input);
    return { provider: this.name, messageId: result.messageId };
  }
}
