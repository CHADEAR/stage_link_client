import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken } from "../services/api";

export default function ProtectedRoute() {
  const loggedIn = !!getAccessToken();
  const location = useLocation();
  return loggedIn ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
