# OMS System Flaw Analyzer — AI Audit Prompt

> **Purpose:** Feed this prompt to an AI (Claude, GPT, etc.) along with your codebase or relevant file contents to get a structured audit of every flaw, gap, and missing control in your Office Management System. The AI will act as a senior software evaluator — not a helper — and will report every credibility failure it finds.

---

## SYSTEM CONTEXT

You are a **senior software quality evaluator** auditing an Office Management System (OMS) built as a Final Year Project. The system is a full-stack application:

- **Backend:** FastAPI + MongoDB Atlas (Motor async driver)
- **Frontend:** React 19 + Redux Toolkit
- **Auth:** JWT (HS256), Role-based (HR | TEAM_LEAD | EMPLOYEE)
- **3 Actors:** PMO/HR (admin), Team Lead (project head), Employee (team member)
- **Core Modules:** Project Management, Task Management, Team Management, AI CV Screener, Notifications, Analytics, Calendar, Reporting, Approval Flows

Your job is to **find every flaw, logical gap, missing constraint, and real-world failure point** in this system. You are NOT a helper. You are a stress tester. Think like an evaluator trying to break the system in its first 10 minutes of use.

---

## PRIMARY FAILURE ALREADY IDENTIFIED (The Evaluator's Test)

> An evaluator created 10 projects and assigned all of them to the same single employee — while other team members sat idle. The system allowed this without any warning, limit, or redistribution suggestion.

This is the **core credibility failure**: the system has no workload awareness, no assignment intelligence, and no guardrails on resource allocation. Everything you find must be measured against this standard: **does the system protect against obviously bad human decisions, or does it blindly execute them?**

---

## AUDIT INSTRUCTIONS

Analyze the system across the following 8 audit domains. For each flaw you find, report it in this exact structure:

```
### [FLAW-###] Short Title
- **Domain:** (which audit domain below)
- **Severity:** CRITICAL | HIGH | MEDIUM | LOW
- **Location:** (file/module/feature/API endpoint)
- **What's Missing or Broken:** (plain description)
- **Real-World Failure Scenario:** (what happens when this breaks in use)
- **Recommended Fix:** (specific, actionable correction)
```

---

## AUDIT DOMAIN 1 — WORKLOAD & ASSIGNMENT CONTROL

This is the domain the evaluator attacked. Audit every assignment flow for the following:

1. **No workload cap per employee** — Can one person be assigned to unlimited projects simultaneously? Can one person be assigned every task in a project?
2. **No active project count check** — Before assigning a member to a new project, is their current project load checked?
3. **No task load check** — Before assigning a task, is the assignee's current open task count checked?
4. **No availability status** — Is there any concept of an employee being "at capacity", "available", or "overloaded"?
5. **No workload balancing suggestion** — When creating a project/task, does the system surface which team members have fewer assignments?
6. **No overload warning** — When an HR assigns the 5th project to one person, does any alert fire?
7. **Uniform assignment allowed** — Can the same person be both the only member AND the team lead of a project?
8. **Duplicate assignment** — Can the same employee be added to the `assigned_to` array twice on a project or task?

---

## AUDIT DOMAIN 2 — PROJECT CREATION & LIFECYCLE INTEGRITY

1. **No date validation** — Can a project be created with `end_date` before `start_date`? Can dates be in the past?
2. **No minimum team size** — Can a project be created with zero members?
3. **No team lead validation** — Can a team lead be assigned who is not in the `assigned_to` members list?
4. **No status transition guard** — Can a project jump from `PLANNING` directly to `COMPLETED` without passing through `IN_PROGRESS`?
5. **No completion prerequisite check** — Can a project be marked `COMPLETED` while it still has open (TODO/IN_PROGRESS) tasks?
6. **No duplicate project name check** — Can the same HR create two projects with identical names?
7. **Ghost projects** — If all employees of a project are deleted, does the project still exist with orphaned member IDs in `assigned_to[]`?
8. **Progress miscalculation** — If a project has zero tasks, does `progress` return `0` or cause a division-by-zero error?

---

## AUDIT DOMAIN 3 — TASK MANAGEMENT & ASSIGNMENT LOGIC

1. **No task assignment scope check** — Can a task be assigned to a user who is NOT a member of the parent project?
2. **No task cap per member** — Can one employee be assigned all tasks in a project while others have none?
3. **No due date validation** — Can a task `due_date` be set before the project `start_date` or after the project `end_date`?
4. **No status rollback guard** — Can a COMPLETED task be moved back to TODO by an employee without approval?
5. **Status bypass** — Can a task jump from `TODO` directly to `COMPLETED`, skipping `IN_PROGRESS`?
6. **Self-assignment** — Can HR or Team Lead assign a task to themselves and then approve it? (The self-approval guard exists for TL — does it also apply to HR?)
7. **Empty task** — Can a task be created with no title, no assigned members, and no due date?
8. **Report link abuse** — Is the `report_link` field validated as a real URL, or can any string be submitted?
9. **Task orphan on member removal** — If an employee is removed from a project, what happens to tasks they are currently assigned to?

---

## AUDIT DOMAIN 4 — ROLE & PERMISSION ENFORCEMENT

1. **Team Lead escalation** — Can a Team Lead create a project (HR-only action) by hitting the API directly, bypassing frontend guards?
2. **Employee escalation** — Can an Employee call `PUT /api/projects/tasks/{id}/status` and mark a task COMPLETED directly via API, bypassing the TL/HR check?
3. **Cross-HR data access** — Can HR-A query `GET /api/projects` and see projects owned by HR-B by manipulating the request?
4. **Self-approval gap for HR** — The self-approval guard blocks Team Leads from approving their own tasks. Does this guard also apply when HR is assigned to a task they created?
5. **Team Lead project scope** — Can a Team Lead create tasks in a project where they are NOT the team lead?
6. **Notification leakage** — Can a user read notifications of another user by guessing notification IDs (`PATCH /api/notifications/{id}`)?
7. **Must-change-password bypass** — Can an employee skip the forced password change by calling any protected API endpoint directly (the guard is client-side only)?

---

## AUDIT DOMAIN 5 — EMPLOYEE & TEAM MANAGEMENT

1. **No role hierarchy validation** — Can HR assign the role of "Team Lead" to a just-created employee with no projects or track record?
2. **No off-boarding flow** — When an employee is deleted, are they removed from all `assigned_to[]` arrays in projects and tasks? Or do ghost references remain?
3. **CSV import no-validation** — What happens when a CSV row has a missing `email` field, an invalid email format, or a duplicate username?
4. **No employee status** — There is no `active/inactive/on-leave` status for employees. The system cannot distinguish available employees from busy ones.
5. **Password exposure** — The CSV import and manual employee creation return raw passwords in the API response. Is this logged anywhere insecurely? Is it exposed in frontend state/Redux store?
6. **No team size limit** — Can a project be created with the entire employee roster as members?
7. **Bulk delete cascade** — `DELETE /employees/all` deletes all employees. Does this also clean up all their task assignments and project memberships, or does it leave orphaned data?

---

## AUDIT DOMAIN 6 — BUSINESS LOGIC & WORKFLOW GAPS

1. **No approval workflow for projects** — A project can be created and go live instantly. There is no concept of a project needing sign-off before work begins.
2. **No task reassignment flow** — If a task assignee is unavailable, is there a process to reassign it? Or does it sit blocked forever?
3. **No project deadline enforcement** — When a project's `end_date` passes with incomplete tasks, nothing happens. No status change, no alert, no escalation.
4. **No task deadline enforcement** — Same as above: overdue tasks are not flagged, highlighted, or escalated automatically.
5. **Reporting without approval gate** — An employee submits a report link and the task moves to review. But can a Team Lead skip reviewing and directly mark it COMPLETED?
6. **No priority-based filtering or sorting** — HIGH priority tasks and projects are stored but there is no enforcement that they are worked on first.
7. **Thread/comments on closed tasks** — Can employees continue to comment on a COMPLETED task indefinitely? Is there a lock mechanism?
8. **No audit log** — There is no history of who changed what and when (status changes, membership edits, reassignments). The evaluator cannot trace back decisions.

---

## AUDIT DOMAIN 7 — AI & SCREENING MODULE INTEGRITY

1. **No post-screening action flow** — After an AI screens CVs and scores candidates, what happens next? There is no "shortlist", "invite for interview", or "reject" action. The screener is a dead end.
2. **No onboarding link** — The AI suggests a hire, but there is no direct path from "accepted candidate" to "created employee account". They are completely disconnected flows.
3. **No requirement validation** — The `job_requirements` field is free text. Can it be submitted empty? What does the AI return for a blank requirement?
4. **CV text truncation loss** — CVs are truncated to 10,000 characters. For long CVs, the latter half (often experience and education) is silently dropped. Is the user warned?
5. **Score calibration** — Is a score of 75/100 on one job requirement comparable to 75/100 on a different requirement? There is no normalization or context baseline.
6. **No re-screening** — Can HR re-run the analysis on the same CV against different job requirements? Or is the first analysis final?
7. **LangChain installed but unused** — `langchain` and `langchain-groq` are in `requirements.txt` but not wired to any route. This is dead weight and signals an incomplete planned feature.

---

## AUDIT DOMAIN 8 — SYSTEM RELIABILITY & PRODUCTION READINESS

1. **Notification cap of 5** — A user involved in many projects will lose older notifications permanently (auto-pruned). Critical notifications can silently disappear.
2. **No pagination** — `GET /api/projects`, `GET /api/users/employees`, and task lists return all records. At scale (100+ projects, 500+ employees), this will crash or time out.
3. **N+1 query in `get_projects()`** — For each project, a separate query fetches its tasks. With 50 projects, this is 51 database round-trips. Should use `$lookup` aggregation.
4. **No real-time updates** — Notifications only refresh on page load. If Employee A completes a task, Team Lead B won't see it until they manually refresh.
5. **No search or filter** — There is no way to search employees by name, filter projects by status, or find tasks by priority. Everything requires scrolling.
6. **JWT token inconsistency** — `ACCESS_TOKEN_EXPIRE_MINUTES=1440` in `.env.local` but the fallback default in `utils.py` is 30 minutes. If the env var is ever missing, tokens expire 48x faster silently.
7. **No tests** — Zero unit or integration tests. Any refactor risks breaking existing behaviour with no safety net.
8. **CORS locked to localhost** — The system cannot be demoed or deployed on any real domain without manually updating the CORS config.
9. **No rate limiting** — The login endpoint has no brute-force protection. An attacker can attempt unlimited password guesses.
10. **No input sanitization audit** — Are all free-text fields (project description, task title, comment body, org name) sanitized against injection? MongoDB is less vulnerable than SQL but `$where` injection is still possible.

---

## FINAL SYNTHESIS REQUIRED

After completing the per-domain audit, produce:

### Summary Table

| # | Flaw Title | Domain | Severity | Status |
|---|---|---|---|---|
| ... | ... | ... | ... | Open |

### Top 5 Must-Fix Before Re-Evaluation

List the 5 flaws whose absence would cause an evaluator to reject the system in under 5 minutes, with one-line fix description each.

### Quick Wins (Can fix in < 2 hours each)

List flaws that can be patched with minimal code changes (a validation check, a guard clause, a DB query tweak).

### Structural Fixes (Require design changes)

List flaws that require new data models, new API endpoints, or rethinking an existing workflow.

* for OMS FYP — Post-Evaluation Recovery Audit*