# API Endpoints

Base path: `/api/v1` (legacy `/api` remains for backward compatibility)

## Auth
All endpoints require a Firebase Auth ID token in:
`Authorization: Bearer <idToken>`

## Status Codes
Common responses:
- `200` for reads/updates
- `201` for create
- `204` for delete
- `400` invalid input
- `401` missing/invalid auth
- `404` not found
- `405` method not allowed

## Create Session
`POST /api/v1/sessions`

Optional header:
`Idempotency-Key: <string>`

Body:
```json
{ "region": "eu-central" }
```

Response `201`:
```json
{
  "sessionId": "abc123",
  "region": "eu-central",
  "status": "pending",
  "createdAt": "2026-02-04T12:34:56.000Z",
  "updatedAt": "2026-02-04T12:34:56.000Z"
}
```

## Get Session
`GET /api/v1/sessions/:sessionId`

## List Sessions
`GET /api/v1/sessions?status=active&region=eu-central`

## List Deleted Sessions
`GET /api/v1/deleted-sessions`
Returns sessions retained for the TTL window after delete.

## Update Session Status
`PATCH /api/v1/sessions/:sessionId/status`

Body:
```json
{ "status": "active" }
```

## Update Session Region
`PATCH /api/v1/sessions/:sessionId`

Body:
```json
{ "region": "us-east" }
```

## Complete Session
`POST /api/v1/sessions/:sessionId/complete`

## Fail Session
`POST /api/v1/sessions/:sessionId/fail`

## Delete Session
`DELETE /api/v1/sessions/:sessionId`

## Error Format
```json
{
  "error": {
    "code": "invalid_argument",
    "message": "region must be a non-empty string",
    "details": { "allowed": ["pending","active","completed","failed"] }
  }
}
```

## Emulator Curl Examples
Replace `<project-id>` and `<region>` (functions region) if needed. Default emulator region: `europe-west1`.

```bash
# Create
curl -X POST http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <idToken>" \
  -d '{"region":"eu-central"}'

# Get
curl http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId> \
  -H "Authorization: Bearer <idToken>"

# Update status
curl -X PATCH http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <idToken>" \
  -d '{"status":"active"}'

# List
curl "http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions?status=active&region=eu-central" \
  -H "Authorization: Bearer <idToken>"

# Update region
curl -X PATCH http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <idToken>" \
  -d '{"region":"us-east"}'

# Complete
curl -X POST http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId>/complete \
  -H "Authorization: Bearer <idToken>"

# Fail
curl -X POST http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId>/fail \
  -H "Authorization: Bearer <idToken>"

# Delete
curl -X DELETE http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId> \
  -H "Authorization: Bearer <idToken>"
```
