// src/modules/github/app/github-app.service.ts
//
// The foundation everything else in this module needs: GitHub Apps
// authenticate as the APP (via a JWT signed with the App's private key)
// to mint short-lived, installation-scoped access tokens. Nothing can
// call the GitHub API on an org's behalf without going through this.
//
// Uses `jose` — already a dependency per google.service.ts (SignJWT for
// signing mirrors the jwtVerify usage you already have for Google).
//
// Env vars needed (add to your config schema):
//   GITHUB_APP_ID              - numeric App ID, from the App's settings page
//   GITHUB_APP_PRIVATE_KEY     - PEM private key, generated in App settings.
//                                 Store with literal \n escapes in env, or
//                                 base64-encode — either is fine, just be
//                                 consistent with how you decode it below.
//   GITHUB_APP_WEBHOOK_SECRET  - set when creating the App, used by
//                                 webhook-signature.ts to verify deliveries
//   GITHUB_APP_SLUG            - the App's URL slug, e.g. "syncr-dev"

import type { InstallationToken } from "@syncr/types";
import { importPKCS8, SignJWT } from "jose";
import type { Logger } from "pino";
import { type AppConfig, OAUTH } from "../../../config";
import { BaseService } from "../../../core/base";
import type { RepoContext } from "../../../core/base/base.repo";
import { Errors } from "../../../errors";

const GITHUB_API = "https://api.github.com";
// Refresh 2 minutes before actual expiry so an in-flight request never
// gets caught using a token that expires mid-call.

export class GithubAppService extends BaseService {
  // In-memory per-isolate cache. On Workers this means a cold isolate
  // mints a fresh token on its first call — acceptable (installation
  // tokens are cheap to mint, GitHub's limit is generous), NOT a
  // correctness issue. If you later move to a shared KV cache to reduce
  // mint calls across isolates, this is the only class that needs to
  // change — nothing else in the module talks to GitHub's token endpoint
  // directly.
  private tokenCache = new Map<string, InstallationToken>();

  constructor(db: RepoContext, config: AppConfig, logger?: Logger) {
    super(db, config, logger);
  }

  /**
   * Signs a short-lived JWT identifying THIS APP (not an installation).
   * Used only to call /app/* endpoints — installation access tokens
   * (below) are what you actually use for repo-scoped API calls.
   */
  async signAppJwt(): Promise<string> {
    const privateKey = await importPKCS8(this.normalizePrivateKey(), "RS256");
    const now = Math.floor(Date.now() / 1000);

    return new SignJWT({})
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt(now - 60) // 60s in the past — tolerates clock drift between this server and GitHub's
      .setExpirationTime(now + 8 * 60) // GitHub's hard max is 10 minutes
      .setIssuer(this.config.GITHUB_APP_ID)
      .sign(privateKey);
  }

  /**
   * Mints (or returns a cached) installation access token. This is what
   * every other GitHub API call in the sync/detection/webhook modules
   * should use for Authorization: Bearer <token>.
   */
  async getInstallationToken(installationId: string): Promise<string> {
    const cached = this.tokenCache.get(installationId);
    if (
      cached &&
      cached.expiresAt.getTime() - OAUTH.GITHUB.REFRESH_MARGIN_MS > Date.now()
    ) {
      return cached.token;
    }

    const appJwt = await this.signAppJwt();
    const res = await fetch(
      `${GITHUB_API}/app/installations/${installationId}/access_tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${appJwt}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (res.status === 404) {
      // Installation was deleted on GitHub's side but we still think it's
      // active — the caller should mark the connection uninstalled rather
      // than retry.
      throw Errors.github.installationNotFound();
    }
    if (!res.ok) {
      throw Errors.github.tokenMintFailed(res.status);
    }

    const body = (await res.json()) as {
      token: string;
      expires_at: string;
      permissions: Record<string, string>;
      repository_selection: "all" | "selected";
    };

    const minted: InstallationToken = {
      token: body.token,
      expiresAt: new Date(body.expires_at),
      permissions: body.permissions,
      repositorySelection: body.repository_selection,
    };
    this.tokenCache.set(installationId, minted);
    return minted.token;
  }

  /**
   * Full installation details (account, permissions, suspension state) —
   * called right after a user completes the install-flow redirect, and
   * whenever you need to refresh what's stored in provider_connections.
   */
  async getInstallation(installationId: string) {
    const appJwt = await this.signAppJwt();
    const res = await fetch(
      `${GITHUB_API}/app/installations/${installationId}`,
      {
        headers: {
          Authorization: `Bearer ${appJwt}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    if (!res.ok) throw Errors.github.installationNotFound();
    return res.json() as Promise<{
      id: number;
      account: { login: string; id: number; type: "User" | "Organization" };
      permissions: Record<string, string>;
      repository_selection: "all" | "selected";
      suspended_at: string | null;
    }>;
  }

  private normalizePrivateKey(): string {
    const raw = this.config.GITHUB_APP_PRIVATE_KEY;
    // Support both "\n"-escaped single-line env values and real newlines.
    return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
  }
}
