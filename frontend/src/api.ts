import type { SessionStatus } from "./utils/statuses";
export type { SessionStatus };

export interface Session {
  sessionId: string;
  region: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

const API_BASE = "https://europe-west1-backend-dev-test-c4ec0.cloudfunctions.net/api/api";

const handle = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const err = (await res.json()) as ApiErrorBody;
    throw new Error(err.error.message);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return (await res.json()) as T;
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
