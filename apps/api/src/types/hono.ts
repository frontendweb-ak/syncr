import type { Logger } from "pino";
import type { AppConfig } from "../config";
import type { RepoContext } from "../core/base/base.repo";
import type { AccessTokenPayload, JwtService } from "../lib/jwt";

declare module "hono" {
  interface ContextVariableMap {
    db: RepoContext;
    auth: AccessTokenPayload;
    config: AppConfig;
    logger: Logger;
    jwt: JwtService;
  }
}
