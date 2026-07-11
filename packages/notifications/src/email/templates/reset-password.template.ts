// packages/notifications/src/email/templates/reset-password-confirmed.template.ts

export interface ResetPasswordConfirmedTemplateInput {
  name: string;
  loginUrl: string;
  changedAt?: string;
}

export function resetPasswordConfirmedTemplate(
  input: ResetPasswordConfirmedTemplateInput,
) {
  const changedAt =
    input.changedAt ??
    new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

  return {
    subject: "Your Syncr password was changed",

    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
        <h2>Password Changed Successfully</h2>

        <p>Hi ${input.name},</p>

        <p>
          Your Syncr account password was successfully changed on:
        </p>

        <p>
          <strong>${changedAt}</strong>
        </p>

        <p>
          If you made this change, no further action is required.
        </p>

        <p>
          If you did not change your password, your account may have been compromised.
          Please reset your password immediately and contact support.
        </p>

        <p style="margin-top:32px;">
          <a
            href="${input.loginUrl}"
            style="
              background:#111827;
              color:white;
              padding:12px 24px;
              text-decoration:none;
              border-radius:8px;
              display:inline-block;
            "
          >
            Login to Syncr
          </a>
        </p>

        <hr style="margin:32px 0;" />

        <p style="font-size:12px;color:#6b7280;">
          If you didn't make this change, contact support immediately.
        </p>
      </div>
    `,

    text: `
Password Changed Successfully

Hi ${input.name},

Your Syncr password was changed on:

${changedAt}

If this was you, no action is required.

If you did not perform this action, reset your password immediately and contact support.

Login:
${input.loginUrl}
    `.trim(),
  };
}
