// src/lib/storage/storage-key.service.ts

const TEMP_PREFIX = "temp";
export const PROPOSE_TYPES = [
  "avatar",
  "document",
  "evidence",
  "task-submission",
  "resource",
  "gallery",
  "assignment",
  "chat",
  "certificate",
  "cover",
] as const;

export type ProposeType = (typeof PROPOSE_TYPES)[number];

export class StorageKeyService {
  /**
   * Temporary key used before upload confirmation.
   *
   * temp/{userId}/{purpose}/{uuid}.{ext}
   */
  buildTempKey(
    userId: string,
    purpose: ProposeType,
    extension?: string,
  ): string {
    const uuid = crypto.randomUUID();

    return [TEMP_PREFIX, userId, purpose, this.filename(uuid, extension)].join(
      "/",
    );
  }

  /**
   * Permanent key after confirmation.
   *
   * {userId}/{purpose}/{uuid}.{ext}
   */
  buildPermanentKey(
    userId: string,
    purpose: ProposeType,
    fileId: string,
    extension?: string,
  ): string {
    return [userId, purpose, this.filename(fileId, extension)].join("/");
  }

  /**
   * Remove temp/ prefix.
   */
  confirmKey(storageKey: string): string {
    if (!storageKey.startsWith(`${TEMP_PREFIX}/`)) {
      return storageKey;
    }

    return storageKey.substring(TEMP_PREFIX.length + 1);
  }

  /**
   * Ownership check.
   */
  belongsToUser(storageKey: string, userId: string): boolean {
    const key = this.confirmKey(storageKey);

    return key.startsWith(`${userId}/`);
  }

  /**
   * Is this still a temporary upload?
   */
  isTemp(storageKey: string): boolean {
    return storageKey.startsWith(`${TEMP_PREFIX}/`);
  }

  private filename(id: string, extension?: string): string {
    if (!extension) {
      return id;
    }

    return `${id}.${extension.toLowerCase()}`;
  }
}
