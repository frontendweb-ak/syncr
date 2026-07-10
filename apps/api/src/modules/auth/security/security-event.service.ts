// src/modules/auth/security/security-event.service.ts
//
// Technical Design §7. Every event in securityEventTypeEnum is recorded
// here, called from the relevant point in AuthService — never inferred
// after the fact from login_history alone, since some events (password
// change, lockout) aren't login attempts at all.

import { securityEvents } from "@syncr/db";
import {
  desc,
  eq,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import type { RepoContext } from "../../../core/base/base.repo";
import { BaseRepo } from "../../../core/base/base.repo";

export type SecurityEvent = InferSelectModel<typeof securityEvents>;
type NewSecurityEvent = InferInsertModel<typeof securityEvents>;

class SecurityEventRepo extends BaseRepo {
  async create(data: NewSecurityEvent): Promise<void> {
    await this.db.insert(securityEvents).values(data);
  }

  async listForUser(userId: string, limit: number): Promise<SecurityEvent[]> {
    return this.db
      .select()
      .from(securityEvents)
      .where(eq(securityEvents.userId, userId))
      .orderBy(desc(securityEvents.createdAt))
      .limit(limit);
  }
}

export interface RecordSecurityEventInput {
  userId?: string;
  deviceId?: string;
  eventType: SecurityEvent["eventType"];
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export class SecurityEventService {
  private readonly repo: SecurityEventRepo;

  constructor(db: RepoContext) {
    this.repo = new SecurityEventRepo(db);
  }

  async record(input: RecordSecurityEventInput): Promise<void> {
    await this.repo.create({
      userId: input.userId,
      deviceId: input.deviceId,
      eventType: input.eventType,
      ipAddress: input.ipAddress,
      metadata: input.metadata,
    });
  }

  async listForUser(userId: string, limit = 50): Promise<SecurityEvent[]> {
    return this.repo.listForUser(userId, limit);
  }
}
