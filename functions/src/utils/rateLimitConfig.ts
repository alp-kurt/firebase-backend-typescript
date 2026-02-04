export interface RateLimitConfigEntry {
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
