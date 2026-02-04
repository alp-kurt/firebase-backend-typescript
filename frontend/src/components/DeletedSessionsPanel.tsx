import React from "react";
import type { DeletedSession } from "../api";
import { formatDate, statusBadge } from "../utils/session";

interface DeletedSessionsPanelProps {
  sessions: DeletedSession[];
}

function DeletedSessionsPanel({ sessions }: DeletedSessionsPanelProps) {
  if (sessions.length === 0) {
    return (
      <div className="card glass px-6 py-8 text-center text-sm text-slate-500">
        No recently deleted sessions.
      </div>
    );
  }

  return (
    <div className="card glass overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">Deleted Sessions</h2>
          <p className="text-sm text-slate-500">Retained for 24 hours</p>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {sessions.map((session) => (
          <div key={session.sessionId} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">{session.sessionId}</p>
              <p className="text-xs text-slate-500">Deleted {formatDate(session.deletedAt)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`${statusBadge(session.status)} badge-lg`}>{session.status}</span>
              <div className="text-xs text-slate-500">Region: {session.region}</div>
              <div className="text-xs text-slate-500">Expires {formatDate(session.expiresAt)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeletedSessionsPanel;
