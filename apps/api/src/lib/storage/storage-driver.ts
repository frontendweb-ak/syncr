// src/lib/storage/storage-driver.ts
//
// Abstracts "move object" / "delete object" / "cleanup stale objects" over
// two backends:
//   - R2BindingDriver: Cloudflare Workers R2 binding. Fast, no network hop
//     through the S3 API, but only exists inside Workers.
//   - S3ObjectStoreDriver: R2's S3-compatible API. Works everywhere —
//     local Node dev, Workers, any other host — as long as R2 API token
//     credentials are configured.
//
// Presigned PUT URLs are NOT part of this interface — the R2 binding has
// no presign capability at all, so presigning always goes through the S3
// API regardless of runtime. See presigner.ts.

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import type { R2Bucket, R2PutOptions } from "@cloudflare/workers-types";
import type { AppConfig } from "../../config";

export interface CleanupResult {
  scanned: number;
  deleted: number;
}

export interface StorageDriver {
  /** Copy fromKey -> toKey, then delete fromKey. Throws if fromKey doesn't exist. */
  moveObject(fromKey: string, toKey: string): Promise<void>;
  deleteObject(key: string): Promise<void>;
  /** Delete every object under `prefix` uploaded before `olderThan`. */
  cleanupExpired(prefix: string, olderThan: Date): Promise<CleanupResult>;
}

export class ObjectNotFoundError extends Error {
  constructor(key: string) {
    super(`Object not found or already expired: ${key}`);
    this.name = "ObjectNotFoundError";
  }
}

export class R2BindingDriver implements StorageDriver {
  constructor(private readonly bucket: R2Bucket) {}

  async moveObject(fromKey: string, toKey: string): Promise<void> {
    const obj = await this.bucket.get(fromKey);
    if (!obj) throw new ObjectNotFoundError(fromKey);

    const putOptions: R2PutOptions = {};
    if (obj.httpMetadata) {
      putOptions.httpMetadata = obj.httpMetadata;
    }

    if (obj.customMetadata) {
      putOptions.customMetadata = obj.customMetadata;
    }
    await this.bucket.put(toKey, obj.body, putOptions);
    await this.bucket.delete(fromKey);
  }

  async deleteObject(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async cleanupExpired(
    prefix: string,
    olderThan: Date
  ): Promise<CleanupResult> {
    const cutoff = olderThan.getTime();
    let scanned = 0;
    let deleted = 0;
    let cursor: string | undefined;

    do {
      const page = await this.bucket.list({
        prefix,
        limit: 500,
        cursor: cursor as string,
      });

      for (const obj of page.objects) {
        scanned++;
        if (obj.uploaded.getTime() < cutoff) {
          await this.bucket.delete(obj.key);
          deleted++;
        }
      }
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);

    return { scanned, deleted };
  }
}

export class S3ObjectStoreDriver implements StorageDriver {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string
  ) {}

  async moveObject(fromKey: string, toKey: string): Promise<void> {
    try {
      await this.client.send(
        new CopyObjectCommand({
          Bucket: this.bucket,
          Key: toKey,
          CopySource: `${this.bucket}/${fromKey}`,
        })
      );
    } catch {
      throw new ObjectNotFoundError(fromKey);
    }
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: fromKey })
    );
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }

  async cleanupExpired(
    prefix: string,
    olderThan: Date
  ): Promise<CleanupResult> {
    const cutoff = olderThan.getTime();
    let scanned = 0;
    let deleted = 0;
    let continuationToken: string | undefined;

    do {
      const page = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: prefix,
          MaxKeys: 500,
          ContinuationToken: continuationToken,
        })
      );
      for (const obj of page.Contents ?? []) {
        scanned++;
        if (
          obj.Key &&
          obj.LastModified &&
          obj.LastModified.getTime() < cutoff
        ) {
          await this.deleteObject(obj.Key);
          deleted++;
        }
      }
      continuationToken = page.IsTruncated
        ? page.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return { scanned, deleted };
  }
}

export function createS3Client(config: AppConfig): S3Client | null {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = config;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Prefer the R2 binding when running in Workers (no network hop for
 * get/put/delete/list). Fall back to the S3-compatible API everywhere
 * else — this is what makes local Node dev behave identically to prod.
 */
export function createStorageDriver(
  config: AppConfig,
  r2Binding: R2Bucket | null,
  s3Client: S3Client | null
): StorageDriver | null {
  if (r2Binding) return new R2BindingDriver(r2Binding);
  if (s3Client) return new S3ObjectStoreDriver(s3Client, config.R2_BUCKET_NAME);
  return null;
}
