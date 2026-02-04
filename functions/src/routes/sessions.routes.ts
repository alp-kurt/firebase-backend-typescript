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

export const sessionsRouter = Router();

sessionsRouter.get("/sessions", listSessionsHandler);
sessionsRouter.post("/sessions", createSessionHandler);
sessionsRouter.get("/sessions/:sessionId", getSessionHandler);
sessionsRouter.patch("/sessions/:sessionId", updateSessionRegionHandler);
sessionsRouter.patch("/sessions/:sessionId/status", updateSessionStatusHandler);
sessionsRouter.post("/sessions/:sessionId/complete", completeSessionHandler);
sessionsRouter.post("/sessions/:sessionId/fail", failSessionHandler);
sessionsRouter.delete("/sessions/:sessionId", deleteSessionHandler);
