import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { env } from "./config/node";
import { createLogger } from "./lib";

const app = createApp(env);
const logger = createLogger(env);

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info({ port: info.port }, "🚀 AIM API started");
});
