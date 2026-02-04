import React from "react";
import type { Session, SessionStatus } from "../api";
import { formatDate, statusBadge } from "../utils/session";

interface SessionRowProps {
  session: Session;
  onRequestStatusChange: (sessionId: string, currentStatus: SessionStatus) => void;
  onRequestDelete: (sessionId: string) => void;
  disabled?: boolean;
}

function SessionRow({
  session,
  onRequestStatusChange,
  onRequestDelete,
  disabled = false
}: SessionRowProps) {
  return (
    <div className="card glass px-5 py-4 transition hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Session</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-900">{session.sessionId}</p>
          <p className="mt-1 text-xs text-slate-500">Created {formatDate(session.createdAt)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`${statusBadge(session.status)} badge-lg`}>{session.status}</span>
          <div>
            <label className="block text-[10px] uppercase tracking-wide text-slate-400">Region</label>
            <div className="mt-1 flex h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm">
              {session.region}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn-primary"
            onClick={() => onRequestStatusChange(session.sessionId, session.status)}
            disabled={disabled}
          >
            Update Status
          </button>
          <button
            className="btn-ghost"
            onClick={() => onRequestDelete(session.sessionId)}
            aria-label="Delete session"
            disabled={disabled}
          >
            <i className="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionRow;
