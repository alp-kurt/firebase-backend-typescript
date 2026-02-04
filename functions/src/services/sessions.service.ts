import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { sessionsCol } from "../db/firestore";
import { SESSION_STATUSES, type Session, type SessionStatus } from "../types/session";

const mapDocToSession = (data: FirebaseFirestore.DocumentData, sessionId: string): Session => {
  const region = data.region;
  const status = data.status;
  const createdAt = data.createdAt as Timestamp;
  const updatedAt = data.updatedAt as Timestamp;

  if (typeof region !== "string" || typeof status !== "string") {
    throw new Error("Invalid session data in Firestore");
  }

  if (!SESSION_STATUSES.includes(status as SessionStatus)) {
    throw new Error("Invalid session status in Firestore");
  }

  if (!(createdAt instanceof Timestamp) || !(updatedAt instanceof Timestamp)) {
    throw new Error("Invalid session timestamps in Firestore");
  }

  return {
    sessionId,
    region,
    status: status as SessionStatus,
    createdAt,
    updatedAt
  };
};

export const createSession = async (region: string): Promise<Session> => {
  const docRef = sessionsCol.doc();
  const sessionId = docRef.id;

  await docRef.set({
    sessionId,
    region,
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  const snap = await docRef.get();
  const data = snap.data();

  if (!data) {
    throw new Error("Failed to read created session");
  }

  return mapDocToSession(data, sessionId);
};

export const getSession = async (sessionId: string): Promise<Session | null> => {
  const snap = await sessionsCol.doc(sessionId).get();
  if (!snap.exists) {
    return null;
  }

  const data = snap.data();
  if (!data) {
    return null;
  }

  return mapDocToSession(data, sessionId);
};

export const updateSessionStatus = async (
  sessionId: string,
  status: SessionStatus
): Promise<Session | null> => {
  const docRef = sessionsCol.doc(sessionId);
  const snap = await docRef.get();

  if (!snap.exists) {
    return null;
  }

  await docRef.update({
    status,
    updatedAt: FieldValue.serverTimestamp()
  });

  const updatedSnap = await docRef.get();
  const data = updatedSnap.data();

  if (!data) {
    throw new Error("Failed to read updated session");
  }

  return mapDocToSession(data, sessionId);
};

export const updateSessionRegion = async (
  sessionId: string,
  region: string
): Promise<Session | null> => {
  const docRef = sessionsCol.doc(sessionId);
  const snap = await docRef.get();

  if (!snap.exists) {
    return null;
  }

  await docRef.update({
    region,
    updatedAt: FieldValue.serverTimestamp()
  });

  const updatedSnap = await docRef.get();
  const data = updatedSnap.data();

  if (!data) {
    throw new Error("Failed to read updated session");
  }

  return mapDocToSession(data, sessionId);
};

export const deleteSession = async (sessionId: string): Promise<boolean> => {
  const docRef = sessionsCol.doc(sessionId);
  const snap = await docRef.get();

  if (!snap.exists) {
    return false;
  }

  await docRef.delete();
  return true;
};

export const listSessions = async (filters: {
  status?: SessionStatus;
  region?: string;
}): Promise<Session[]> => {
  let query: FirebaseFirestore.Query = sessionsCol;

  if (filters.status) {
    query = query.where("status", "==", filters.status);
  }

  if (filters.region) {
    query = query.where("region", "==", filters.region);
  }

  const snap = await query.get();
  return snap.docs.map((doc) => mapDocToSession(doc.data(), doc.id));
};
