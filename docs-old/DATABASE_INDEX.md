# Syncr — Database Index
> Every model, its purpose, which features use it, which APIs read/write it, which workers touch it.

---

## Model Map

| Model | Domain | Features That Use It | Status |
|-------|--------|---------------------|--------|
| User | Identity | FEAT-001,002,003,004 | Schema done |
| Session | Identity | FEAT-002 | Schema done |
| Role | RBAC | FEAT-001,003 | Schema done |
| Permission | RBAC | FEAT-001 | Schema done |
| RolePermission | RBAC | FEAT-001 | Schema done |
| UserPermission | RBAC | FEAT-004 | Schema done |
| Org | Organisation | FEAT-001,003,016 | Schema done |
| OrgMember | Organisation | FEAT-001,003 | Schema done |
| Invitation | Identity | FEAT-003 | Schema done |
| ApiToken | Infrastructure | FEAT-004 | Schema done |
| GithubInstallation | GitHub | FEAT-005 | Schema done |
| GithubWebhookEvent | GitHub | FEAT-005,009 | Schema done |
| Repo | Repository | FEAT-006,009 | Schema done |
| Component | Registry | FEAT-007,008,009 | Schema done |
| ComponentVersion | Registry | FEAT-007,008 | Schema done |
| ComponentTag | Registry | FEAT-007 | Schema done |
| RepoComponent | Registry+Sync | FEAT-009,010 | Schema done |
| SyncProposal | Sync | FEAT-010,011,012 | Schema done |
| SyncEvent | Sync | FEAT-010,011,012 | Schema done |
| Scan | Security | FEAT-013 | Schema done |
| Vulnerability | Security | FEAT-013,014,015 | Schema done |
| Subscription | Billing | FEAT-016 | Schema done |
| WebhookEndpoint | Infrastructure | Future | Schema done |
| WebhookDelivery | Infrastructure | Future | Schema done |
| AuditLog | Infrastructure | All mutations | Schema done |
| FeatureFlag | Infrastructure | All features | Schema done |

---

## Migration Status

| Migration | Name | Status | Date |
|-----------|------|--------|------|
| 001 | init | ⏳ Pending | — |

**To run first migration:**
```bash
cd packages/database
pnpm db:migrate
# Name: init
```

---

## Seed Data Required

| Table | Seed Data | When |
|-------|-----------|------|
| Role | owner, admin, member, viewer | Migration 001 |
| Permission | All 25 permissions (resource:action) | Migration 001 |
| RolePermission | owner→all, admin→subset, member→subset, viewer→read-only | Migration 001 |

**Critical:** These seed rows must exist before any user can register. The registration flow assigns the OWNER role to the first org member.

---

## Index Strategy

**Why each index exists:**

| Table | Index | Query it supports |
|-------|-------|-------------------|
| users | email | Login lookup O(1) |
| orgs | slug | URL routing O(1) |
| org_members | [orgId,userId] unique | Membership check O(1) |
| repos | orgId | "List all repos for org" |
| repos | githubRepoId | Webhook lookup by GitHub ID |
| components | [orgId,slug] unique | CLI push/pull lookup |
| repo_components | [repoId,componentId] unique | Drift detection |
| repo_components | isOutOfSync | Dashboard: stale components count |
| sync_proposals | [orgId,status] | Dashboard: open PRs per org |
| vulnerabilities | [repoId,cveId] unique | Idempotent CVE scan |
| vulnerabilities | [orgId,severity] | Security dashboard filter |
| audit_logs | [orgId,createdAt DESC] | Audit log pagination |
| github_webhook_events | deliveryId | Duplicate delivery prevention |

---

_Last updated: 2025-06-26_
