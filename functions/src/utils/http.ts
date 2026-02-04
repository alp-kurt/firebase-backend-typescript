import type { Response } from "express";
import type { ApiErrorBody } from "../types/api";

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
  const body: ApiErrorBody = {
    error: {
      code: err.code,
      message: err.message,
      details: err.details
    }
  };

  res.status(err.status).json(body);
};

export const toInternalError = (err: unknown): HttpError => {
  if (err instanceof HttpError) {
    return err;
  }

  return new HttpError(500, "internal", "Internal server error");
};
