// src/modules/registry/storage/storage.service.ts
//
// Minimal storage abstraction — CLI uploads a component tarball, this
// puts it at a deterministic key and returns a signed download URL on
// read. Written against R2 (per AppBindings.STORAGE in cloudflare.ts)
// with a Node fallback stub — same dual-runtime shape as kv-store.ts.
//
// ASSUMPTION: I don't have your actual storage config/env for Node local
// dev (S3-compatible endpoint? local filesystem?) — the Node branch
// throws explicitly rather than guessing, so this fails loudly in dev
// instead of silently no-op'ing.

import type { R2Bucket } from "@cloudflare/workers-types";

export interface StorageService {
  put(
    key: string,
    data: ArrayBuffer | ReadableStream,
    contentType: string,
  ): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
}

export class R2StorageService implements StorageService {
  constructor(private readonly bucket: R2Bucket) {}

  async put(
    key: string,
    data: ArrayBuffer | ReadableStream,
    contentType: string,
  ): Promise<void> {
    await this.bucket.put(key, data, { httpMetadata: { contentType } });
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    // R2 signed URLs require the S3-compatible API + AWS SigV4 signing,
    // not the native R2Bucket binding methods shown here — this binding
    // is same-worker-only access. For CLI downloads from outside the
    // Worker, route through a signed-URL-issuing endpoint using R2's
    // S3 API credentials (separate from this binding), or proxy the
    // download through a Syncr API route instead of signed URLs at all
    // for MVP simplicity. Flagging rather than guessing your R2 API
    // token setup.
    throw new Error(
      `R2StorageService.getSignedUrl not implemented — see comment. key=${key}, ttl=${expiresInSeconds}`,
    );
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }
}

export function componentVersionStorageKey(
  organizationId: string,
  componentSlug: string,
  version: string,
): string {
  return `orgs/${organizationId}/components/${componentSlug}/${version}.tar.gz`;
}
