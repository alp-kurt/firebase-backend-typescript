import type { RequestHandler } from "express";
import { rateLimit } from "./rateLimit";
import { requireAuth } from "./auth";
import { safeHandler, withRequestLogging, type AsyncHandler } from "./handler";
import { methodNotAllowed } from "./http";

export const wrapHandler = (name: string, handler: AsyncHandler): RequestHandler =>
  safeHandler(withRequestLogging(name, handler));

export const buildProtectedRoute = (
  handler: RequestHandler,
  limit?: { windowMs: number; max: number }
): RequestHandler[] => {
  const chain: RequestHandler[] = [requireAuth];
  if (limit) {
    chain.push(rateLimit(limit));
  }
  chain.push(handler);
  return chain;
};

export const notAllowed = (allowed: string[]): RequestHandler => (req, res) =>
  methodNotAllowed(allowed)(res);
