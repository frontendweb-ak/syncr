// src/modules/auth/security/login-history.service.ts
//
// PRD §6, BR-5. Every login attempt — success or failure — is recorded
// here. Distinct from SecurityEventService: login_history is specifically
// about authentication attempts (one row per attempt, with method and
// outcome), while security_events covers a broader set of account-state
// changes that aren't all attempts (password change, lockout, device
// revocation).

import type { LoginFailureReason, LoginMethod } from "@syncr/types";
import type { RepoContext } from "../../../core/base/base.repo";
import { type LoginHistoryEntry, LoginHistoryRepo } from "./login-history.repo";



export interface RecordLoginAttemptInput {
  userId?: string;
  deviceId?: string;
  loginIdentifier?: string;
  ipAddress?: string;
  userAgent?: string;
  loginMethod: LoginMethod;
  success: boolean;
  failureReason?: LoginFailureReason;
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

  async getById(id: string) {
    return this.repo.findById(id);
  }

  async listForUser(userId: string, limit = 50): Promise<LoginHistoryEntry[]> {
    return this.repo.findRecentByUser(userId, limit);
  }
}
