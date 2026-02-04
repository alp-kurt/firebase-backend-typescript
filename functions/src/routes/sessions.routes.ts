import { Router } from "express";
import {
  completeSessionHandler,
  createSessionHandler,
  deleteSessionHandler,
  getSessionHandler,
  listSessionsHandler,
  updateSessionRegionHandler,
  updateSessionStatusHandler,
  failSessionHandler
} from "../handlers/sessions.handlers";
import { requireAuth } from "../utils/auth";
import { methodNotAllowed } from "../utils/http";

export const sessionsRouter = Router();

sessionsRouter.use(requireAuth);

sessionsRouter
  .route("/sessions")
  .get(listSessionsHandler)
  .post(createSessionHandler)
  .all((req, res) => methodNotAllowed(["GET", "POST"])(res));

sessionsRouter
  .route("/sessions/:sessionId")
  .get(getSessionHandler)
  .patch(updateSessionRegionHandler)
  .delete(deleteSessionHandler)
  .all((req, res) => methodNotAllowed(["GET", "PATCH", "DELETE"])(res));

sessionsRouter
  .route("/sessions/:sessionId/status")
  .patch(updateSessionStatusHandler)
  .all((req, res) => methodNotAllowed(["PATCH"])(res));

sessionsRouter
  .route("/sessions/:sessionId/complete")
  .post(completeSessionHandler)
  .all((req, res) => methodNotAllowed(["POST"])(res));

sessionsRouter
  .route("/sessions/:sessionId/fail")
  .post(failSessionHandler)
  .all((req, res) => methodNotAllowed(["POST"])(res));
