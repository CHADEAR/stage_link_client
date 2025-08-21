// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { getAccessToken, logout, setAccessToken } from "../services/api";

export default function Layout() {
  const loggedIn = !!getAccessToken();

  function onLogout() {
    logout().finally(() => {
      setAccessToken(null);
      window.location.href = "/login";
    });
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        {loggedIn && (
          <button
            onClick={onLogout}
            style={{ border: "1px solid #ccc", borderRadius: 6, padding: "6px 10px" }}
          >
            Logout
          </button>
        )}
      </header>
      <Outlet />
    </div>
  );
}
