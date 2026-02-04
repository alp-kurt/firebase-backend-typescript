import type { Request } from "express";
import { HttpError } from "./http";
import type { ValidationResult } from "../validation/sessions.validation";

export const requireValid = <T>(result: ValidationResult<T>, field: string): T => {
  if (result.ok) {
    return result.value;
  }

  throw new HttpError(400, "invalid_argument", result.message, {
    field,
    details: result.details
  });
};

export const requireParam = (req: Request, name: string): string => {
  const value = req.params[name];
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, "invalid_argument", `${name} must be a non-empty string`);
  }
  return value.trim();
};
