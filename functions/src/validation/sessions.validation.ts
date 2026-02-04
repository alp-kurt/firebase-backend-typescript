import { SESSION_STATUSES, SessionStatus } from "../types/session";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string; details?: unknown };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const validateRegion = (value: unknown): ValidationResult<string> => {
  if (!isNonEmptyString(value)) {
    return { ok: false, message: "region must be a non-empty string" };
  }

  return { ok: true, value: value.trim() };
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
  if (!isNonEmptyString(value)) {
    return { ok: false, message: "sessionId must be a non-empty string" };
  }

  return { ok: true, value: value.trim() };
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
