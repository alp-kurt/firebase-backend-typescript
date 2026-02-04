import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth";
import {
  Session,
  SessionStatus,
  DeletedSession,
  createSession,
  listDeletedSessions,
  deleteSession,
  listSessions,
  updateSessionStatus,
  toErrorMessage
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
import DeletedSessionsPanel from "../components/DeletedSessionsPanel";

const statuses: SessionStatus[] = [...SESSION_STATUSES];

const emptyFilters = { status: "", region: "" };

function SessionsPage() {
  const { token, signOut, userEmail } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [deletedSessions, setDeletedSessions] = useState<DeletedSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [region, setRegion] = useState<string>(REGIONS[0]);
  const [filters, setFilters] = useState({ ...emptyFilters });
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetId, setStatusTargetId] = useState<string | null>(null);
  const [statusCurrent, setStatusCurrent] = useState<SessionStatus | null>(null);
  const [statusNext, setStatusNext] = useState<SessionStatus>("pending");
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"live" | "deleted">("live");

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

  const requireToken = useCallback((): string | null => {
    if (!token) {
      setError({ message: "You are not authenticated. Please sign in again.", code: "unauthenticated" });
      return null;
    }
    return token;
  }, [token]);

  const refresh = useCallback(async (): Promise<void> => {
    await withBusy("refresh", setBusy, async () => {
      setLoading(true);
      setError(null);
      try {
        const authToken = requireToken();
        if (!authToken) {
          setSessions([]);
          return;
        }
        const [data, deleted] = await Promise.all([
          listSessions(activeFilters, authToken),
          listDeletedSessions(authToken)
        ]);
        setSessions(data);
        setDeletedSessions(deleted);
      } catch (err) {
        setError({
          message: toErrorMessage(err),
          code: err instanceof Error && "code" in err ? (err as { code?: string }).code : undefined
        });
      } finally {
        setLoading(false);
      }
    });
  }, [activeFilters, requireToken, setBusy, setLoading, setError, setSessions, setDeletedSessions]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onCreate = async (): Promise<void> => {
    if (!region.trim()) {
      setError({ message: "Please choose a valid region.", code: "invalid_argument" });
      return;
    }
    setError(null);
    const authToken = requireToken();
    if (!authToken) return;
    await withBusy("create", setBusy, async () => {
      try {
        await createSession(region, authToken);
        await refresh();
      } catch (err) {
        setError({
          message: toErrorMessage(err),
          code: err instanceof Error && "code" in err ? (err as { code?: string }).code : undefined
        });
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
        setError({
          message: toErrorMessage(err),
          code: err instanceof Error && "code" in err ? (err as { code?: string }).code : undefined
        });
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
        setError({
          message: toErrorMessage(err),
          code: err instanceof Error && "code" in err ? (err as { code?: string }).code : undefined
        });
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

          {error ? <ErrorBanner message={error.message} code={error.code} /> : null}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-4 flex items-center gap-2">
          <button
            className={activeTab === "live" ? "btn-primary" : "btn-ghost"}
            onClick={() => setActiveTab("live")}
          >
            Live Sessions
          </button>
          <button
            className={activeTab === "deleted" ? "btn-primary" : "btn-ghost"}
            onClick={() => setActiveTab("deleted")}
          >
            Recently Deleted
          </button>
        </div>

        {activeTab === "live" ? (
          <SessionsTable
            sessions={sessions}
            loading={loading}
            onRequestStatusChange={onRequestStatusChange}
            onRequestDelete={onRequestDelete}
            busyKeys={busy}
          />
        ) : (
          <DeletedSessionsPanel sessions={deletedSessions} />
        )}

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
