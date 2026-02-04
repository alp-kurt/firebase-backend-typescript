import { Timestamp } from "firebase-admin/firestore";
import type { SessionStatus } from "./session";

export interface DeletedSession {
  sessionId: string;
  region: string;
  status: SessionStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp;
  expiresAt: Timestamp;
}

export interface DeletedSessionResponse {
  sessionId: string;
  region: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  expiresAt: string;
}
