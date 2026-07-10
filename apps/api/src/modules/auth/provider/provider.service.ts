import type { AuthProvider } from "@syncr/types";
import type { Logger } from "pino";
import type { AppConfig } from "../../../config";
import type { RepoContext } from "../../../core/base/base.repo";
import { LoggedService } from "../../../core/base/logger.service";
import { Errors } from "../../../errors";
import type { JwtService } from "../../../lib";
import {
  AuthProviderRepo,
  type NewUserAuthProvider,
  type UserAuthProvider,
} from "./provider.repo";

export class AuthProviderService extends LoggedService {
  private readonly repo: AuthProviderRepo;
  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
  ) {
    super(db, jwt, config, logger);
    this.repo = new AuthProviderRepo(db);
  }

  /**
   * Link an OAuth provider to a user.
   */
  async linkProvider(data: NewUserAuthProvider) {
    const exists = await this.repo.existsProvider(
      data.provider,
      data.providerId,
    );
    if (exists) throw Errors.auth.providerAlreadyLinked();
    const provider = await this.repo.linkProvider(data);
    return provider;
  }

  /**
   * Remove a linked provider.
   */
  async unlinkProvider(userId: string, provider: AuthProvider): Promise<void> {
    await this.repo.unlinkProvider(userId, provider);
    this.logger?.info({ userId, provider }, "OAuth provider unlinked");
  }

  /**
   * Get all providers linked to a user.
   */
  async getLinkedProviders(userId: string): Promise<UserAuthProvider[]> {
    return this.repo.findByUserId(userId);
  }

  /**
   * Returns true if the provider is linked.
   */
  async isLinked(
    provider: UserAuthProvider["provider"],
    providerId: string,
  ): Promise<boolean> {
    return this.repo.existsProvider(provider, providerId);
  }

  /**
   * Find linked provider by provider account.
   */
  async getProvider(
    provider: UserAuthProvider["provider"],
    providerId: string,
  ): Promise<UserAuthProvider> {
    const linked = await this.repo.findByProvider(provider, providerId);

    if (!linked) {
      throw Errors.auth.providerNotFound();
    }

    return linked;
  }

  /**
   * Update provider account identifier.
   */
  async updateProviderId(id: string, providerId: string): Promise<void> {
    const provider = await this.repo.findById(id);
    if (!provider) throw Errors.auth.providerNotFound();
    await this.repo.updateProviderId(id, providerId);
  }

  /**
   * Remove every linked provider for a user.
   * Used during hard account deletion.
   */
  async deleteAllForUser(userId: string): Promise<void> {
    await this.repo.deleteAllForUser(userId);
  }
}
