import { checkDatabase, type DatabaseHealth, type Db } from "@syncr/db";
import type { Logger } from "pino";

export interface HealthResponse {
  success: boolean;
  status: "healthy" | "degraded";
  service: string;
  environment: string;
  version: string;
  timestamp: string;
  uptime: number | null;
  database: DatabaseHealth;
}

export interface HealthServiceOptions {
  service: string;
  environment: string;
  version: string;
}

export class HealthService {
  constructor(
    private readonly db: Db,
    private readonly logger: Logger,
    private readonly options: HealthServiceOptions,
  ) {}

  async check(): Promise<HealthResponse> {
    try {
      const result = await checkDatabase(this.db);

      return {
        success: result.status === "up",
        status: result.status === "up" ? "healthy" : "degraded",

        service: this.options.service,
        environment: this.options.environment,
        version: this.options.version,

        timestamp: new Date().toISOString(),

        uptime:
          typeof process !== "undefined" && process.uptime
            ? Math.floor(process.uptime())
            : null,
        database: result,
      };
    } catch (err) {
      this.logger.error({ err }, "Health check failed");
      throw err;
    }
  }
}
