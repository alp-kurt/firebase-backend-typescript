import type { Response } from "express";

export const getRequestId = (res: Response): string | undefined =>
  (res.locals as { requestId?: string }).requestId;
