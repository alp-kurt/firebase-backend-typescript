import type { Request, Response } from "express";
import {
  createSession,
  createSessionIdempotent,
  deleteSession,
  getSession,
  listSessions,
  updateSessionRegion,
  updateSessionStatus
} from "../services/sessions.service";
import type { Session, SessionResponse } from "../types/session";
import { HttpError, sendError, sendJson, toInternalError } from "../utils/http";
import {
  validateIdempotencyKey,
  validateOptionalRegion,
  validateOptionalStatus,
  validateRegion,
  validateSessionId,
  validateStatus
} from "../validation/sessions.validation";

const toResponse = (session: Session): SessionResponse => ({
  sessionId: session.sessionId,
  region: session.region,
  status: session.status,
  createdAt: session.createdAt.toDate().toISOString(),
  updatedAt: session.updatedAt.toDate().toISOString()
});

const toResponses = (sessions: Session[]): SessionResponse[] =>
  sessions.map((session) => toResponse(session));

export const createSessionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const regionResult = validateRegion(req.body?.region);
    if (!regionResult.ok) {
      throw new HttpError(400, "invalid_argument", regionResult.message, regionResult.details);
    }

    const idempotencyResult = validateIdempotencyKey(req.header("Idempotency-Key"));
    if (!idempotencyResult.ok) {
      throw new HttpError(400, "invalid_argument", idempotencyResult.message, idempotencyResult.details);
    }

    const session = idempotencyResult.value
      ? await createSessionIdempotent(regionResult.value, idempotencyResult.value)
      : await createSession(regionResult.value);
    sendJson(res, 201, toResponse(session));
  } catch (err: unknown) {
    sendError(res, toInternalError(err));
  }
};

export const listSessionsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const statusResult = validateOptionalStatus(req.query.status);
    if (!statusResult.ok) {
      throw new HttpError(400, "invalid_argument", statusResult.message, statusResult.details);
    }

    const regionResult = validateOptionalRegion(req.query.region);
    if (!regionResult.ok) {
      throw new HttpError(400, "invalid_argument", regionResult.message, regionResult.details);
    }

    const sessions = await listSessions({
      status: statusResult.value,
      region: regionResult.value
    });

    sendJson(res, 200, toResponses(sessions));
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

export const updateSessionRegionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const idResult = validateSessionId(req.params.sessionId);
    if (!idResult.ok) {
      throw new HttpError(400, "invalid_argument", idResult.message, idResult.details);
    }

    const regionResult = validateRegion(req.body?.region);
    if (!regionResult.ok) {
      throw new HttpError(400, "invalid_argument", regionResult.message, regionResult.details);
    }

    const session = await updateSessionRegion(idResult.value, regionResult.value);
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

export const completeSessionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const idResult = validateSessionId(req.params.sessionId);
    if (!idResult.ok) {
      throw new HttpError(400, "invalid_argument", idResult.message, idResult.details);
    }

    const session = await updateSessionStatus(idResult.value, "completed");
    if (!session) {
      throw new HttpError(404, "not_found", "session not found");
    }

    sendJson(res, 200, toResponse(session));
  } catch (err: unknown) {
    sendError(res, toInternalError(err));
  }
};

export const failSessionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const idResult = validateSessionId(req.params.sessionId);
    if (!idResult.ok) {
      throw new HttpError(400, "invalid_argument", idResult.message, idResult.details);
    }

    const session = await updateSessionStatus(idResult.value, "failed");
    if (!session) {
      throw new HttpError(404, "not_found", "session not found");
    }

    sendJson(res, 200, toResponse(session));
  } catch (err: unknown) {
    sendError(res, toInternalError(err));
  }
};

export const deleteSessionHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const idResult = validateSessionId(req.params.sessionId);
    if (!idResult.ok) {
      throw new HttpError(400, "invalid_argument", idResult.message, idResult.details);
    }

    const deleted = await deleteSession(idResult.value);
    if (!deleted) {
      throw new HttpError(404, "not_found", "session not found");
    }

    res.status(204).send();
  } catch (err: unknown) {
    sendError(res, toInternalError(err));
  }
};
