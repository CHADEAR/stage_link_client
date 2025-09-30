import React, { useState, useRef, useEffect } from "react";
import FrontSidebar from "../components/Sidebar";
import FrontNavbar from "../components/Topbar";
import ProgrammeCard from "../components/ProgrammeCard";
import "./Programme.css";
import { listProgrammes, programmeUploads } from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/** 🔧 ช่วยแปลงค่าจาก DB/API ให้เป็น URL เต็ม
 *  - "http..."         -> ใช้ได้เลย
 *  - "/uploads/xxx"    -> ต่อกับ API_BASE
 *  - "xxx.webp"        -> สร้างเป็น `${API_BASE}/uploads/xxx.webp`
 */
const toAbsUrl = (raw) => {
  if (!raw) return null;
  const s = String(raw);
  if (s.startsWith("http")) return s;
  if (s.startsWith("/uploads/")) return `${API_BASE}${s}`;
  return `${API_BASE}/uploads/${s.replace(/^\/+/, "")}`;
};

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

  // ✅ โหลดเร็วขึ้น: แสดงรายการก่อน แล้วค่อยเติมรูปเฉพาะที่ยังไม่มี
  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        setLoading(true);

        // 1) ดึงลิสต์โปรแกรม
        const progs = await listProgrammes();

        // 2) map เป็น model สำหรับแสดงผล + normalize cover_image
        const prelim = (progs || []).map((p) => {
          // แปลงเวลาให้อ่านง่าย
          let time = "";
          if (p.shoot_date && p.start_time && p.end_time) {
            const [y, m, d] = String(p.shoot_date).split("-").map(Number);
            const dt = new Date(y, m - 1, d);
            const dateTh = dt.toLocaleDateString("th-TH", {
              weekday: "long", day: "numeric", month: "long", year: "numeric"
            });
            const start = `${p.start_time}`.slice(0, 5);
            const end = `${p.end_time}`.slice(0, 5);
            time = `${dateTh} • ${start} - ${end} น.`;
          } else if (p.created_at) {
            time = new Date(p.created_at).toLocaleTimeString("th-TH", {
              hour: "2-digit", minute: "2-digit"
            });
          }

          return {
            id: p.id,
            title: p.title,
            status: p.is_active ? "green" : "red",
            time,
            imageUrl: toAbsUrl(p.cover_image), // ✅ ครอบคลุมทุกกรณี
          };
        });

        if (canceled) return;
        // 3) โชว์รายการก่อน (เร็วขึ้น)
        setItems(prelim);

        // 4) เติมรูปแบบ lazy: ยิง /programmes/:id/uploads เฉพาะตัวที่ยังไม่มี imageUrl
        const need = prelim.filter((i) => !i.imageUrl);
        if (need.length) {
          const uploadsList = await Promise.all(
            need.map((i) => programmeUploads(i.id).catch(() => []))
          );
          if (canceled) return;

          // สร้าง map ของ id -> imageUrl ที่หาเจอ
          const patchMap = new Map();
          need.forEach((item, idx) => {
            const list = uploadsList[idx];
            if (Array.isArray(list) && list.length > 0) {
              const first = list[0];
              const raw = first?.url || first?.file_path || null; // รองรับทั้ง url/file_path
              const abs = toAbsUrl(raw);
              if (abs) patchMap.set(item.id, abs);
            }
          });

          // อัปเดตรูปเฉพาะที่หาเจอ โดยไม่กระทบตัวอื่น
          if (patchMap.size > 0) {
            setItems((prev) =>
              prev.map((it) => (patchMap.has(it.id) ? { ...it, imageUrl: patchMap.get(it.id) } : it))
            );
          }
        }
      } catch (e) {
        console.error("[Programme] load error:", e);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => { canceled = true; };
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
