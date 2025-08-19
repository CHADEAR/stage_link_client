import React from "react";
import { Outlet, Link } from "react-router-dom";
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
        <Link to="/" style={{ textDecoration: "none", fontWeight: 700 }}>StageLink</Link>
        <nav style={{ display: "flex", gap: 12 }}>
          {!loggedIn ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <button onClick={onLogout} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "6px 10px" }}>Logout</button>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
