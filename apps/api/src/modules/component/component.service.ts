// src/modules/registry/component/component.service.ts

import type { Logger } from "pino";
import type { AppConfig } from "../../config";
import type { RepoContext } from "../../core/base/base.repo";
import { LoggedService } from "../../core/base/logger.service";
import { Errors } from "../../errors";
import type { JwtService } from "../../lib";
import {
  componentVersionStorageKey,
  type StorageService,
} from "../registry/storage/storage.service";
import {
  type ComponentVersion,
  ComponentVersionRepo,
} from "./component-version.repo";
import { type Component, ComponentRepo } from "./component.repo";
import { isGreaterSemver, isValidSemver } from "./semver";

export interface CreateComponentInput {
  organizationId: string;
  slug: string;
  name: string;
  description?: string;
  framework: string; // matches componentFramework enum values
  isPublic?: boolean;
}

export interface PublishVersionInput {
  organizationId: string;
  slug: string;
  version: string;
  changelog?: string;
  isBreaking: boolean;
  tarball: ArrayBuffer;
  contentHash: string; // SHA-256, computed by the CLI before upload — see note below
  publishedByUserId: string;
}

export class ComponentService extends LoggedService {
  private readonly repo: ComponentRepo;
  private readonly versionRepo: ComponentVersionRepo;

  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger: Logger,
    private readonly storage: StorageService,
  ) {
    super(db, jwt, config, logger);
    this.repo = new ComponentRepo(db);
    this.versionRepo = new ComponentVersionRepo(db);
  }

  async create(input: CreateComponentInput): Promise<Component> {
    const existing = await this.repo.findBySlug(
      input.organizationId,
      input.slug,
    );
    if (existing) throw Errors.component.slugTaken();

    return this.repo.create({
      organizationId: input.organizationId,
      slug: input.slug,
      name: input.name,
      description: input.description,
      framework: input.framework as Component["framework"],
      isPublic: input.isPublic ?? false,
    });
  }

  async get(organizationId: string, slug: string): Promise<Component> {
    return this.repo.findBySlugOrThrow(organizationId, slug);
  }

  async list(
    organizationId: string,
    includeDeprecated = false,
  ): Promise<Component[]> {
    return this.repo.listForOrg(organizationId, { includeDeprecated });
  }

  async update(
    organizationId: string,
    slug: string,
    data: { name?: string; description?: string },
  ): Promise<Component> {
    return this.repo.update(organizationId, slug, data);
  }

  async deprecate(
    organizationId: string,
    slug: string,
    note: string,
  ): Promise<Component> {
    if (!note?.trim()) throw Errors.component.deprecationNoteRequired();
    return this.repo.deprecate(organizationId, slug, note);
  }

  async delete(organizationId: string, slug: string): Promise<void> {
    const component = await this.repo.findBySlugOrThrow(organizationId, slug);
    if (component.repoUsageCount > 0) {
      // Don't silently orphan repos that depend on this component — per
      // BRD EC-9, deletion should mark consuming RepoComponent rows
      // orphaned, not disappear the component out from under them
      // without any signal. For MVP, block the delete and point at
      // deprecate() instead; the softer "orphan on delete" handling is
      // detection-module work (#9/#10), not this module's job.
      throw Errors.component.hasActiveConsumers(component.repoUsageCount);
    }
    await this.repo.softDelete(organizationId, slug);
  }

  /**
   * Publishes a new version. This is `syncr publish`'s target.
   *
   * Ordering matters here and is deliberate:
   *  1. Validate semver format
   *  2. Reject exact-content-hash duplicates (no-op republish)
   *  3. Reject versions that aren't strictly greater than latest
   *  4. Upload to storage BEFORE writing the DB row — a failed upload
   *     must never leave a dangling ComponentVersion row pointing at a
   *     tarball that doesn't exist.
   *  5. Write the (immutable) version row
   *  6. Update the component's denormalised latestVersion pointer
   *
   * NOTE ON contentHash: computed CLIENT-SIDE by the CLI and sent as a
   * field, not recomputed server-side from the uploaded bytes. That's a
   * trust boundary worth flagging explicitly — a malicious/buggy CLI
   * could lie about the hash. For MVP this is acceptable (the hash is
   * used for no-op detection and drift-detection matching, not as a
   * security integrity check), but if that changes, recompute
   * server-side from the uploaded bytes instead of trusting the client.
   */
  async publish(input: PublishVersionInput): Promise<ComponentVersion> {
    if (!isValidSemver(input.version)) {
      throw Errors.component.invalidVersion(input.version);
    }

    const component = await this.repo.findBySlugOrThrow(
      input.organizationId,
      input.slug,
    );

    const hashMatch = await this.versionRepo.findByContentHash(
      component.id,
      input.contentHash,
    );
    if (hashMatch) {
      throw Errors.component.noopRepublish(hashMatch.version);
    }

    if (
      component.latestVersion &&
      !isGreaterSemver(input.version, component.latestVersion)
    ) {
      throw Errors.component.versionNotGreater(
        input.version,
        component.latestVersion,
      );
    }

    const storageKey = componentVersionStorageKey(
      input.organizationId,
      input.slug,
      input.version,
    );
    await this.storage.put(storageKey, input.tarball, "application/gzip");

    let newVersion: ComponentVersion;
    try {
      newVersion = await this.versionRepo.create({
        componentId: component.id,
        version: input.version,
        changelog: input.changelog,
        isBreaking: input.isBreaking,
        storageKey,
        contentHash: input.contentHash,
        publishedByUserId: input.publishedByUserId,
      });
    } catch (err) {
      // DB write failed after a successful upload — orphaned object in
      // storage. Not cleaned up automatically here (best-effort delete
      // could itself fail and mask the original error); log loudly so
      // it's visible for manual cleanup or a future reconciliation job.
      this.logger?.error(
        { err, storageKey },
        "Component version DB write failed after storage upload — orphaned object",
      );
      throw err;
    }

    await this.repo.updateLatestVersion(
      component.id,
      newVersion.id,
      newVersion.version,
    );

    // TODO (out of scope for this module — belongs to #9/#10): this is
    // the exact point where drift-proposal generation should trigger for
    // every out-of-sync RepoComponent referencing this component. Not
    // wired here on purpose — see DetectionService.maybeCreateProposal
    // delivered earlier, which expects to be called from here once that
    // module is built.

    this.logger?.info(
      { componentId: component.id, version: newVersion.version },
      "Component version published",
    );

    return newVersion;
  }

  async listVersions(
    organizationId: string,
    slug: string,
  ): Promise<ComponentVersion[]> {
    const component = await this.repo.findBySlugOrThrow(organizationId, slug);
    return this.versionRepo.listForComponent(component.id);
  }

  async getVersion(
    organizationId: string,
    slug: string,
    version: string,
  ): Promise<ComponentVersion> {
    const component = await this.repo.findBySlugOrThrow(organizationId, slug);
    const found = await this.versionRepo.findByComponentAndVersion(
      component.id,
      version,
    );
    if (!found) throw Errors.component.versionNotFound(version);
    return found;
  }
}
