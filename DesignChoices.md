# Design Choices

## Tests
I added Jest + Supertest tests around the HTTP handlers and validation utilities. The Firestore service layer is mocked so tests stay fast and deterministic.

Covered cases include:
- Valid create session returns `201`.
- Invalid body returns `400`.
- Missing session returns `404`.
- Invalid status returns `400`.
- Update status returns `200`.
- Missing/invalid auth returns `401`.
- Unsupported method returns `405`.
- Invalid JSON body returns `400`.

Validation tests cover invalid/valid `region`, `status`, and `sessionId`.

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
I tightened lint rules for both functions and frontend, added type‑aware linting, and introduced predeploy checks to run lint/build (and tests for functions). I also added Release Please for automated versioning/changelogs and a deploy workflow that publishes functions + hosting on version tags.

Edge cases handled:
- Lint blocks unused variables and unsafe patterns before deploy.
- Predeploy checks fail fast on build/test errors.

Trade‑offs:
- TypeScript linting depends on a supported TS version, so I pinned functions to TS 5.5.x to avoid parser warnings.

## Frontend Validation & Errors
I added lightweight client‑side validation for login fields and create‑session region selection. Error handling now safely parses non‑JSON responses and surfaces API error codes alongside messages to improve debugging.
