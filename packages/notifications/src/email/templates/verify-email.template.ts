import { EmailTemplate } from "../email.types";

export interface VerifyEmailTemplateInput {
  name: string;
  verificationUrl: string;
}

export function verifyEmailTemplate(
  input: VerifyEmailTemplateInput,
): EmailTemplate {
  return {
    subject: "Verify your email address",

    html: `
      <!doctype html>
      <html>
      <body>
        <h1>Welcome to Syncr</h1>

        <p>Hi ${input.name},</p>

        <p>
          Please verify your email address to activate your account.
        </p>

        <p>
          <a href="${input.verificationUrl}">
            Verify Email
          </a>
        </p>

        <p>
          If you didn't create this account, you can ignore this email.
        </p>
      </body>
      </html>
    `,

    text: `
Welcome to Syncr

Hi ${input.name},

Please verify your email address:

${input.verificationUrl}

If you didn't create this account you can ignore this email.
    `.trim(),
  };
}
