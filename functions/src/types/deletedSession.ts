import type { Timestamp } from "firebase-admin/firestore";
import type { SessionBase, TimestampString } from "./session";

export interface DeletedSession extends SessionBase<Timestamp> {
  deletedAt: Timestamp;
  expiresAt: Timestamp;
}

export interface DeletedSessionResponse extends SessionBase<TimestampString> {
  deletedAt: TimestampString;
  expiresAt: TimestampString;
}
