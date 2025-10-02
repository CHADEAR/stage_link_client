// src/pages/ProgrammeDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProgrammeDetail.css";
import FrontSidebar from "../components/Sidebar";
import FrontNavbar from "../components/Topbar";

export default function ProgrammeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ⏰ นาฬิกา
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatThaiDate = (d) =>
    d.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formatThaiTime = (d) =>
    d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className={["front-shell", sidebarCollapsed ? "side-collapsed" : "", menuOpen ? "mobile-open" : ""].join(" ")}>
      {/* ✅ Sidebar */}
      <FrontSidebar
        collapsed={sidebarCollapsed}
        open={menuOpen}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onCloseMobile={() => setMenuOpen(false)}
        selectedDateLabel={formatThaiDate(now)}
      />

      <div className="front-main">
        {/* ✅ Topbar */}
        <FrontNavbar
          dateStr={formatThaiDate(now)}
          timeStr={formatThaiTime(now)}
          onToggleMenu={() => setMenuOpen((v) => !v)}
        />

        {/* ✅ Content */}
        <div className="front-content">
          <div className="programme-detail-layout">
            {/* Header */}
            <div className="programme-detail-header">
              <h1>ข่าว</h1>
              <button onClick={() => navigate(-1)} className="back-btn">
                ← กลับ
              </button>
            </div>

            <div className="programme-detail-body">
              {/* ซ้าย */}
              <div className="programme-left">
                <img
                  src={`https://picsum.photos/seed/${id}/300/180`}
                  alt="cover"
                  className="programme-cover"
                />
                <p className="programme-desc">
                  ● รายการ บรรจง ชงข่าว <br />
                  ถ่ายทอดสดเวลา : 11.00 น. - 14.00 น.
                </p>

                <div className="programme-buttons">
                  <button className="detail-btn">จัดการสตูดิโอ</button>
                  <button className="detail-btn">ควบคุมไฟ</button>
                  <button className="detail-btn">โหวต</button>
                </div>
              </div>

              {/* ขวา */}
              <div className="programme-right">
                <h2>รายละเอียดการถ่ายทำ การดำเนินการของรายการ</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
