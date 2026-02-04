import express from "express";
import { sessionsRouter } from "./routes/sessions.routes";
import { HttpError, sendError } from "./utils/http";

export const app = express();

app.use(express.json());
app.use("/api", sessionsRouter);

app.use((req, res) => {
  sendError(res, new HttpError(404, "not_found", "route not found"));
});
