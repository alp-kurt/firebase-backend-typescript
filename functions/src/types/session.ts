import { Timestamp } from "firebase-admin/firestore";

export const SESSION_STATUSES = ["pending", "active", "completed", "failed"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export interface Session {
  sessionId: string;
  region: string;
  status: SessionStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SessionResponse {
  sessionId: string;
  region: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}
