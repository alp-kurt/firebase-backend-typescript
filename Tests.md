# Tests

## Backend (functions)
Tests use Jest + Supertest with mocked Firestore services. Coverage focuses on handler behavior, validation, and utilities.

Covered scenarios:
- Create session returns `201`
- Invalid body returns `400`
- Missing session returns `404`
- Invalid status returns `400`
- Update status returns `200`
- Update region returns `200`
- Complete/fail endpoints update status
- Delete returns `204`
- List sessions returns array and supports filters
- Missing/invalid auth returns `401`
- Unsupported method returns `405`
- Invalid JSON body returns `400`
- Idempotency returns the same session for the same key
- Request IDs are echoed and logs do not leak auth tokens
- Serializer tests convert Firestore timestamps to ISO strings
- Validation tests cover region/status/sessionId
- `requireValid` throws on invalid validation results
- Config helpers parse CORS/TTL/rate limit defaults
- Rate limiter blocks after exceeding max

Run:
```bash
cd functions
npm run test
```

## Frontend
No automated UI tests yet. Linting and TypeScript build run as part of `npm run predeploy:check`.

Run:
```bash
cd frontend
npm run predeploy:check
```
