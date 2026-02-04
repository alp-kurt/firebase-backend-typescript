import type { Request, Response } from "express";
import { logger } from "firebase-functions";
import {
  createSession,
  createSessionIdempotent,
  deleteSession,
  getSession,
  listDeletedSessions,
  listSessions,
  updateSessionRegion,
  updateSessionStatus
} from "../services/sessions.service";
import type { Session, SessionResponse } from "../types/session";
import type { DeletedSession, DeletedSessionResponse } from "../types/deletedSession";
import { HttpError, sendError, sendJson, toInternalError } from "../utils/http";
import { getRequestId } from "../utils/requestId";
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

const toDeletedResponse = (session: DeletedSession): DeletedSessionResponse => ({
  sessionId: session.sessionId,
  region: session.region,
  status: session.status,
  createdAt: session.createdAt.toDate().toISOString(),
  updatedAt: session.updatedAt.toDate().toISOString(),
  deletedAt: session.deletedAt.toDate().toISOString(),
  expiresAt: session.expiresAt.toDate().toISOString()
});

const toDeletedResponses = (sessions: DeletedSession[]): DeletedSessionResponse[] =>
  sessions.map((session) => toDeletedResponse(session));

export const createSessionHandler = async (req: Request, res: Response): Promise<void> => {
  const requestId = getRequestId(res);
  const start = Date.now();
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
    logger.info("create_session", { requestId, durationMs: Date.now() - start, sessionId: session.sessionId });
  } catch (err: unknown) {
    logger.error("create_session_failed", {
      requestId,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : err
    });
    sendError(res, toInternalError(err));
  }
};

export const listSessionsHandler = async (req: Request, res: Response): Promise<void> => {
  const requestId = getRequestId(res);
  const start = Date.now();
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
    logger.info("list_sessions", { requestId, durationMs: Date.now() - start, count: sessions.length });
  } catch (err: unknown) {
    logger.error("list_sessions_failed", {
      requestId,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : err
    });
    sendError(res, toInternalError(err));
  }
};

export const listDeletedSessionsHandler = async (req: Request, res: Response): Promise<void> => {
  const requestId = getRequestId(res);
  const start = Date.now();
  try {
    const sessions = await listDeletedSessions();
    sendJson(res, 200, toDeletedResponses(sessions));
    logger.info("list_deleted_sessions", { requestId, durationMs: Date.now() - start, count: sessions.length });
  } catch (err: unknown) {
    logger.error("list_deleted_sessions_failed", {
      requestId,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : err
    });
    sendError(res, toInternalError(err));
  }
};

export const getSessionHandler = async (req: Request, res: Response): Promise<void> => {
  const requestId = getRequestId(res);
  const start = Date.now();
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
    logger.info("get_session", { requestId, durationMs: Date.now() - start, sessionId: session.sessionId });
  } catch (err: unknown) {
    logger.error("get_session_failed", {
      requestId,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : err
    });
    sendError(res, toInternalError(err));
  }
};

export const updateSessionRegionHandler = async (req: Request, res: Response): Promise<void> => {
  const requestId = getRequestId(res);
  const start = Date.now();
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
    logger.info("update_session_region", { requestId, durationMs: Date.now() - start, sessionId: session.sessionId });
  } catch (err: unknown) {
    logger.error("update_session_region_failed", {
      requestId,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : err
    });
    sendError(res, toInternalError(err));
  }
};

export const updateSessionStatusHandler = async (req: Request, res: Response): Promise<void> => {
  const requestId = getRequestId(res);
  const start = Date.now();
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
    logger.info("update_session_status", { requestId, durationMs: Date.now() - start, sessionId: session.sessionId });
  } catch (err: unknown) {
    logger.error("update_session_status_failed", {
      requestId,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : err
    });
    sendError(res, toInternalError(err));
  }
};

export const completeSessionHandler = async (req: Request, res: Response): Promise<void> => {
  const requestId = getRequestId(res);
  const start = Date.now();
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
    logger.info("complete_session", { requestId, durationMs: Date.now() - start, sessionId: session.sessionId });
  } catch (err: unknown) {
    logger.error("complete_session_failed", {
      requestId,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : err
    });
    sendError(res, toInternalError(err));
  }
};

export const failSessionHandler = async (req: Request, res: Response): Promise<void> => {
  const requestId = getRequestId(res);
  const start = Date.now();
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
    logger.info("fail_session", { requestId, durationMs: Date.now() - start, sessionId: session.sessionId });
  } catch (err: unknown) {
    logger.error("fail_session_failed", {
      requestId,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : err
    });
    sendError(res, toInternalError(err));
  }
};

export const deleteSessionHandler = async (req: Request, res: Response): Promise<void> => {
  const requestId = getRequestId(res);
  const start = Date.now();
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
    logger.info("delete_session", { requestId, durationMs: Date.now() - start, sessionId: idResult.value });
  } catch (err: unknown) {
    logger.error("delete_session_failed", {
      requestId,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : err
    });
    sendError(res, toInternalError(err));
  }
};
