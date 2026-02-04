import type { Timestamp } from "firebase-admin/firestore";

export const SESSION_STATUSES = ["pending", "active", "completed", "failed"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export type TimestampString = string;

export interface SessionBase<TTimestamp> {
  sessionId: string;
  region: string;
  status: SessionStatus;
  createdAt: TTimestamp;
  updatedAt: TTimestamp;
}

export type Session = SessionBase<Timestamp>;

export type SessionResponse = SessionBase<TimestampString>;
