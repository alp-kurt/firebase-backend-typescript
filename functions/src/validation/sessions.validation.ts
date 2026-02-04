import { SESSION_STATUSES } from "../types/session";
import type { SessionStatus } from "../types/session";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string; details?: unknown };

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const validateRegion = (value: unknown): ValidationResult<string> => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return { ok: false, message: "region must be a non-empty string" };
  }

  return { ok: true, value: normalized };
};

const sessionStatusSet = new Set<string>(SESSION_STATUSES);

export const isSessionStatus = (value: unknown): value is SessionStatus =>
  typeof value === "string" && sessionStatusSet.has(value);

export const validateStatus = (value: unknown): ValidationResult<SessionStatus> => {
  if (!isSessionStatus(value)) {
    return {
      ok: false,
      message: `status must be one of: ${SESSION_STATUSES.join(", ")}`,
      details: { allowed: SESSION_STATUSES }
    };
  }

  return { ok: true, value };
};

export const validateSessionId = (value: unknown): ValidationResult<string> => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return { ok: false, message: "sessionId must be a non-empty string" };
  }

  return { ok: true, value: normalized };
};

export const validateIdempotencyKey = (value: unknown): ValidationResult<string> => {
  if (value === undefined || value === null) {
    return { ok: true, value: "" };
  }
  const normalized = normalizeString(value);
  if (!normalized) {
    return { ok: false, message: "Idempotency-Key must be a non-empty string" };
  }
  if (normalized.length > 256) {
    return { ok: false, message: "Idempotency-Key must be at most 256 characters" };
  }
  return { ok: true, value: normalized };
};

export const validateOptionalRegion = (value: unknown): ValidationResult<string | undefined> => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  return validateRegion(value);
};

export const validateOptionalStatus = (
  value: unknown
): ValidationResult<SessionStatus | undefined> => {
  if (value === undefined) {
    return { ok: true, value: undefined };
  }

  return validateStatus(value);
};
