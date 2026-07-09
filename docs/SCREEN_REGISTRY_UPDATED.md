# Syncr — Screen Registry (Updated from actual design files)
> Source of truth for all UI screens. Cross-referenced against DB schema.
> MVP = build in Sprint 1-6. POST-MVP = build after first paying customer.

---

## Navigation Structure (from actual screens)

```
WORKSPACE
  Dashboard
  Activity

DISCOVER  
  Repositories
  Components
  Dependencies
  Consumers

OPERATE
  Jobs
  Pull Requests
  Sync Center

ANALYZE
  Quality
  Security
  Insights
  Reports

MANAGE
  Settings
  Members
  Integrations
  Billing

ALERTS (badge count)
```

---

## Phase 1 — Authentication & Onboarding

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| AUTH-001 | Login | ✅ MVP | POST /auth/login | User, Session | 2 |
| AUTH-002 | Register | ✅ MVP | POST /auth/register | User, Org, OrgMember, OrgSettings | 2 |
| AUTH-003 | Forgot Password | ✅ MVP | POST /auth/forgot-password | User | 2 |
| AUTH-004 | Verify Email | ✅ MVP | POST /auth/verify-email | User | 2 |
| AUTH-005 | Create Organization | ✅ MVP | POST /v1/orgs | Org, OrgSettings | 2 |
| AUTH-006 | Install GitHub App | ✅ MVP | GET /v1/orgs/:id/github/install-url | GithubInstallation | 2 |
| AUTH-007 | Select Repositories | ✅ MVP | POST /v1/orgs/:id/repos | Repo | 2 |
| AUTH-008 | Initial Scan | ✅ MVP | GET /v1/orgs/:id/scans/latest | Scan, RepoStats | 3 |
| AUTH-009 | Configure Analysis | ✅ MVP | PATCH /v1/orgs/:id/settings | OrgSettings | 3 |
| AUTH-010 | Review & Complete | ✅ MVP | PATCH /v1/orgs/:id/settings/complete | OrgSettings | 3 |

**DB Gap found:** OrgSettings.onboardingStep tracks which step the user is on. OrgSettings.onboardingCompleted marks completion. ✅ Added to schema-additions.

---

## Phase 2 — Workspace Shell

| ID | Screen | MVP? | Key Requirements | Sprint |
|----|--------|------|-----------------|--------|
| CORE-001 | Application Shell | ✅ MVP | Layout with sidebar + topnav + content | 5 |
| CORE-002 | Sidebar Expanded | ✅ MVP | Nav items with badge counts (Issues, Alerts) | 5 |
| CORE-003 | Sidebar Collapsed | ✅ MVP | Icon-only sidebar | 5 |
| CORE-004 | Top Navigation | ✅ MVP | Search bar, command palette trigger, notifications, user menu | 5 |
| CORE-005 | Global Search ⌘K | ✅ MVP | Search repos, components, issues, PRs | 5 |
| CORE-006 | Notification Center | ✅ MVP | GET /v1/orgs/:id/alerts | Alert, ActivityEvent | 5 |
| CORE-007 | User Menu | ✅ MVP | Profile, settings, logout | 5 |
| CORE-008 | Right Context Panel | POST-MVP | Contextual details panel | 7+ |

---

## Phase 3 — Dashboard

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| DASH-001 | Executive Dashboard | ✅ MVP | /repos, /sync-proposals, /vulnerabilities/summary, /alerts | Repo, SyncProposal, Vulnerability, Alert, ActivityEvent | 5 |
| DASH-002 | Customize Dashboard | POST-MVP | — | — | 8+ |
| DASH-003 | Widget Library | POST-MVP | — | — | 8+ |
| DASH-004 | Empty Dashboard | ✅ MVP | — | — | 5 |
| DASH-005 | Dashboard Filters | ✅ MVP | Query params | — | 5 |
| DASH-006 | Dashboard Sharing | POST-MVP | — | — | 8+ |

**Dashboard shows:** Repositories count, Pull Requests (open), Open Issues, Code Health (0-100), Deployment Frequency, Code Health chart, Repository Health per repo (0-100), Recent Activity, Language Distribution, Pull Requests list, Top Issues

**DB Gap found:** 
- Code Health score needs QualityCheck.score (0-100 Int) ✅
- Language distribution needs RepoStats.languages Json ✅  
- Deployment Frequency needs Deployment table ✅
- Open Issues needs Issue table ✅
- Recent Activity needs ActivityEvent table ✅

---

## Phase 4 — Repository Module

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| REP-001 | Repository List | ✅ MVP | GET /v1/orgs/:id/repos | Repo, RepoStats | 3 |
| REP-002 | Repository Overview | ✅ MVP | GET /v1/orgs/:id/repos/:id | Repo, RepoStats, QualityCheck | 3 |
| REP-003 | Repository Health | ✅ MVP | GET /v1/orgs/:id/repos/:id/health | Repo, QualityCheck, Vulnerability, SecretFinding | 4 |
| REP-004 | Components | ✅ MVP | GET /v1/orgs/:id/repos/:id/components | RepoComponent, Component | 3 |
| REP-005 | Dependencies | ✅ MVP | GET /v1/orgs/:id/repos/:id/dependencies | RepoStats (deps from scan) | 4 |
| REP-006 | Consumers | ✅ MVP | GET /v1/orgs/:id/repos/:id/consumers | RepoComponent (inverse query) | 4 |
| REP-007 | Pull Requests | ✅ MVP | GET /v1/orgs/:id/repos/:id/pull-requests | SyncProposal, PipelineRun | 4 |
| REP-008 | Activity Timeline | ✅ MVP | GET /v1/orgs/:id/repos/:id/activity | ActivityEvent | 5 |
| REP-009 | Jobs | ✅ MVP | GET /v1/orgs/:id/repos/:id/jobs | Scan, PipelineRun | 5 |
| REP-010 | Repository Settings | ✅ MVP | GET/PATCH /v1/orgs/:id/repos/:id/settings | Repo, OrgSettings | 5 |
| REP-011 | Branches | POST-MVP | GitHub API proxy | RepoStats.totalBranches | 7+ |
| REP-012 | Files & Explorer | POST-MVP | GitHub API proxy | — | 7+ |

---

## Phase 5 — Component Intelligence

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| CMP-001 | Component Registry | ✅ MVP | GET /v1/orgs/:id/components | Component, ComponentVersion | 3 |
| CMP-002 | Component Details | ✅ MVP | GET /v1/orgs/:id/components/:id | Component, ComponentVersion, RepoComponent | 3 |
| CMP-003 | Dependency Graph | POST-MVP | — | — | 7+ |
| CMP-004 | Consumers Graph | ✅ MVP | GET /v1/orgs/:id/components/:id/consumers | RepoComponent | 4 |
| CMP-005 | Version History | ✅ MVP | GET /v1/orgs/:id/components/:id/versions | ComponentVersion | 3 |
| CMP-006 | Update Wizard | ✅ MVP | POST /v1/orgs/:id/sync-proposals/bulk | SyncProposal | 4 |
| CMP-007 | Component Health | ✅ MVP | GET /v1/orgs/:id/components/:id/health | RepoComponent (isOutOfSync count) | 4 |
| CMP-008 | Usage Analytics | POST-MVP | — | Component.downloadCount, repoUsageCount | 7+ |
| CMP-009 | Component Search | ✅ MVP | GET /v1/orgs/:id/components?q= | Component | 3 |
| CMP-010 | Shared Components | ✅ MVP | GET /v1/orgs/:id/components?isPublic=true | Component | 5 |

---

## Phase 6 — Operations

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| OPS-001 | Job Queue | ✅ MVP | GET /v1/orgs/:id/jobs | Scan, PipelineRun | 5 |
| OPS-002 | Job Details | ✅ MVP | GET /v1/orgs/:id/jobs/:id | Scan | 5 |
| OPS-003 | Live Logs | ✅ MVP | WebSocket or SSE | CloudWatch logs | 5 |
| OPS-004 | Synchronization Queue | ✅ MVP | GET /v1/orgs/:id/sync-proposals | SyncProposal, SyncEvent | 4 |
| OPS-005 | Pull Request Queue | ✅ MVP | GET /v1/orgs/:id/sync-proposals?status=OPEN | SyncProposal | 4 |
| OPS-006 | Pull Request Details | ✅ MVP | GET /v1/orgs/:id/sync-proposals/:id | SyncProposal, SyncEvent | 4 |
| OPS-007 | Merge Assistant | POST-MVP | — | — | 7+ |
| OPS-008 | Scan History | ✅ MVP | GET /v1/orgs/:id/scans | Scan | 5 |
| OPS-009 | Scheduled Jobs | ✅ MVP | GET /v1/orgs/:id/settings | OrgSettings.analysisSchedule | 5 |
| OPS-010 | Retry Failed Jobs | ✅ MVP | POST /v1/orgs/:id/scans/:id/retry | Scan | 5 |
| OPS-011 | Queue Metrics | POST-MVP | — | — | 7+ |
| OPS-012 | Worker Health | POST-MVP | — | — | 7+ |

---

## Phase 7 — Security

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| SEC-001 | Security Overview | ✅ MVP | GET /v1/orgs/:id/vulnerabilities/summary | Vulnerability, SecretFinding, LicenseFinding | 5 |
| SEC-002 | Vulnerabilities | ✅ MVP | GET /v1/orgs/:id/vulnerabilities | Vulnerability | 5 |
| SEC-003 | Secret Scanner | ✅ MVP | GET /v1/orgs/:id/secrets | SecretFinding | 5 |
| SEC-004 | Dependency Risks | ✅ MVP | GET /v1/orgs/:id/vulnerabilities?type=dependency | Vulnerability | 5 |
| SEC-005 | License Compliance | POST-MVP | GET /v1/orgs/:id/licenses | LicenseFinding | 6+ |
| SEC-006 | Security Policies | POST-MVP | — | OrgSettings.qualityGates | 6+ |
| SEC-007 | Security Timeline | ✅ MVP | GET /v1/orgs/:id/alerts?type=security | Alert, ActivityEvent | 5 |
| SEC-008 | Risk Matrix | POST-MVP | — | — | 7+ |
| SEC-009 | CVE Detail | ✅ MVP | GET /v1/orgs/:id/vulnerabilities/:id | Vulnerability | 5 |
| SEC-010 | Allowlist | ✅ MVP | GET/POST /v1/orgs/:id/allowlist | AllowlistRule | 6 |
| SEC-011 | Ignore Rules | ✅ MVP | Same as Allowlist | AllowlistRule | 6 |
| SEC-012 | Security Reports | POST-MVP | — | Report | 7+ |

---

## Phase 8 — Analytics

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| ANA-001 | Insights | ✅ MVP | GET /v1/orgs/:id/insights | Aggregated from multiple tables | 6 |
| ANA-002 | DORA Metrics | POST-MVP | — | Deployment, PipelineRun | 7+ |
| ANA-003 | Team Performance | POST-MVP | — | Team, Deployment | 7+ |
| ANA-004 | Velocity | POST-MVP | — | Deployment, PipelineRun | 7+ |
| ANA-005 | Repository Trends | ✅ MVP | GET /v1/orgs/:id/repos/:id/trends | QualityCheck, Scan (time series) | 6 |
| ANA-006 | Cost Analysis | POST-MVP | — | — | Enterprise |
| ANA-007 | Forecast | POST-MVP | — | — | Enterprise |
| ANA-008 | Custom Dashboard | POST-MVP | — | — | 9+ |

---

## Phase 9 — Reports

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| RPT-001 | Reports | ✅ MVP | GET /v1/orgs/:id/reports | Report | 6 |
| RPT-002 | Report Builder | POST-MVP | — | Report | 8+ |
| RPT-003 | Schedule Report | POST-MVP | — | Report.scheduleConfig | 8+ |
| RPT-004 | Templates | POST-MVP | — | — | 8+ |
| RPT-005 | Export Wizard | ✅ MVP | POST /v1/orgs/:id/reports/:id/export | Report | 6 |
| RPT-006 | Shared Reports | POST-MVP | — | Report.shareToken | 8+ |
| RPT-007 | PDF Preview | ✅ MVP | GET /v1/orgs/:id/reports/:id/preview | Report.storageKey | 6 |
| RPT-008 | Report History | ✅ MVP | GET /v1/orgs/:id/reports | Report | 6 |

---

## Phase 10 — Organization

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| ORG-001 | Members | ✅ MVP | GET /v1/orgs/:id/members | OrgMember, User | 3 |
| ORG-002 | Member Profile | ✅ MVP | GET /v1/orgs/:id/members/:id | OrgMember, User | 3 |
| ORG-003 | Invite Member | ✅ MVP | POST /v1/orgs/:id/invitations | Invitation | 3 |
| ORG-004 | Teams | ✅ MVP | GET /v1/orgs/:id/teams | Team | 4 |
| ORG-005 | Team Details | ✅ MVP | GET /v1/orgs/:id/teams/:id | Team, TeamMember | 4 |
| ORG-006 | Roles | ✅ MVP | GET /v1/orgs/:id/roles | Role, Permission | 3 |
| ORG-007 | Permissions | ✅ MVP | GET /v1/orgs/:id/permissions | Permission, RolePermission | 3 |
| ORG-008 | Audit Logs | ✅ MVP | GET /v1/orgs/:id/audit-logs | AuditLog | 5 |
| ORG-009 | Organization Settings | ✅ MVP | GET/PATCH /v1/orgs/:id/settings | OrgSettings, Org | 4 |
| ORG-010 | Workspace Switcher | ✅ MVP | GET /v1/user/orgs | Org, OrgMember | 3 |

---

## Phase 11 — Integrations

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| INT-001 | Integrations | ✅ MVP | GET /v1/orgs/:id/integrations | GithubInstallation, WebhookEndpoint | 4 |
| INT-002 | GitHub | ✅ MVP | GET /v1/orgs/:id/github | GithubInstallation | 3 |
| INT-003 | Slack | ✅ MVP | POST /v1/orgs/:id/integrations/slack | OrgSettings.slackWebhookUrl | 5 |
| INT-004 | Linear | POST-MVP | — | — | 8+ |
| INT-005 | Jira | POST-MVP | — | — | 8+ |
| INT-006 | Discord | POST-MVP | — | — | 8+ |
| INT-007 | Webhooks | ✅ MVP | GET/POST /v1/orgs/:id/webhooks | WebhookEndpoint | 4 |
| INT-008 | API Tokens | ✅ MVP | GET/POST /v1/orgs/:id/tokens | ApiToken | 4 |
| INT-009 | OAuth Apps | POST-MVP | — | — | 8+ |
| INT-010 | Marketplace | POST-MVP | — | — | 10+ |

---

## Phase 12 — Billing

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| BILL-001 | Subscription | ✅ MVP | GET /v1/billing, POST /v1/billing/portal | Subscription, Org | 4 |
| BILL-002 | Usage | ✅ MVP | GET /v1/billing/usage | Subscription | 4 |
| BILL-003 | Invoices | ✅ MVP | Stripe Customer Portal | Subscription | 4 |
| BILL-004 | Payment Methods | ✅ MVP | Stripe Customer Portal | Subscription | 4 |
| BILL-005 | Upgrade Plan | ✅ MVP | POST /v1/billing/checkout | Subscription | 4 |
| BILL-006 | Team Seats | ✅ MVP | GET /v1/orgs/:id/members | OrgMember | 4 |
| BILL-007 | Billing History | ✅ MVP | Stripe Customer Portal | Subscription | 4 |
| BILL-008 | Usage Limits | ✅ MVP | GET /v1/billing/limits | Subscription, Org.plan | 4 |

---

## Phase 13 — Settings

| ID | Screen | MVP? | APIs Called | DB Models | Sprint |
|----|--------|------|-------------|-----------|--------|
| SET-001 | General | ✅ MVP | GET/PATCH /v1/orgs/:id/settings | Org, OrgSettings | 4 |
| SET-002 | Notifications | ✅ MVP | GET/PATCH /v1/user/notification-prefs | NotificationPreference | 5 |
| SET-003 | Repository Defaults | ✅ MVP | PATCH /v1/orgs/:id/settings | OrgSettings | 4 |
| SET-004 | Analysis Rules | ✅ MVP | PATCH /v1/orgs/:id/settings | OrgSettings.qualityGates | 5 |
| SET-005 | Feature Flags | ✅ MVP | GET /v1/orgs/:id/flags | FeatureFlag | 5 |
| SET-006 | AI Settings | POST-MVP | — | — | 8+ |
| SET-007 | Theme | ✅ MVP | Client-side only (localStorage) | — | 5 |
| SET-008 | API | ✅ MVP | GET/POST /v1/orgs/:id/tokens | ApiToken | 4 |
| SET-009 | Webhooks | ✅ MVP | GET/POST /v1/orgs/:id/webhooks | WebhookEndpoint | 4 |
| SET-010 | Audit | ✅ MVP | GET /v1/orgs/:id/audit-logs | AuditLog | 5 |
| SET-011 | Advanced | ✅ MVP | PATCH /v1/orgs/:id/settings | OrgSettings | 5 |
| SET-012 | Danger Zone | ✅ MVP | DELETE /v1/orgs/:id | Org | 5 |

---

## Phase 14 — Empty / Loading / Error States

Every module needs these 3 states. Total: 13 modules × 3 = 39 states minimum.
These are React components, not separate pages. Build with each module.

---

## MVP Summary

| Phase | Total Screens | MVP Screens | Post-MVP |
|-------|--------------|-------------|----------|
| Auth & Onboarding | 10 | 10 | 0 |
| Workspace Shell | 8 | 7 | 1 |
| Dashboard | 6 | 3 | 3 |
| Repository | 12 | 10 | 2 |
| Components | 10 | 7 | 3 |
| Operations | 12 | 9 | 3 |
| Security | 12 | 8 | 4 |
| Analytics | 8 | 3 | 5 |
| Reports | 8 | 4 | 4 |
| Organization | 10 | 10 | 0 |
| Integrations | 10 | 5 | 5 |
| Billing | 8 | 8 | 0 |
| Settings | 12 | 11 | 1 |
| States | 39 | 39 | 0 |
| **TOTAL** | **165** | **134** | **31** |

---

_Last updated: 2025-06-26 | Cross-referenced against actual design files (35 screens reviewed)_
