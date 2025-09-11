// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ width: "100%", margin: 0, fontFamily: "system-ui, sans-serif" }}>
      <Outlet />
    </div>
  );
}
