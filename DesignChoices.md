# Design Choices

## Tests
I added lightweight integration-style tests around the HTTP handlers using `supertest` and Jest. These tests exercise the Express routes and validate response status codes and error shapes without requiring the Firestore emulator. The Firestore service layer is mocked so the tests stay fast and deterministic.

Covered cases:
- Valid create session request returns `201` with the expected body.
- Invalid create request returns `400` with `invalid_argument`.
- Missing session returns `404` with `not_found`.
- Invalid status update returns `400` with `invalid_argument`.
- Valid status update returns `200` and the new status.

I also added direct validation tests to ensure runtime checks reject bad input and accept valid values.
