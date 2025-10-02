// src/pages/ProgrammeDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./ProgrammeDetail.css";
import FrontSidebar from "../components/Sidebar";
import FrontNavbar from "../components/Topbar";
import Fallback from "../assets/news.jpg";
import { listProgrammes, programmeUploads } from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const toAbsUrl = (raw) => {
  if (!raw) return null;
  const s = String(raw);
  if (s.startsWith("http")) return s;
  if (s.startsWith("/uploads/")) return `${API_BASE}${s}`;
  return `${API_BASE}/uploads/${s.replace(/^\/+/, "")}`;
};

export default function ProgrammeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const passed = state?.programme || state?.item || null;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // ถ้ามี state ก็ใช้เป็นค่าเริ่มต้นไปก่อน (เร็วกว่า)
  const [item, setItem] = useState(passed || null);
  const [imgUrl, setImgUrl] = useState(passed?.imageUrl || null);
  const [loading, setLoading] = useState(!passed);

  // clock
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const formatThaiDate = (d) => d.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formatThaiTime = (d) => d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });

  // ✅ ดึงของจริงจาก API ถ้า state ไม่มี description (หรือเข้า URL ตรง)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // กรณี state พอครบแล้ว (มี description) ข้ามการ fetch รายการ
        const needFetchProgramme = !passed || !passed.description;

        if (needFetchProgramme) {
          setLoading(true);
          const list = await listProgrammes();
          const p = list.find((x) => x.id === id) || null;
          if (cancelled) return;
          setItem(p);
          // เซ็ตรูปจาก cover_image ก่อน
          let url = toAbsUrl(p?.cover_image);
          // ถ้ายังไม่มี ค่อยลองไปดู uploads
          if (!url) {
            const ups = await programmeUploads(id).catch(() => []);
            if (cancelled) return;
            if (Array.isArray(ups) && ups.length) {
              const raw = ups[0].url || ups[0].file_path;
              url = toAbsUrl(raw);
            }
          }
          setImgUrl(url || null);
        } else {
          // state มีครบแล้ว แต่อาจยังไม่มีรูป → เติมรูปถ้าจำเป็น
          if (!imgUrl) {
            let url = toAbsUrl(passed?.cover_image);
            if (!url) {
              const ups = await programmeUploads(id).catch(() => []);
              if (cancelled) return;
              if (Array.isArray(ups) && ups.length) {
                const raw = ups[0].url || ups[0].file_path;
                url = toAbsUrl(raw);
              }
            }
            setImgUrl(url || null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, passed, imgUrl]);

  // ✅ เวลา: โชว์เฉพาะช่วงเวลา (เก็บวัน-เดือน-ปีไว้ใน DB เหมือนเดิม)
  const timeLabel = (() => {
    const p = item;
    if (!p) return "";
    const s = p.start_time ? String(p.start_time).slice(0, 5) : null;
    const e = p.end_time ? String(p.end_time).slice(0, 5) : null;
    if (s && e) return `${s} - ${e} น.`;
    return p.created_at
      ? new Date(p.created_at).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
      : "";
  })();

  const onImgError = (e) => { e.currentTarget.src = Fallback; };

  const handleVote = () => {
    navigate("/voter", { state: { programmeId: id, from: "programme-detail" } });
  };

  return (
    <div className={["front-shell", sidebarCollapsed ? "side-collapsed" : "", menuOpen ? "mobile-open" : ""].join(" ")}>
      <FrontSidebar
        collapsed={sidebarCollapsed}
        open={menuOpen}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        onCloseMobile={() => setMenuOpen(false)}
        selectedDateLabel={formatThaiDate(now)}
      />

      <div className="front-main">
        <FrontNavbar
          dateStr={formatThaiDate(now)}
          timeStr={formatThaiTime(now)}
          onToggleMenu={() => setMenuOpen((v) => !v)}
        />

        <div className="front-content">
          <div className="programme-detail-layout">
            <div className="programme-detail-header">
              <h1>{item?.title || "รายการ"}</h1>
              <button onClick={() => navigate(-1)} className="back-btn">← กลับ</button>
            </div>

            {loading ? (
              <div style={{ padding: 24 }}>กำลังโหลด…</div>
            ) : (
              <div className="programme-detail-body">
                <div className="programme-left">
                  <img
                    src={imgUrl || Fallback}
                    alt={item?.title || "cover"}
                    className="programme-cover"
                    onError={onImgError}
                    loading="lazy"
                  />
                  <p className="programme-desc">
                    ● รายการ {item?.title || "-"} <br />
                    ถ่ายทอดสดเวลา : {timeLabel || "-"}
                  </p>

                  <div className="programme-buttons">
                    <button className="detail-btn">จัดการสตูดิโอ</button>
                    <button className="detail-btn">ควบคุมไฟ</button>
                    <button className="detail-btn" onClick={handleVote}>โหวต</button>
                  </div>
                </div>

                <div className="programme-right">
                  <h2>รายละเอียดการถ่ายทำ / การดำเนินการของรายการ</h2>
                  {/* ✅ ดึง “ของจริง” จาก field description */}
                  <pre style={{ whiteSpace: "pre-wrap" }}>{item?.description || "-"}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
