// src/modules/api-keys/api-key.service.ts

import crypto from "node:crypto";

import type { Logger } from "pino";

import type { AppConfig } from "../../../config";
import type { RepoContext } from "../../../core/base/base.repo";
import { LoggedService } from "../../../core/base/logger.service";
import { Errors } from "../../../errors";
import type { JwtService } from "../../../lib";
import { type ApiKey, ApiKeyRepo, type NewApiKey } from "./api-key.repo";

const KEY_PREFIX = "syncr_live_";

interface GeneratedKey {
  rawKey: string; // "syncr_live_<8 hex>.<64 hex>" — shown to the user once, never persisted
  prefix: string; // "syncr_live_<8 hex>" — persisted in the clear, used for lookup
  secretHash: string;
}

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

  private generateKey(): GeneratedKey {
    const prefix = `${KEY_PREFIX}${crypto.randomBytes(4).toString("hex")}`;
    const secret = crypto.randomBytes(32).toString("hex");
    const rawKey = `${prefix}.${secret}`;
    const secretHash = crypto.createHash("sha256").update(secret).digest("hex");

    return { rawKey, prefix, secretHash };
  }

  // The only place a PAT is minted. Controller calls this and this
  // alone — it must never build prefix/secret/hash itself.
  async create(input: NewApiKey) {
    const { rawKey, prefix, secretHash } = this.generateKey();

    const expiresAt = input.expiresAt
      ? new Date(
          Date.now() +
            new Date(input.expiresAt).getTime() * 24 * 60 * 60 * 1000,
        )
      : null;

    const key = await this.repo.create({
      userId: input.userId,
      name: input.name,
      description: input.description,
      prefix,
      secretHash,
      expiresAt,
      type: "PERSONAL",
      status: "ACTIVE",
      createdBy: input.userId,
    } satisfies NewApiKey);

    return { key, rawKey };
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

  async listUserKeys(userId: string, status?: ApiKey["status"]) {
    return this.repo.findByUserId(userId, status);
  }

  async listOrganizationKeys(
    organizationId: string,
    status?: ApiKey["status"],
  ) {
    return this.repo.findByOrganizationId(organizationId, status);
  }

  // Ownership check lives here, not in the controller — this is
  // business logic ("who is allowed to revoke this key"), and the
  // service layer is where that belongs. MVP rule: a user can only
  // revoke their own PERSONAL key. There's no "revoke others' keys"
  // permission yet, so this doesn't go through the RBAC permission
  // check — it's a flat ownership comparison.
  async revoke(apiKeyId: string, requestingUserId: string, reason?: string) {
    const apiKey = await this.getById(apiKeyId);

    if (apiKey.userId !== requestingUserId) {
      throw Errors.auth.permissionDenied("api_keys:revoke");
    }

    if (apiKey.status === "REVOKED") {
      return apiKey; // idempotent — revoking twice is not an error
    }

    await this.repo.revoke(apiKeyId, requestingUserId, reason);

    return this.getById(apiKeyId);
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

  // ipAddress is passed straight through to repo.updateUsage, which
  // maps it onto the lastUsedIp column (see the repo fix above).
  async touch(apiKeyId: string, ipAddress?: string) {
    await this.repo.updateUsage({
      id: apiKeyId,
      ...(ipAddress ? { ipAddress } : {}),
    });
  }

  // Called by the CLI bearer-token middleware on every request.
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
