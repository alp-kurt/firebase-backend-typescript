import type { SessionStatus } from "./utils/statuses";
export type { SessionStatus };

export interface Session {
  sessionId: string;
  region: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DeletedSession extends Session {
  deletedAt: string;
  expiresAt: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export const toErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }
  return "Unexpected error occurred.";
};

const API_BASE = "https://europe-west1-backend-dev-test-c4ec0.cloudfunctions.net/api/api/v1";

const safeParseJson = async (res: Response): Promise<unknown | null> => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const extractErrorMessage = (payload: unknown, status: number): { code: string; message: string; details?: unknown } => {
  if (payload && typeof payload === "object") {
    const maybeError = payload as Partial<ApiErrorBody>;
    if (maybeError.error?.message) {
      return {
        code: maybeError.error.code ?? "unknown",
        message: maybeError.error.message,
        details: maybeError.error.details
      };
    }
  }
  return { code: "http_error", message: `Request failed with status ${status}.` };
};

const handle = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const payload = await safeParseJson(res);
    const extracted = extractErrorMessage(payload, res.status);
    throw new ApiError(extracted.code, extracted.message, extracted.details);
  }
  if (res.status === 204) {
    return {} as T;
  }
  const payload = await safeParseJson(res);
  if (payload === null) {
    throw new Error("Server returned an invalid response.");
  }
  return payload as T;
};

const authHeaders = (token?: string): HeadersInit =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const listSessions = async (
  filters: { status?: SessionStatus; region?: string },
  token: string
): Promise<Session[]> => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.region) params.set("region", filters.region);
  const res = await fetch(`${API_BASE}/sessions?${params.toString()}`, {
    headers: authHeaders(token)
  });
  return handle<Session[]>(res);
};

export const createSession = async (region: string, token: string): Promise<Session> => {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ region })
  });
  return handle<Session>(res);
};

export const updateSessionStatus = async (
  sessionId: string,
  status: SessionStatus,
  token: string
): Promise<Session> => {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ status })
  });
  return handle<Session>(res);
};

export const updateSessionRegion = async (
  sessionId: string,
  region: string,
  token: string
): Promise<Session> => {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ region })
  });
  return handle<Session>(res);
};

export const completeSession = async (sessionId: string, token: string): Promise<Session> => {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/complete`, {
    method: "POST",
    headers: authHeaders(token)
  });
  return handle<Session>(res);
};

export const failSession = async (sessionId: string, token: string): Promise<Session> => {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/fail`, {
    method: "POST",
    headers: authHeaders(token)
  });
  return handle<Session>(res);
};

export const deleteSession = async (sessionId: string, token: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
  await handle(res);
};

export const listDeletedSessions = async (token: string): Promise<DeletedSession[]> => {
  const res = await fetch(`${API_BASE}/deleted-sessions`, {
    headers: authHeaders(token)
  });
  return handle<DeletedSession[]>(res);
};
