export const SESSION_STATUSES = ["pending", "active", "completed", "failed"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

const statusSet = new Set<string>(SESSION_STATUSES);

export const isSessionStatus = (value: string): value is SessionStatus => statusSet.has(value);
