# OMS System Flaw Analysis — Post-Evaluation Audit Report

> **Generated:** 2026-05-29 | **Auditor:** AI Senior Software Evaluator | **System:** Office Management System (FYP)
>
> **Scope:** Full-stack audit of FastAPI + React codebase against 8 evaluation domains.
> **Exclusions:** Cloudinary image uploads and email delivery services (per request).

---

## AUDIT DOMAIN 1 — WORKLOAD & ASSIGNMENT CONTROL

> [!CAUTION]
> This is the domain the evaluator attacked. Every flaw here directly undermines the system's core credibility as a management tool.

---

### [FLAW-001] No Workload Cap Per Employee
- **Domain:** Workload & Assignment Control
- **Severity:** CRITICAL
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /` (Create Project), `POST /tasks` (Create Task)
- **What's Missing or Broken:** There is zero limit on how many projects or tasks can be assigned to a single employee. The `assigned_to` array accepts any number of user IDs without checking current load.
- **Real-World Failure Scenario:** An evaluator created 10 projects and assigned all of them to the same single employee — while other team members sat idle. The system accepted this without any warning. This is the **exact attack** the evaluator used.
- **Recommended Fix:** Add a `MAX_ACTIVE_PROJECTS_PER_EMPLOYEE` constant (e.g., 5). Before inserting into `assigned_to`, count the employee's active project memberships via `projects_collection.count_documents({"assigned_to": member_id, "status": {"$ne": "COMPLETED"}})`. Reject or warn if the threshold is exceeded.

---

### [FLAW-002] No Active Project Count Check Before Assignment
- **Domain:** Workload & Assignment Control
- **Severity:** CRITICAL
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /` (L11-52)
- **What's Missing or Broken:** When assigning a member to a new project, their current active project count is never queried. The backend blindly appends IDs to `assigned_to`.
- **Real-World Failure Scenario:** HR assigns Employee A to a new project without realizing they are already on 8 other active projects. Employee A becomes a bottleneck. No system feedback warns HR about this.
- **Recommended Fix:** Before project creation, query each member's active project count. Return a warning payload like `{ "warnings": [{ "user_id": "...", "active_projects": 8 }] }` so the frontend can display it. Optionally enforce a hard cap.

---

### [FLAW-003] No Task Load Check Before Task Assignment
- **Domain:** Workload & Assignment Control
- **Severity:** HIGH
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /tasks` (L89-147)
- **What's Missing or Broken:** When assigning tasks, the assignee's current open task count (`TODO` + `IN_PROGRESS`) is never checked.
- **Real-World Failure Scenario:** Team Lead assigns all 20 tasks in a project to one person. The other 4 members have zero tasks. No warning is shown.
- **Recommended Fix:** Before task creation, count open tasks per assignee: `tasks_collection.count_documents({"assigned_to": member_id, "status": {"$ne": "COMPLETED"}})`. Display the count in the assignment UI and warn if above a threshold (e.g., 10).

---

### [FLAW-004] No Employee Availability Status
- **Domain:** Workload & Assignment Control
- **Severity:** HIGH
- **Location:** [models.py](file:///f:/Projects/FypApp/backend/models.py), [database.py](file:///f:/Projects/FypApp/backend/database.py) — User schema
- **What's Missing or Broken:** There is no concept of an employee being `available`, `at_capacity`, `on_leave`, or `overloaded`. The `users` collection has no status field for workload state.
- **Real-World Failure Scenario:** An employee is on leave but still appears as assignable in every project/task creation dropdown. They get assigned work they cannot do.
- **Recommended Fix:** Add a `status` field to the user schema (enum: `AVAILABLE | BUSY | ON_LEAVE | AT_CAPACITY`). Compute `BUSY`/`AT_CAPACITY` dynamically based on open task count, or allow HR to set `ON_LEAVE` manually. Filter the assignment dropdowns to show status badges.

---

### [FLAW-005] No Workload Balancing Suggestion
- **Domain:** Workload & Assignment Control
- **Severity:** HIGH
- **Location:** Frontend — [CreateProjectDialog.jsx](file:///f:/Projects/FypApp/frontend/src/components/CreateProjectDialog.jsx), [CreateTaskDialog.jsx](file:///f:/Projects/FypApp/frontend/src/components/CreateTaskDialog.jsx)
- **What's Missing or Broken:** When creating a project or task, the employee multi-select dropdown shows names only. There is no indication of each member's current workload (active projects, open tasks).
- **Real-World Failure Scenario:** HR creates a project and has to guess which employees are free. They pick the same top-performer every time because there's no visibility into who is underutilized.
- **Recommended Fix:** Alongside each employee name in the assignment dropdown, show a badge: `"3 projects, 7 tasks"`. Sort employees by ascending workload so the least-loaded appear first. Add a "Suggest balanced assignment" auto-distribute button.

---

### [FLAW-006] No Overload Warning on Assignment
- **Domain:** Workload & Assignment Control
- **Severity:** HIGH
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /`, `POST /tasks`
- **What's Missing or Broken:** When HR assigns the 5th, 10th, or 20th project to one person, no alert fires. The system silently accepts every assignment regardless of existing load.
- **Real-World Failure Scenario:** The evaluator's exact test: 10 projects dumped on one employee, zero system feedback. The system appears to have no intelligence about resource allocation.
- **Recommended Fix:** After checking workload, return warnings in the API response: `{ "warnings": ["Employee 'John' already has 9 active projects"] }`. The frontend should display a confirmation dialog: *"John is already assigned to 9 projects. Are you sure?"*

---

### [FLAW-007] Same Person as Sole Member AND Team Lead
- **Domain:** Workload & Assignment Control
- **Severity:** MEDIUM
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /`
- **What's Missing or Broken:** A project can be created where `assigned_to = ["user_A"]` and `team_lead_id = "user_A"` — the same person is both the only team member and the team lead. Combined with the self-approval guard, this person cannot approve their own tasks, creating a deadlock.
- **Real-World Failure Scenario:** HR creates a project with one member who is also the team lead. That person completes a task, but the self-approval guard blocks them from marking it COMPLETED. The task is permanently stuck unless HR intervenes.
- **Recommended Fix:** If `assigned_to` has only 1 member, either disallow that member from also being team lead, or relax the self-approval guard in single-member projects by allowing HR to auto-approve.

---

### [FLAW-008] Duplicate Members in assigned_to Array
- **Domain:** Workload & Assignment Control
- **Severity:** LOW
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /`, [models.py](file:///f:/Projects/FypApp/backend/models.py) — `ProjectCreate`
- **What's Missing or Broken:** The `assigned_to: List[str]` field has no deduplication. The same employee ID can appear twice. This inflates member counts and may cause double notifications.
- **Real-World Failure Scenario:** A malicious or buggy API call sends `assigned_to: ["user_A", "user_A", "user_A"]`. The project appears to have 3 members but only 1 person. Notifications fire 3 times for the same user.
- **Recommended Fix:** Deduplicate the list: `project.assigned_to = list(set(project.assigned_to))` before insertion. Alternatively, add a Pydantic validator.

---

## AUDIT DOMAIN 2 — PROJECT CREATION & LIFECYCLE INTEGRITY

---

### [FLAW-009] No Date Validation (end_date Before start_date)
- **Domain:** Project Creation & Lifecycle
- **Severity:** HIGH
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /`, `PUT /{id}`, [models.py](file:///f:/Projects/FypApp/backend/models.py) — `ProjectCreate`
- **What's Missing or Broken:** Dates are stored as plain strings (`Optional[str]`), not date types. There is no validation that `end_date > start_date`, no date format enforcement, and no check against past dates. A project can be created with `start_date: "2026-12-31"` and `end_date: "2020-01-01"`.
- **Real-World Failure Scenario:** HR creates a project with dates in the wrong order. The calendar view and deadline logic produce nonsensical output. Progress tracking becomes meaningless.
- **Recommended Fix:** Change date fields to `Optional[date]` in the Pydantic model. Add a model validator: `if end_date and start_date and end_date < start_date: raise ValueError("End date must be after start date")`. On the frontend [CreateProjectDialog.jsx](file:///f:/Projects/FypApp/frontend/src/components/CreateProjectDialog.jsx), set `min` attributes on date inputs and add a JavaScript comparison check.

---

### [FLAW-010] No Minimum Team Size Check
- **Domain:** Project Creation & Lifecycle
- **Severity:** MEDIUM
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /`, [models.py](file:///f:/Projects/FypApp/backend/models.py) — `ProjectCreate`
- **What's Missing or Broken:** `assigned_to: List[str]` defaults to `[]`. A project can be created with zero members. The frontend [CreateProjectDialog.jsx](file:///f:/Projects/FypApp/frontend/src/components/CreateProjectDialog.jsx) checks `assigned_to.length === 0` but this can be bypassed via direct API call.
- **Real-World Failure Scenario:** A project is created with no members. It exists as an empty shell with no one to do the work. Tasks cannot be created meaningfully because there's no one to assign them to.
- **Recommended Fix:** Backend: `if not project.assigned_to: raise HTTPException(400, "Project must have at least one member")`. Enforce the same check on the frontend.

---

### [FLAW-011] Team Lead Not Required to Be in assigned_to
- **Domain:** Project Creation & Lifecycle
- **Severity:** HIGH
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /`, `PUT /{id}`
- **What's Missing or Broken:** `team_lead_id` can be set to any user ID, even one that is NOT in the `assigned_to` array. The frontend populates the team lead dropdown from the selected members, but this can be bypassed via API.
- **Real-World Failure Scenario:** A team lead is set for a project but is not a member. They can create tasks (the permission check passes for `team_lead_id`), but they don't appear in the project's member list. Their task notifications and project visibility become inconsistent.
- **Recommended Fix:** Backend: `if project.team_lead_id and project.team_lead_id not in project.assigned_to: raise HTTPException(400, "Team lead must be a project member")`.

---

### [FLAW-012] No Status Transition Guard on Projects
- **Domain:** Project Creation & Lifecycle
- **Severity:** HIGH
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `PUT /{id}`
- **What's Missing or Broken:** A project can jump from `PLANNING` directly to `COMPLETED`, skipping `IN_PROGRESS`. There is no transition validation. The `status` field in `ProjectUpdate` is an unvalidated `Optional[str]` — any string is accepted (even `"HACKED"`).
- **Real-World Failure Scenario:** HR accidentally (or maliciously via API) sets a project to `COMPLETED` on day one. All tasks remain open. The dashboard shows 100% completion for a project with zero work done.
- **Recommended Fix:** Define allowed transitions: `PLANNING → IN_PROGRESS → COMPLETED`. Validate: `if new_status == "COMPLETED" and current_status != "IN_PROGRESS": raise HTTPException(400, "...")`. Use enums instead of strings.

---

### [FLAW-013] No Completion Prerequisite Check
- **Domain:** Project Creation & Lifecycle
- **Severity:** HIGH
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `PUT /{id}`
- **What's Missing or Broken:** A project can be marked `COMPLETED` while it still has `TODO` or `IN_PROGRESS` tasks. There is no check that all tasks are done before project completion.
- **Real-World Failure Scenario:** HR marks a project as completed while 5 tasks remain open. The dashboard shows "COMPLETED" but progress shows 60%. This contradicts itself and misleads stakeholders.
- **Recommended Fix:** Before allowing `status = COMPLETED`: `open_tasks = await tasks_collection.count_documents({"project_id": ObjectId(id), "status": {"$ne": "COMPLETED"}})`. If `open_tasks > 0`, reject with `"Cannot complete project with X open tasks"`.

---

### [FLAW-014] No Duplicate Project Name Check
- **Domain:** Project Creation & Lifecycle
- **Severity:** LOW
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /`
- **What's Missing or Broken:** The same HR can create multiple projects with identical names. No uniqueness constraint exists.
- **Real-World Failure Scenario:** HR accidentally creates "Website Redesign" twice. Both appear in the dashboard with no way to distinguish them other than scrolling to check member lists.
- **Recommended Fix:** Check: `existing = await projects_collection.find_one({"name": project.name, "created_by": current_user["id"]})`. If found, return `400 "A project with this name already exists"`.

---

### [FLAW-015] Ghost Projects After Employee Deletion
- **Domain:** Project Creation & Lifecycle
- **Severity:** HIGH
- **Location:** [users.py](file:///f:/Projects/FypApp/backend/routers/users.py) — `DELETE /employees/all`
- **What's Missing or Broken:** `DELETE /employees/all` deletes all HR's employees but does **NOT** clean up their IDs from `assigned_to[]` arrays in projects and tasks. These ghost IDs remain in the database, referencing nonexistent users.
- **Real-World Failure Scenario:** HR bulk-deletes all employees. All project member lists now contain invalid user IDs. The frontend tries to render these names, shows blank/error entries. Task assignments break silently.
- **Recommended Fix:** After bulk delete, run: `await projects_collection.update_many({"created_by": hr_id}, {"$pull": {"assigned_to": {"$in": deleted_ids}}})` and similarly for tasks. See also [FLAW-033].

---

### [FLAW-016] Progress Calculation — Zero Tasks Handled Correctly ✅
- **Domain:** Project Creation & Lifecycle
- **Severity:** N/A (NOT A FLAW)
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `GET /` (L82-83)
- **What's Working:** The code uses `(completed / total * 100) if total > 0 else 0`, correctly avoiding division by zero. **This is one of the few properly handled edge cases.**

---

## AUDIT DOMAIN 3 — TASK MANAGEMENT & ASSIGNMENT LOGIC

---

### [FLAW-017] Task Assignees Not Validated Against Project Members
- **Domain:** Task Management & Assignment Logic
- **Severity:** CRITICAL
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /tasks` (L89-147)
- **What's Missing or Broken:** When creating a task, the `assigned_to` list is accepted without verifying that each user ID exists in the parent project's `assigned_to[]`. A task can be assigned to users who are not project members.
- **Real-World Failure Scenario:** Via API, a Team Lead assigns a task to Employee X who is not a member of the project. Employee X receives a notification for a project they can't access. They see the task in "My Tasks" but cannot view the parent project.
- **Recommended Fix:** Fetch the project's `assigned_to` list. For each task assignee, check: `if member_id not in project["assigned_to"]: raise HTTPException(400, f"User {member_id} is not a member of this project")`.

---

### [FLAW-018] No Task Cap Per Member Within a Project
- **Domain:** Task Management & Assignment Logic
- **Severity:** MEDIUM
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /tasks`
- **What's Missing or Broken:** One employee can be assigned every single task in a project while others have none. No per-member task limit or balancing exists.
- **Real-World Failure Scenario:** Team Lead assigns all 15 tasks to their favourite employee. Other team members have nothing to do. Work distribution is completely unbalanced and the system provides no feedback.
- **Recommended Fix:** Show task counts per member in the [CreateTaskDialog.jsx](file:///f:/Projects/FypApp/frontend/src/components/CreateTaskDialog.jsx) dropdown. Optionally set a soft cap and warn: `"User already has 10 tasks in this project"`.

---

### [FLAW-019] No Task Due Date Validation Against Project Dates
- **Domain:** Task Management & Assignment Logic
- **Severity:** MEDIUM
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /tasks`
- **What's Missing or Broken:** A task's `due_date` is not validated against the parent project's `start_date` or `end_date`. A task can be due before the project starts or after it ends.
- **Real-World Failure Scenario:** A task is set to be due on Jan 1, 2025, inside a project that runs from Feb to March 2026. The calendar view shows the task completely outside the project timeline.
- **Recommended Fix:** Parse and compare dates: `if task.due_date < project.start_date or task.due_date > project.end_date: raise HTTPException(400, "Task due date must fall within project timeline")`. Note: the frontend [CreateTaskDialog.jsx](file:///f:/Projects/FypApp/frontend/src/components/CreateTaskDialog.jsx) already prevents past dates via `min={today}` — good, but backend needs enforcement too.

---

### [FLAW-020] No Status Rollback Guard on Tasks
- **Domain:** Task Management & Assignment Logic
- **Severity:** HIGH
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `PUT /tasks/{id}/status` (L180-277)
- **What's Missing or Broken:** A `COMPLETED` task can be moved back to `TODO` by any authorized user. There is no status rollback prevention. Similarly, `IN_PROGRESS` can go back to `TODO`.
- **Real-World Failure Scenario:** An employee moves a completed task back to TODO (accidentally or maliciously). The project's progress drops from 100% to 80% without any audit trail. No one knows who reverted it or why.
- **Recommended Fix:** Add transition rules: `COMPLETED → TODO` and `COMPLETED → IN_PROGRESS` are disallowed (or require HR-only override). Define valid transitions: `TODO → IN_PROGRESS → COMPLETED` only.

---

### [FLAW-021] Task Status Can Skip IN_PROGRESS
- **Domain:** Task Management & Assignment Logic
- **Severity:** MEDIUM
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `PUT /tasks/{id}/status`
- **What's Missing or Broken:** A task can jump from `TODO` directly to `COMPLETED`, skipping `IN_PROGRESS`. There is no sequential status enforcement.
- **Real-World Failure Scenario:** HR marks a task as COMPLETED without it ever being worked on. The workflow step of "in progress → submit report → review → complete" is entirely bypassed.
- **Recommended Fix:** Enforce: `if new_status == "COMPLETED" and current_status != "IN_PROGRESS": raise HTTPException(400, "Task must be IN_PROGRESS before it can be COMPLETED")`.

---

### [FLAW-022] Self-Approval Gap for HR
- **Domain:** Task Management & Assignment Logic
- **Severity:** MEDIUM
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `PUT /tasks/{id}/status` (L191-200)
- **What's Missing or Broken:** The self-approval guard exists for Team Leads (`if is_team_lead and not is_hr and current_user["id"] in task["assigned_to"]`), but HR bypasses this check entirely. If HR is assigned to a task they created, they can approve their own work.
- **Real-World Failure Scenario:** HR assigns a task to themselves, does the work (or doesn't), and marks it COMPLETED. There is no independent review. This breaks the accountability model.
- **Recommended Fix:** Extend the guard: `if current_user["id"] in task["assigned_to"] and current_user["id"] == project["created_by"]: raise HTTPException(403, "Cannot approve tasks assigned to yourself")`. Or at minimum, log a warning.

---

### [FLAW-023] Tasks Can Be Created With Empty Title and No Assignees
- **Domain:** Task Management & Assignment Logic
- **Severity:** MEDIUM
- **Location:** [models.py](file:///f:/Projects/FypApp/backend/models.py) — `TaskCreate`, [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /tasks`
- **What's Missing or Broken:** `title: str` allows empty strings. `assigned_to: List[str]` defaults to `[]`. A task can be created with no title, no assignees, and no due date. Pydantic's `str` type only checks for type, not content.
- **Real-World Failure Scenario:** An empty-titled task appears in the task board as a blank card. No one is assigned. It sits indefinitely with no owner and no purpose.
- **Recommended Fix:** Add Pydantic validators: `@field_validator('title') ... if not v.strip(): raise ValueError('Title is required')`. Backend: `if not task.assigned_to: raise HTTPException(400, "At least one assignee required")`.

---

### [FLAW-024] Report Link Not Validated as URL
- **Domain:** Task Management & Assignment Logic
- **Severity:** LOW
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `PUT /tasks/{id}/status`, [models.py](file:///f:/Projects/FypApp/backend/models.py) — `TaskUpdateStatus`
- **What's Missing or Broken:** `report_link: Optional[str]` accepts any string. There is no URL format validation. A `javascript:alert('xss')` string could be submitted and rendered as a clickable link.
- **Real-World Failure Scenario:** An employee submits `report_link: "not a real link"`. The team lead clicks it and gets a broken page. Worse: a `javascript:` protocol link could execute in the team lead's browser. The frontend partially mitigates this with `if (!value.startsWith("http"))` but only on the input side — existing links from the DB are rendered without re-validation.
- **Recommended Fix:** Backend: `from urllib.parse import urlparse; parsed = urlparse(report_link); if parsed.scheme not in ("http", "https"): raise HTTPException(400, "Invalid URL")`.

---

### [FLAW-025] Task Orphans on Member Removal from Project
- **Domain:** Task Management & Assignment Logic
- **Severity:** HIGH
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `PUT /{id}` (L320-338)
- **What's Missing or Broken:** When a member is removed from a project via project update, their tasks in that project are cleaned up (member removed from task `assigned_to`, reassigned to TL if task becomes orphaned). This logic **exists and works correctly** ✅. However, when an employee is deleted via `DELETE /employees/all`, **no cascade cleanup runs** — see [FLAW-015] and [FLAW-033].
- **Real-World Failure Scenario:** Employee is bulk-deleted. Their tasks still reference their ID. The task appears assigned to a non-existent user. No one picks up the work.
- **Recommended Fix:** Ensure all employee deletion paths (single, bulk, self-delete) clean up task assignments.

---

## AUDIT DOMAIN 4 — ROLE & PERMISSION ENFORCEMENT

---

### [FLAW-026] Team Lead Cannot Create Projects (Correctly Blocked) — But No Error Feedback
- **Domain:** Role & Permission Enforcement
- **Severity:** LOW
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /` uses `get_current_hr_user`
- **What's Missing or Broken:** Project creation correctly requires HR role via the `get_current_hr_user` dependency. A Team Lead or Employee hitting `POST /api/projects` via API gets a 403. **This is correctly blocked.** ✅ However, the error message is generic: *"The user doesn't have enough privileges"*.
- **Recommended Fix:** Minor UX improvement: change error to *"Only HR administrators can create projects"*.

---

### [FLAW-027] Any Authenticated User Can Change Non-COMPLETED Task Status
- **Domain:** Role & Permission Enforcement
- **Severity:** CRITICAL
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `PUT /tasks/{id}/status` (L180-277)
- **What's Missing or Broken:** The authorization check only gates the `COMPLETED` status. For any other status change (`TODO → IN_PROGRESS`, `IN_PROGRESS → TODO`), the code checks if the user is HR, TL, or **assigned to the task** — but there's **no check that the user is even a member of the parent project**. Any authenticated employee can change the status of any task in any project they aren't part of, as long as the new status isn't `COMPLETED`.
- **Real-World Failure Scenario:** Employee A from Project X finds the task ID of a task in Project Y (e.g., by inspecting network traffic). They call `PUT /api/projects/tasks/{id}/status` with `status: "TODO"` and reset someone else's in-progress work. No membership check blocks them.
- **Recommended Fix:** Add project membership check before any status update: `if current_user["id"] not in project["assigned_to"] and not is_hr and not is_team_lead: raise HTTPException(403, "Not authorized")`.

---

### [FLAW-028] Cross-HR Data Access — Correctly Isolated ✅
- **Domain:** Role & Permission Enforcement
- **Severity:** N/A (NOT A FLAW)
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `GET /`, `PUT /{id}`, `DELETE /{id}`
- **What's Working:** All project queries for HR use `created_by: current_user["id"]` as a filter. HR-A cannot see or modify HR-B's projects. ✅

---

### [FLAW-029] HR Task Reports Leak — Cross-Project Visibility
- **Domain:** Role & Permission Enforcement
- **Severity:** HIGH
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `GET /tasks/reports` (L288-306)
- **What's Missing or Broken:** For HR users, the task reports endpoint fetches ALL tasks with `report_link` — it does **not** filter by `created_by`. This means HR-A can see task reports from projects created by HR-B.
- **Real-World Failure Scenario:** Two HRs are on the same MongoDB instance. HR-A navigates to Task Reports and sees confidential report submissions from HR-B's projects. Data isolation is broken.
- **Recommended Fix:** Add `created_by` filter: `projects = await projects_collection.find({"created_by": current_user["id"]}).to_list(length=None)`.

---

### [FLAW-030] Notification Ownership Not Checked on Mark-Read
- **Domain:** Role & Permission Enforcement
- **Severity:** HIGH *(Based on initial router research, but the actual `notifications.py` DOES check ownership)*
- **Updated Finding:** The `PATCH /{notification_id}/read` endpoint **does** include `user_id: current_user["id"]` in the query filter. **This is correctly guarded.** ✅
- **Location:** [notifications.py](file:///f:/Projects/FypApp/backend/routers/notifications.py) — L93

---

### [FLAW-031] Must-Change-Password Bypass via Direct API Calls
- **Domain:** Role & Permission Enforcement
- **Severity:** CRITICAL
- **Location:** [deps.py](file:///f:/Projects/FypApp/backend/deps.py) — `get_current_user`, Frontend — [App.jsx](file:///f:/Projects/FypApp/frontend/src/App.jsx) — `ProtectedRoute`
- **What's Missing or Broken:** The forced password change is enforced **only on the frontend** via `ProtectedRoute`. The backend `get_current_user` dependency does NOT check `must_change_password`. An employee who must change their password can call ANY protected API endpoint directly (via Postman, curl, or scripts) and access full system functionality.
- **Real-World Failure Scenario:** A new employee receives their temp credentials. Instead of using the web UI, they hit the API directly and access all their tasks, project data, and submit comments — all without ever changing the known temporary password. If the temp password was shared insecurely (e.g., on Slack), anyone with it has persistent access.
- **Recommended Fix:** In `deps.py`, add to `get_current_user`: `if user.get("must_change_password") and request.url.path != "/api/users/me/password": raise HTTPException(403, "Password change required before accessing the system")`.

---

### [FLAW-032] Team Lead Can Create Tasks in Non-Own Projects — Correctly Blocked ✅
- **Domain:** Role & Permission Enforcement
- **Severity:** N/A (NOT A FLAW)
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /tasks` (L96-105)
- **What's Working:** The check `current_user["id"] == project.team_lead_id` ensures a Team Lead can only create tasks in projects where they are the designated team lead. ✅

---

## AUDIT DOMAIN 5 — EMPLOYEE & TEAM MANAGEMENT

---

### [FLAW-033] No Off-boarding Cascade on Bulk Employee Delete
- **Domain:** Employee & Team Management
- **Severity:** CRITICAL
- **Location:** [users.py](file:///f:/Projects/FypApp/backend/routers/users.py) — `DELETE /employees/all` (L260-270)
- **What's Missing or Broken:** `DELETE /employees/all` runs `delete_many` on the users collection but does **NOT** clean up project `assigned_to[]` arrays or task `assigned_to[]` arrays. Ghost user IDs remain everywhere. **Contrast with** `DELETE /employee/{id}` which **does** have cascade cleanup (removes from projects and tasks) — but has its own bug (see [FLAW-034]).
- **Real-World Failure Scenario:** HR clicks "Delete All Employees" to reset their workspace. All projects now show phantom members. Task boards reference deleted users. The system is in a corrupted state.
- **Recommended Fix:** Before deleting, collect all employee IDs: `employee_ids = [str(e["_id"]) for e in employees]`. Then run cascade cleanup on projects and tasks, identical to the single-delete logic but in bulk.

---

### [FLAW-034] Single Employee Delete — Cascade Runs Before Ownership Check
- **Domain:** Employee & Team Management
- **Severity:** HIGH
- **Location:** [users.py](file:///f:/Projects/FypApp/backend/routers/users.py) — `DELETE /employee/{id}` (L211-258)
- **What's Missing or Broken:** The cascade cleanup (removing employee from project/task `assigned_to[]`, clearing `team_lead_id`) runs **before** the ownership verification (`delete_one` with `created_by: hr_user["id"]`). If the HR doesn't own the employee, the delete fails at step 3 — but steps 1-2 (cascade cleanup) have already corrupted the employee's data.
- **Real-World Failure Scenario:** HR-A calls `DELETE /employee/{id}` on an employee owned by HR-B. The delete fails (ownership check), but the employee has already been removed from all their project and task assignments. HR-B's data is silently corrupted.
- **Recommended Fix:** Move the ownership check to the top: `employee = await users_collection.find_one({"_id": ObjectId(id), "created_by": hr_user["id"]})`. If not found, return 404 immediately before any cascade operations.

---

### [FLAW-035] Employee Role is Client-Controllable in EmployeeCreate
- **Domain:** Employee & Team Management
- **Severity:** HIGH
- **Location:** [models.py](file:///f:/Projects/FypApp/backend/models.py) — `EmployeeCreate` (field: `role: Optional[str] = "EMPLOYEE"`), [users.py](file:///f:/Projects/FypApp/backend/routers/users.py) — `POST /employee`
- **What's Missing or Broken:** The `EmployeeCreate` model has `role: Optional[str] = "EMPLOYEE"`. A malicious HR could send `role: "HR"` in the request body, creating another HR-level user. The backend code uses `employee.role or "EMPLOYEE"` as a fallback but does not restrict the value.
- **Real-World Failure Scenario:** An HR user crafts a POST request with `role: "HR"`. The system creates a new user with HR privileges. That new user can now create their own projects, employees, and access the AI screener.
- **Recommended Fix:** Hardcode the role in the router: `"role": "EMPLOYEE"` — ignore any client-provided value. Remove `role` from `EmployeeCreate` model entirely, or use an enum with only `EMPLOYEE`.

---

### [FLAW-036] CSV Import — No Email Format Validation
- **Domain:** Employee & Team Management
- **Severity:** MEDIUM
- **Location:** [users.py](file:///f:/Projects/FypApp/backend/routers/users.py) — `POST /employee/csv` (L55-152)
- **What's Missing or Broken:** CSV email values are checked for existence (`not email or pd.isna(email)`) but not for valid email format. A row with `email: "not-an-email"` will be imported successfully.
- **Real-World Failure Scenario:** A CSV has `email: "john"`. The system creates an employee with email `"john"`. Login by email fails. The data is corrupted.
- **Recommended Fix:** Add email regex validation per row: `import re; if not re.match(r"^[\w.-]+@[\w.-]+\.\w+$", email): results.append({"status": "skipped", "reason": "Invalid email format"})`.

---

### [FLAW-037] CSV Role Default Case Mismatch
- **Domain:** Employee & Team Management
- **Severity:** LOW
- **Location:** [users.py](file:///f:/Projects/FypApp/backend/routers/users.py) — `POST /employee/csv` (L131)
- **What's Missing or Broken:** CSV role defaults to `"Employee"` (title-case) instead of `"EMPLOYEE"` (uppercase), which is what the rest of the system uses. Role comparisons like `role == "EMPLOYEE"` will fail for CSV-imported users.
- **Real-World Failure Scenario:** CSV-imported employees cannot access employee-specific features because their role is `"Employee"` not `"EMPLOYEE"`. Role-based visibility breaks silently.
- **Recommended Fix:** Normalize: `role = (row.get("role") or "EMPLOYEE").upper()`.

---

### [FLAW-038] Username Uniqueness Not Checked on Employee Creation
- **Domain:** Employee & Team Management
- **Severity:** HIGH
- **Location:** [users.py](file:///f:/Projects/FypApp/backend/routers/users.py) — `POST /employee` (L22-24)
- **What's Missing or Broken:** Only email is checked for duplicates. Username uniqueness is NOT validated. Two employees can have the same username. Since `deps.py` looks up users by username during authentication, a duplicate username causes the **wrong user** to be authenticated.
- **Real-World Failure Scenario:** HR creates Employee A with `username: "john"`. Later creates Employee B also with `username: "john"`. When Employee A tries to log in by username, the system finds Employee B first (whichever MongoDB returns). Employee A is locked out of their own account.
- **Recommended Fix:** Add: `existing = await users_collection.find_one({"username": employee.username})`. If found, return `400 "Username already taken"`. Also add a unique index on `username` in `database.py`.

---

### [FLAW-039] Password Exposure in API Responses
- **Domain:** Employee & Team Management
- **Severity:** MEDIUM
- **Location:** [users.py](file:///f:/Projects/FypApp/backend/routers/users.py) — `POST /employee`, `POST /employee/csv`
- **What's Missing or Broken:** Both single and CSV employee creation return raw plaintext passwords in the API response body. These passwords travel over HTTP, are stored in browser network history, and appear in Redux action payloads.
- **Real-World Failure Scenario:** Browser DevTools → Network tab shows the response containing all employee passwords in plaintext. If the browser is shared or the network is sniffed, passwords are exposed. The frontend correctly shows them in a modal for HR to copy (with a "won't see again" warning), but the passwords persist in browser history.
- **Recommended Fix:** This is partially by design (HR needs the temp passwords). Mitigate by: (1) Ensure HTTPS in production, (2) Add `Cache-Control: no-store` headers to the response, (3) Consider a one-time-view token pattern instead of returning passwords directly.

---

### [FLAW-040] No Employee Status (active/inactive/on-leave)
- **Domain:** Employee & Team Management
- **Severity:** MEDIUM
- **Location:** [models.py](file:///f:/Projects/FypApp/backend/models.py) — User schema, [database.py](file:///f:/Projects/FypApp/backend/database.py) — `user_helper`
- **What's Missing or Broken:** The user schema has no `status` or `is_active` field. There is no way to mark an employee as on leave, inactive, or suspended. Every employee is always "available" in the system.
- **Real-World Failure Scenario:** An employee goes on 2-week leave. HR cannot mark them as unavailable. Other team members continue assigning them tasks. When they return, they have a backlog of overdue work.
- **Recommended Fix:** Add `status: str = "ACTIVE"` to the user schema (enum: `ACTIVE | ON_LEAVE | SUSPENDED`). Filter assignment dropdowns to show only `ACTIVE` employees. Show status badges in the Team page.

---

## AUDIT DOMAIN 6 — BUSINESS LOGIC & WORKFLOW GAPS

---

### [FLAW-041] No Project Deadline Enforcement
- **Domain:** Business Logic & Workflow Gaps
- **Severity:** HIGH
- **Location:** System-wide — no deadline monitoring exists
- **What's Missing or Broken:** When a project's `end_date` passes with incomplete tasks, nothing happens. No status auto-update, no notification, no escalation. The project stays in whatever status it was in.
- **Real-World Failure Scenario:** A project was due last week. It's still at 60% progress. HR doesn't realize it's overdue because the dashboard shows no visual indicator. The team continues working as if the deadline doesn't exist.
- **Recommended Fix:** The notification router already has task-level deadline checks (approaching + overdue). Extend this to projects: during `GET /notifications`, also check project `end_date`. Create "Project Overdue" notifications. On the frontend, add red "OVERDUE" badges to project cards where `end_date < today && status != COMPLETED`.

---

### [FLAW-042] No Task Deadline Enforcement (Partially Addressed ✅)
- **Domain:** Business Logic & Workflow Gaps
- **Severity:** MEDIUM
- **Location:** [notifications.py](file:///f:/Projects/FypApp/backend/routers/notifications.py) — `GET /` (L18-71)
- **What's Partially Working:** The notification router **does** check for approaching (within 24h) and overdue (past 1 day) tasks on every `GET /notifications` call. It creates "Deadline Approaching" and "Deadline Passed" notifications with deduplication. ✅ This is better than expected.
- **What's Still Missing:** Overdue tasks are not visually flagged in the task board itself. The notifications can be lost due to the 5-notification cap. There's no escalation to HR or Team Lead when a task is overdue.
- **Recommended Fix:** Add overdue highlighting in [ProjectTasks.jsx](file:///f:/Projects/FypApp/frontend/src/components/ProjectTasks.jsx): compare `task.due_date` with today and show a red "OVERDUE" badge. Send overdue notifications to the Team Lead and HR, not just the assignee.

---

### [FLAW-043] Report Submission Without Review Gate
- **Domain:** Business Logic & Workflow Gaps
- **Severity:** MEDIUM
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `PUT /tasks/{id}/status`
- **What's Missing or Broken:** An employee submits a report link, and the task enters a review state. But the Team Lead can skip reviewing the link and directly mark the task as `COMPLETED` — there's no mandatory review step.
- **Real-World Failure Scenario:** Employee submits a random Google link as their "report". Team Lead bulk-approves all pending tasks without clicking a single link. Quality control is nonexistent.
- **Recommended Fix:** Add a `REVIEW` status between `IN_PROGRESS` and `COMPLETED`. When a report link is submitted, auto-set status to `REVIEW`. Team Lead must acknowledge the review before marking `COMPLETED`. This adds one more state to the workflow: `TODO → IN_PROGRESS → REVIEW → COMPLETED`.

---

### [FLAW-044] Comments on Completed Tasks — No Lock
- **Domain:** Business Logic & Workflow Gaps
- **Severity:** LOW
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `POST /tasks/{id}/comments` (L149-178)
- **What's Missing or Broken:** Comments can be added to `COMPLETED` tasks indefinitely. There is no lock or warning when commenting on a closed task.
- **Real-World Failure Scenario:** A task was completed 6 months ago. An employee adds a comment to it. The task reappears in activity feeds, creating noise and confusion.
- **Recommended Fix:** Add check: `if task["status"] == "COMPLETED": raise HTTPException(400, "Cannot comment on completed tasks")`. Or add a visual "This task is closed" banner and allow comments as "notes" only.

---

### [FLAW-045] No Audit Log
- **Domain:** Business Logic & Workflow Gaps
- **Severity:** HIGH
- **Location:** System-wide — no audit trail exists
- **What's Missing or Broken:** There is no history of who changed what and when. Status changes, membership edits, task reassignments, project updates — none are logged. The evaluator cannot trace back any decision.
- **Real-World Failure Scenario:** A task mysteriously moves from `COMPLETED` back to `TODO`. No one knows who did it or when. A project's member list changes but there's no record of who was removed or added. Accountability is impossible.
- **Recommended Fix:** Create an `audit_log` collection. On every state-changing operation, insert a log entry: `{ "entity_type": "task", "entity_id": "...", "action": "status_change", "from": "COMPLETED", "to": "TODO", "user_id": "...", "timestamp": "..." }`. This is a structural change but provides immense value for credibility.

---

## AUDIT DOMAIN 7 — AI & SCREENING MODULE INTEGRITY

---

### [FLAW-046] No Post-Screening Action Flow (Dead End)
- **Domain:** AI & Screening Module
- **Severity:** HIGH
- **Location:** [ai_screener.py](file:///f:/Projects/FypApp/backend/routers/ai_screener.py), [AIScreener.jsx](file:///f:/Projects/FypApp/frontend/src/pages/AIScreener.jsx)
- **What's Missing or Broken:** After the AI scores and evaluates candidates, there is no "Shortlist", "Invite for Interview", "Reject", or "Create Employee Account" action. The screener results are displayed and persisted to `ai_analysis` — but that's it. The feature is a dead end.
- **Real-World Failure Scenario:** HR screens 50 CVs. The AI says "Candidate A: Score 92, Strong Hire". HR then has to manually navigate to the Team page and create an employee account from scratch, retyping all the candidate's information. The AI-to-onboarding pipeline is completely disconnected.
- **Recommended Fix:** Add action buttons to each screening result: "Shortlist" (saves candidate to a shortlist view), "Reject" (marks as rejected), "Onboard" (pre-fills the employee creation form with candidate name/email). Create a `candidates` collection to track candidate status: `SCREENED → SHORTLISTED → INTERVIEW → HIRED → ONBOARDED` or `REJECTED`.

---

### [FLAW-047] Empty Job Requirements Accepted
- **Domain:** AI & Screening Module
- **Severity:** MEDIUM
- **Location:** [ai_screener.py](file:///f:/Projects/FypApp/backend/routers/ai_screener.py) — `POST /analyze`
- **What's Missing or Broken:** `requirements: str = Form(...)` is required but can be an empty string. The AI will receive a blank job requirement and return a meaningless analysis.
- **Real-World Failure Scenario:** HR clicks "Analyze" without typing any requirements. The AI analyzes the CV against nothing and returns a generic, useless score. The result is saved to the database, polluting the audit trail.
- **Recommended Fix:** Add: `if not job_requirements.strip(): raise HTTPException(400, "Job requirements cannot be empty")`. Also enforce a minimum length (e.g., 20 characters).

---

### [FLAW-048] CV Text Truncation Without Warning
- **Domain:** AI & Screening Module
- **Severity:** MEDIUM
- **Location:** [ai_screener.py](file:///f:/Projects/FypApp/backend/routers/ai_screener.py) — L108
- **What's Missing or Broken:** CVs are truncated to 10,000 characters with `cv_text[:10000]`. For long CVs, the latter half (often containing work experience, certifications, and education) is silently dropped. The user is never informed.
- **Real-World Failure Scenario:** A senior candidate with 20 years of experience has a 15,000-character CV. The AI only sees the first 10,000 characters (personal info and early career). The analysis rates them as "junior" because it never sees their senior experience section. HR rejects a strong candidate based on an incomplete evaluation.
- **Recommended Fix:** Track truncation: `was_truncated = len(text) > 10000`. Include in the response: `{"truncated": true, "original_length": 15000, "analyzed_length": 10000}`. Display a yellow warning banner on the frontend.

---

### [FLAW-049] LangChain Installed But Unused (Dead Weight)
- **Domain:** AI & Screening Module
- **Severity:** LOW
- **Location:** `requirements.txt` — `langchain`, `langchain-groq`
- **What's Missing or Broken:** Both packages are installed but not imported or used anywhere in the codebase. This signals an unfinished feature to evaluators and adds unnecessary dependency weight.
- **Real-World Failure Scenario:** An evaluator inspects `requirements.txt`, sees LangChain, and expects a sophisticated AI pipeline. They find it's never used. This undermines credibility and suggests the project was more ambitious than what was delivered.
- **Recommended Fix:** Either remove both packages from `requirements.txt`, or integrate them meaningfully (e.g., use LangChain for a more structured prompt pipeline with output parsers and retry logic).

---

## AUDIT DOMAIN 8 — SYSTEM RELIABILITY & PRODUCTION READINESS

---

### [FLAW-050] Notification Cap of 5 — Critical Notifications Silently Lost
- **Domain:** System Reliability
- **Severity:** HIGH
- **Location:** [database.py](file:///f:/Projects/FypApp/backend/database.py) — `create_notification` (L95-116)
- **What's Missing or Broken:** Each user is capped at 5 notifications. When a 6th arrives, the oldest is permanently deleted — even if it was unread and critical (e.g., "Project Deleted", "You've been removed from a project"). There is no archival, no priority preservation.
- **Real-World Failure Scenario:** An employee is involved in 3 projects. Each project gets updated, firing 2 notifications each. The first 4 notifications (including a project deletion warning) are purged before the employee checks. They lose critical information.
- **Recommended Fix:** Increase cap to at least 50. Never auto-delete unread notifications. Add a `priority` field to notifications and preserve `CRITICAL` ones regardless of cap. Consider paginated notification history.

---

### [FLAW-051] No Pagination on Any Endpoint
- **Domain:** System Reliability
- **Severity:** HIGH
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `GET /`, [users.py](file:///f:/Projects/FypApp/backend/routers/users.py) — `GET /employees`, `GET /tasks/my`
- **What's Missing or Broken:** All list endpoints use `to_list(length=None)`, returning **every** record. No `?page=` or `?limit=` parameters exist.
- **Real-World Failure Scenario:** An HR manages 200 projects with 500 employees. `GET /api/projects` returns all 200 projects with all their tasks embedded. The response is megabytes of JSON. The browser tab freezes. The mobile experience is unusable.
- **Recommended Fix:** Add `skip` and `limit` query parameters: `async def get_projects(skip: int = 0, limit: int = 20, ...)`. Use `.skip(skip).limit(limit)` in MongoDB queries. Return `{ "data": [...], "total": count, "page": page, "pages": total_pages }`.

---

### [FLAW-052] N+1 Query in get_projects()
- **Domain:** System Reliability
- **Severity:** HIGH
- **Location:** [projects.py](file:///f:/Projects/FypApp/backend/routers/projects.py) — `GET /` (task fetch loop)
- **What's Missing or Broken:** For each project, a separate `tasks_collection.find({"project_id": project["_id"]})` query runs. With 50 projects, this is 51 database round-trips (1 for projects + 50 for tasks).
- **Real-World Failure Scenario:** Dashboard loads with 100 projects. The server makes 101 MongoDB queries. Response time exceeds 5 seconds. User perceives the app as broken.
- **Recommended Fix:** Use MongoDB aggregation with `$lookup`:
```python
pipeline = [
    {"$match": {"created_by": current_user["id"]}},
    {"$lookup": {"from": "tasks", "localField": "_id", "foreignField": "project_id", "as": "tasks"}},
    {"$addFields": {
        "progress": {"$cond": [
            {"$gt": [{"$size": "$tasks"}, 0]},
            {"$multiply": [{"$divide": [{"$size": {"$filter": {"input": "$tasks", "cond": {"$eq": ["$$this.status", "COMPLETED"]}}}}, {"$size": "$tasks"}]}, 100]},
            0
        ]}
    }}
]
```

---

### [FLAW-053] No Real-Time Updates
- **Domain:** System Reliability
- **Severity:** MEDIUM
- **Location:** [NotificationBell.jsx](file:///f:/Projects/FypApp/frontend/src/components/NotificationBell.jsx) — 30-second polling
- **What's Missing or Broken:** Notifications are fetched via 30-second polling intervals. There are no WebSockets or Server-Sent Events. If Employee A completes a task, Team Lead B won't know for up to 30 seconds. Other state changes (project updates, new assignments) require manual page refresh.
- **Real-World Failure Scenario:** HR assigns a task. The employee doesn't see it for 30 seconds. In a demo, the evaluator creates a project and switches to the employee view — nothing appears until the next poll fires.
- **Recommended Fix:** For the FYP scope, 30-second polling is acceptable but reduce to 10 seconds. For production, implement WebSockets via FastAPI's `WebSocket` endpoint for real-time notification push.

---

### [FLAW-054] JWT SECRET_KEY Has Hardcoded Weak Fallback
- **Domain:** System Reliability
- **Severity:** CRITICAL
- **Location:** [utils.py](file:///f:/Projects/FypApp/backend/utils.py) — `SECRET_KEY = os.environ.get("SECRET_KEY", "secret")`
- **What's Missing or Broken:** If the `SECRET_KEY` environment variable is missing, the JWT secret defaults to the string `"secret"`. Anyone can forge authentication tokens with this known secret.
- **Real-World Failure Scenario:** The app is deployed without the `.env.local` file (common in fresh deployments). All JWTs are signed with `"secret"`. An attacker forges a token with `sub: "admin_user_id"` and gains full HR access.
- **Recommended Fix:** Remove the fallback entirely. Crash on startup if the key is missing: `SECRET_KEY = os.environ["SECRET_KEY"]` (raises `KeyError` if absent). Or validate at startup: `if not SECRET_KEY or SECRET_KEY == "secret": raise RuntimeError("SECRET_KEY not configured")`.

---

### [FLAW-055] No Rate Limiting on Login
- **Domain:** System Reliability
- **Severity:** HIGH
- **Location:** [auth.py](file:///f:/Projects/FypApp/backend/routers/auth.py) — `POST /login`
- **What's Missing or Broken:** No brute-force protection. No rate limiting on any endpoint. An attacker can attempt unlimited password guesses per second.
- **Real-World Failure Scenario:** An attacker runs a dictionary attack against the login endpoint. With no rate limiting, they can try thousands of passwords per minute. Employee accounts with weak temporary passwords are especially vulnerable.
- **Recommended Fix:** Install `slowapi`: `from slowapi import Limiter`. Apply rate limiting to login: `@limiter.limit("5/minute")`. Return `429 Too Many Requests` when exceeded.

---

### [FLAW-056] CORS Locked to Localhost
- **Domain:** System Reliability
- **Severity:** MEDIUM
- **Location:** [main.py](file:///f:/Projects/FypApp/backend/main.py) — CORS middleware (L14-20)
- **What's Missing or Broken:** CORS origins are hardcoded to `localhost:3000`, `127.0.0.1:3000`, `localhost:5173`, and `127.0.0.1:5173`. Deploying to any real domain requires code changes.
- **Real-World Failure Scenario:** The FYP is deployed to a cloud server for the evaluation demo. The frontend loads but every API call fails with a CORS error. The demo is broken.
- **Recommended Fix:** Use an environment variable: `CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")`. Set it in production `.env` to the actual domain.

---

### [FLAW-057] No Input Sanitization Audit
- **Domain:** System Reliability
- **Severity:** MEDIUM
- **Location:** System-wide
- **What's Missing or Broken:** Free-text fields (project name, task title, comment body, organization name) are not sanitized. While MongoDB is less vulnerable than SQL, NoSQL injection via `$where` or operator injection (`$gt`, `$ne`) is possible if user input is used in query construction. Additionally, `report_link` fields can contain `javascript:` protocol URIs.
- **Real-World Failure Scenario:** A user submits a comment with `{"$gt": ""}` as the text. If the comment content is ever used in a query filter, it could bypass intended logic. The frontend uses React's JSX auto-escaping (good) but `report_link` is used directly in `<a href>`.
- **Recommended Fix:** (1) Validate `report_link` as an `http://` or `https://` URL. (2) Use Pydantic `constr(max_length=...)` on all text fields to prevent oversized inputs. (3) Ensure all MongoDB queries use explicit field lookups, never interpolating user strings into `$where` expressions.

---

### [FLAW-058] Zero Automated Tests
- **Domain:** System Reliability
- **Severity:** HIGH
- **Location:** Entire project — no `tests/` directory exists
- **What's Missing or Broken:** There are no unit tests, integration tests, or end-to-end tests. Any code change risks breaking existing functionality with zero safety net.
- **Real-World Failure Scenario:** A developer fixes [FLAW-020] (status rollback guard) and accidentally breaks the normal `TODO → IN_PROGRESS` transition. No test catches this. The bug ships to production and employees can't start working on tasks.
- **Recommended Fix:** Start with critical-path integration tests using `pytest` + `httpx` for FastAPI: test login, test project creation, test task status transitions, test role guards. Aim for at least 20 tests covering the happy paths and the most dangerous edge cases.

---

### [FLAW-059] No Search or Filtering
- **Domain:** System Reliability
- **Severity:** MEDIUM
- **Location:** Frontend — header search bar is **non-functional** (static input with no event handler), Backend — no search parameters on any endpoint
- **What's Missing or Broken:** There is no way to search employees by name, filter projects by status/priority, or find tasks by keyword. The header has a search bar with a ⌘K shortcut icon, but it is completely non-functional — it's just a styled `<input>` element with no `onChange` handler.
- **Real-World Failure Scenario:** HR has 100 employees. They need to find "John Smith". They must scroll through the entire unsorted list. The search bar does nothing when they type.
- **Recommended Fix:** Wire the header search to a backend search endpoint: `GET /api/search?q=john&type=employee`. Use MongoDB text indexes or regex matching. On the frontend, add `onChange` handler to dispatch search thunks. At minimum, implement client-side filtering on already-fetched data.

---

### [FLAW-060] Frontend API URL Hardcoded
- **Domain:** System Reliability
- **Severity:** LOW
- **Location:** [api.js](file:///f:/Projects/FypApp/frontend/src/services/api.js) — `baseURL: 'http://localhost:8000/api'`
- **What's Missing or Broken:** The API base URL is hardcoded. Cannot be changed without editing source code.
- **Real-World Failure Scenario:** Deploying the frontend to a cloud server — all API calls go to `localhost:8000` which doesn't exist on the cloud server.
- **Recommended Fix:** Use Vite's environment variables: `baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'`.

---

### [FLAW-061] No Enum Validation on Status/Priority/Role Fields
- **Domain:** System Reliability
- **Severity:** HIGH
- **Location:** [models.py](file:///f:/Projects/FypApp/backend/models.py) — `ProjectCreate`, `TaskCreate`, `TaskUpdateStatus`, `ProjectUpdate`
- **What's Missing or Broken:** All `status`, `priority`, `type`, and `role` fields are `Optional[str]` with no enum constraint. Any arbitrary string is accepted. A client can send `status: "HACKED"` or `priority: "INFINITE"`.
- **Real-World Failure Scenario:** A malformed request sets `status: "UNKNOWN"`. The project is saved with an invalid status. The frontend doesn't know how to render it. Dropdown filters break. Progress calculations become unpredictable.
- **Recommended Fix:** Define Python enums (which already exist in models.py for some types but aren't used in the create/update models). Apply them: `status: Optional[ProjectStatus] = None`, `priority: Optional[Priority] = None`. Pydantic will reject invalid values automatically.

---

## FINAL SYNTHESIS

---

### Summary Table

| # | Flaw Title | Domain | Severity | Status |
|---|---|---|---|---|
| 001 | No workload cap per employee | Workload & Assignment | CRITICAL | Open |
| 002 | No active project count check before assignment | Workload & Assignment | CRITICAL | Open |
| 003 | No task load check before task assignment | Workload & Assignment | HIGH | Open |
| 004 | No employee availability status | Workload & Assignment | HIGH | Open |
| 005 | No workload balancing suggestion in UI | Workload & Assignment | HIGH | Open |
| 006 | No overload warning on assignment | Workload & Assignment | HIGH | Open |
| 007 | Same person as sole member AND team lead (deadlock) | Workload & Assignment | MEDIUM | Open |
| 008 | Duplicate members in assigned_to array | Workload & Assignment | LOW | Open |
| 009 | No date validation (end < start, past dates) | Project Lifecycle | HIGH | Open |
| 010 | No minimum team size check | Project Lifecycle | MEDIUM | Open |
| 011 | Team lead not required to be in assigned_to | Project Lifecycle | HIGH | Open |
| 012 | No status transition guard on projects | Project Lifecycle | HIGH | Open |
| 013 | No completion prerequisite check | Project Lifecycle | HIGH | Open |
| 014 | No duplicate project name check | Project Lifecycle | LOW | Open |
| 015 | Ghost projects after bulk employee deletion | Project Lifecycle | HIGH | Open |
| 017 | Task assignees not validated against project members | Task Management | CRITICAL | Open |
| 018 | No task cap per member within a project | Task Management | MEDIUM | Open |
| 019 | No task due date validation against project dates | Task Management | MEDIUM | Open |
| 020 | No status rollback guard on tasks | Task Management | HIGH | Open |
| 021 | Task status can skip IN_PROGRESS | Task Management | MEDIUM | Open |
| 022 | Self-approval gap for HR | Task Management | MEDIUM | Open |
| 023 | Tasks can be created with empty title/no assignees | Task Management | MEDIUM | Open |
| 024 | Report link not validated as URL | Task Management | LOW | Open |
| 025 | Task orphans on member removal (partial) | Task Management | HIGH | Open |
| 027 | Any user can change non-COMPLETED task status | Role & Permission | CRITICAL | Open |
| 029 | HR task reports leak across HR accounts | Role & Permission | HIGH | Open |
| 031 | Must-change-password bypass via direct API | Role & Permission | CRITICAL | Open |
| 033 | No off-boarding cascade on bulk employee delete | Employee Management | CRITICAL | Open |
| 034 | Single employee delete — cascade before ownership check | Employee Management | HIGH | Open |
| 035 | Employee role is client-controllable (privilege escalation) | Employee Management | HIGH | Open |
| 036 | CSV import — no email format validation | Employee Management | MEDIUM | Open |
| 037 | CSV role default case mismatch | Employee Management | LOW | Open |
| 038 | Username uniqueness not checked on creation | Employee Management | HIGH | Open |
| 039 | Password exposure in API responses | Employee Management | MEDIUM | Open |
| 040 | No employee status (active/inactive/on-leave) | Employee Management | MEDIUM | Open |
| 041 | No project deadline enforcement | Business Logic | HIGH | Open |
| 042 | Task deadline enforcement (partial — notifications exist) | Business Logic | MEDIUM | Partial |
| 043 | Report submission without review gate | Business Logic | MEDIUM | Open |
| 044 | Comments on completed tasks — no lock | Business Logic | LOW | Open |
| 045 | No audit log | Business Logic | HIGH | Open |
| 046 | AI screener — no post-screening action flow | AI Module | HIGH | Open |
| 047 | Empty job requirements accepted | AI Module | MEDIUM | Open |
| 048 | CV text truncation without warning | AI Module | MEDIUM | Open |
| 049 | LangChain installed but unused | AI Module | LOW | Open |
| 050 | Notification cap of 5 — critical info lost | System Reliability | HIGH | Open |
| 051 | No pagination on any endpoint | System Reliability | HIGH | Open |
| 052 | N+1 query in get_projects() | System Reliability | HIGH | Open |
| 053 | No real-time updates (30s polling only) | System Reliability | MEDIUM | Open |
| 054 | JWT SECRET_KEY hardcoded weak fallback | System Reliability | CRITICAL | Open |
| 055 | No rate limiting on login | System Reliability | HIGH | Open |
| 056 | CORS locked to localhost | System Reliability | MEDIUM | Open |
| 057 | No input sanitization audit | System Reliability | MEDIUM | Open |
| 058 | Zero automated tests | System Reliability | HIGH | Open |
| 059 | No search or filtering (header search non-functional) | System Reliability | MEDIUM | Open |
| 060 | Frontend API URL hardcoded | System Reliability | LOW | Open |
| 061 | No enum validation on status/priority/role fields | System Reliability | HIGH | Open |

**Total Flaws Found: 52** | **CRITICAL: 7** | **HIGH: 22** | **MEDIUM: 17** | **LOW: 6**

---

### Top 5 Must-Fix Before Re-Evaluation

> [!CAUTION]
> These are the flaws whose absence will cause an evaluator to reject the system in under 5 minutes.

| Priority | Flaw | One-Line Fix Description |
|---|---|---|
| **1** | **[FLAW-001/002/006] No workload awareness** | Add active project count check + warning when assigning overloaded employees (this was the exact evaluator attack) |
| **2** | **[FLAW-027] Any user can change task status across projects** | Add project membership check before any task status update |
| **3** | **[FLAW-031] must_change_password bypass via API** | Add server-side check in `get_current_user` to block all endpoints except password-change |
| **4** | **[FLAW-017] Task assignees not validated against project members** | Check that every task assignee exists in the parent project's `assigned_to[]` |
| **5** | **[FLAW-054] JWT secret key defaults to `"secret"`** | Remove fallback; crash on startup if `SECRET_KEY` env var is missing |

---

### Quick Wins (Can Fix in < 2 Hours Each)

These are validation checks and guard clauses requiring minimal code changes:

| # | Flaw | Estimated Time | Fix Type |
|---|---|---|---|
| 008 | Duplicate members in assigned_to | 10 min | `list(set(...))` dedup |
| 009 | No date validation | 30 min | Pydantic model validator + date type |
| 010 | No minimum team size | 10 min | `if not assigned_to: raise` |
| 011 | Team lead not in assigned_to | 10 min | `if tl not in assigned_to: raise` |
| 014 | Duplicate project name | 15 min | `find_one({"name": ...})` check |
| 017 | Task assignees not in project | 20 min | Set intersection check |
| 020 | Status rollback guard | 30 min | Transition map dictionary |
| 021 | Task status skip | 15 min | Same transition map |
| 023 | Empty title / no assignees | 15 min | Pydantic `min_length` + backend check |
| 024 | Report link URL validation | 15 min | `urlparse` check |
| 027 | Task status auth gap | 20 min | Add membership check |
| 031 | Must-change-password bypass | 20 min | Server-side check in `get_current_user` |
| 034 | Cascade before ownership check | 15 min | Move ownership check to top |
| 035 | Client-controllable role | 5 min | Hardcode `role = "EMPLOYEE"` in router |
| 036 | CSV email format validation | 15 min | Regex check per row |
| 037 | CSV role case mismatch | 5 min | `.upper()` normalize |
| 038 | Username uniqueness | 15 min | `find_one({"username": ...})` + unique index |
| 044 | Comments on completed tasks | 10 min | `if status == COMPLETED: raise` |
| 047 | Empty job requirements | 10 min | `if not requirements.strip(): raise` |
| 048 | CV truncation warning | 15 min | Add `truncated` flag to response |
| 049 | LangChain unused | 5 min | Remove from `requirements.txt` |
| 054 | JWT secret key fallback | 5 min | Remove default, crash if missing |
| 056 | CORS to env variable | 10 min | `os.getenv("CORS_ORIGINS").split(",")` |
| 060 | Hardcoded API URL | 5 min | `import.meta.env.VITE_API_URL` |
| 061 | Enum validation on fields | 30 min | Use Python enums in Pydantic models |

---

### Structural Fixes (Require Design Changes)

These require new data models, new API endpoints, or fundamental workflow redesigns:

| # | Flaw | What's Needed | Scope |
|---|---|---|---|
| 001-006 | **Workload awareness system** | New query logic to count active projects/tasks per employee. New API response fields for warnings. New UI components for workload badges in assignment dropdowns. New `MAX_PROJECTS_PER_EMPLOYEE` config. | Backend + Frontend |
| 004/040 | **Employee availability status** | New `status` field in user schema (`ACTIVE/ON_LEAVE/SUSPENDED`). New UI for HR to toggle status. Filter assignment lists by status. | Database + Backend + Frontend |
| 012/013 | **Project status transition engine** | Transition map: `PLANNING → IN_PROGRESS → COMPLETED`. Completion prerequisites (all tasks done). Status machine pattern. | Backend |
| 033/015 | **Cascade cleanup on all delete paths** | Audit and fix every deletion endpoint. Ensure all employee, project, and task deletions clean up all cross-references. Consider a centralized `cascade_delete_employee()` helper. | Backend |
| 041 | **Project deadline enforcement** | Background job or on-request check for overdue projects. Auto-create notifications. Frontend badges. | Backend + Frontend |
| 043 | **Review workflow for task reports** | New `REVIEW` status in task lifecycle. Team Lead must acknowledge report before approving. | Backend + Frontend + Schema |
| 045 | **Audit log system** | New `audit_log` collection. Insert log entries on every state change. New API endpoint to query logs. New UI to view history. | Database + Backend + Frontend |
| 046 | **AI screener post-screening pipeline** | New `candidates` collection with status tracking. Shortlist/Reject/Onboard actions. Link from screening results to employee creation. | Database + Backend + Frontend |
| 050 | **Notification system overhaul** | Increase cap, add priority field, archive instead of delete, paginate notification history. | Database + Backend + Frontend |
| 051/052 | **Pagination + Query optimization** | Add `skip/limit` on all list endpoints. Replace N+1 queries with `$lookup` aggregation. Return pagination metadata. | Backend + Frontend |
| 058 | **Automated test suite** | Set up `pytest` + `httpx`. Write integration tests for auth, projects, tasks, roles. CI pipeline. | New directory + config |

---

> [!IMPORTANT]
> **Priority Order for Recovery:** Fix all **Quick Wins** first (most can be done in a single coding session). Then tackle the **Top 5 Must-Fix** items. Finally, plan the **Structural Fixes** as separate sprints. The workload awareness system (FLAW-001 through 006) should be the first structural fix since it was the evaluator's primary attack vector.

---

*Report generated for OMS FYP — Post-Evaluation Recovery Audit*
