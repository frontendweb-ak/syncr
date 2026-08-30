import type { Logger } from "pino";
import type { AppConfig } from "../../../config";
import { BaseService } from "../../../core/base";
import type { RepoContext } from "../../../core/base/base.repo";
import { Errors } from "../../../errors";
import { type NewPasskey, PasskeyRepo } from "./passkeys.repo";

export class PasskeyService extends BaseService {
  private readonly repo: PasskeyRepo;

  constructor(db: RepoContext, config: AppConfig, logger: Logger) {
    super(db, config, logger);
    this.repo = new PasskeyRepo(db);
  }

  async register(input: NewPasskey) {
    const existing = await this.repo.findByCredentialId(input.credentialId);
    if (existing) throw Errors.auth.passkeyAlreadyExists();
    return this.repo.create(input);
  }

  async getById(id: string) {
    const passkey = await this.repo.findById(id);
    if (!passkey) throw Errors.auth.passkeyNotFound();
    return passkey;
  }

  async getByCredentialId(credentialId: string) {
    const passkey = await this.repo.findByCredentialId(credentialId);
    if (!passkey) throw Errors.auth.passkeyNotFound();
    return passkey;
  }

  async listForUser(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async updateCounter(credentialId: string, newCounter: number) {
    const passkey = await this.getByCredentialId(credentialId);
    if (newCounter < passkey.counter) {
      throw Errors.auth.passkeyCloneDetected();
    }

    await this.repo.updateCounter(passkey.id, newCounter);
    return passkey;
  }

  async rename(id: string, name: string) {
    await this.getById(id);
    await this.repo.rename(id, name);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
