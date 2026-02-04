import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp();
}

export const db = getFirestore();
export const sessionsCol = db.collection("sessions");
export const idempotencyCol = db.collection("idempotencyKeys");
export const deletedSessionsCol = db.collection("deletedSessions");
