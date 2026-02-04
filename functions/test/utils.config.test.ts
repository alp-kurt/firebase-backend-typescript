import { getCorsOrigins, getDeletedTtlMs, getIdempotencyTtlMs, getRateLimitConfig } from "../src/utils/config";

describe("config helpers", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test("getCorsOrigins parses CSV", () => {
    process.env.CORS_ORIGINS = "https://a.com, https://b.com";
    expect(getCorsOrigins()).toEqual(["https://a.com", "https://b.com"]);
  });

  test("getRateLimitConfig uses defaults", () => {
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_CREATE_MAX;
    const config = getRateLimitConfig();
    expect(config.create.max).toBe(20);
    expect(config.create.windowMs).toBe(60000);
  });

  test("getIdempotencyTtlMs uses hours", () => {
    process.env.IDEMPOTENCY_TTL_HOURS = "2";
    expect(getIdempotencyTtlMs()).toBe(2 * 60 * 60 * 1000);
  });

  test("getDeletedTtlMs uses hours", () => {
    process.env.DELETED_TTL_HOURS = "3";
    expect(getDeletedTtlMs()).toBe(3 * 60 * 60 * 1000);
  });
});
