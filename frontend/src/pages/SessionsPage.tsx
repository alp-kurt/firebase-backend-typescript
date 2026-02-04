import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth";
import {
  Session,
  SessionStatus,
  createSession,
  deleteSession,
  listSessions,
  updateSessionStatus
} from "../api";
import ControlsPanel from "../components/ControlsPanel";
import ConfirmModal from "../components/ConfirmModal";
import ErrorBanner from "../components/ErrorBanner";
import PageHeader from "../components/PageHeader";
import SessionsTable from "../components/SessionsTable";
import StatsStrip from "../components/StatsStrip";
import StatusUpdateModal from "../components/StatusUpdateModal";
import { REGIONS } from "../utils/regions";
import { withBusy } from "../utils/requestGuard";
import { SESSION_STATUSES } from "../utils/statuses";
import { parseStatus } from "../utils/session";

const statuses: SessionStatus[] = [...SESSION_STATUSES];

const emptyFilters = { status: "", region: "" } as const;

function SessionsPage() {
  const { token, signOut, userEmail } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState(REGIONS[0]);
  const [filters, setFilters] = useState({ ...emptyFilters });
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetId, setStatusTargetId] = useState<string | null>(null);
  const [statusCurrent, setStatusCurrent] = useState<SessionStatus | null>(null);
  const [statusNext, setStatusNext] = useState<SessionStatus>("pending");
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const activeFilters = useMemo(() => ({
    status: parseStatus(filters.status) ?? undefined,
    region: filters.region || undefined
  }), [filters]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const pending = sessions.filter((s) => s.status === "pending").length;
    const active = sessions.filter((s) => s.status === "active").length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    const failed = sessions.filter((s) => s.status === "failed").length;
    return { total, pending, active, completed, failed };
  }, [sessions]);

  const requireToken = (): string | null => {
    if (!token) {
      setError("You are not authenticated. Please sign in again.");
      return null;
    }
    return token;
  };

  const refresh = async (): Promise<void> => {
    await withBusy("refresh", setBusy, async () => {
      setLoading(true);
      setError(null);
      try {
        const authToken = requireToken();
        if (!authToken) {
          setSessions([]);
          return;
        }
        const data = await listSessions(activeFilters, authToken);
        setSessions(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    void refresh();
  }, [activeFilters.status, activeFilters.region]);

  const onCreate = async (): Promise<void> => {
    setError(null);
    const authToken = requireToken();
    if (!authToken) return;
    await withBusy("create", setBusy, async () => {
      try {
        await createSession(region, authToken);
        await refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const onRequestCreate = (): void => {
    setConfirmCreateOpen(true);
  };

  const onUpdateStatus = async (sessionId: string, status: SessionStatus): Promise<void> => {
    setError(null);
    const authToken = requireToken();
    if (!authToken) return;
    await withBusy(`status:${sessionId}`, setBusy, async () => {
      try {
        await updateSessionStatus(sessionId, status, authToken);
        await refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const onRequestStatusChange = (sessionId: string, currentStatus: SessionStatus): void => {
    setStatusTargetId(sessionId);
    setStatusCurrent(currentStatus);
    const next = statuses.find((value) => value !== currentStatus) ?? currentStatus;
    setStatusNext(next);
    setStatusModalOpen(true);
  };

  const onConfirmStatusChange = async (): Promise<void> => {
    if (!statusTargetId || !statusCurrent) {
      setStatusModalOpen(false);
      return;
    }
    setStatusModalOpen(false);
    await onUpdateStatus(statusTargetId, statusNext);
  };

  const isBusy = (key: string): boolean => !!busy[key];

  const onDelete = async (sessionId: string): Promise<void> => {
    setError(null);
    const authToken = requireToken();
    if (!authToken) return;
    await withBusy(`delete:${sessionId}`, setBusy, async () => {
      try {
        await deleteSession(sessionId, authToken);
        await refresh();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  const onRequestDelete = (sessionId: string): void => {
    setDeleteTargetId(sessionId);
    setConfirmDeleteOpen(true);
  };

  return (
    <div className="min-h-screen bg-mist">
      <header className="px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <PageHeader
            title="Session Console"
            subtitle={`Signed in as ${userEmail ?? "admin"}`}
            onRefresh={() => void refresh()}
            onSignOut={() => void signOut()}
          />

          <StatsStrip {...stats} />

          <ControlsPanel
            region={region}
            onRegionChange={setRegion}
            filters={filters}
            onFiltersChange={setFilters}
            statuses={statuses}
            regions={REGIONS}
            onCreate={() => onRequestCreate()}
            createDisabled={isBusy("create")}
          />

          {error ? <ErrorBanner message={error} /> : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <SessionsTable
          sessions={sessions}
          loading={loading}
          onRequestStatusChange={onRequestStatusChange}
          onRequestDelete={onRequestDelete}
          busyKeys={busy}
        />
        <ConfirmModal
          open={confirmCreateOpen}
          title="Create session?"
          description={`Create a new session in ${region}.`}
          confirmLabel="Create"
          confirming={isBusy("create")}
          onCancel={() => setConfirmCreateOpen(false)}
          onConfirm={async () => {
            setConfirmCreateOpen(false);
            await onCreate();
          }}
        />
        <ConfirmModal
          open={confirmDeleteOpen}
          title="Delete session?"
          description={deleteTargetId ? `This will permanently delete ${deleteTargetId}.` : undefined}
          confirmLabel="Delete"
          confirming={deleteTargetId ? isBusy(`delete:${deleteTargetId}`) : false}
          onCancel={() => setConfirmDeleteOpen(false)}
          onConfirm={async () => {
            if (!deleteTargetId) return;
            setConfirmDeleteOpen(false);
            await onDelete(deleteTargetId);
          }}
        />
        <StatusUpdateModal
          open={statusModalOpen}
          sessionId={statusTargetId}
          currentStatus={statusCurrent}
          nextStatus={statusNext}
          statuses={statuses}
          onChange={setStatusNext}
          onCancel={() => setStatusModalOpen(false)}
          onConfirm={() => void onConfirmStatusChange()}
          confirming={statusTargetId ? isBusy(`status:${statusTargetId}`) : false}
        />
      </main>
    </div>
  );
}

export default SessionsPage;
