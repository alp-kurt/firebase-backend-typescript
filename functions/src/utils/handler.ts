import type { Request, Response } from "express";
import { logger } from "firebase-functions";
import { HttpError, sendError, toInternalError } from "./http";
import { getRequestId } from "./requestId";

export type AsyncHandler = (req: Request, res: Response) => Promise<void>;

const buildErrorPayload = (err: unknown) => ({
  error: err instanceof Error ? err.message : err
});

export const withRequestLogging = (name: string, handler: AsyncHandler): AsyncHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    const requestId = getRequestId(res);
    const start = Date.now();

    try {
      await handler(req, res);
      logger.info(name, { requestId, durationMs: Date.now() - start });
    } catch (err: unknown) {
      logger.error(`${name}_failed`, {
        requestId,
        durationMs: Date.now() - start,
        ...buildErrorPayload(err)
      });
      throw err;
    }
  };
};

export const safeHandler = (handler: AsyncHandler): AsyncHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      await handler(req, res);
    } catch (err: unknown) {
      const safe = toInternalError(err);
      if (!(err instanceof HttpError)) {
        logger.error("handler_error", {
          requestId: getRequestId(res),
          ...buildErrorPayload(err)
        });
      }
      sendError(res, safe);
    }
  };
};
