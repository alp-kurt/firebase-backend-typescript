import { Router } from "express";
import {
  completeSessionHandler,
  createSessionHandler,
  deleteSessionHandler,
  getSessionHandler,
  listDeletedSessionsHandler,
  listSessionsHandler,
  updateSessionRegionHandler,
  updateSessionStatusHandler,
  failSessionHandler
} from "../handlers/sessions.handlers";
import { getRateLimitConfig } from "../utils/config";
import { buildProtectedRoute, notAllowed, wrapHandler } from "../utils/route";

export const sessionsRouter = Router();

const limits = getRateLimitConfig();

sessionsRouter
  .route("/sessions")
  .get(...buildProtectedRoute(wrapHandler("list_sessions", listSessionsHandler)))
  .post(...buildProtectedRoute(wrapHandler("create_session", createSessionHandler), limits.create))
  .all(notAllowed(["GET", "POST"]));

sessionsRouter
  .route("/deleted-sessions")
  .get(...buildProtectedRoute(wrapHandler("list_deleted_sessions", listDeletedSessionsHandler)))
  .all(notAllowed(["GET"]));

sessionsRouter
  .route("/sessions/:sessionId")
  .get(...buildProtectedRoute(wrapHandler("get_session", getSessionHandler)))
  .patch(...buildProtectedRoute(wrapHandler("update_session_region", updateSessionRegionHandler), limits.update))
  .delete(...buildProtectedRoute(wrapHandler("delete_session", deleteSessionHandler), limits.delete))
  .all(notAllowed(["GET", "PATCH", "DELETE"]));

sessionsRouter
  .route("/sessions/:sessionId/status")
  .patch(...buildProtectedRoute(wrapHandler("update_session_status", updateSessionStatusHandler), limits.updateStatus))
  .all(notAllowed(["PATCH"]));

sessionsRouter
  .route("/sessions/:sessionId/complete")
  .post(...buildProtectedRoute(wrapHandler("complete_session", completeSessionHandler), limits.complete))
  .all(notAllowed(["POST"]));

sessionsRouter
  .route("/sessions/:sessionId/fail")
  .post(...buildProtectedRoute(wrapHandler("fail_session", failSessionHandler), limits.fail))
  .all(notAllowed(["POST"]));
