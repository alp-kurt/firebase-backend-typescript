import express from "express";
import cors from "cors";
import crypto from "crypto";
import { logger } from "firebase-functions";
import { sessionsRouter } from "./routes/sessions.routes";
import { HttpError, sendError } from "./utils/http";
import { getRequestId } from "./utils/requestId";
import { getCorsOrigins } from "./utils/config";

export const app = express();

const allowedOrigins = getCorsOrigins();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0) {
      callback(null, true);
      return;
    }
    callback(null, allowedOrigins.includes(origin));
  }
}));

app.use((req, res, next) => {
  const requestId = req.header("x-request-id") ?? crypto.randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  const start = Date.now();
  res.on("finish", () => {
    const resolvedRequestId = getRequestId(res);
    const log = {
      requestId: resolvedRequestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
      userId: (req as { userId?: string }).userId
    };
    if (res.statusCode >= 500) {
      logger.error("request_complete", log);
    } else if (res.statusCode >= 400) {
      logger.warn("request_complete", log);
    } else {
      logger.info("request_complete", log);
    }
  });
  next();
});
app.use(express.json());
app.use("/api", sessionsRouter);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError) {
    logger.warn("invalid_json_body", { requestId: res.locals.requestId });
    sendError(res, new HttpError(400, "invalid_argument", "Invalid JSON body"));
    return;
  }
  logger.error("unhandled_error", { requestId: res.locals.requestId, error: err instanceof Error ? err.message : err });
  sendError(res, new HttpError(500, "internal", "Internal server error"));
});

app.use((req, res) => {
  sendError(res, new HttpError(404, "not_found", "route not found"));
});
