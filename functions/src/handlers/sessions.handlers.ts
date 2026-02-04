import type { Request, Response } from "express";
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
import { serializeDeletedSessions, serializeSession, serializeSessions } from "../utils/serializers";
import { HttpError, sendJson } from "../utils/http";
import { safeHandler, withRequestLogging } from "../utils/handler";
import {
  validateIdempotencyKey,
  validateOptionalRegion,
  validateOptionalStatus,
  validateRegion,
  validateSessionId,
  validateStatus
} from "../validation";
import { requireValid } from "../utils/validation";

const toResponse = (session: Session): SessionResponse => serializeSession(session);
const toResponses = (sessions: Session[]): SessionResponse[] => serializeSessions(sessions);
const toDeletedResponses = (sessions: DeletedSession[]): DeletedSessionResponse[] =>
  serializeDeletedSessions(sessions);

const createSessionHandlerBase = async (req: Request, res: Response): Promise<void> => {
  const region = requireValid(validateRegion(req.body?.region), "region");

    const idempotencyKey = requireValid(validateIdempotencyKey(req.header("Idempotency-Key")), "Idempotency-Key");

  const session = idempotencyKey
    ? await createSessionIdempotent(region, idempotencyKey)
    : await createSession(region);
  sendJson(res, 201, toResponse(session));
};

export const createSessionHandler = safeHandler(
  withRequestLogging("create_session", createSessionHandlerBase)
);

const listSessionsHandlerBase = async (req: Request, res: Response): Promise<void> => {
  const status = requireValid(validateOptionalStatus(req.query.status), "status");
  const region = requireValid(validateOptionalRegion(req.query.region), "region");

    const sessions = await listSessions({
      status,
      region
    });

  sendJson(res, 200, toResponses(sessions));
};

export const listSessionsHandler = safeHandler(
  withRequestLogging("list_sessions", listSessionsHandlerBase)
);

const listDeletedSessionsHandlerBase = async (req: Request, res: Response): Promise<void> => {
  const sessions = await listDeletedSessions();
  sendJson(res, 200, toDeletedResponses(sessions));
};

export const listDeletedSessionsHandler = safeHandler(
  withRequestLogging("list_deleted_sessions", listDeletedSessionsHandlerBase)
);

const getSessionHandlerBase = async (req: Request, res: Response): Promise<void> => {
  const sessionId = requireValid(validateSessionId(req.params.sessionId), "sessionId");

    const session = await getSession(sessionId);
    if (!session) {
      throw new HttpError(404, "not_found", "session not found");
    }

  sendJson(res, 200, toResponse(session));
};

export const getSessionHandler = safeHandler(
  withRequestLogging("get_session", getSessionHandlerBase)
);

const updateSessionRegionHandlerBase = async (req: Request, res: Response): Promise<void> => {
  const sessionId = requireValid(validateSessionId(req.params.sessionId), "sessionId");
  const region = requireValid(validateRegion(req.body?.region), "region");

    const session = await updateSessionRegion(sessionId, region);
    if (!session) {
      throw new HttpError(404, "not_found", "session not found");
    }

  sendJson(res, 200, toResponse(session));
};

export const updateSessionRegionHandler = safeHandler(
  withRequestLogging("update_session_region", updateSessionRegionHandlerBase)
);

const updateSessionStatusHandlerBase = async (req: Request, res: Response): Promise<void> => {
  const sessionId = requireValid(validateSessionId(req.params.sessionId), "sessionId");
  const status = requireValid(validateStatus(req.body?.status), "status");

    const session = await updateSessionStatus(sessionId, status);
    if (!session) {
      throw new HttpError(404, "not_found", "session not found");
    }

  sendJson(res, 200, toResponse(session));
};

export const updateSessionStatusHandler = safeHandler(
  withRequestLogging("update_session_status", updateSessionStatusHandlerBase)
);

const completeSessionHandlerBase = async (req: Request, res: Response): Promise<void> => {
  const sessionId = requireValid(validateSessionId(req.params.sessionId), "sessionId");
  const session = await updateSessionStatus(sessionId, "completed");
    if (!session) {
      throw new HttpError(404, "not_found", "session not found");
    }

  sendJson(res, 200, toResponse(session));
};

export const completeSessionHandler = safeHandler(
  withRequestLogging("complete_session", completeSessionHandlerBase)
);

const failSessionHandlerBase = async (req: Request, res: Response): Promise<void> => {
  const sessionId = requireValid(validateSessionId(req.params.sessionId), "sessionId");
  const session = await updateSessionStatus(sessionId, "failed");
    if (!session) {
      throw new HttpError(404, "not_found", "session not found");
    }

  sendJson(res, 200, toResponse(session));
};

export const failSessionHandler = safeHandler(
  withRequestLogging("fail_session", failSessionHandlerBase)
);

const deleteSessionHandlerBase = async (req: Request, res: Response): Promise<void> => {
  const sessionId = requireValid(validateSessionId(req.params.sessionId), "sessionId");
  const deleted = await deleteSession(sessionId);
    if (!deleted) {
      throw new HttpError(404, "not_found", "session not found");
    }

  res.status(204).send();
};

export const deleteSessionHandler = safeHandler(
  withRequestLogging("delete_session", deleteSessionHandlerBase)
);
