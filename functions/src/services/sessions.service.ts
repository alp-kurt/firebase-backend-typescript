import { FieldValue, Timestamp } from "firebase-admin/firestore";
import crypto from "crypto";
import { deletedSessionsCol, idempotencyCol, sessionsCol } from "../db/firestore";
import { type Session, type SessionStatus } from "../types/session";
import type { DeletedSession } from "../types/deletedSession";
import { isSessionStatus } from "../validation";
import { getDeletedTtlMs, getIdempotencyTtlMs } from "../utils/config";

const mapDocToSession = (data: FirebaseFirestore.DocumentData, sessionId: string): Session => {
  const region = data.region;
  const status = data.status;
  const createdAt = data.createdAt as Timestamp;
  const updatedAt = data.updatedAt as Timestamp;

  if (typeof region !== "string" || typeof status !== "string") {
    throw new Error("Invalid session data in Firestore");
  }

  if (!isSessionStatus(status)) {
    throw new Error("Invalid session status in Firestore");
  }

  if (!(createdAt instanceof Timestamp) || !(updatedAt instanceof Timestamp)) {
    throw new Error("Invalid session timestamps in Firestore");
  }

  return {
    sessionId,
    region,
    status,
    createdAt,
    updatedAt
  };
};

const buildSessionData = (region: string) => ({
  region,
  status: "pending" as const,
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp()
});

const readSessionDoc = async (docRef: FirebaseFirestore.DocumentReference): Promise<Session> => {
  const snap = await docRef.get();
  const data = snap.data();
  if (!data) {
    throw new Error("Failed to read session");
  }
  return mapDocToSession(data, docRef.id);
};

const readSessionDocIfExists = async (
  docRef: FirebaseFirestore.DocumentReference
): Promise<Session | null> => {
  const snap = await docRef.get();
  if (!snap.exists) {
    return null;
  }
  const data = snap.data();
  if (!data) {
    return null;
  }
  return mapDocToSession(data, docRef.id);
};

export const createSession = async (region: string): Promise<Session> => {
  const docRef = sessionsCol.doc();

  await docRef.set({
    sessionId: docRef.id,
    ...buildSessionData(region)
  });

  return readSessionDoc(docRef);
};

const idempotencyDocId = (key: string): string => {
  return crypto.createHash("sha256").update(key).digest("hex");
};

export const createSessionIdempotent = async (
  region: string,
  key: string
): Promise<Session> => {
  const keyId = idempotencyDocId(key);
  const idempotencyRef = idempotencyCol.doc(keyId);
  const ttlMs = getIdempotencyTtlMs();
  let sessionId: string | null = null;

  await sessionsCol.firestore.runTransaction(async (tx) => {
    const idempotencySnap = await tx.get(idempotencyRef);
    if (idempotencySnap.exists) {
      const data = idempotencySnap.data();
      if (data && typeof data.sessionId === "string") {
        sessionId = data.sessionId;
        return;
      }
      throw new Error("Invalid idempotency record");
    }

    const docRef = sessionsCol.doc();
    sessionId = docRef.id;

    tx.set(docRef, {
      sessionId,
      ...buildSessionData(region)
    });

    tx.set(idempotencyRef, {
      sessionId,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + ttlMs)
    });
  });

  if (!sessionId) {
    throw new Error("Failed to resolve idempotent session");
  }

  return readSessionDoc(sessionsCol.doc(sessionId));
};

export const getSession = async (sessionId: string): Promise<Session | null> => {
  return readSessionDocIfExists(sessionsCol.doc(sessionId));
};

export const updateSessionStatus = async (
  sessionId: string,
  status: SessionStatus
): Promise<Session | null> => {
  const docRef = sessionsCol.doc(sessionId);
  const exists = await readSessionDocIfExists(docRef);
  if (!exists) return null;

  await docRef.update({
    status,
    updatedAt: FieldValue.serverTimestamp()
  });

  return readSessionDoc(docRef);
};

export const updateSessionRegion = async (
  sessionId: string,
  region: string
): Promise<Session | null> => {
  const docRef = sessionsCol.doc(sessionId);
  const exists = await readSessionDocIfExists(docRef);
  if (!exists) return null;

  await docRef.update({
    region,
    updatedAt: FieldValue.serverTimestamp()
  });

  return readSessionDoc(docRef);
};

export const deleteSession = async (sessionId: string): Promise<boolean> => {
  const docRef = sessionsCol.doc(sessionId);
  const snap = await docRef.get();
  if (!snap.exists) return false;
  const data = snap.data();
  if (!data) return false;

  const ttlMs = getDeletedTtlMs();

  await sessionsCol.firestore.runTransaction(async (tx) => {
    tx.set(deletedSessionsCol.doc(sessionId), {
      ...data,
      deletedAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + ttlMs)
    });
    tx.delete(docRef);
  });
  return true;
};

const mapDeletedDocToSession = (
  data: FirebaseFirestore.DocumentData,
  sessionId: string
): DeletedSession => {
  const region = data.region;
  const status = data.status;
  const createdAt = data.createdAt as Timestamp;
  const updatedAt = data.updatedAt as Timestamp;
  const deletedAt = data.deletedAt as Timestamp;
  const expiresAt = data.expiresAt as Timestamp;

  if (typeof region !== "string" || typeof status !== "string") {
    throw new Error("Invalid deleted session data in Firestore");
  }

  if (
    !(createdAt instanceof Timestamp) ||
    !(updatedAt instanceof Timestamp) ||
    !(deletedAt instanceof Timestamp) ||
    !(expiresAt instanceof Timestamp)
  ) {
    throw new Error("Invalid deleted session timestamps in Firestore");
  }

  if (!isSessionStatus(status)) {
    throw new Error("Invalid deleted session status in Firestore");
  }

  return {
    sessionId,
    region,
    status,
    createdAt,
    updatedAt,
    deletedAt,
    expiresAt
  };
};

export const listDeletedSessions = async (): Promise<DeletedSession[]> => {
  const snap = await deletedSessionsCol.orderBy("deletedAt", "desc").get();
  return snap.docs.map((doc) => mapDeletedDocToSession(doc.data(), doc.id));
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
