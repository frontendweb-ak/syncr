import type { Context } from "hono";

import type { AppContext } from "../../types/env";
import { HealthService } from "./health.service";

export const healthController = {
  async get(c: Context<AppContext>) {
    const config = c.get("config");
    const service = new HealthService(c.get("db"), c.get("logger"), {
      service: "syncr-api",
      environment: config.APP_ENV,
      version: process.env.npm_package_version ?? "development",
    });
    const result = await service.check();
    return c.json(result, result.success ? 200 : 503);
  },
};
