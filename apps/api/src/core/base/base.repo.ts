// core/base/base.repo.ts

import type { Db, Transaction } from "@syncr/db";

export type RepoContext = Db | Transaction;

export abstract class BaseRepo {
  constructor(protected readonly db: RepoContext) {}

  protected first<T>(rows: T[]): T | null {
    return rows[0] ?? null;
  }

  protected firstOrThrow<T>(rows: T[], error: Error): T {
    const row = rows[0];

    if (!row) {
      throw error;
    }

    return row;
  }

  protected exists<T>(rows: T[]): boolean {
    return rows.length > 0;
  }
}
