// // src/modules/sync/detection/detection.service.ts
// //
// // THE CORE ALGORITHM: figures out which version of which component is
// // installed in which repo, without relying on a package manager entry
// // (agencies using the shadcn "copy-paste" model have no such entry).
// //
// // Assumes the Drizzle tables from the schema file given earlier (repos,
// // components, component_versions, repo_components, sync_proposals) and a
// // GitHubClient you provide (fetch file tree + file contents for a repo at
// // a given ref — likely lives near your GithubInstallation/webhook code).

// import { createHash } from "node:crypto";
// import type { Logger } from "pino";
// import type { RepoContext } from "../../core/base/base.repo";

// // Provide this — wraps the GitHub App installation token flow you'll
// // already need for webhooks. Signature is the contract this module needs,
// // not a suggestion for how to implement the client itself.
// export interface GitHubClient {
//   listRepoFiles(
//     repoId: string,
//     ref: string,
//     pathPrefix?: string,
//   ): Promise<string[]>;
//   getFileContent(repoId: string, ref: string, path: string): Promise<string>;
// }

// export type DetectionMethod = "import-path" | "hash" | "file-name";

// export interface DetectionMatch {
//   componentId: string;
//   version: string;
//   filePath: string;
//   detectedBy: DetectionMethod;
//   /** Only set false for file-name matches — surfaced in the dashboard as
//    * "unconfirmed" until a human (or a later hash match) confirms it. */
//   confident: boolean;
// }

// // Conventional component directories to scan. Cheap first pass before
// // walking the whole repo tree — most agencies keep components under one
// // of these.
// const CANDIDATE_DIRS = [
//   "src/components",
//   "components",
//   "src/ui",
//   "src/lib/components",
// ];

// // Matches: import Button from "@acme/components/button" or
// //          import { Button } from "@acme/registry/button"
// const IMPORT_ALIAS_RE =
//   /from\s+["']@([\w-]+)\/(?:components|registry)\/([\w-]+)["']/;

// export class DetectionService {
//   private readonly componentRepo: ComponentRepo;
//   private readonly repoComponentRepo: RepoComponentRepo;
//   private readonly proposalRepo: SyncProposalRepo;

//   constructor(
//     db: RepoContext,
//     private readonly github: GitHubClient,
//     private readonly logger: Logger,
//   ) {
//     this.componentRepo = new ComponentRepo(db);
//     this.repoComponentRepo = new RepoComponentRepo(db);
//     this.proposalRepo = new SyncProposalRepo(db);
//   }

//   /**
//    * Entry point. Run on: push webhook to a CONSUMER repo's default
//    * branch, nightly full rescan, or manual dashboard trigger.
//    *
//    * Idempotent — safe to run repeatedly. Only writes rows that changed.
//    */
//   async scanRepo(orgId: string, repoId: string, ref: string): Promise<void> {
//     const orgComponents = await this.componentRepo.listPublishedForOrg(orgId);
//     if (orgComponents.length === 0) return; // nothing to detect against

//     // Every published version's content hash, indexed for O(1) lookup.
//     // This IS the mechanism that solves copy-paste detection — see tier 2.
//     const hashIndex = await this.componentRepo.getContentHashIndex(orgId);

//     const candidateFiles = await this.collectCandidateFiles(repoId, ref);
//     const matches: DetectionMatch[] = [];
//     const matchedPaths = new Set<string>();

//     // ── Tier 1: import-path match ──────────────────────────────
//     for (const filePath of candidateFiles) {
//       const content = await this.github.getFileContent(repoId, ref, filePath);
//       const importMatch = this.detectByImportPath(content, orgComponents);
//       if (importMatch) {
//         matches.push({
//           ...importMatch,
//           filePath,
//           detectedBy: "import-path",
//           confident: true,
//         });
//         matchedPaths.add(filePath);
//       }
//     }

//     // ── Tier 2: content-hash match (files tier 1 didn't resolve) ─
//     for (const filePath of candidateFiles) {
//       if (matchedPaths.has(filePath)) continue;
//       const content = await this.github.getFileContent(repoId, ref, filePath);
//       const hash = this.hashContent(content);
//       const hit = hashIndex.get(hash);
//       if (hit) {
//         matches.push({
//           componentId: hit.componentId,
//           version: hit.version,
//           filePath,
//           detectedBy: "hash",
//           confident: true,
//         });
//         matchedPaths.add(filePath);
//       }
//     }

//     // ── Tier 3: file-name heuristic fallback (low confidence) ────
//     for (const filePath of candidateFiles) {
//       if (matchedPaths.has(filePath)) continue;
//       const heuristicMatch = this.detectByFileName(filePath, orgComponents);
//       if (heuristicMatch) {
//         matches.push({
//           ...heuristicMatch,
//           filePath,
//           detectedBy: "file-name",
//           confident: false,
//         });
//         matchedPaths.add(filePath);
//       }
//     }

//     await this.reconcile(repoId, matches);
//   }

//   // ─────────────────────────────────────────────────────────────
//   // Detection tiers
//   // ─────────────────────────────────────────────────────────────

//   private detectByImportPath(
//     content: string,
//     orgComponents: Array<{
//       componentId: string;
//       slug: string;
//       latestVersion: string;
//     }>,
//   ) {
//     const match = content.match(IMPORT_ALIAS_RE);
//     if (!match) return null;
//     const [, , componentSlug] = match;

//     const component = orgComponents.find((c) => c.slug === componentSlug);
//     if (!component) return null;

//     // Import path tells us WHICH component, not WHICH version. Look for
//     // a pinned version comment or a syncr.lock entry — if neither exists,
//     // fall through to hash matching for this file instead of guessing.
//     const versionComment = content.match(/@syncr-version:\s*([\d.]+)/);
//     if (!versionComment) return null;

//     return { componentId: component.componentId, version: versionComment[1] };
//   }

//   private detectByFileName(
//     filePath: string,
//     orgComponents: Array<{
//       componentId: string;
//       slug: string;
//       name: string;
//       latestVersion: string;
//     }>,
//   ) {
//     const fileName = filePath
//       .split("/")
//       .pop()
//       ?.replace(/\.(tsx|jsx|vue|svelte)$/, "");
//     if (!fileName) return null;

//     const component = orgComponents.find(
//       (c) => c.name.toLowerCase() === fileName.toLowerCase(),
//     );
//     if (!component) return null;

//     // No way to know the actual version from a name match — record it
//     // as "unknown, assume oldest" so it surfaces as needing sync rather
//     // than silently reporting false confidence. Never assume it's current.
//     return { componentId: component.componentId, version: "unknown" };
//   }

//   private hashContent(content: string): string {
//     // Normalise whitespace before hashing — otherwise a reformatted-but-
//     // unchanged file (prettier ran, line endings changed) reads as a
//     // different version and creates a spurious drift alert.
//     const normalised = content.replace(/\s+/g, " ").trim();
//     return createHash("sha256").update(normalised).digest("hex");
//   }

//   private async collectCandidateFiles(
//     repoId: string,
//     ref: string,
//   ): Promise<string[]> {
//     const files: string[] = [];
//     for (const dir of CANDIDATE_DIRS) {
//       const found = await this.github
//         .listRepoFiles(repoId, ref, dir)
//         .catch(() => [] as string[]); // directory may not exist in this repo
//       files.push(...found.filter((f) => /\.(tsx|jsx|vue|svelte)$/.test(f)));
//     }
//     return files;
//   }

//   // ─────────────────────────────────────────────────────────────
//   // Reconciliation — write RepoComponent rows, flag drift
//   // ─────────────────────────────────────────────────────────────

//   private async reconcile(
//     repoId: string,
//     matches: DetectionMatch[],
//   ): Promise<void> {
//     const existing = await this.repoComponentRepo.listByRepo(repoId);
//     const existingByComponent = new Map(
//       existing.map((r) => [r.componentId, r]),
//     );

//     for (const match of matches) {
//       const component = await this.componentRepo.getById(match.componentId);
//       if (!component) continue;

//       const isOutOfSync =
//         match.version !== "unknown" &&
//         match.version !== component.latestVersion;

//       const prior = existingByComponent.get(match.componentId);

//       await this.repoComponentRepo.upsert({
//         repoId,
//         componentId: match.componentId,
//         usedVersion: match.version,
//         latestVersion: component.latestVersion,
//         isOutOfSync,
//         filePath: match.filePath,
//         detectedBy: match.detectedBy,
//       });

//       // Only auto-generate a proposal for confident matches. A "file-name"
//       // guess should never silently open a PR — see confident: false above.
//       if (
//         isOutOfSync &&
//         match.confident &&
//         (!prior || prior.usedVersion !== match.version)
//       ) {
//         await this.maybeCreateProposal(
//           repoId,
//           match.componentId,
//           match.version,
//           component,
//         );
//       }
//     }
//     // Components matched previously but not this scan aren't touched here
//     // on purpose — a component that disappeared from the file tree is a
//     // separate "component removed" signal, not a version-drift signal.
//   }

//   /**
//    * Guards: don't duplicate an already-open proposal for this repo +
//    * component pair, and copy the breaking-change flag forward so it
//    * gates approval downstream in the PR automation step.
//    */
//   private async maybeCreateProposal(
//     repoId: string,
//     componentId: string,
//     fromVersion: string,
//     component: { latestVersion: string; latestVersionId: string | null },
//   ): Promise<void> {
//     const openProposal = await this.proposalRepo.findOpenForRepoComponent(
//       repoId,
//       componentId,
//     );
//     if (openProposal) return;

//     const latestVersionRecord = component.latestVersionId
//       ? await this.componentRepo.getVersionById(component.latestVersionId)
//       : null;

//     await this.proposalRepo.create({
//       repoId,
//       componentId,
//       fromVersion,
//       toVersion: component.latestVersion,
//       isBreaking: latestVersionRecord?.isBreaking ?? false,
//       status: "PENDING",
//     });
//   }
// }
