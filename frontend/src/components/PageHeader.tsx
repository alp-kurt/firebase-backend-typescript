import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh: () => void;
  onSignOut: () => void;
}

function PageHeader({ title, subtitle, onRefresh, onSignOut }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn-ghost" onClick={onRefresh}>
          Refresh
        </button>
        <button className="btn-ghost" onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default PageHeader;
