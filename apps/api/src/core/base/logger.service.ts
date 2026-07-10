import type { Logger } from "pino";
import type { AppConfig } from "../../config";
import type { JwtService } from "../../lib/jwt";
import type { RepoContext } from "./base.repo";
import { BaseService } from "./base.service";

export abstract class LoggedService extends BaseService {
  constructor(
    db: RepoContext,
    protected readonly jwt: JwtService,
    protected readonly config: AppConfig,
    protected readonly logger?: Logger,
  ) {
    super(db);
  }
}
