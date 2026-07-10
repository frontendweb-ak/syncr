// ─────────────────────────────────────────────────────────────────
// src/lib/email/providers/console.provider.ts
// ─────────────────────────────────────────────────────────────────
// Zero-config provider for local development and unit/integration
// tests: no network call, no API key, just a readable dump so you can
// see the exact subject/body/recipients being sent.
// (Your pasted draft had a broken template literal — a stray `$` and
// no interpolation braces around `{input.to}` — so it would have
// printed the literal text "$" then "{input.to}" instead of the
// address. Fixed.)
// ─────────────────────────────────────────────────────────────────
import type { EmailSendResult, SendEmailInput } from "../email.types";
import type { EmailProvider } from "./email.provider";

export class ConsoleProvider implements EmailProvider {
  readonly name = "console";

  async send(input: SendEmailInput): Promise<EmailSendResult> {
    const to = Array.isArray(input.to) ? input.to.join(", ") : input.to;
    const border = "─".repeat(60);

    console.log(`\n[ConsoleProvider] ${border}`);
    console.log(`  TO:      ${to}`);
    if (input.cc?.length) console.log(`  CC:      ${input.cc.join(", ")}`);
    if (input.bcc?.length) console.log(`  BCC:     ${input.bcc.join(", ")}`);
    console.log(`  SUBJECT: ${input.subject}`);
    if (input.tags && Object.keys(input.tags).length > 0) {
      console.log(`  TAGS:    ${JSON.stringify(input.tags)}`);
    }
    console.log(
      `  TEXT:\n${input.text
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n")}`,
    );
    console.log(`[ConsoleProvider] ${border}\n`);

    return { provider: this.name, messageId: crypto.randomUUID() };
  }
}
