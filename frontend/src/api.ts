export type SessionStatus = "pending" | "active" | "completed" | "failed";

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

export const listSessions = async (filters: {
  status?: SessionStatus;
  region?: string;
}): Promise<Session[]> => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.region) params.set("region", filters.region);
  const res = await fetch(`${API_BASE}/sessions?${params.toString()}`);
  return handle<Session[]>(res);
};

export const createSession = async (region: string): Promise<Session> => {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ region })
  });
  return handle<Session>(res);
};

export const updateSessionStatus = async (
  sessionId: string,
  status: SessionStatus
): Promise<Session> => {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return handle<Session>(res);
};

export const updateSessionRegion = async (
  sessionId: string,
  region: string
): Promise<Session> => {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ region })
  });
  return handle<Session>(res);
};

export const completeSession = async (sessionId: string): Promise<Session> => {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/complete`, {
    method: "POST"
  });
  return handle<Session>(res);
};

export const failSession = async (sessionId: string): Promise<Session> => {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/fail`, {
    method: "POST"
  });
  return handle<Session>(res);
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: "DELETE"
  });
  await handle(res);
};
