import type { AppConfig } from "../../config";

export class StorageUrlService {
  constructor(private readonly config: AppConfig) {}

  /**
   * Public URL for a stored object.
   */
  publicUrl(storageKey: string): string {
    return this.baseUrl(storageKey);
  }

  /**
   * Nullable helper for entities.
   */
  getPublicUrl(storageKey: string | null): string | null {
    return storageKey ? this.baseUrl(storageKey) : null;
  }

  /**
   * Temporary upload URL (if you ever expose temp files).
   */
  tempUrl(storageKey: string): string {
    return this.baseUrl(storageKey);
  }

  /**
   * Base URL builder.
   */
  private baseUrl(storageKey: string): string {
    if (this.config.R2_PUBLIC_URL) {
      return `${this.config.R2_PUBLIC_URL}/${storageKey}`;
    }

    return `https://${this.config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${this.config.R2_BUCKET_NAME}/${storageKey}`;
  }
}
