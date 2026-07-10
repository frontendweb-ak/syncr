// src/modules/auth/security/login-history.service.ts
//
// PRD §6, BR-5. Every login attempt — success or failure — is recorded
// here. Distinct from SecurityEventService: login_history is specifically
// about authentication attempts (one row per attempt, with method and
// outcome), while security_events covers a broader set of account-state
// changes that aren't all attempts (password change, lockout, device
// revocation).

import { loginHistory } from "@syncr/db";
import {
  desc,
  eq,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";

import { BaseRepo } from "../../../core/base/base.repo";
import { Errors } from "../../../errors";

export type LoginHistoryEntry = InferSelectModel<typeof loginHistory>;
type NewLoginHistoryEntry = InferInsertModel<typeof loginHistory>;

export class LoginHistoryRepo extends BaseRepo {
  async create(data: NewLoginHistoryEntry): Promise<LoginHistoryEntry> {
    const rows = await this.db.insert(loginHistory).values(data).returning();
    return this.firstOrThrow(rows, Errors.auth.loginHistoryCreateFailed());
  }

  async findById(id: string): Promise<LoginHistoryEntry | null> {
    const rows = await this.db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.id, id))
      .limit(1);

    return this.first(rows);
  }

  async findRecentByUser(
    userId: string,
    limit = 50,
  ): Promise<LoginHistoryEntry[]> {
    return this.db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.userId, userId))
      .orderBy(desc(loginHistory.createdAt))
      .limit(limit);
  }
}
