## ANALYSIS FROM SCREENS

### What the screens show that the current DB schema DOES NOT have:

1. **Issues** — sidebar shows "Issues 28", dashboard shows "Open Issues", PR details show linked issues. 
   Need: issues table with title, number, severity, status, repoId, assigneeId, labels

2. **Code Health Score (0-100)** — dashboard shows "Code Health 82/100", not just A-F grade
   Current schema: Repo.healthScore is String (A-F). Screens show numeric 0-100.
   Fix: change to Int or keep both

3. **Deployment tracking** — dashboard shows "Deployment Frequency 4.2/day", activity shows "Deployed to production"
   Need: deployments table with version, environment, status, deployedAt, repoId

4. **DORA Metrics** — Analytics screen shows DORA metrics (deployment frequency, lead time, MTTR)
   Need: computed from deployments + PRs, possibly a dora_metrics materialized view or cached table

5. **Language distribution** — dashboard shows "TypeScript 42.1%, Python 23.7%"
   Need: repo_languages table or languages Json on Repo

6. **Lines of code** — initial scan shows "2.4M / 4.7M lines of code"
   Need: codeStats Json or separate repo_stats table

7. **Consumers** — dedicated "Consumers" module showing which repos consume a component
   Current: RepoComponent handles this but the Consumer Explorer screen is more complex
   Need: consumer tracking is fine with RepoComponent — just needs proper queries

8. **Issues** — "Risks" in sidebar, "Open Issues" in dashboard, linked to PRs
   Need: issues table

9. **CI/CD** — sidebar shows "CI/CD", screens show pipeline status
   Need: pipeline_runs table or cicd_configs table

10. **Quality scores** — "Code Health", "Quality" in sidebar
    Need: quality_checks table or quality_scores per repo

11. **Secret Scanner** — SEC-003 Secret Scanner screen
    Need: secrets table (secret_findings) with file path, type, severity

12. **License Compliance** — SEC-005 License Compliance
    Need: license_findings table with package, license type, compliance status

13. **Teams** — ORG-004/005 Teams screens
    Need: teams table, team_members junction

14. **Alerts** — "Alerts" in sidebar
    Need: alerts table distinct from notifications — alerts are system-generated, notifications are user-targeted

15. **Reports** — RPT-001 through RPT-008
    Need: reports table with type, schedule, format, lastGeneratedAt

16. **Branches** — REP-011 Branches screen
    Current: Repo has defaultBranch only. 
    Need: branches table or at minimum branch data in repo_stats

17. **Analysis settings** — Configure screen shows analysis depth, schedule, data retention
    Need: org_settings or analysis_config table

18. **Onboarding state** — multi-step onboarding flow
    Need: onboarding_state on Org or separate onboarding table

19. **Notification preferences** — SET-002 Notifications screen
    Need: notification_preferences table per user

20. **Activity/Events feed** — dedicated Activity screen, sidebar item
    Current: AuditLog covers this but AuditLog is security-focused
    Need: Either repurpose AuditLog or add activity_events table for user-visible events

### What the screen inventory has that is NOT needed for MVP:

1. DASH-002 Customize Dashboard — nice to have, post-MVP
2. DASH-003 Widget Library — post-MVP  
3. DASH-006 Dashboard Sharing — post-MVP
4. ANA-002 DORA Metrics — needs deployment data, Sprint 6+
5. ANA-006 Cost Analysis — enterprise feature
6. ANA-007 Forecast — ML feature, post-MVP
7. RPT-002 Report Builder — complex, post-MVP
8. RPT-004 Templates — post-MVP
9. INT-004 Linear, INT-005 Jira, INT-006 Discord — Sprint 8+
10. INT-010 Marketplace — Sprint 10+
11. SET-006 AI Settings — Sprint 8+
12. OPS-007 Merge Assistant — Sprint 5+
13. OPS-011 Queue Metrics, OPS-012 Worker Health — Sprint 6+

### Sidebar nav from screens (actual):
Dashboard, Repositories, Issues, Pull Requests, Risks, Quality, Security, Insights, Reports, Alerts, Settings
(NOT matching our current SCREEN_REGISTRY which has different nav)

### DB models to ADD:
- Issue
- Deployment  
- Team + TeamMember
- SecretFinding
- LicenseFinding
- Report + ReportSchedule
- Alert (system-generated, different from Notification)
- OrgSettings / AnalysisConfig
- OnboardingProgress
- NotificationPreference
- QualityCheck / QualityScore
- PipelineRun (CI/CD)
- ActivityEvent (user-visible feed, separate from AuditLog)
- RepoStats (lines of code, language breakdown, file count)
- RepoLanguage

### DB models to MODIFY:
- Repo.healthScore: add healthScoreNumeric Int (0-100) alongside existing A-F
- Repo: add linesOfCode Int, fileCount Int, languageStats Json
- Org: add onboardingStep String, onboardingCompleted Boolean
