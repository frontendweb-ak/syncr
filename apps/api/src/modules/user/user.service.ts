import type { UserStatus } from "@syncr/types";
import type { Logger } from "pino";
import type { AppConfig } from "../../config";
import type { RepoContext } from "../../core/base/base.repo";
import { LoggedService } from "../../core/base/logger.service";
import { Errors } from "../../errors";
import type { JwtService } from "../../lib";
import { type NewUser, UserRepo } from "./user.repo";

export class UserService extends LoggedService {
  private readonly repo: UserRepo;

  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
  ) {
    super(db, jwt, config, logger);
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
}
