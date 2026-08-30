import type { UserStatus } from "@syncr/types";
import type { Logger } from "pino";
import type { AppConfig } from "../../config";
import { BaseService } from "../../core/base";
import type { RepoContext } from "../../core/base/base.repo";
import { Errors } from "../../errors";
import { type NewUser, UserRepo } from "./user.repo";

export class UserService extends BaseService {
  private readonly repo: UserRepo;

  constructor(
    db: RepoContext,

    config: AppConfig,
    logger?: Logger,
  ) {
    super(db, config, logger);
    this.repo = new UserRepo(db);
  }

  async createUser(input: NewUser) {
    const user = await this.repo.create(input);
    return user;
  }

  async getById(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw Errors.user.notFound();
    return user;
  }

  async getByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.repo.verifyEmail(userId);
  }

  async update(userId: string, data: Partial<NewUser>) {
    return this.repo.update(userId, data);
  }

  async updateStatus(
    userId: string,
    status: UserStatus,
    reason?: string,
  ): Promise<void> {
    await this.repo.updateStatus(userId, status, reason);
  }

  async updateLastSeen(userId: string): Promise<void> {
    await this.repo.updateLastSeen(userId);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.repo.updateLastLogin(userId);
  }

  async deleteUser(userId: string) {
    return this.repo.softDelete(userId);
  }

  async bumpTokenVersion(userId: string) {
    return this.repo.bumpTokenVersion(userId);
  }
}
