// src/pages/Programme.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FrontSidebar from "../components/Sidebar";
import FrontNavbar from "../components/Topbar";
import ProgrammeCard from "../components/ProgrammeCard";
import "./Programme.css";
import { listProgrammes, programmeUploads } from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ---------------- Utils ---------------- */
const toAbsUrl = (raw) => {
  if (!raw) return null;
  const s = String(raw);
  if (s.startsWith("http")) return s;
  if (s.startsWith("/uploads/")) return `${API_BASE}${s}`;
  return `${API_BASE}/uploads/${s.replace(/^\/+/, "")}`;
};

const SAVE_DATA = typeof navigator !== "undefined" && navigator.connection?.saveData;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 นาที
const CACHE_KEY_LIST = "prog:list:v1";
const CACHE_KEY_UPLOADS = "prog:uploads:v1"; // { [programmeId]: url }

/** cache helpers */
const now = () => Date.now();
const readCache = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.exp && parsed.exp < now()) return null;
    return parsed.data ?? null;
  } catch { return null; }
};
const writeCache = (key, data, ttl = CACHE_TTL_MS) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({ exp: now() + ttl, data }));
  } catch { /* ignore */ }
};

/** mapLimit: run mapper concurrently up to `limit` */
async function mapLimit(arr, limit, mapper) {
  const ret = new Array(arr.length);
  let i = 0;
  const workers = new Array(Math.min(limit, arr.length)).fill(0).map(async () => {
    while (i < arr.length) {
      const cur = i++;
      ret[cur] = await mapper(arr[cur], cur);
    }
  });
  await Promise.all(workers);
  return ret;
}

/* ---------------- Page ---------------- */
export default function Programme() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  // ✅ โหลดข้อมูล (มีแคช + ดึงรูปแบบจำกัด concurrency)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);

        // 1) อ่านรายการจากแคชก่อน (ถ้ามี) — ให้ผู้ใช้เห็นการ์ดเร็วขึ้น
        const cachedList = readCache(CACHE_KEY_LIST);
        if (!cancelled && Array.isArray(cachedList)) setItems(cachedList);

        // 2) โหลดรายการจริงจาก API (ทับแคชถ้ามี)
        const progs = await listProgrammes().catch(() => cachedList || []);
        if (cancelled) return;

        const prelim = (progs || []).map((p) => {
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
            imageUrl: toAbsUrl(p.cover_image),
          };
        });

        if (cancelled) return;
        setItems(prelim);
        writeCache(CACHE_KEY_LIST, prelim); // แคชรายการ

        // 3) เติมรูปจากอัปโหลด (ถ้า card ไหนยังไม่มีรูป) — ใช้แคชอัปโหลดช่วย
        const uploadCache = readCache(CACHE_KEY_UPLOADS) || {};
        const filledFromCache = new Map();

        const patched = prelim.map((it) => {
          if (!it.imageUrl && uploadCache[it.id]) {
            filledFromCache.set(it.id, true);
            return { ...it, imageUrl: uploadCache[it.id] };
          }
          return it;
        });

        if (!cancelled) setItems(patched);

        // 4) เตรียมยิง API หา uploads เฉพาะที่ยังไม่มีรูป (และยังไม่ได้ในแคช)
        let need = patched.filter((i) => !i.imageUrl).map((i) => i.id);

        // เคารพ Save-Data: ถ้าผู้ใช้เปิดโหมดประหยัดดาต้า โหลดรูปเสริมแค่ไม่กี่รายการพอ
        const MAX_EAGER_UPLOADS = SAVE_DATA ? 4 : 12;
        if (need.length > MAX_EAGER_UPLOADS) need = need.slice(0, MAX_EAGER_UPLOADS);

        if (need.length) {
          // จำกัด concurrency = 4 เพื่อไม่ถล่มเซิร์ฟเวอร์
          const results = await mapLimit(need, 4, async (progId) => {
            try {
              const list = await programmeUploads(progId);
              const first = Array.isArray(list) && list.length ? (list[0].url || list[0].file_path) : null;
              const abs = toAbsUrl(first);
              return { progId, abs };
            } catch {
              return { progId, abs: null };
            }
          });

          if (cancelled) return;

          const patchMap = {};
          results.forEach(({ progId, abs }) => { if (abs) patchMap[progId] = abs; });

          if (Object.keys(patchMap).length) {
            // อัปเดตสถานะ + แคชอัปโหลด
            const next = (prev) => prev.map((it) => patchMap[it.id] ? ({ ...it, imageUrl: patchMap[it.id] }) : it);
            setItems(next);
            writeCache(CACHE_KEY_UPLOADS, { ...uploadCache, ...patchMap });
          }
        }
      } catch (e) {
        console.error("[Programme] load error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
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
          dateStr={formatThaiDate(nowTime)}
          timeStr={formatThaiTime(nowTime)}
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
                  — ยังไม่มีรายการ —
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
