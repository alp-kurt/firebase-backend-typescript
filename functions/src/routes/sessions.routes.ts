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
import { requireAuth } from "../utils/auth";
import { methodNotAllowed } from "../utils/http";
import { rateLimit } from "../utils/rateLimit";
import { getRateLimitConfig } from "../utils/rateLimitConfig";

export const sessionsRouter = Router();

sessionsRouter.use(requireAuth);

const limits = getRateLimitConfig();

sessionsRouter
  .route("/sessions")
  .get(listSessionsHandler)
  .post(rateLimit(limits.create), createSessionHandler)
  .all((req, res) => methodNotAllowed(["GET", "POST"])(res));

sessionsRouter
  .route("/deleted-sessions")
  .get(listDeletedSessionsHandler)
  .all((req, res) => methodNotAllowed(["GET"])(res));

sessionsRouter
  .route("/sessions/:sessionId")
  .get(getSessionHandler)
  .patch(rateLimit(limits.update), updateSessionRegionHandler)
  .delete(rateLimit(limits.delete), deleteSessionHandler)
  .all((req, res) => methodNotAllowed(["GET", "PATCH", "DELETE"])(res));

sessionsRouter
  .route("/sessions/:sessionId/status")
  .patch(rateLimit(limits.updateStatus), updateSessionStatusHandler)
  .all((req, res) => methodNotAllowed(["PATCH"])(res));

sessionsRouter
  .route("/sessions/:sessionId/complete")
  .post(rateLimit(limits.complete), completeSessionHandler)
  .all((req, res) => methodNotAllowed(["POST"])(res));

sessionsRouter
  .route("/sessions/:sessionId/fail")
  .post(rateLimit(limits.fail), failSessionHandler)
  .all((req, res) => methodNotAllowed(["POST"])(res));
