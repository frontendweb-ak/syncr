import type { EmailTemplate } from "../email.types";

export interface ForgotPasswordTemplateInput {
  name: string;
  resetUrl: string;
}

export function forgotPasswordTemplate(
  input: ForgotPasswordTemplateInput,
): EmailTemplate {
  return {
    subject: "Reset your Syncr password",

    html: `
      <!doctype html>
      <html>
      <body>
        <h1>Reset Your Password</h1>

        <p>Hi ${input.name},</p>

        <p>
          We received a request to reset the password for your Syncr account.
        </p>

        <p>
          <a href="${input.resetUrl}">
            Reset Password
          </a>
        </p>

        <p>
          This link will expire in <strong>30 minutes</strong> and can only be used once.
        </p>

        <p>
          If you didn't request a password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </p>
      </body>
      </html>
    `,

    text: `
Reset Your Password

Hi ${input.name},

We received a request to reset the password for your Syncr account.

Reset your password:

${input.resetUrl}

This link expires in 30 minutes and can only be used once.

If you didn't request this password reset, you can safely ignore this email.
Your password will remain unchanged.
    `.trim(),
  };
}
