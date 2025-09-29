import React, { useState, useRef, useEffect } from "react";
import FrontSidebar from "../components/Sidebar";
import FrontNavbar from "../components/Topbar";
import ProgrammeCard from "../components/ProgrammeCard";
import "./Programme.css";
import { listProgrammes, programmeUploads } from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Programme() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // นาฬิกา
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatThaiDate = (d) =>
    d.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formatThaiTime = (d) =>
    d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });

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

  // โหลดของจริง
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const progs = await listProgrammes();

        const prelim = (progs || []).map((p) => {
          // แปลงเวลาสวย ๆ
          let time = "";
          if (p.shoot_date && p.start_time && p.end_time) {
            const [y,m,d] = String(p.shoot_date).split("-").map(Number);
            const dt = new Date(y, m-1, d);
            const dateTh = dt.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
            const start = `${p.start_time}`.slice(0,5);
            const end   = `${p.end_time}`.slice(0,5);
            time = `${dateTh} • ${start} - ${end} น.`;
          } else if (p.created_at) {
            time = new Date(p.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
          }

          return {
            id: p.id,
            title: p.title,
            status: p.is_active ? "green" : "red",
            time,
            imageUrl: p.cover_image
              ? (String(p.cover_image).startsWith("http") ? p.cover_image : `${API_BASE}${p.cover_image}`)
              : null,
          };
        });

        const need = prelim.filter((i) => !i.imageUrl);
        if (need.length) {
          const uploadsList = await Promise.all(
            need.map((i) => programmeUploads(i.id).catch(() => []))
          );
          need.forEach((item, idx) => {
            const list = uploadsList[idx];
            if (Array.isArray(list) && list.length > 0) {
              const url = list[0].url;
              item.imageUrl = String(url).startsWith("http") ? url : `${API_BASE}${url}`;
            }
          });
        }

        setItems(prelim);
      } catch (e) {
        console.error("[Programme] load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className={["front-shell", sidebarCollapsed ? "side-collapsed" : "", menuOpen ? "mobile-open" : ""].join(" ")}>
      <FrontSidebar
        collapsed={sidebarCollapsed}
        open={menuOpen}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        onCloseMobile={() => setMenuOpen(false)}
        selectedDateLabel={formatThaiDate(selectedDate)}
      />

      <div className="front-main">
        <FrontNavbar
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

          {loading ? (
            <div style={{ padding: 24 }}>กำลังโหลดรายการ…</div>
          ) : (
            <div className="card-grid">
              {items.map((it) => (
                <ProgrammeCard
                  key={it.id}
                  title={it.title}
                  time={it.time}
                  status={it.status}
                  imageUrl={it.imageUrl}
                />
              ))}
              {!items.length && <div style={{ padding: 24, color: "#666" }}>— ยังไม่มีรายการ —</div>}
            </div>
          )}
        </div>
      </div>

      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
