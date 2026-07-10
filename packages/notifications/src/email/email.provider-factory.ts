import type { EmailConfig } from "./email.config";
import { BrevoProvider } from "./providers/brevo.provider";
import { ConsoleProvider } from "./providers/console.provider";
import type { EmailProvider } from "./providers/email.provider";
import { SesProvider } from "./providers/ses.provider";

export function createEmailProvider(config: EmailConfig): EmailProvider {
  switch (config.provider) {
    case "console":
      return new ConsoleProvider();

    case "brevo":
      return new BrevoProvider({
        apiKey: config.brevo!.apiKey,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
      });

    case "ses":
      return new SesProvider({
        region: config.ses!.region,
        accessKeyId: config.ses!.accessKeyId,
        secretAccessKey: config.ses!.secretAccessKey,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
        ...(config.ses?.configurationSetName
          ? { configurationSetName: config.ses.configurationSetName }
          : {}),
        ...(config.replyTo ? { replyTo: config.replyTo } : {}),
      });

    default: {
      const exhaustive = config.provider;
      throw new Error(`Unsupported email provider: ${exhaustive}`);
    }
  }
}
