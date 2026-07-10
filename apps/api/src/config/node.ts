// src/config/env.ts

import * as path from "node:path";
import { fileURLToPath } from "node:url";
/**
 * Environment schema.
 *
 * Validates all required environment variables at application startup.
 * If any variable is missing or invalid, the server fails fast.
 */
import * as dotenv from "dotenv";
import { envSchema } from "./schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const appEnv = process.env.APP_ENV ?? "development";

dotenv.config({
  path: path.resolve(__dirname, `../../../../.env.${appEnv}`),
});

export const env = envSchema.parse(process.env);
