import React from "react";
import "./Topbar.css";
import { useNavigate } from "react-router-dom";

export default function FrontNavbar({ dateStr, timeStr }) {
  const navigate = useNavigate();

  return (
    <header className="front-bar">
      <div className="bar-left">
        {/* แสดงเฉพาะจอเล็ก */}
        {/* <button className="icon-btn only-mobile" onClick={onToggleMenu} aria-label="Open menu">
          <span className="material-symbols-outlined">menu</span>
        </button> */}

        <div className="date-time">
          <span>{dateStr}</span>
          <span className="dot">•</span>
          <span>{timeStr}</span>
        </div>
      </div>

      <div className="bar-right">
        <div className="search">
          <span className="material-symbols-outlined">search</span>
          <input placeholder="Search...." />
        </div>
        <button className="icon-btn" title="แจ้งเตือน">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          className="icon-btn"
          title="บัญชีผู้ใช้"
          onClick={() => navigate("/dashboard")}
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}
