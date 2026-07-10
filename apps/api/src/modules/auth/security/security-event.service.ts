// src/modules/auth/security/security-event.service.ts
//
// Technical Design §7. Every event in securityEventTypeEnum is recorded
// here, called from the relevant point in AuthService — never inferred
// after the fact from login_history alone, since some events (password
// change, lockout) aren't login attempts at all.

import type { RepoContext } from "../../../core/base/base.repo";
import {
  type NewSecurityEvent,
  type SecurityEvent,
  SecurityEventRepo,
} from "./security-event.repo";




export class SecurityEventService {
  private readonly repo: SecurityEventRepo;

  constructor(db: RepoContext) {
    this.repo = new SecurityEventRepo(db);
  }

  async record(input: NewSecurityEvent): Promise<void> {
    await this.repo.create({
      userId: input.userId,
      deviceId: input.deviceId,
      eventType: input.eventType,
      ipAddress: input.ipAddress,
      metadata: input.metadata,
    });
  }

  async getRecentByUser(userId: string, limit = 50): Promise<SecurityEvent[]> {
    return this.repo.findRecentByUser(userId, limit);
  }

  async cleanup(days: number): Promise<number> {
    return this.repo.deleteOlderThan(days);
  }
}
