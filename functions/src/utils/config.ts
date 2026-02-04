import type { RateLimitConfig } from "./rateLimitConfig";

const DEFAULT_RATE_WINDOW_MS = 60_000;
const DEFAULT_IDEMPOTENCY_TTL_HOURS = 24;
const DEFAULT_DELETED_TTL_HOURS = 24;

const toPositiveInt = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const hoursToMs = (hours: number): number => hours * 60 * 60 * 1000;

const toCsvList = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const getRateLimitConfig = (): RateLimitConfig => {
  const windowMs = toPositiveInt(process.env.RATE_LIMIT_WINDOW_MS, DEFAULT_RATE_WINDOW_MS);

  return {
    create: { windowMs, max: toPositiveInt(process.env.RATE_LIMIT_CREATE_MAX, 20) },
    update: { windowMs, max: toPositiveInt(process.env.RATE_LIMIT_UPDATE_MAX, 60) },
    updateStatus: { windowMs, max: toPositiveInt(process.env.RATE_LIMIT_UPDATE_STATUS_MAX, 60) },
    complete: { windowMs, max: toPositiveInt(process.env.RATE_LIMIT_COMPLETE_MAX, 30) },
    fail: { windowMs, max: toPositiveInt(process.env.RATE_LIMIT_FAIL_MAX, 30) },
    delete: { windowMs, max: toPositiveInt(process.env.RATE_LIMIT_DELETE_MAX, 20) }
  };
};

export const getIdempotencyTtlMs = (): number => {
  const hours = toPositiveInt(process.env.IDEMPOTENCY_TTL_HOURS, DEFAULT_IDEMPOTENCY_TTL_HOURS);
  return hoursToMs(hours);
};

export const getDeletedTtlMs = (): number => {
  const hours = toPositiveInt(process.env.DELETED_TTL_HOURS, DEFAULT_DELETED_TTL_HOURS);
  return hoursToMs(hours);
};

export const getCorsOrigins = (): string[] => toCsvList(process.env.CORS_ORIGINS);
