// src/core/base/base.service.ts
//
// Every service in this codebase (UserService, DeviceService) already
// follows the same shape by hand: take a RepoContext in the constructor,
// construct one or more Repos from it. This formalizes that pattern and
// adds the one thing none of them have yet: a withTransaction() helper
// so multi-repo operations (e.g. "create mentorship + decrement mentor
// capacity + write an audit log row") can run atomically.
//
// Services are constructed per-request from a controller, using the
// request-scoped db: `new UserService(c.get("db"))`. This is cheap — it's
// just object construction, not a new connection (the underlying pool is
// already built once in app.ts, see middleware/db.ts).

import type { Db, Transaction } from "@syncr/db";
import type { RepoContext } from "./base.repo";

export abstract class BaseService {
  constructor(protected readonly db: RepoContext) {}

  /**
   * Runs `fn` inside a database transaction, passing the transaction
   * handle through so any Repo constructed inside `fn` participates in
   * the same atomic unit of work.
   *
   * IMPORTANT: only call this when `this.db` is a full `Db` (i.e. this
   * service was constructed from the request-scoped db, not from inside
   * an outer transaction already) — nested transactions aren't supported
   * by postgres-js and this guards against that mistake explicitly rather
   * than failing confusingly inside the driver.
   *
   * @example
   *   async createMentorship(input: CreateMentorshipInput) {
   *     return this.withTransaction(async (tx) => {
   *       const mentorship = await new MentorshipRepo(tx).create(input);
   *       await new MentorRepo(tx).decrementCapacity(input.mentorId);
   *       await new AuditLogRepo(tx).record({ ... });
   *       return mentorship;
   *     });
   *   }
   */
  protected async withTransaction<T>(
    fn: (tx: Transaction) => Promise<T>,
  ): Promise<T> {
    if (!this.isFullDb(this.db)) {
      throw new Error(
        "withTransaction() called on a service already running inside a " +
          "transaction — nested transactions are not supported. Construct " +
          "this service with the request-scoped db, not a transaction handle.",
      );
    }

    return this.db.transaction(fn);
  }

  private isFullDb(db: RepoContext): db is Db {
    // Db exposes .transaction(); a Transaction handle does not (postgres-js
    // and Drizzle both omit it on the tx object to prevent nesting). This
    // is a structural check rather than an instanceof check because Db and
    // Transaction are both interface types from @aim/db, not classes.
    return typeof (db as Db).transaction === "function";
  }

  protected first<T>(rows: readonly T[]): T | null {
    return rows[0] ?? null;
  }

  protected firstOrThrow<T>(rows: readonly T[], error: Error): T {
    const row = rows[0];
    if (!row) throw error;
    return row;
  }
}
