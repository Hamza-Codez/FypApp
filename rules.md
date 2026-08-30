# RULES.md — Engineering Standards & Blueprint

> Auto-generated from the **adopt.md** protocol after full codebase analysis of the FypApp (Office Management System).
> These rules are **mandatory** for all current and future projects.

---

## 1. CODEBASE DNA — Extracted Architecture

### Project Identity

| Layer     | Stack                               |
|-----------|-------------------------------------|
| Backend   | FastAPI + Motor (async MongoDB)     |
| Frontend  | React 18 + Vite + Redux Toolkit     |
| Database  | MongoDB Atlas (TLS via certifi)     |
| Auth      | JWT (python-jose) + bcrypt (passlib)|
| AI        | Groq SDK (LLaMA 3.3 70B)           |
| Storage   | Cloudinary (image uploads)          |
| Email     | fastapi-mail (SMTP)                 |

### Data Flow

```
Client (React) → Axios API Layer → FastAPI Router → Dependency Injection (Auth) → Database Layer (Motor) → MongoDB
                                                                                ↘ Utils (hashing, JWT, email, upload)
```

### Folder Structure — Backend

```
backend/
├── main.py              # App entry, middleware, router mounting
├── database.py          # Connection, collections, helpers, init_db
├── models.py            # Pydantic schemas (request/response)
├── deps.py              # Auth dependencies (get_current_user, get_current_hr_user)
├── utils.py             # Hashing, JWT, Cloudinary, email utilities
├── routers/
│   ├── __init__.py
│   ├── auth.py          # Signup, login, /me
│   ├── users.py         # Employee CRUD, CSV import, profile
│   ├── projects.py      # Projects + Tasks CRUD
│   ├── ai_screener.py   # CV analysis via Groq AI
│   └── notifications.py # Notification fetch, read, deadline checks
└── .env.local           # Environment variables
```

### Folder Structure — Frontend

```
frontend/src/
├── main.jsx             # React DOM root
├── App.jsx              # Routing + Auth guards
├── index.css            # Global styles
├── app/
│   └── store.js         # Redux Toolkit store
├── services/
│   └── api.js           # Axios instance + interceptors
├── pages/               # Route-level components
│   ├── Home.jsx         # Landing page
│   ├── Layout.jsx       # Dashboard shell (sidebar + content)
│   ├── Dashboard.jsx    # Main dashboard
│   ├── Projects.jsx     # Project list
│   ├── ProjectDetails.jsx
│   ├── Team.jsx         # Employee management
│   ├── Profile.jsx
│   ├── AIScreener.jsx
│   ├── MyTasks.jsx
│   ├── TaskDetails.jsx
│   ├── TaskReports.jsx
│   ├── Notifications.jsx
│   └── Auth/            # Login/Signup flows
├── components/          # Reusable UI components
│   ├── Sidebar.jsx
│   ├── Navbar.jsx
│   ├── NotificationBell.jsx
│   ├── ProjectCard.jsx
│   ├── StatsGrid.jsx
│   ├── ConfirmDialog.jsx
│   ├── CustomModal.jsx
│   └── ... (21 components)
└── features/            # Redux slices (if any)
```

---

## 2. SKILL EXTRACTION — Actionable Rules

### 2.1 Architecture Patterns

- **Router–Service–Database layering**: Routes handle HTTP; business logic lives in route handlers but DB operations are centralized in `database.py`.
- **Dependency Injection for Auth**: Use FastAPI `Depends()` to inject `get_current_user` and role-guarded variants like `get_current_hr_user`.
- **Startup lifecycle hooks**: Use `@app.on_event("startup")` to initialize DB indexes, ensuring query performance from first request.
- **Collection-per-entity**: Each domain entity (users, projects, tasks, notifications, ai_analysis) has its own MongoDB collection.

### 2.2 API Design Principles

- **Prefix-based routing**: All API routes are mounted under `/api/<domain>` (e.g., `/api/auth`, `/api/projects`).
- **Tag grouping**: Each router is tagged for automatic OpenAPI documentation.
- **OAuth2 token flow**: Login endpoint uses `OAuth2PasswordRequestForm` for standards-compliant auth.
- **Form-based multipart for file uploads**: Endpoints that accept files use `Form(...)` + `File(...)` parameters.
- **Consistent ID transformation**: MongoDB `_id` (ObjectId) is always converted to string `id` via helper functions.

### 2.3 Data Modeling Strategy

- **Pydantic for ALL schemas**: Every request/response body has a corresponding Pydantic model in `models.py`.
- **Optional fields with defaults**: Use `Optional[T] = None` or `Optional[T] = "DEFAULT"` for non-required fields.
- **Separate Create/Update/Response models**: e.g., `ProjectCreate`, `ProjectUpdate`, `User` (response).
- **Type-safe email validation**: Use `EmailStr` from Pydantic for all email fields.

### 2.4 Validation & Schema Design

- **Validate ALL inputs at the boundary**: Pydantic enforces types and constraints before handler logic executes.
- **CSV header normalization**: Normalize column names (lowercase, underscores) and support aliases for flexible imports.
- **File type validation**: Check file extensions before processing (`.pdf`, `.docx`, `.csv`).
- **Password length truncation**: Enforce bcrypt's 72-byte limit by truncating passwords to 50 characters.

### 2.5 Error Handling Strategy

- **HTTPException with explicit status codes**: Never raise raw Python exceptions to the client.
- **Graceful file parsing fallback**: If PDF/DOCX libraries are missing, return `503` with a clear error message instead of crashing.
- **Per-item error collection**: Batch operations (CSV import, multi-CV analysis) collect errors per row/file and return them alongside successes.
- **Silent email failures**: Email sending is wrapped in try/except with `pass` to never block the main flow.

### 2.6 Security Practices

- **JWT-based stateless auth**: Tokens are signed with `HS256` and include expiration.
- **Bcrypt password hashing**: Using `passlib` with `CryptContext(schemes=["bcrypt"])`.
- **Role-based access control (RBAC)**: `get_current_hr_user` enforces `role == "HR"` at the dependency level.
- **Ownership validation**: Users can only modify/delete resources they created (`created_by` checks).
- **CORS whitelist**: Only specific origins are allowed, not `*`.
- **Environment-based secrets**: All secrets (`SECRET_KEY`, API keys, DB URIs) are loaded from `.env` files, never hardcoded.

### 2.7 Performance Optimization Techniques

- **Fully async I/O**: All database operations use `async/await` via Motor (async MongoDB driver).
- **Database indexing at startup**: Compound indexes on frequently queried fields (e.g., `user_id + created_at` for notifications).
- **Connection pooling**: Motor client is initialized once at module level, reused across requests.
- **Notification cap enforcement**: Hard limit of 5 notifications per user to prevent unbounded growth.
- **Text truncation for AI**: CV text is capped at 10,000 characters to control token usage and cost.

### 2.8 Code Structure & Modularity

- **One file per concern**: `database.py` (data access), `deps.py` (auth), `utils.py` (utilities), `models.py` (schemas).
- **One router per domain**: Each domain entity gets its own router file.
- **Helper functions for data transformation**: `user_helper()`, `project_helper()`, `task_helper()`, `notification_helper()` centralize MongoDB-to-dict mapping.
- **Utility functions are pure**: Password hashing, JWT creation, and image upload are stateless utilities.

### 2.9 Naming Conventions

- **snake_case** for Python files, functions, variables, and database fields.
- **PascalCase** for Pydantic models and React components.
- **SCREAMING_SNAKE_CASE** for constants and environment variables.
- **Enum-like strings for status fields**: `"TODO"`, `"IN_PROGRESS"`, `"COMPLETED"`, `"PLANNING"`, `"MEDIUM"`, `"HIGH"`.
- **Router file names match domain**: `auth.py`, `users.py`, `projects.py`.

### 2.10 Testing Awareness

- **Functions are isolated and injectable**: Auth dependencies can be overridden for testing.
- **Helper functions are pure**: Can be unit tested without database connections.
- **Pydantic models validate independently**: Schema validation is testable in isolation.

### 2.11 Deployment Readiness

- **Uvicorn with reload for dev**: `uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)`.
- **TLS certificate handling**: `certifi.where()` for MongoDB Atlas connections.
- **Configurable timeouts**: `serverSelectionTimeoutMS` and `connectTimeoutMS` are explicitly set.
- **Retry writes enabled**: `retryWrites=True` for MongoDB resilience.

---

## 3. BLUEPRINT — Mandatory Standards

### A. Architectural Rules

| Rule | Enforcement |
|------|-------------|
| No business logic in route functions beyond orchestration | Logic belongs in service functions or is composed from utility functions |
| No direct `collection.find()` in routes | All DB operations go through `database.py` helpers or are within route handlers that call centralized functions |
| Auth is always injected via `Depends()` | Never manually parse tokens in route handlers |
| Startup initialization is mandatory | Use lifecycle hooks to create indexes and validate connections |
| One router file per domain entity | Never mix unrelated endpoints in the same file |

### B. API Standards

| Standard | Requirement |
|----------|-------------|
| Route prefix | `/api/<domain>` (e.g., `/api/auth`, `/api/users`) |
| Versioning | Use `/api/v1/` when multiple API versions coexist |
| HTTP methods | `GET` for reads, `POST` for creates, `PUT` for full updates, `PATCH` for partial updates, `DELETE` for removals |
| Status codes | `200` success, `201` created, `400` bad request, `401` unauthorized, `403` forbidden, `404` not found, `503` service unavailable |
| Response format | Always return structured JSON — never raw strings or unformatted data |
| Pagination | Support `limit` and `skip` query parameters for list endpoints |
| File uploads | Use `Form(...)` + `File(...)` with proper content type validation |

### C. Validation Rules

- **Use Pydantic strictly** — every endpoint must have typed request/response models.
- **Validate ALL inputs** — file types, string formats, numeric ranges, email addresses.
- **Never trust client data** — always verify ownership, permissions, and data integrity server-side.
- **Normalize external data** — CSV headers, uploaded text, and user inputs must be sanitized before processing.
- **Separate Create vs Update models** — Create models have required fields; Update models use `Optional` everywhere.

### D. Error Handling

- **Centralized exception pattern**: Raise `HTTPException` with specific `status_code` and `detail` messages.
- **No raw exceptions exposed**: Wrap all external service calls (AI, email, file parsing) in try/except.
- **Batch error collection**: For multi-item operations, collect errors per item and return them in the response.
- **Graceful degradation**: If a non-critical service fails (email, image upload), log it and continue.
- **Custom error responses**: Always include `detail` field explaining what went wrong.

### E. Security

| Practice | Implementation |
|----------|----------------|
| Password hashing | bcrypt via passlib, with 50-char truncation |
| Token auth | JWT with configurable expiration |
| RBAC | Dependency-level role checks |
| Ownership | Verify `created_by` before mutations |
| CORS | Explicit origin whitelist, never `*` in production |
| Secrets | All via environment variables, loaded with `dotenv` |
| Input sanitization | Pydantic validation + explicit string sanitization |
| Rate limiting | Structure code to be rate-limit ready (middleware slot) |

### F. Performance

- **Async everywhere**: Use `async def` for all route handlers and database operations.
- **Never block the event loop**: No synchronous I/O in async handlers. Use async drivers (Motor, httpx).
- **Index-first design**: Create compound indexes for all frequently queried field combinations.
- **Connection reuse**: Initialize database clients at module level, not per-request.
- **Bounded queries**: Always use `.to_list(length=N)` or cursor limits — never fetch unbounded result sets without limits.
- **Payload truncation**: Limit large text inputs (e.g., CV text to 10K chars) before sending to external services.

### G. Config Management

- **Environment-based configuration**: All secrets, URLs, and feature flags come from `.env` files.
- **No hardcoded secrets**: Zero tolerance — API keys, database URIs, and passwords must never appear in source code.
- **Defaults for development**: Provide sensible defaults (e.g., `SECRET_KEY = "secret"`) but require proper values in production.
- **Separate env files by context**: Use `.env.local` for local development, `.env.production` for deployment.

---

## 4. ADOPTION RULES — Non-Negotiable

### MUST

- [ ] Follow this blueprint for every new feature and project
- [ ] Reuse extracted patterns — don't reinvent solutions
- [ ] Maintain naming and structural consistency across all files
- [ ] Keep code DRY — extract shared logic into utilities
- [ ] Handle edge cases proactively (nulls, empty inputs, missing data)
- [ ] Add database indexes for new collections at startup
- [ ] Use dependency injection for cross-cutting concerns (auth, logging)

### MUST NOT

- [ ] Introduce inconsistent patterns (e.g., mixing sync and async DB calls)
- [ ] Skip input validation on any endpoint
- [ ] Mix concerns (auth logic in routes, DB queries in utilities)
- [ ] Write monolithic functions — break into composable units
- [ ] Ignore scalability (unbounded queries, missing indexes, blocking I/O)
- [ ] Hardcode any secret, URL, or configuration value
- [ ] Return raw MongoDB documents — always transform through helper functions

---

## 5. EDGE CASE HANDLING — Mandatory Checklist

For **every** feature or endpoint, verify:

- [ ] **Null/empty inputs**: What happens when optional fields are missing?
- [ ] **Invalid formats**: Email validation, file type checks, date parsing.
- [ ] **Duplicate detection**: Check for existing records before insert (email uniqueness, etc.).
- [ ] **Authorization boundaries**: Can a user access resources they don't own?
- [ ] **Cascading effects**: Does deleting a project also clean up its tasks? Does deleting an HR user clean up their employees?
- [ ] **Concurrency**: Are operations idempotent? Can two requests create conflicting state?
- [ ] **Database failures**: What happens if MongoDB is unreachable? Graceful error or crash?
- [ ] **External service failures**: AI API down? Email server unreachable? Handle gracefully.
- [ ] **Payload limits**: Large file uploads, oversized text inputs, excessive list lengths.

---

## 6. FRONTEND INTEGRATION CONTRACT

### API Client Pattern

```javascript
// services/api.js — Single Axios instance with interceptors
const API = axios.create({ baseURL: VITE_API_URL });
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Contract Requirements

| Requirement | Rule |
|-------------|------|
| Predictable responses | All endpoints return JSON objects, never arrays at top level for paginated data |
| Proper status codes | Frontend switches on HTTP status code, not response body strings |
| ID format | All IDs are strings (ObjectId → string conversion in backend) |
| Date format | ISO 8601 strings or UTC datetime objects |
| Error shape | `{ "detail": "Human-readable error message" }` |
| Auth token | Bearer token in `Authorization` header |
| File uploads | `multipart/form-data` with explicit `Content-Type` |

---

## 7. CODE QUALITY ENFORCEMENT

All generated code must satisfy:

- [ ] **Readable**: Clear variable names, logical flow, no clever tricks.
- [ ] **Structured**: Consistent file organization matching the blueprint.
- [ ] **Documented**: Docstrings for complex functions; inline comments for non-obvious logic.
- [ ] **Non-redundant**: No copy-paste code — extract shared logic into helpers.
- [ ] **Consistently formatted**: Follow language-specific conventions (PEP 8 for Python, Prettier for JS).
- [ ] **Type-annotated**: Python type hints on all function signatures; Pydantic models for all data shapes.

---

## 8. TESTING READINESS

Even if tests are not written immediately, code must be **testable by design**:

- [ ] Functions are isolated — no hidden dependencies or global state mutations.
- [ ] Dependencies are injectable — FastAPI `Depends()` can be overridden in tests.
- [ ] Data transformations are pure functions — `user_helper()`, `get_password_hash()`, etc.
- [ ] Side effects are contained — email, file upload, and external API calls are wrapped in dedicated functions.
- [ ] Database operations are abstracted — can be mocked or replaced with test databases.

---

## 9. FUTURE-READY DESIGN

The architecture must support these extensions **without refactoring core structure**:

| Extension | How the Architecture Supports It |
|-----------|----------------------------------|
| AI Agent Workflows | AI screener pattern is already modular — new AI services follow the same router + Groq/OpenAI pattern |
| External API Integrations | Utility functions in `utils.py` pattern; new integrations get their own utility module |
| Background Jobs | Notification deadline checks show the pattern; Celery/ARQ workers can consume the same database layer |
| Event-Driven Extensions | Notification system is already event-based; can be extended to WebSockets or message queues |
| Multi-Tenancy | `created_by` pattern already provides org-level data isolation |
| Microservice Split | Router-per-domain design means each router can become its own service |

---

## 10. OUTPUT EXPECTATIONS

When building any new project or feature:

1. **Generate folder structure** following the blueprint above.
2. **Generate core boilerplate**: `main.py`, `database.py`, `models.py`, `deps.py`, `utils.py`.
3. **Implement one feature fully** as a reference (complete CRUD with auth, validation, error handling, notifications).
4. **Verify ALL rules above** before considering the implementation complete.

---

## FINAL PRINCIPLE

> Every line of code must justify its existence.

We are not just generating code. We are:

- **Preserving engineering discipline** across all projects
- **Replicating proven success patterns** from working production code
- **Eliminating future technical debt** through consistent standards

---

**FAILURE CONDITION:** If any rule in this document is violated, the output is considered invalid.

**SUCCESS CONDITION:** A new project built with these rules can be scaled, maintained, and extended with minimal refactoring.
