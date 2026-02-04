import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth";

export const ProtectedRoute = (): JSX.Element => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-mist px-6 py-12">
        <div className="card mx-auto max-w-lg p-6 text-center text-sm text-slate-500">
          Checking session...
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
