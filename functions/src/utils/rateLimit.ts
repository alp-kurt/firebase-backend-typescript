import type { Request, Response, NextFunction } from "express";
import { HttpError, sendError } from "./http";
import type { AuthenticatedRequest } from "./auth";

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const buildKey = (req: AuthenticatedRequest): string => {
  const ip = req.ip || "unknown";
  const userId = req.userId;
  return userId ? `${userId}:${ip}` : ip;
};

const initBucket = (now: number, windowMs: number): Bucket => ({
  count: 1,
  resetAt: now + windowMs
});

const isExpired = (bucket: Bucket, now: number): boolean => bucket.resetAt <= now;

export const rateLimit = (options: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = buildKey(req as AuthenticatedRequest);
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || isExpired(existing, now)) {
      buckets.set(key, initBucket(now, options.windowMs));
      next();
      return;
    }

    const nextCount = existing.count + 1;
    const updated: Bucket = { ...existing, count: nextCount };
    buckets.set(key, updated);

    if (nextCount > options.max) {
      sendError(
        res,
        new HttpError(429, "resource_exhausted", "Too many requests", {
          retryAfterMs: Math.max(updated.resetAt - now, 0)
        })
      );
      return;
    }

    next();
  };
};
