import type { Logger } from "pino";
import type { AppConfig } from "../../../config";
import type { RepoContext } from "../../../core/base/base.repo";
import { LoggedService } from "../../../core/base/logger.service";
import type { JwtService } from "../../../lib";
import { WorkspaceRepo } from "./workspace.repo";

export class WorkspaceService extends LoggedService {
  private readonly repo: WorkspaceRepo;

  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger?: Logger,
  ) {
    super(db, jwt, config, logger);
    this.repo = new WorkspaceRepo(db);
  }
}
