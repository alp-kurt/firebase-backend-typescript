import type { Session, SessionResponse } from "../types/session";
import type { DeletedSession, DeletedSessionResponse } from "../types/deletedSession";

export const serializeSession = (session: Session): SessionResponse => ({
  sessionId: session.sessionId,
  region: session.region,
  status: session.status,
  createdAt: session.createdAt.toDate().toISOString(),
  updatedAt: session.updatedAt.toDate().toISOString()
});

export const serializeSessions = (sessions: Session[]): SessionResponse[] =>
  sessions.map((session) => serializeSession(session));

export const serializeDeletedSession = (session: DeletedSession): DeletedSessionResponse => ({
  sessionId: session.sessionId,
  region: session.region,
  status: session.status,
  createdAt: session.createdAt.toDate().toISOString(),
  updatedAt: session.updatedAt.toDate().toISOString(),
  deletedAt: session.deletedAt.toDate().toISOString(),
  expiresAt: session.expiresAt.toDate().toISOString()
});

export const serializeDeletedSessions = (sessions: DeletedSession[]): DeletedSessionResponse[] =>
  sessions.map((session) => serializeDeletedSession(session));
