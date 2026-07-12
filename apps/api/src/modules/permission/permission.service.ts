import type { Logger } from "pino";

import type { AppConfig } from "../../config";
import type { RepoContext } from "../../core/base/base.repo";
import { LoggedService } from "../../core/base/logger.service";
import { Errors } from "../../errors";
import type { JwtService } from "../../lib";

import { type NewPermission, PermissionRepo } from "./permission.repo";

export class PermissionService extends LoggedService {
  private readonly repo: PermissionRepo;

  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
  ) {
    super(db, jwt, config, logger);
    this.repo = new PermissionRepo(db);
  }

  async createPermission(data: NewPermission) {
    const existing = await this.repo.findByResourceAndAction(
      data.resource,
      data.action,
    );
    if (existing) throw Errors.permission.alreadyExists();
    return this.repo.create(data);
  }

  async getPermission(id: string) {
    const permission = await this.repo.findById(id);
    if (!permission) throw Errors.permission.notFound();
    return permission;
  }

  async getPermissions() {
    return this.repo.list();
  }

  async updatePermission(id: string, data: Partial<NewPermission>) {
    const permission = await this.repo.findById(id);
    if (!permission) throw Errors.permission.notFound();
    if (permission.isSystem) throw Errors.role.systemProtected();
    return this.repo.update(id, data);
  }

  async deletePermission(id: string) {
    const permission = await this.repo.findById(id);
    if (!permission) throw Errors.permission.notFound();
    if (permission.isSystem) throw Errors.role.systemProtected();
    await this.repo.delete(id);
  }
}
