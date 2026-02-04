import type { Request, Response } from "express";
import { createSession, getSession, updateSessionStatus } from "../services/sessions.service";
import type { Session, SessionResponse } from "../types/session";
import { HttpError, sendError, sendJson, toInternalError } from "../utils/http";
import { validateRegion, validateSessionId, validateStatus } from "../validation/sessions.validation";

const toResponse = (session: Session): SessionResponse => ({
  sessionId: session.sessionId,
  region: session.region,
  status: session.status,
  createdAt: session.createdAt.toDate().toISOString(),
  updatedAt: session.updatedAt.toDate().toISOString()
});

export const createSessionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const regionResult = validateRegion(req.body?.region);
    if (!regionResult.ok) {
      throw new HttpError(400, "invalid_argument", regionResult.message, regionResult.details);
    }

    const session = await createSession(regionResult.value);
    sendJson(res, 201, toResponse(session));
  } catch (err: unknown) {
    sendError(res, toInternalError(err));
  }
};

export const getSessionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const idResult = validateSessionId(req.params.sessionId);
    if (!idResult.ok) {
      throw new HttpError(400, "invalid_argument", idResult.message, idResult.details);
    }

    const session = await getSession(idResult.value);
    if (!session) {
      throw new HttpError(404, "not_found", "session not found");
    }

    sendJson(res, 200, toResponse(session));
  } catch (err: unknown) {
    sendError(res, toInternalError(err));
  }
};

export const updateSessionStatusHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const idResult = validateSessionId(req.params.sessionId);
    if (!idResult.ok) {
      throw new HttpError(400, "invalid_argument", idResult.message, idResult.details);
    }

    const statusResult = validateStatus(req.body?.status);
    if (!statusResult.ok) {
      throw new HttpError(400, "invalid_argument", statusResult.message, statusResult.details);
    }

    const session = await updateSessionStatus(idResult.value, statusResult.value);
    if (!session) {
      throw new HttpError(404, "not_found", "session not found");
    }

    sendJson(res, 200, toResponse(session));
  } catch (err: unknown) {
    sendError(res, toInternalError(err));
  }
};
