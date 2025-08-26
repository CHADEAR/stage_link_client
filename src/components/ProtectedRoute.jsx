// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { ready, authed } = useAuth();
  const location = useLocation();

  if (!ready) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!authed) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
