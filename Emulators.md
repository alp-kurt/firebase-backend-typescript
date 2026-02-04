# Emulator Guide

## Prereqs
- Firebase CLI installed: `npm i -g firebase-tools`
- Dependencies installed:
```bash
cd functions
npm install
# Optional (only if running the frontend)
cd ../frontend
npm install
```

## Start Emulators
From repo root:
```bash
firebase emulators:start
```

Default emulator URLs:
- Functions: http://127.0.0.1:5001
- Firestore: http://127.0.0.1:8080

## Optional: Run Frontend Locally
The frontend is not required for emulator testing, but you can run it if you want a UI.
```bash
cd frontend
npm run dev
```

## Example Requests
Replace `<project-id>` with your Firebase project id (from `.firebaserc`).

```bash
# Create session
curl -X POST http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <idToken>" \
  -d '{"region":"eu-central"}'

# Get session
curl http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId> \
  -H "Authorization: Bearer <idToken>"

# Update status
curl -X PATCH http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <idToken>" \
  -d '{"status":"active"}'

# Update region
curl -X PATCH http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <idToken>" \
  -d '{"region":"us-east"}'

# Complete session
curl -X POST http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId>/complete \
  -H "Authorization: Bearer <idToken>"

# Fail session
curl -X POST http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId>/fail \
  -H "Authorization: Bearer <idToken>"

# Delete session
curl -X DELETE http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions/<sessionId> \
  -H "Authorization: Bearer <idToken>"

# List sessions
curl "http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/sessions?status=active&region=eu-central" \
  -H "Authorization: Bearer <idToken>"

# List deleted sessions
curl http://127.0.0.1:5001/<project-id>/europe-west1/api/api/v1/deleted-sessions \
  -H "Authorization: Bearer <idToken>"
```
