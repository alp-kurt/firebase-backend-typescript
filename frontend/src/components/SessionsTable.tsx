import React from "react";
import type { Session, SessionStatus } from "../api";
import SessionRow from "./SessionRow";

interface SessionsTableProps {
  sessions: Session[];
  loading: boolean;
  onRequestStatusChange: (sessionId: string, currentStatus: SessionStatus) => void;
  onRequestDelete: (sessionId: string) => void;
  busyKeys?: Record<string, boolean>;
}

function SessionsTable({
  sessions,
  loading,
  onRequestStatusChange,
  onRequestDelete,
  busyKeys = {}
}: SessionsTableProps) {
  return (
    <div className="fade-in">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Sessions</h2>
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">live</div>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <SessionRow
            key={session.sessionId}
            session={session}
            onRequestStatusChange={onRequestStatusChange}
            onRequestDelete={onRequestDelete}
            disabled={busyKeys[`status:${session.sessionId}`] || busyKeys[`delete:${session.sessionId}`]}
          />
        ))}
        {!loading && sessions.length === 0 ? (
          <div className="card glass px-6 py-12 text-center text-sm text-slate-500">
            No sessions yet. Create one to get started.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SessionsTable;
