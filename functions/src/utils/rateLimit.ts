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

const getKey = (req: AuthenticatedRequest): string => {
  const ip = req.ip || "unknown";
  const userId = req.userId;
  return userId ? `${userId}:${ip}` : ip;
};

export const rateLimit = (options: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = getKey(req as AuthenticatedRequest);
    const now = Date.now();

    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    existing.count += 1;
    buckets.set(key, existing);

    if (existing.count > options.max) {
      sendError(
        res,
        new HttpError(429, "resource_exhausted", "Too many requests", {
          retryAfterMs: Math.max(existing.resetAt - now, 0)
        })
      );
      return;
    }

    next();
  };
};
