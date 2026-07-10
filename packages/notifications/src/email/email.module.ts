// email.module.ts

import { loadEmailConfig } from "./email.config";
import { createEmailProvider } from "./email.provider-factory";
import { EmailService } from "./mail.service";

export function createEmailModule(env: Record<string, string | undefined>) {
  const config = loadEmailConfig(env);
  const provider = createEmailProvider(config);
  const service = new EmailService(provider);

  return {
    config,
    provider,
    email: service,
  };
}
