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
import type { RepoContext } from "../../../core/base/base.repo";
import { BaseRepo } from "../../../core/base/base.repo";

export type LoginHistoryEntry = InferSelectModel<typeof loginHistory>;
type NewLoginHistoryEntry = InferInsertModel<typeof loginHistory>;

class LoginHistoryRepo extends BaseRepo {
  async create(data: NewLoginHistoryEntry): Promise<void> {
    await this.db.insert(loginHistory).values(data);
  }

  async listForUser(
    userId: string,
    limit: number,
  ): Promise<LoginHistoryEntry[]> {
    return this.db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.userId, userId))
      .orderBy(desc(loginHistory.createdAt))
      .limit(limit);
  }
}

export interface RecordLoginAttemptInput {
  userId?: string;
  deviceId?: string;
  loginIdentifier?: string;
  ipAddress?: string;
  userAgent?: string;
  loginMethod: LoginHistoryEntry["loginMethod"];
  success: boolean;
  failureReason?: LoginHistoryEntry["failureReason"];
}

export class LoginHistoryService {
  private readonly repo: LoginHistoryRepo;

  constructor(db: RepoContext) {
    this.repo = new LoginHistoryRepo(db);
  }

  async record(input: RecordLoginAttemptInput): Promise<void> {
    await this.repo.create({
      userId: input.userId,
      deviceId: input.deviceId,
      loginIdentifier: input.loginIdentifier,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      loginMethod: input.loginMethod,
      success: input.success,
      failureReason: input.failureReason,
    });
  }

  async listForUser(userId: string, limit = 50): Promise<LoginHistoryEntry[]> {
    return this.repo.listForUser(userId, limit);
  }
}
