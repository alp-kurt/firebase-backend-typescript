import React from "react";
import type { SessionStatus } from "../api";

interface StatusUpdateModalProps {
  open: boolean;
  sessionId: string | null;
  currentStatus: SessionStatus | null;
  nextStatus: SessionStatus;
  statuses: SessionStatus[];
  onChange: (value: SessionStatus) => void;
  onCancel: () => void;
  onConfirm: () => void;
  confirming?: boolean;
}

function StatusUpdateModal({
  open,
  sessionId,
  currentStatus,
  nextStatus,
  statuses,
  onChange,
  onCancel,
  onConfirm,
  confirming = false
}: StatusUpdateModalProps) {
  if (!open || !sessionId || !currentStatus) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="card glass w-full max-w-md p-6">
        <h3 className="text-lg font-semibold">Update Status</h3>
        <p className="mt-1 text-sm text-slate-500">
          Session <span className="font-semibold">{sessionId}</span>
        </p>

        <label className="mt-4 block text-xs uppercase tracking-wide text-slate-400">New Status</label>
        <select
          className="input mt-2"
          value={nextStatus}
          onChange={(event) => onChange(event.target.value as SessionStatus)}
        >
          {statuses
            .filter((value) => value !== currentStatus)
            .map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
        </select>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          This will change status from <span className="font-semibold">{currentStatus}</span> to
          <span className="font-semibold"> {nextStatus}</span>.
        </div>

        <div className="mt-6 flex gap-2">
          <button className="btn-ghost w-full" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-primary w-full" onClick={onConfirm} disabled={confirming}>
            {confirming ? "Updating..." : "Confirm Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StatusUpdateModal;
