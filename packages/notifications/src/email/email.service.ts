// email.service.ts

import type { EmailSendResult, SendEmailInput } from "./email.types";
import type { EmailProvider } from "./providers/email.provider";

export class EmailService {
  constructor(private readonly provider: EmailProvider) {}

  send(input: SendEmailInput): Promise<EmailSendResult> {
    return this.provider.send(input);
  }
}
