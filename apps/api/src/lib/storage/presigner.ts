// src/lib/storage/presigner.ts
//
// Presigned upload URLs always go through R2's S3-compatible API — the
// Workers R2 binding cannot presign at all — so this is identical in
// every runtime as long as R2 API token credentials are configured.

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 *
 * @param client
 * @param bucket
 * @param key
 * @param contentType
 * @param expiresInSeconds
 * @returns
 */
export async function presignPutUrl(
  client: S3Client,
  bucket: string,
  key: string,
  contentType: string,
  expiresInSeconds: number,
): Promise<string> {
  if (!key) throw new Error("Missing S3 key");
  if (!contentType) throw new Error("Missing content type");

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ACL: "private", // ensures file is private
  });

  return await getSignedUrl(client, command, {
    expiresIn: expiresInSeconds,
  });
}
