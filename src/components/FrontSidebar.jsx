import React from "react";
import { logout, setAccessToken } from "../services/api"; 
import { Link, useLocation } from "react-router-dom";
import "./FrontSidebar.css";
import stageLogo from "../assets/Stage.png"; 

function Item({ to, label, icon }) {
  const { pathname } = useLocation();
  const active = pathname === to;
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
  return (
    <aside className={`front-side ${collapsed ? "collapsed" : ""} ${open ? "open" : ""}`}>
      <div className="side-top">
        <div className="brand">
          <img src={stageLogo} alt="StageLink" />
          <span className="label">StageLink</span>

          {/* ปุ่มยุบ/ขยายอยู่ขวาสุดเสมอ */}
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
          <Item to="/user" label="User" icon="group" />
          <Item to="/admin" label="Admin" icon="admin_panel_settings" />
          <Item to="/upload" label="Upload" icon="upload_file" />
        </nav>
      </div>

      <div className="side-bottom">
        <button className="logout-btn" onClick={onLogout}>
          <span className="material-symbols-outlined mi">logout</span>
          <span className="label">Logout</span>
        </button>
      </div>

      {/* ปิดจากด้านในตอน mobile */}
      <button className="close-mobile only-mobile" onClick={onCloseMobile} aria-label="Close menu">
        <span className="material-symbols-outlined">close</span>
      </button>
    </aside>
  );
}
