import { Router } from "express";
import {
  createSessionHandler,
  getSessionHandler,
  updateSessionStatusHandler
} from "../handlers/sessions.handlers";

export const sessionsRouter = Router();

sessionsRouter.post("/sessions", createSessionHandler);
sessionsRouter.get("/sessions/:sessionId", getSessionHandler);
sessionsRouter.patch("/sessions/:sessionId/status", updateSessionStatusHandler);
