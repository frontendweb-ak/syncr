import type { Logger } from "pino";
import type { AppConfig } from "../../config";
import type { RepoContext } from "../../core/base/base.repo";
import { LoggedService } from "../../core/base/logger.service";
import { Errors } from "../../errors";
import type { JwtService } from "../../lib";
import { type NewRole, RoleRepo } from "./role.repo";

export class RoleService extends LoggedService {
  private readonly repo: RoleRepo;

  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
  ) {
    super(db, jwt, config, logger);
    this.repo = new RoleRepo(db);
  }
  async createRole(data: NewRole) {
    const existing = await this.repo.findBySlug(data.slug, data.organizationId);
    if (existing) throw Errors.role.alreadyExists();
    return this.repo.create(data);
  }
  async getRole(id: string) {
    const role = await this.repo.findById(id);
    if (!role) throw new Error("Role not found");
    return role;
  }
  async getRoles(organizationId?: string) {
    return this.repo.list(organizationId);
  }
  async updateRole(id: string, data: Partial<NewRole>) {
    return this.repo.update(id, data);
  }
  async deleteRole(id: string) {
    await this.repo.softDelete(id);
  }
}
