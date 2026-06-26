Perfect. This is exactly how I'd run the design phase as a CTO.

# AppInit MVP Master Screen Inventory (Version 1.0)

This becomes our **single source of truth**. Every screen gets a unique ID. Once a screen is approved, it is frozen unless we intentionally revise it.

---

# Phase 1 — Authentication & Onboarding (10)

| ID       | Screen              | Status |
| -------- | ------------------- | ------ |
| AUTH-001 | Login               | ✅     |
| AUTH-002 | Register            | ✅     |
| AUTH-003 | Forgot Password     | ⬜     |
| AUTH-004 | Verify Email        | ✅     |
| AUTH-005 | Create Organization | ✅     |
| AUTH-006 | Install GitHub App  | ✅     |
| AUTH-007 | Select Repositories | ✅     |
| AUTH-008 | Initial Scan        | ✅     |
| AUTH-009 | Configure Analysis  | ✅     |
| AUTH-010 | Review & Complete   | ✅     |

---

# Phase 2 — Workspace Shell (8)

These define the entire application.

| ID       | Screen              |
| -------- | ------------------- |
| CORE-001 | Application Shell   |
| CORE-002 | Sidebar Expanded    |
| CORE-003 | Sidebar Collapsed   |
| CORE-004 | Top Navigation      |
| CORE-005 | Global Search (⌘K)  |
| CORE-006 | Notification Center |
| CORE-007 | User Menu           |
| CORE-008 | Right Context Panel |

---

# Phase 3 — Dashboard (6)

No more.

Only one dashboard.

| ID       | Screen              |
| -------- | ------------------- |
| DASH-001 | Executive Dashboard |
| DASH-002 | Customize Dashboard |
| DASH-003 | Widget Library      |
| DASH-004 | Empty Dashboard     |
| DASH-005 | Dashboard Filters   |
| DASH-006 | Dashboard Sharing   |

---

# Phase 4 — Repository Module (12)

One of AppInit's biggest modules.

| ID      | Screen              |
| ------- | ------------------- |
| REP-001 | Repository List     |
| REP-002 | Repository Overview |
| REP-003 | Repository Health   |
| REP-004 | Components          |
| REP-005 | Dependencies        |
| REP-006 | Consumers           |
| REP-007 | Pull Requests       |
| REP-008 | Activity Timeline   |
| REP-009 | Jobs                |
| REP-010 | Repository Settings |
| REP-011 | Branches            |
| REP-012 | Files & Explorer    |

---

# Phase 5 — Component Intelligence (10)

Unique to AppInit.

| ID      | Screen             |
| ------- | ------------------ |
| CMP-001 | Component Registry |
| CMP-002 | Component Details  |
| CMP-003 | Dependency Graph   |
| CMP-004 | Consumers Graph    |
| CMP-005 | Version History    |
| CMP-006 | Update Wizard      |
| CMP-007 | Component Health   |
| CMP-008 | Usage Analytics    |
| CMP-009 | Component Search   |
| CMP-010 | Shared Components  |

---

# Phase 6 — Operations (12)

Core product.

| ID      | Screen                |
| ------- | --------------------- |
| OPS-001 | Job Queue             |
| OPS-002 | Job Details           |
| OPS-003 | Live Logs             |
| OPS-004 | Synchronization Queue |
| OPS-005 | Pull Request Queue    |
| OPS-006 | Pull Request Details  |
| OPS-007 | Merge Assistant       |
| OPS-008 | Scan History          |
| OPS-009 | Scheduled Jobs        |
| OPS-010 | Retry Failed Jobs     |
| OPS-011 | Queue Metrics         |
| OPS-012 | Worker Health         |

---

# Phase 7 — Security (12)

| ID      | Screen             |
| ------- | ------------------ |
| SEC-001 | Security Overview  |
| SEC-002 | Vulnerabilities    |
| SEC-003 | Secret Scanner     |
| SEC-004 | Dependency Risks   |
| SEC-005 | License Compliance |
| SEC-006 | Security Policies  |
| SEC-007 | Security Timeline  |
| SEC-008 | Risk Matrix        |
| SEC-009 | CVE Detail         |
| SEC-010 | Allowlist          |
| SEC-011 | Ignore Rules       |
| SEC-012 | Security Reports   |

---

# Phase 8 — Analytics (8)

| ID      | Screen            |
| ------- | ----------------- |
| ANA-001 | Insights          |
| ANA-002 | DORA Metrics      |
| ANA-003 | Team Performance  |
| ANA-004 | Velocity          |
| ANA-005 | Repository Trends |
| ANA-006 | Cost Analysis     |
| ANA-007 | Forecast          |
| ANA-008 | Custom Dashboard  |

---

# Phase 9 — Reports (8)

| ID      | Screen          |
| ------- | --------------- |
| RPT-001 | Reports         |
| RPT-002 | Report Builder  |
| RPT-003 | Schedule Report |
| RPT-004 | Templates       |
| RPT-005 | Export Wizard   |
| RPT-006 | Shared Reports  |
| RPT-007 | PDF Preview     |
| RPT-008 | Report History  |

---

# Phase 10 — Organization (10)

| ID      | Screen                |
| ------- | --------------------- |
| ORG-001 | Members               |
| ORG-002 | Member Profile        |
| ORG-003 | Invite Member         |
| ORG-004 | Teams                 |
| ORG-005 | Team Details          |
| ORG-006 | Roles                 |
| ORG-007 | Permissions           |
| ORG-008 | Audit Logs            |
| ORG-009 | Organization Settings |
| ORG-010 | Workspace Switcher    |

---

# Phase 11 — Integrations (10)

| ID      | Screen       |
| ------- | ------------ |
| INT-001 | Integrations |
| INT-002 | GitHub       |
| INT-003 | Slack        |
| INT-004 | Linear       |
| INT-005 | Jira         |
| INT-006 | Discord      |
| INT-007 | Webhooks     |
| INT-008 | API Tokens   |
| INT-009 | OAuth Apps   |
| INT-010 | Marketplace  |

---

# Phase 12 — Billing (8)

| ID       | Screen          |
| -------- | --------------- |
| BILL-001 | Subscription    |
| BILL-002 | Usage           |
| BILL-003 | Invoices        |
| BILL-004 | Payment Methods |
| BILL-005 | Upgrade Plan    |
| BILL-006 | Team Seats      |
| BILL-007 | Billing History |
| BILL-008 | Usage Limits    |

---

# Phase 13 — Settings (12)

| ID      | Screen              |
| ------- | ------------------- |
| SET-001 | General             |
| SET-002 | Notifications       |
| SET-003 | Repository Defaults |
| SET-004 | Analysis Rules      |
| SET-005 | Feature Flags       |
| SET-006 | AI Settings         |
| SET-007 | Theme               |
| SET-008 | API                 |
| SET-009 | Webhooks            |
| SET-010 | Audit               |
| SET-011 | Advanced            |
| SET-012 | Danger Zone         |

---

# Phase 14 — Empty / Loading / Error States (18)

Every module has:

- Empty
- Loading
- Error

No screen ships without these.

---

# Total MVP

- Authentication: **10**
- Core Workspace: **8**
- Dashboard: **6**
- Repository: **12**
- Components: **10**
- Operations: **12**
- Security: **12**
- Analytics: **8**
- Reports: **8**
- Organization: **10**
- Integrations: **10**
- Billing: **8**
- Settings: **12**
- States: **18**

**Total: 144 unique screens**
