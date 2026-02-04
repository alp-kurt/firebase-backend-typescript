interface RateLimitConfigEntry {
  windowMs: number;
  max: number;
}

export interface RateLimitConfig {
  create: RateLimitConfigEntry;
  update: RateLimitConfigEntry;
  updateStatus: RateLimitConfigEntry;
  complete: RateLimitConfigEntry;
  fail: RateLimitConfigEntry;
  delete: RateLimitConfigEntry;
}

const parseIntSafe = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseMs = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getRateLimitConfig = (): RateLimitConfig => {
  const windowMs = parseMs(process.env.RATE_LIMIT_WINDOW_MS, 60_000);

  return {
    create: { windowMs, max: parseIntSafe(process.env.RATE_LIMIT_CREATE_MAX, 20) },
    update: { windowMs, max: parseIntSafe(process.env.RATE_LIMIT_UPDATE_MAX, 60) },
    updateStatus: { windowMs, max: parseIntSafe(process.env.RATE_LIMIT_UPDATE_STATUS_MAX, 60) },
    complete: { windowMs, max: parseIntSafe(process.env.RATE_LIMIT_COMPLETE_MAX, 30) },
    fail: { windowMs, max: parseIntSafe(process.env.RATE_LIMIT_FAIL_MAX, 30) },
    delete: { windowMs, max: parseIntSafe(process.env.RATE_LIMIT_DELETE_MAX, 20) }
  };
};
