import type { AppEnv } from "../types/cloudflare";
import { envSchema } from "./schema";

export const getEnv = (env: AppEnv) => envSchema.parse(env);
