// src/modules/github/webhook/github-webhook-event.repo.ts

import { githubWebhookEvents } from "@syncr/db/schema"; // adjust import path to your schema module
import { eq } from "drizzle-orm";
import type { RepoContext } from "../../../../core/base/base.repo";

export interface CreateWebhookEventInput {
  deliveryId: string;
  event: string;
  payload: unknown;
  providerConnectionId: string | null;
}

export class GithubWebhookEventRepo {
  constructor(private readonly db: RepoContext) {}

  /**
   * Returns the created row, or `null` if this delivery_id was already
   * stored (GitHub retry) — the unique index on delivery_id is what
   * actually enforces this; the try/catch just turns the constraint
   * violation into a clean "already have this" signal for the caller.
   */
  async createIfNew(input: CreateWebhookEventInput) {
    try {
      const [created] = await this.db
        .insert(githubWebhookEvents)
        .values({
          deliveryId: input.deliveryId,
          event: input.event,
          payload: input.payload,
          providerConnectionId: input.providerConnectionId,
          processed: false,
        })
        .returning();
      return created;
    } catch (err: any) {
      // Adjust this check to your actual Postgres driver's unique-
      // violation error shape (postgres.js / pg both differ slightly).
      if (err?.code === "23505") return null;
      throw err;
    }
  }

  async markProcessed(id: string) {
    return this.db
      .update(githubWebhookEvents)
      .set({ processed: true, processedAt: new Date() })
      .where(eq(githubWebhookEvents.id, id));
  }

  async markFailed(id: string, error: string) {
    return this.db
      .update(githubWebhookEvents)
      .set({ error })
      .where(eq(githubWebhookEvents.id, id));
  }
}
