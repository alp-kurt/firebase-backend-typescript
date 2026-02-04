import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const COLLECTIONS = {
  sessions: "sessions",
  idempotencyKeys: "idempotencyKeys",
  deletedSessions: "deletedSessions"
} as const;

const ensureFirebaseApp = (): void => {
  if (getApps().length === 0) {
    initializeApp();
  }
};

ensureFirebaseApp();

export const db = getFirestore();
export const sessionsCol = db.collection(COLLECTIONS.sessions);
export const idempotencyCol = db.collection(COLLECTIONS.idempotencyKeys);
export const deletedSessionsCol = db.collection(COLLECTIONS.deletedSessions);

export { COLLECTIONS };
