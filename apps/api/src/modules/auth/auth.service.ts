import type { Logger } from "pino";
import type { AppConfig } from "../../config";
import type { RepoContext } from "../../core/base/base.repo";
import { LoggedService } from "../../core/base/logger.service";
import type { JwtService } from "../../lib";

export class AuthService extends LoggedService {
  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
  ) {
    super(db, jwt, config, logger);
  }
}
