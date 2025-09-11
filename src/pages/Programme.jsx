import React, { useState } from "react";
import FrontSidebar from "../components/FrontSidebar";
import FrontNavbar from "../components/FrontNavbar";
import ProgrammeCard from "../components/ProgrammeCard";
import "./Programme.css";

const mockItems = [
  {
    id: 1,
    title: "บรรจง ชงข่าว",
    time: "11.00 น. - 14.00 น.",
    status: "green",
    img: "/assets/program-bun.jpg",
  },
  {
    id: 2,
    title: "มหาศึกบิงศิลป์",
    time: "18.00 น. - 20.00 น.",
    status: "green",
    img: "/assets/program-mu.jpg",
  },
  {
    id: 3,
    title: "The Celeb Wars",
    time: "22.15 น. - 23.00 น.",
    status: "red",
    img: "/assets/program-celeb.jpg",
  },
  {
    id: 4,
    title: "เจาะใจ",
    time: "20.30 น. - 21.30 น.",
    status: "green",
    img: "/assets/program-talk.jpg",
  },
  {
    id: 5,
    title: "ละครเย็น",
    time: "17.00 น. - 18.00 น.",
    status: "red",
    img: "/assets/program-drama.jpg",
  },
  {
    id: 6,
    title: "ข่าวค่ำ",
    time: "19.00 น. - 20.00 น.",
    status: "green",
    img: "/assets/program-news.jpg",
  },
];

export default function Programme() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse
  const [menuOpen, setMenuOpen] = useState(false);                 // mobile drawer

  return (
    <div
      className={[
        "front-shell",
        sidebarCollapsed ? "side-collapsed" : "",
        menuOpen ? "mobile-open" : ""
      ].join(" ")}
    >
      <FrontSidebar
        collapsed={sidebarCollapsed}
        open={menuOpen}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        onCloseMobile={() => setMenuOpen(false)}
      />

      <div className="front-main">
        <FrontNavbar
          dateStr="30 ส.ค 2568"
          timeStr="12.00 น."
          onToggleMenu={() => setMenuOpen(v => !v)} // ปุ่มเมนูบน navbar (ใช้เฉพาะมือถือ)
        />

        <div className="front-content">
          <div className="page-title">Programme</div>
          <div className="toolbar">
            <button className="date-chip">วันอาทิตย์ 30 สิงหาคม 2568</button>
            <div className="toolbar-icons">
              <button className="icon-btn" title="ปฏิทิน">
                <span className="material-symbols-outlined">calendar_month</span>
              </button>
              <button className="icon-btn" title="สลับมุมมอง">
                <span className="material-symbols-outlined">dashboard</span>
              </button>
            </div>
          </div>

          <div className="card-grid">
            {mockItems.map(it => (
              <ProgrammeCard key={it.id} {...it} />
            ))}
          </div>
        </div>
      </div>

      {/* overlay เฉพาะ mobile */}
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
