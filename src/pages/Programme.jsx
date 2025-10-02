// src/pages/Programme.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FrontSidebar from "../components/Sidebar";
import FrontNavbar from "../components/Topbar";
import ProgrammeCard from "../components/ProgrammeCard";
import "./Programme.css";
import { listProgrammes, programmeUploads } from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ประเภทที่รองรับ (ต้องตรงกับค่าที่บันทึกใน DB)
const CATEGORY_OPTIONS = [
  { value: "news", label: "ข่าว" },
  { value: "variety", label: "วาไรตี้" },
  { value: "singing", label: "รายการร้องเพลง" },
];

/* ---------------- Utils ---------------- */
const toAbsUrl = (raw) => {
  if (!raw) return null;
  const s = String(raw);
  if (s.startsWith("http")) return s;
  if (s.startsWith("/uploads/")) return `${API_BASE}${s}`;
  return `${API_BASE}/uploads/${s.replace(/^\/+/, "")}`;
};

/** แปลง "HH:MM[:SS]" -> "HH.MM" สำหรับการแสดงผล */
const toThaiHM = (t) => {
  if (!t) return null;
  const m = String(t).match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}.${m[2]}` : null;
};

/** ISO-local date (YYYY-MM-DD) สำหรับ input[type=date] และ query */
const toInputValue = (d) => {
  const tz = d.getTimezoneOffset() * 60 * 1000;
  const local = new Date(d.getTime() - tz);
  return local.toISOString().slice(0, 10);
};

/* ---------------- Page ---------------- */
export default function Programme() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ฟิลเตอร์
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCats, setSelectedCats] = useState(new Set());

  const dateInputRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // นาฬิกา
  const [nowTime, setNowTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const formatThaiDate = (d) =>
    d.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formatThaiTime = (d) =>
    d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });

  const openDatePicker = () => {
    const el = dateInputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") el.showPicker();
    else { el.focus(); el.click(); }
  };

  // โหลดรายการตามฟิลเตอร์ (กรองที่หลังบ้าน)
  async function fetchProgrammes() {
    setLoading(true);
    try {
      const params = {};
      if (selectedDate) params.date = toInputValue(selectedDate);
      if (selectedCats.size) params.categories = Array.from(selectedCats);

      const progs = await listProgrammes(params);

      // map สำหรับโชว์เวลาแบบ "15.00 น. - 20.00 น."
      const prelim = (progs || []).map((p) => {
        const s = toThaiHM(p.start_time);
        const e = toThaiHM(p.end_time);
        const time =
          s && e ? `${s} น. - ${e} น.` :
          s ? `${s} น.` :
          e ? `${e} น.` : "";

        return {
          id: p.id,
          title: p.title,
          status: p.is_active ? "green" : "red",
          time,
          imageUrl: toAbsUrl(p.cover_image),
        };
      });

      setItems(prelim);

      // เติมรูปจาก uploads ถ้ายังไม่มี cover_image
      const need = prelim.filter((i) => !i.imageUrl);
      if (need.length) {
        const ups = await Promise.all(need.map(i => programmeUploads(i.id).catch(() => [])));
        need.forEach((item, idx) => {
          const list = ups[idx];
          if (Array.isArray(list) && list.length) {
            const raw = list[0].url || list[0].file_path;
            const abs = toAbsUrl(raw);
            if (abs) item.imageUrl = abs;
          }
        });
        setItems([...prelim]);
      }
    } catch (e) {
      console.error("[Programme] fetch error:", e);
    } finally {
      setLoading(false);
    }
  }

  // โหลดครั้งแรก + เมื่อฟิลเตอร์เปลี่ยน
  useEffect(() => { fetchProgrammes(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { fetchProgrammes(); /* eslint-disable-next-line */ }, [selectedDate, selectedCats]);

  // toggle ประเภท (หลายตัว)
  const toggleCategory = (value) => {
    setSelectedCats(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  // ล้างตัวกรอง
  const clearFilters = () => {
    setSelectedCats(new Set());
    setSelectedDate(new Date());
  };

  return (
    <div className={["front-shell", sidebarCollapsed ? "side-collapsed" : "", menuOpen ? "mobile-open" : ""].join(" ")}>
      <FrontSidebar
        collapsed={sidebarCollapsed}
        open={menuOpen}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        onCloseMobile={() => setMenuOpen(false)}
        selectedDateLabel={formatThaiDate(nowTime)}
      />

      <div className="front-main">
        <FrontNavbar
          dateStr={formatThaiDate(nowTime)}
          timeStr={formatThaiTime(nowTime)}
          onToggleMenu={() => setMenuOpen(v => !v)}
        />

        <div className="front-content">
          <div className="page-title">Programme</div>

          {/* ✅ คงโครงสร้าง class เดิม ทุกอย่างอยู่ “ชิดขวา” */}
          <div className="toolbar">
            <div className="toolbar-right">
              {/* ป้ายวันที่ (เดิม) */}
              <button className="date-chip">{formatThaiDate(selectedDate)}</button>

              {/* กลุ่มปุ่มด้านขวา (เดิม) — ใส่ตัวกรอง + ไอคอนทั้งหมดไว้ในนี้ */}
              <div className="toolbar-icons">
                {/* ปุ่มเลือกประเภท (เลือกได้หลายตัว) */}
                {CATEGORY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`category-btn ${selectedCats.has(opt.value) ? "active" : ""}`}
                    onClick={() => toggleCategory(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}

                {/* ปุ่มล้างตัวกรอง */}
                <button type="button" className="icon-btn" onClick={clearFilters} title="ล้างตัวกรอง">
                  ล้าง
                </button>

                {/* ปฏิทิน (เดิม) */}
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

                {/* ปุ่มเดิมอื่น ๆ (ถ้ามี) */}
                {/* <button className="icon-btn" title="สลับมุมมุมมอง">
                  <span className="material-symbols-outlined">dashboard</span>
                </button> */}
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
                >
                  <button
                    onClick={() => navigate(`/programme/${it.id}`, { state: { programme: it } })}
                    className="icon-btn"
                  >
                    รายละเอียดการจัดการ
                  </button>
                </ProgrammeCard>
              ))}
              {!items.length && (
                <div style={{ padding: 24, color: "#666" }}>
                  — ไม่พบรายการตามตัวกรอง —
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
