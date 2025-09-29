import React from "react";
import { logout, setAccessToken } from "../services/api";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import stageLogo from "../assets/Stage.png";
import useAuth from "../hooks/useAuth";

function Item({ to, label, icon }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  const { user } = useAuth();

  console.log("🔑 Current user role:", user?.role);

  return (
    <Link to={to} className={`side-item ${active ? "active" : ""}`} title={label}>
      <span className="material-symbols-outlined mi">{icon}</span>
      <span className="label">{label}</span>
    </Link>
  );
}

function onLogout() {
  logout().finally(() => {
    setAccessToken(null);
    window.location.href = "/login";
  });
}

export default function FrontSidebar({ collapsed, open, onToggleCollapse, onCloseMobile }) {
  const { user } = useAuth(); // ✅ ดึง user role ออกมา

  return (
    <aside className={`front-side ${collapsed ? "collapsed" : ""} ${open ? "open" : ""}`}>
      <div className="side-top">
        <div className="brand">
          <img src={stageLogo} alt="StageLink" />
          <span className="label">StageLink</span>

          {/* ปุ่มยุบ/ขยาย */}
          <button
            className="collapse-btn"
            onClick={onToggleCollapse}
            aria-label="Toggle width"
            aria-expanded={!collapsed}
          >
            <span className="material-symbols-outlined">
              {collapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>

        <nav className="side-nav">
          <Item to="/" label="Programme" icon="tv_guide" />

          {/* ✅ แสดงเมนูเฉพาะ admin */}
          {user?.role === "admin" && (
            <>
          <Item to="/admin" label="Admin" icon="admin_panel_settings" />
          <Item to="/user" label="User" icon="group" />
          <Item to="/upload" label="Upload" icon="upload_file" />
            </>
          )}
        
        </nav>
      </div>

      <div className="side-bottom">
        <button className="logout-btn" onClick={onLogout}>
          <span className="material-symbols-outlined mi">logout</span>
          <span className="label">Logout</span>
        </button>
      </div>

      {/* ปิดเมนูบน mobile */}
      <button className="close-mobile only-mobile" onClick={onCloseMobile} aria-label="Close menu">
        <span className="material-symbols-outlined">close</span>
      </button>
    </aside>
  );
}
