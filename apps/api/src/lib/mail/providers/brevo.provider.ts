// src/lib/mail/providers/brevo.provider.ts

import type { EmailProvider, SendEmailInput } from "./email.provider";

export interface BrevoProviderOptions {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  replyTo?: string;
}

export class BrevoProvider implements EmailProvider {
  constructor(private readonly options: BrevoProviderOptions) {}

  async send(input: SendEmailInput): Promise<void> {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": this.options.apiKey,
      },
      body: JSON.stringify({
        sender: {
          email: this.options.fromEmail,
          ...(this.options.fromName ? { name: this.options.fromName } : {}),
        },
        to: (Array.isArray(input.to) ? input.to : [input.to]).map((email) => ({
          email,
        })),

        subject: input.subject,
        htmlContent: input.html,
        textContent: input.text,

        ...(this.options.replyTo
          ? {
              replyTo: {
                email: this.options.replyTo,
              },
            }
          : {}),

        tags: input.tags
          ? Object.entries(input.tags).map(([k, v]) => `${k}:${v}`)
          : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      throw new Error(`Brevo send failed: ${response.status} ${error}`);
    }
  }
}
