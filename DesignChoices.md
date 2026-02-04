# Design Choices

## Questions, Assumptions & Trade-offs (as part of the assignment)

The spec leaves a few details open. Below are the questions I would normally ask, plus the assumptions I implemented to keep the API consistent and easy to verify.

### API routes & response shape
- **Routes were not specified**, so I implemented a clear REST shape around sessions (Create, Get, List, Update Status/Region, Complete/Fail, Delete, and List Deleted) and documented exact paths + curl examples in the README.
- **Response shape:** I return a predictable JSON object for the session, and a single consistent JSON shape for errors (`{ error: { code, message, details? } }`).  
  Trade-off: not wrapping success responses in `{ data: ... }` keeps curl/manual verification simpler.

### Region validation strictness
- The spec gives `region` as an example (`"eu-central"`), but doesn’t define an allow-list.  
  **Assumption:** treat `region` as a required non-empty string and keep validation lightweight.
  Trade-off: an allow-list would be stronger, but without a source of truth it would risk rejecting valid inputs.

### Session ID generation
- The spec requires a unique `sessionId` but doesn’t dictate the format.  
  **Assumption:** generate IDs server-side using Firestore auto-IDs and mirror it into the `sessionId` field.
  Trade-off: UUIDs or custom formats are possible, but auto-IDs are simple and collision-safe.

### Status update semantics
- Status values are strictly limited to: `pending | active | completed | failed`.
- **Status transitions were not specified**, so I allow any transition between valid statuses.
  Trade-off: in a real domain I’d likely enforce a state machine (e.g., disallow `completed → active`) after product clarification.

### Not-found and upsert behavior
- The spec includes “update status”, but doesn’t say whether update should upsert.  
  **Assumption:** no upsert — updating a missing session returns `404`.
  Trade-off: upsert can be useful for some workflows, but it often hides client bugs.

### Timestamps serialization
- Firestore stores timestamps as server timestamps.
- **Assumption:** timestamps are stored using server time; API returns them in a consistent serialized form (documented in README).
  Trade-off: returning raw Firestore `Timestamp` objects can be awkward for API consumers; returning ISO strings is more portable.

### Authentication (bonus)
- Auth is optional in the spec.  
  **Assumption:** secure-by-default using Firebase Auth ID tokens (`Authorization: Bearer <idToken>`).
  Trade-off: adds a small verification step for reviewers; to reduce friction I documented how to obtain a token quickly and kept error messages explicit.

### Rate limiting (bonus)
- Used a lightweight in-memory limiter.
  Trade-off: limits are per-instance. For multi-instance/global rate limits, a shared store (e.g., Redis) would be the next step.

### Testing strategy (bonus)
- Added Jest + Supertest tests around HTTP handlers and validation utilities.
- Firestore service layer is mocked for speed/determinism.
  Trade-off: emulator-backed integration tests would increase confidence for Firestore behavior, but take longer to run and add setup overhead.

---

## Tests
I added Jest + Supertest tests around the HTTP handlers and validation utilities. The Firestore service layer is mocked so tests stay fast and deterministic.

Covered cases include:
- Valid create session returns `201`.
- Invalid body returns `400`.
- Missing session returns `404`.
- Invalid status returns `400`.
- Update status returns `200`.
- Update region returns `200`.
- Complete/fail endpoints update status.
- Delete returns `204`.
- List sessions returns array and supports filters.
- Missing/invalid auth returns `401`.
- Unsupported method returns `405`.
- Invalid JSON body returns `400`.
- Idempotency returns the same session for the same key.
- Request IDs are echoed and logs do not leak auth tokens.

Validation tests cover invalid/valid `region`, `status`, and `sessionId`. Utility tests cover serializers, config helpers, and rate limiting behavior.

## Authentication
Firebase Auth only. All endpoints require `Authorization: Bearer <idToken>` and the frontend uses email/password login.

Edge cases handled:
- Missing/invalid token → `401`.
- Login shows friendly errors for common Firebase Auth failures.
- Turned off new sign ups from Firebase Console

Uncovered:
- MFA/lockouts, audit logging, and explicit token refresh UI.

## Frontend UI
I designed the UI, focusing on a single user admin console with a clean two‑route flow: a dedicated login screen and a protected sessions workspace. The sessions workspace is organized around a small set of predictable modules—header actions, a compact stats strip, a single control panel for create/filter, and a card‑based session list.

Edge cases handled:
- Protected routes redirect to `/login` when unauthenticated.
- In‑flight actions are disabled to prevent double submits.
- Create, delete, and status updates require confirmation modals.

## Type Safety
Both backend and frontend use explicit type guards for status parsing, and the frontend shares a single source of truth for allowed statuses.

## Rate Limiting
I used a lightweight in‑memory limiter for simplicity. Trade‑off: limits are per instance. For stronger global limits, a Redis‑backed limiter would be the next step.

## Linting & CI/CD
I tightened lint rules for both functions and frontend, added type‑aware linting, and introduced predeploy checks to run lint/build (and tests for functions). I also added Release Please for automated versioning/changelogs and deployment workflows that run on published releases (GitHub Pages deploys the frontend; functions deploy is intentionally a placeholder for manual deployment).

Trade‑offs:
- TypeScript linting depends on a supported TS version, so I pinned functions to TS 5.5.x to avoid parser warnings.

## Frontend Validation & Errors
I added lightweight client‑side validation for login fields and create‑session region selection. Error handling now safely parses non‑JSON responses and surfaces API error codes alongside messages to improve debugging.
