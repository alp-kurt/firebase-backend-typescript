# Firebase Session API (TypeScript)

Firestore-backed session management API on Firebase Cloud Functions with a small Vite React admin console.

## Live Demo
https://alp-kurt.github.io/firebase-backend-typescript/login

## Setup
1. Install backend dependencies:
```bash
cd functions
npm install
```

2. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

3. Configure frontend env:
```bash
cp .env.example .env
```
Fill in `VITE_FIREBASE_*` values from your Firebase project.

## Run Locally
```bash
# from repo root
firebase emulators:start
```

Frontend dev server:
```bash
cd frontend
npm run dev
```

## Manual Firebase Setup
Some Firebase settings must be configured manually. See [`FirebaseSetup.md`](./FirebaseSetup.md).

## Deploy
Functions:
```bash
cd functions
npm run deploy:prod
```
Firestore rules:
```bash
cd functions
npm run deploy:rules
```
Predeploy checks (lint + test + build):
```bash
cd functions
npm run predeploy:check
```

Frontend (Firebase Hosting):
```bash
cd frontend
npm run deploy
```
Predeploy checks (lint + build):
```bash
cd frontend
npm run predeploy:check
```

GitHub Pages (tagged releases):
- Deploys on Release Published via GitHub Actions.

## API Docs
- Full endpoint list and examples: [`Endpoints.md`](./Endpoints.md)
- Tests: [`Tests.md`](./Tests.md)
- Changelog: [`CHANGELOG.md`](./CHANGELOG.md)

## Decisions / Trade-offs
- Timestamps are serialized to ISO strings for client-friendly responses.
- Idempotency uses a Firestore collection + TTL for lightweight de-duplication.
- Rate limiting is in-memory per instance; Redis would be the next step for global limits.

More details: [`DesignChoices.md`](./DesignChoices.md)

## Author
[Alp Kurt](https://alpkurt.com) — krtalp@gmail.com
