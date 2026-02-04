import React from "react";
import type { SessionStatus } from "../api";

interface ControlsPanelProps {
  region: string;
  onRegionChange: (value: string) => void;
  filters: { status: string; region: string };
  onFiltersChange: (next: { status: string; region: string }) => void;
  statuses: SessionStatus[];
  regions: readonly string[];
  onCreate: () => void;
  createDisabled?: boolean;
}

function ControlsPanel({
  region,
  onRegionChange,
  filters,
  onFiltersChange,
  statuses,
  regions,
  onCreate,
  createDisabled = false
}: ControlsPanelProps) {
  return (
    <div className="card glass p-5 fade-in">
      <div className="grid gap-4 md:grid-cols-4 md:items-end">
        <div>
          <label className="block text-xs uppercase tracking-wide text-slate-400">Create Region</label>
          <select
            className="input mt-2"
            value={region}
            onChange={(event) => onRegionChange(event.target.value)}
          >
            {regions.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-slate-400">Filter Status</label>
          <select
            className="input mt-2"
            value={filters.status}
            onChange={(event) => onFiltersChange({ ...filters, status: event.target.value })}
          >
            <option value="">All</option>
            {statuses.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-slate-400">Filter Region</label>
          <select
            className="input mt-2"
            value={filters.region}
            onChange={(event) => onFiltersChange({ ...filters, region: event.target.value })}
          >
            <option value="">All</option>
            {regions.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="btn-primary w-full" onClick={onCreate} disabled={createDisabled}>
            {createDisabled ? "Creating..." : "Create Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ControlsPanel;
