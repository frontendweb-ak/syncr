import crypto from "node:crypto";

import type { Logger } from "pino";

import type { AppConfig } from "../../../config";
import type { RepoContext } from "../../../core/base/base.repo";
import { LoggedService } from "../../../core/base/logger.service";
import { Errors } from "../../../errors";
import type { JwtService } from "../../../lib";
import { ApiKeyRepo, type NewApiKey } from "./api-key.repo";

export class ApiKeyService extends LoggedService {
  private readonly repo: ApiKeyRepo;

  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
  ) {
    super(db, jwt, config, logger);
    this.repo = new ApiKeyRepo(db);
  }

  async create(input: NewApiKey) {
    return this.repo.create(input);
  }

  async getById(id: string) {
    const apiKey = await this.repo.findById(id);

    if (!apiKey) {
      throw Errors.apiKey.notFound();
    }

    return apiKey;
  }

  async getByPrefix(prefix: string) {
    return this.repo.findByPrefix(prefix);
  }

  async listUserKeys(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async listOrganizationKeys(organizationId: string) {
    return this.repo.findByOrganizationId(organizationId);
  }

  async revoke(apiKeyId: string, revokedBy: string, reason?: string) {
    const apiKey = await this.getById(apiKeyId);

    if (apiKey.status === "REVOKED") {
      return;
    }

    await this.repo.revoke(apiKeyId, revokedBy, reason);
  }

  async activate(apiKeyId: string) {
    const apiKey = await this.getById(apiKeyId);

    if (apiKey.status === "ACTIVE") {
      return apiKey;
    }

    await this.repo.activate(apiKeyId);

    return this.getById(apiKeyId);
  }

  async delete(apiKeyId: string) {
    await this.getById(apiKeyId);

    await this.repo.delete(apiKeyId);
  }

  async touch(apiKeyId: string, ipAddress?: string) {
    await this.repo.updateUsage({
      id: apiKeyId,
      ipAddress,
    });
  }

  async validate(rawKey: string) {
    const [prefix, secret] = rawKey.split(".");

    if (!prefix || !secret) {
      throw Errors.apiKey.invalid();
    }

    const apiKey = await this.repo.findActiveByPrefix(prefix);

    if (!apiKey) {
      throw Errors.apiKey.invalid();
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw Errors.apiKey.expired();
    }

    const secretHash = crypto.createHash("sha256").update(secret).digest("hex");

    if (secretHash !== apiKey.secretHash) {
      throw Errors.apiKey.invalid();
    }

    return apiKey;
  }
}
