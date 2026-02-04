# Firebase Manual Setup

This project requires a few manual steps in the Firebase Console.

## 1) Create a Firebase Project
- Go to https://console.firebase.google.com
- Create a new project
- Enable **Firestore** and **Functions**

## 2) Enable Authentication
- Go to **Authentication → Sign-in method**
- Enable **Email/Password**
- Create an admin user under **Users**

## 3) Firestore TTL Policies
TTL is required for automatic cleanup of idempotency keys and deleted sessions.

In **Firestore → TTL**:
- Add policy for collection: `idempotencyKeys`, field: `expiresAt`
- Add policy for collection: `deletedSessions`, field: `expiresAt`

Note: policies can be created before the collections exist.

## 4) Firebase Functions Region
This project deploys the function named `api` to region `europe-west1`.

## 5) GitHub Pages (optional)
If you deploy the frontend via GitHub Pages:
- Ensure Pages is configured to **GitHub Actions** in repo settings.
- Tag a release or publish a Release to trigger deployment.
