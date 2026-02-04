import express from "express";
import cors from "cors";
import crypto from "crypto";
import { sessionsRouter } from "./routes/sessions.routes";
import { HttpError, sendError } from "./utils/http";

export const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

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
    const log = {
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
      ip: req.ip,
      userId: (req as { userId?: string }).userId
    };
    console.log(JSON.stringify(log));
  });
  next();
});
app.use(express.json());
app.use("/api", sessionsRouter);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError) {
    sendError(res, new HttpError(400, "invalid_argument", "Invalid JSON body"));
    return;
  }
  sendError(res, new HttpError(500, "internal", "Internal server error"));
});

app.use((req, res) => {
  sendError(res, new HttpError(404, "not_found", "route not found"));
});
