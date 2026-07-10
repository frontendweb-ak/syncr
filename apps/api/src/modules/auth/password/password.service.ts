// src/modules/auth/password/password.service.ts
//
// Password hashing using bcryptjs.
//
// Why bcryptjs?
// - Pure JavaScript (no native addons)
// - No WebAssembly
// - Works in:
//   • Node.js
//   • Cloudflare Workers
//   • Bun
//   • Deno
// - Production proven
// - No platform-specific binaries
//
// Cost factor 12 provides a good balance between security and performance
// for authentication APIs running on Cloudflare Workers.

import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export class PasswordService {
  /**
   * Hash a plaintext password.
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Verify a plaintext password against a bcrypt hash.
   *
   * Returns false for invalid passwords or malformed hashes.
   */
  async verify(password: string, passwordHash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, passwordHash);
    } catch {
      return false;
    }
  }
}
