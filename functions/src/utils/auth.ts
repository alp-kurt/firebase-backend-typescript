import type { Request, Response, NextFunction } from "express";
import { auth as adminAuth } from "firebase-admin";
import { HttpError, sendError } from "./http";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

const parseBearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = parseBearerToken(req);
  if (!token) {
    sendError(res, new HttpError(401, "unauthenticated", "Missing Bearer token"));
    return;
  }

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    req.userId = decoded.uid;
    next();
  } catch {
    sendError(res, new HttpError(401, "unauthenticated", "Invalid token"));
  }
};
