import React from "react";

interface ErrorBannerProps {
  message: string;
  code?: string;
}

function ErrorBanner({ message, code }: ErrorBannerProps) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <div className="flex flex-wrap items-center gap-2">
        <span>{message}</span>
        {code ? (
          <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] uppercase tracking-wide text-rose-600">
            {code}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default ErrorBanner;
