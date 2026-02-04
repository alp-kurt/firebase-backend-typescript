import type { Request, Response, NextFunction } from "express";
import { auth as adminAuth } from "firebase-admin";
import { HttpError, sendError } from "./http";

const getBearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = getBearerToken(req);
  if (!token) {
    sendError(res, new HttpError(401, "unauthenticated", "Missing Bearer token"));
    return;
  }

  try {
    await adminAuth().verifyIdToken(token);
    next();
  } catch {
    sendError(res, new HttpError(401, "unauthenticated", "Invalid token"));
  }
};
