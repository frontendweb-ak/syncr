// src/lib/mail/providers/email.provider.ts

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  tags?: Record<string, string>;
}

export interface EmailProvider {
  send(input: SendEmailInput): Promise<void>;
}
