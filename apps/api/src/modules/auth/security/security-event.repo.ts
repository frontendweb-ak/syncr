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
  lt,
} from "drizzle-orm";

import { BaseRepo } from "../../../core/base/base.repo";
import { Errors } from "../../../errors";

export type SecurityEvent = InferSelectModel<typeof securityEvents>;
export type NewSecurityEvent = InferInsertModel<typeof securityEvents>;

export class SecurityEventRepo extends BaseRepo {
  async create(data: NewSecurityEvent): Promise<SecurityEvent> {
    const rows = await this.db.insert(securityEvents).values(data).returning();

    return this.firstOrThrow(rows, Errors.auth.securityEventCreateFailed());
  }

  async findRecentByUser(userId: string, limit = 50): Promise<SecurityEvent[]> {
    return this.db
      .select()
      .from(securityEvents)
      .where(eq(securityEvents.userId, userId))
      .orderBy(desc(securityEvents.createdAt))
      .limit(limit);
  }

  async deleteOlderThan(days: number): Promise<number> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await this.db
      .delete(securityEvents)
      .where(lt(securityEvents.createdAt, cutoff))
      .returning({ id: securityEvents.id });

    return rows.length;
  }
}
