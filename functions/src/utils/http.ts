import type { Response } from "express";
import type { ApiErrorBody } from "../types/api";
import { getRequestId } from "./requestId";

export class HttpError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const sendJson = <T>(res: Response, status: number, body: T): void => {
  res.status(status).json(body);
};

export const sendError = (res: Response, err: HttpError): void => {
  const requestId = getRequestId(res);
  const details = (() => {
    if (!requestId) return err.details;
    if (!err.details) return { requestId };
    if (typeof err.details === "object" && !Array.isArray(err.details)) {
      return { ...(err.details as Record<string, unknown>), requestId };
    }
    return { requestId, detail: err.details };
  })();

  const body: ApiErrorBody = {
    error: {
      code: err.code,
      message: err.message,
      details
    }
  };

  res.status(err.status).json(body);
};

export const methodNotAllowed = (allowed: string[]) => {
  return (res: Response): void => {
    sendError(
      res,
      new HttpError(405, "method_not_allowed", "Method not allowed", { allowed })
    );
  };
};

export const toInternalError = (err: unknown): HttpError => {
  if (err instanceof HttpError) {
    return err;
  }

  return new HttpError(500, "internal", "Internal server error");
};
