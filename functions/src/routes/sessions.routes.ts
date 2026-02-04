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

export const sessionsRouter = Router();

sessionsRouter.use(requireAuth);

sessionsRouter.get("/sessions", listSessionsHandler);
sessionsRouter.get("/sessions/:sessionId", getSessionHandler);
sessionsRouter.post("/sessions", createSessionHandler);
sessionsRouter.patch("/sessions/:sessionId", updateSessionRegionHandler);
sessionsRouter.patch("/sessions/:sessionId/status", updateSessionStatusHandler);
sessionsRouter.post("/sessions/:sessionId/complete", completeSessionHandler);
sessionsRouter.post("/sessions/:sessionId/fail", failSessionHandler);
sessionsRouter.delete("/sessions/:sessionId", deleteSessionHandler);
