import { Router } from "express";
import { sessionsRouter } from "../sessions.routes";

export const v1Router = Router();

v1Router.use("/", sessionsRouter);
