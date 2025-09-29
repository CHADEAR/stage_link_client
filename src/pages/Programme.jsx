import React, { useState, useRef, useEffect } from "react";
import FrontSidebar from "../components/Sidebar";
import FrontNavbar from "../components/Topbar";
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date()); // วันที่จากปฏิทิน
  const dateInputRef = useRef(null);

  // นาฬิกาปัจจุบัน
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // format ไทย
  const formatThaiDate = (d) =>
    d.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formatThaiTime = (d) =>
    d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,   // ให้เป็น 24 ชั่วโมง
    });

  // value สำหรับ <input type="date"> (กัน timezone เพี้ยน)
  const toInputValue = (d) => {
    const tz = d.getTimezoneOffset() * 60 * 1000;
    const local = new Date(d.getTime() - tz);
    return local.toISOString().slice(0, 10);
  };

  const openDatePicker = () => {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else { el.focus(); el.click(); }
  };

  return (
    <div className={["front-shell", sidebarCollapsed ? "side-collapsed" : "", menuOpen ? "mobile-open" : ""].join(" ")}>
      <FrontSidebar
        collapsed={sidebarCollapsed}
        open={menuOpen}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        onCloseMobile={() => setMenuOpen(false)}
        // ⬇️ ส่งวันที่ที่ “เลือกจากปฏิทิน” ไปให้ Sidebar
        selectedDateLabel={formatThaiDate(selectedDate)}
      />

      <div className="front-main">
        <FrontNavbar
          // ⬇️ Navbar ใช้ “เวลาปัจจุบัน”
          dateStr={formatThaiDate(now)}
          timeStr={formatThaiTime(now)}
          onToggleMenu={() => setMenuOpen(v => !v)}
        />

        <div className="front-content">
          <div className="page-title">Programme</div>

          <div className="toolbar">
            <div className="toolbar-right">
              <button className="date-chip">{formatThaiDate(selectedDate)}</button>

              <div className="toolbar-icons">
                <div className="calendar-anchor" style={{ position: "relative", display: "inline-block" }}>
                  <button className="icon-btn" title="ปฏิทิน" onClick={openDatePicker}>
                    <span className="material-symbols-outlined">calendar_month</span>
                  </button>
                  <input
                    ref={dateInputRef}
                    type="date"
                    className="hidden-date-input"
                    value={toInputValue(selectedDate)}
                    onChange={(e) => {
                      const [y, m, d] = e.target.value.split("-").map(Number);
                      setSelectedDate(new Date(y, m - 1, d));
                    }}
                  />
                </div>

                <button className="icon-btn" title="สลับมุมมุมมอง">
                  <span className="material-symbols-outlined">dashboard</span>
                </button>
              </div>
            </div>
          </div>


          <div className="card-grid">
            {mockItems.map(it => (<ProgrammeCard key={it.id} {...it} />))}
          </div>
        </div>
      </div>

      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}