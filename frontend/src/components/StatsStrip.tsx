import React from "react";

interface StatsStripProps {
  total: number;
  pending: number;
  active: number;
  completed: number;
  failed: number;
}

function StatsStrip({ total, pending, active, completed, failed }: StatsStripProps) {
  return (
    <div className="card glass p-4 fade-in">
      <div className="grid gap-4 text-center sm:grid-cols-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Total</p>
          <p className="mt-2 text-2xl font-semibold">{total}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Pending</p>
          <p className="mt-2 text-2xl font-semibold">{pending}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Active</p>
          <p className="mt-2 text-2xl font-semibold">{active}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Completed</p>
          <p className="mt-2 text-2xl font-semibold">{completed}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Failed</p>
          <p className="mt-2 text-2xl font-semibold">{failed}</p>
        </div>
      </div>
    </div>
  );
}

export default StatsStrip;
