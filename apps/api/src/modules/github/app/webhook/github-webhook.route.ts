// src/modules/github/webhook/github-webhook.route.ts
//
// Handles GitHub's server-to-server webhook deliveries. This is
// DIFFERENT from install.route.ts's /callback — that's a browser
// redirect with a state param; this is GitHub's backend calling yours
// directly, with no user session and no state. It can only UPDATE a
// provider_connections row that /callback already created.
//
// For MVP this processes installation lifecycle events synchronously.
// `push` events (needed for drift detection, roadmap item #10) are
// stored but only stubbed here — wiring them to DetectionService is a
// separate task once the registry (#5) exists.

import { Hono } from "hono";
import type { RepoContext } from "../../../../core/base/base.repo";
import { authMiddleware } from "../../../../middleware/auth";
import type { AppContext, AppCtx } from "../../../../types/env";
import { ProviderConnectionRepo } from "../install/provider-connection.repo";
import { GithubWebhookEventRepo } from "./github-webhook-event.repo";
import { verifyGithubSignature } from "./webhook-signature";

const webhook = new Hono<AppContext>();

/**
 * POST /api/v1/webhooks/github
 * PUBLIC (verified via HMAC signature, not auth headers).
 *
 * Always returns 200 quickly once the event is durably stored — GitHub
 * retries aggressively on non-2xx, and slow/failing responses can get an
 * endpoint suspended by GitHub after repeated failures. Processing
 * happens after the signature check but before responding, since MVP
 * volume doesn't yet justify a queue — revisit if installation count
 * grows enough that this becomes a request-time bottleneck.
 */

webhook.use("*", authMiddleware);
webhook.post("/github", async (c: AppCtx) => {
  const config = c.get("config");
  const db = c.get("db");
  const logger = c.get("logger");

  // MUST read raw text before any parsing — signature is computed over
  // the exact bytes GitHub sent.
  const rawBody = await c.req.text();
  const signature = c.req.header("x-hub-signature-256");
  const deliveryId = c.req.header("x-github-delivery");
  const event = c.req.header("x-github-event");

  if (!deliveryId || !event) {
    return c.json({ error: "missing_headers" }, 400);
  }

  const valid = await verifyGithubSignature(
    rawBody,
    signature,
    config.GITHUB_APP_WEBHOOK_SECRET,
  );
  if (!valid) {
    logger?.warn(
      { deliveryId, event },
      "GitHub webhook signature verification failed",
    );
    return c.json({ error: "invalid_signature" }, 401);
  }

  const payload = JSON.parse(rawBody);
  const webhookEventRepo = new GithubWebhookEventRepo(db);

  // Idempotency: delivery_id is unique. A GitHub retry of a delivery we
  // already stored hits a conflict here and we just acknowledge — never
  // process the same installation change twice.
  const stored = await webhookEventRepo.createIfNew({
    deliveryId,
    event,
    payload,
    providerConnectionId: null, // resolved below once we know it
  });
  if (!stored) {
    return c.json({ received: true, duplicate: true });
  }

  try {
    await dispatchEvent(db, event, payload);
    await webhookEventRepo.markProcessed(stored.id);
  } catch (err) {
    await webhookEventRepo.markFailed(stored.id, String(err));
    logger?.error(
      { err, deliveryId, event },
      "GitHub webhook processing failed",
    );
    // Still return 200 — the raw event is safely stored (see module
    // header); a processing bug shouldn't make GitHub think delivery
    // itself failed and start retrying/suspending the endpoint. Fix
    // forward from the stored payload instead.
  }

  return c.json({ received: true });
});

async function dispatchEvent(
  db: RepoContext,
  event: string,
  payload: any,
): Promise<void> {
  const repo = new ProviderConnectionRepo(db);

  switch (event) {
    case "installation": {
      const installationId = String(payload.installation.id);
      switch (payload.action) {
        case "deleted":
          await repo.markUninstalled(installationId, new Date());
          break;
        case "suspend":
          await repo.markSuspended(installationId, new Date());
          break;
        case "unsuspend":
          await repo.markSuspended(installationId, null);
          break;
        case "new_permissions_accepted":
          await repo.updatePermissions(
            installationId,
            payload.installation.permissions,
          );
          break;
        // "created" is intentionally NOT handled here — see module
        // header. The browser callback flow creates the row; if this
        // event somehow arrives first (race), there's nothing to
        // update yet and that's fine, the callback will create it
        // moments later.
      }
      break;
    }

    case "installation_repositories": {
      // repos added/removed from an existing installation's access.
      // TODO: sync the Repo table once the registry module (#5) exists
      // — for now just log via the stored raw event; nothing downstream
      // depends on this yet.
      break;
    }

    case "push": {
      // TODO: wire to DetectionService.scanRepo() once the registry
      // (#5) and detection wiring (#9-10) land. Stored raw for replay —
      // no data is lost by not processing it synchronously today.
      break;
    }

    default:
      // Unhandled event types are expected and fine — GitHub sends many
      // more event types than Syncr currently cares about. Storing the
      // raw payload (already done above) means nothing is lost if a
      // future feature needs to process it retroactively.
      break;
  }
}

export { webhook as githubWebhookRoutes };

