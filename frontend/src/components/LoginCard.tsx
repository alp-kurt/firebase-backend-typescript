import React from "react";

interface LoginCardProps {
  email: string;
  password: string;
  status: "idle" | "loading" | "success" | "error";
  message: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

function LoginCard({
  email,
  password,
  status,
  message,
  onEmailChange,
  onPasswordChange,
  onSubmit
}: LoginCardProps) {
  return (
    <div className="card glass w-full max-w-md p-6 fade-in">
      <p className="text-sm font-semibold text-slate-500">Sign In</p>

      <label className="mt-6 block text-xs uppercase tracking-wide text-slate-400">Email</label>
      <input
        className="input mt-2"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="admin@example.com"
        type="email"
      />

      <label className="mt-4 block text-xs uppercase tracking-wide text-slate-400">Password</label>
      <input
        className="input mt-2"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        placeholder="••••••••"
        type="password"
      />

      <button
        className="btn-primary mt-6 w-full"
        onClick={onSubmit}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Signing in..." : "Sign In"}
      </button>

      {message ? (
        <div
          className={
            status === "error"
              ? "mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              : "mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          }
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}

export default LoginCard;
