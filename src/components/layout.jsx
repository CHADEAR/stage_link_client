import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { getAccessToken, logout, setAccessToken } from "../services/api";
import { Tv, User, Shield, LogOut } from "lucide-react";
import "./layout.css";

export default function Layout() {
  const loggedIn = !!getAccessToken();

  const [collapsed, setCollapsed] = useState(false); // ใช้เฉพาะ desktop
  const [isMobile, setIsMobile] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const formatDate = now.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formatTime = now.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  function onLogout() {
    logout().finally(() => {
      setAccessToken(null);
      window.location.href = "/login";
    });
  }

  const menu = [
    { to: "/programme", icon: <Tv size={18} />, label: "Programme" },
    { to: "/user", icon: <User size={18} />, label: "User" },
    { to: "/admin", icon: <Shield size={18} />, label: "Admin" },
  ];

  // จัดคลาสให้ sidebar ชัดเจนสำหรับ desktop vs mobile
  const sidebarClasses = ["sidebar"];
  if (!isMobile && collapsed) sidebarClasses.push("sidebar--mini");
  if (isMobile) sidebarClasses.push("drawer");
  if (isMobile && showDrawer) sidebarClasses.push("open");

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={sidebarClasses.join(" ")}>
        <div className="brand">
          <img src="/assets/logo.png" alt="logo" className="logo" />
          {!collapsed && !isMobile && <span className="brand-text">StageLink</span>}
          {isMobile && <span className="brand-text">StageLink</span>}
        </div>

        <nav className="side-nav">
          {menu.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              className={({ isActive }) => "side-item" + (isActive ? " active" : "")}
              onClick={() => {
                if (isMobile) setShowDrawer(false);
              }}
            >
              <span className="side-icon">{m.icon}</span>
              <span className="side-label">{m.label}</span>
            </NavLink>
          ))}
        </nav>

        {loggedIn && (
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            <span className="side-label">Logout</span>
          </button>
        )}
      </aside>

      {/* Backdrop (คลิกเพื่อปิด Drawer) */}
      {isMobile && showDrawer && (
        <div className="backdrop" onClick={() => setShowDrawer(false)} />
      )}

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <button
            className="menu-toggle"
            onClick={() => (isMobile ? setShowDrawer(true) : setCollapsed((v) => !v))}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div className="date-time">
            {formatDate} &nbsp; {formatTime}
          </div>
          <input className="search-box" placeholder="Search..." />
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
