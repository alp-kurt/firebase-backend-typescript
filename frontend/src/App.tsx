import { useEffect, useMemo, useState } from "react";
import {
  Session,
  SessionStatus,
  completeSession,
  createSession,
  deleteSession,
  failSession,
  listSessions,
  updateSessionRegion,
  updateSessionStatus
} from "./api";

const statuses: SessionStatus[] = ["pending", "active", "completed", "failed"];

const statusBadge = (status: SessionStatus): string => {
  switch (status) {
    case "pending":
      return "badge-pending";
    case "active":
      return "badge-active";
    case "completed":
      return "badge-completed";
    case "failed":
      return "badge-failed";
    default:
      return "badge";
  }
};

const formatDate = (value: string): string =>
  new Date(value).toLocaleString();

const emptyFilters = { status: "", region: "" } as const;

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState("eu-central");
  const [filters, setFilters] = useState({ ...emptyFilters });

  const activeFilters = useMemo(() => ({
    status: filters.status ? (filters.status as SessionStatus) : undefined,
    region: filters.region || undefined
  }), [filters]);

  const refresh = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSessions(activeFilters);
      setSessions(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [activeFilters.status, activeFilters.region]);

  const onCreate = async (): Promise<void> => {
    setError(null);
    try {
      await createSession(region);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onUpdateStatus = async (sessionId: string, status: SessionStatus): Promise<void> => {
    setError(null);
    try {
      await updateSessionStatus(sessionId, status);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onUpdateRegion = async (sessionId: string, newRegion: string): Promise<void> => {
    setError(null);
    try {
      await updateSessionRegion(sessionId, newRegion);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onComplete = async (sessionId: string): Promise<void> => {
    setError(null);
    try {
      await completeSession(sessionId);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onFail = async (sessionId: string): Promise<void> => {
    setError(null);
    try {
      await failSession(sessionId);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onDelete = async (sessionId: string): Promise<void> => {
    setError(null);
    try {
      await deleteSession(sessionId);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-mist">
      <header className="px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Medverse</p>
              <h1 className="text-3xl font-semibold">Session Control</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-ghost" onClick={() => void refresh()}>
                Refresh
              </button>
              <button className="btn-primary" onClick={() => void onCreate()}>
                Create Session
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-4">
              <p className="text-sm font-semibold text-slate-500">Create Session</p>
              <label className="mt-3 block text-xs uppercase tracking-wide text-slate-400">Region</label>
              <input
                className="input mt-2"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="eu-central"
              />
            </div>
            <div className="card p-4 md:col-span-2">
              <p className="text-sm font-semibold text-slate-500">Filters</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400">Status</label>
                  <select
                    className="input mt-2"
                    value={filters.status}
                    onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                  >
                    <option value="">All</option>
                    {statuses.map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400">Region</label>
                  <input
                    className="input mt-2"
                    value={filters.region}
                    onChange={(event) => setFilters((prev) => ({ ...prev, region: event.target.value }))}
                    placeholder="eu-central"
                  />
                </div>
              </div>
            </div>
          </div>
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">Sessions</h2>
              <p className="text-sm text-slate-500">{loading ? "Loading..." : `${sessions.length} sessions`}</p>
            </div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">live</div>
          </div>
          <div className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <div key={session.sessionId} className="grid gap-4 px-6 py-5 md:grid-cols-7 md:items-center">
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold">{session.sessionId}</p>
                  <p className="text-xs text-slate-500">Created {formatDate(session.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={statusBadge(session.status)}>{session.status}</span>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400">Region</label>
                  <input
                    className="input mt-2"
                    defaultValue={session.region}
                    onBlur={(event) => void onUpdateRegion(session.sessionId, event.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-wide text-slate-400">Status</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {statuses.map((value) => (
                      <button
                        key={value}
                        className={value === session.status ? "btn-primary" : "btn-ghost"}
                        onClick={() => void onUpdateStatus(session.sessionId, value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-accent" onClick={() => void onComplete(session.sessionId)}>
                    Complete
                  </button>
                  <button className="btn-warn" onClick={() => void onFail(session.sessionId)}>
                    Fail
                  </button>
                  <button className="btn-ghost" onClick={() => void onDelete(session.sessionId)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!loading && sessions.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                No sessions yet. Create one to get started.
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
