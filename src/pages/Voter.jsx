// src/pages/Voter.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, RotateCcw } from "lucide-react";
import FrontSidebar from "../components/Sidebar";
import FrontNavbar from "../components/Topbar";
import "./Voter.css";

// ใช้ตัวแปร env เดิมของคุณได้เลย (ตั้งใน frontend/.env)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_VOTE = `${BASE_URL}/api/vote`;
const API_CTRL = `${BASE_URL}/api/control`;

export default function Voter() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // ----- time on navbar -----
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const dateStr = now.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // ----- candidates -----
  const players = useMemo(
    () => [
      { key: "player1", label: "User 1" },
      { key: "player2", label: "User 2" },
      { key: "player3", label: "User 3" },
      { key: "player4", label: "User 4" },
    ],
    []
  );

  // ----- state -----
  const [rows, setRows] = useState([]);     // [{player, value}]
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const pollTimerRef = useRef(null);

  const fetchJSON = async (url, options = {}) => {
    const r = await fetch(url, options);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };

  // โหลด snapshot (ใช้งานกับการ์ดบน)
  const loadVotes = async () => {
    try {
      const data = await fetchJSON(`${API_VOTE}/snapshot`);
      // data = { ok:true, items:[{player,value,updated_at}], current }
      if (Array.isArray(data?.items)) setRows(data.items);
      setErr("");
    } catch (e) {
      console.error(e);
      setErr("เชื่อมต่อ API ไม่ได้");
    }
  };

  // polling ทุก 1.5s (เฉพาะตอนแท็บ active)
  useEffect(() => {
    loadVotes(); // ครั้งแรก
    pollTimerRef.current = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      loadVotes();
    }, 1500);
    return () => clearInterval(pollTimerRef.current);
  }, []);

  // map player -> value (1=เลือก/ไฟติด, 0=รอ/ไฟดับ)
  const valueMap = useMemo(() => {
    const m = new Map();
    rows.forEach((r) => m.set(r.player, Number(r.value)));
    return m;
  }, [rows]);

  const fmt = new Date().toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  // ===== actions =====
  const postJson = async (url, body) => {
    setLoading(true);
    try {
      await fetchJSON(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // ให้ความรู้สึกไวขึ้น: refresh หลังส่งคำสั่งเล็กน้อย
      setTimeout(loadVotes, 400);
      setErr("");
    } catch (e) {
      console.error(e);
      setErr("ส่งคำสั่งไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // ล่างซ้าย: หมุน + ไฟสว่าง  (light:true)
  const onRotateWithLight = (player) =>
    postJson(`${API_CTRL}/enqueue`, { player, light: true });

  // ล่างขวา: หมุน + ไฟดับ    (light:false)
  const onRotateNoLight = (player) =>
    postJson(`${API_CTRL}/enqueue`, { player, light: false });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
      <FrontSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <FrontNavbar dateStr={dateStr} timeStr={timeStr} />

        <div className="vote-topbar-spacer" />
        <div className="vote-header-row">
          <div className="vote-head-left">
            <h1 className="vote-title">โหวต</h1>
            <div className="vote-breadcrumb">
              <span>รายการ </span>
              <strong>The Voice</strong>
            </div>
          </div>
          <span className="vote-datetime">{fmt}</span>
        </div>

        {/* การ์ดบน: แสดงผลการเลือกของกรรมการ */}
        <section className="vote-card">
          <div className="section-title">
            แสดงผลการเลือกของกรรมการ <strong>The Voice</strong>
          </div>
          {err && <div className="warn">{err}</div>}

          <div className="candidate-row">
            {players.map((p) => {
              const active = valueMap.get(p.key) === 1;
              return (
                <div key={p.key} className={`candidate ${active ? "active" : ""}`}>
                  <div className="cand-ring">
                    <div className="avatar"><User size={28} /></div>
                    <div className="cand-name">{p.label}</div>
                    <span className={`status-pill ${active ? "on" : ""}`}>
                      {active ? "กำลังเลือก" : "รอการเลือก"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="vote-footer">
            <button className="link-back" onClick={() => navigate(-1)}>&lt; Back</button>
            <button className="btn-refresh" onClick={loadVotes} disabled={loading}>
              <RotateCcw size={16} /> {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </section>

        {/* ล่างซ้าย: หมุน + ไฟสว่าง */}
        <section className="vote-card soft">
          <div className="section-title">ควบคุม การหมุนโดย <strong>ไฟจะสว่าง</strong></div>
          <div className="candidate-row">
            {players.map((p) => (
              <button
                key={`on-${p.key}`}
                className="candidate btn"
                disabled={loading}
                onClick={() => onRotateWithLight(p.key)}
                title={`เลือก ${p.label} → เซอร์โวหมุน + ไฟสว่าง`}
              >
                <div className="cand-ring">
                  <div className="avatar"><User size={24} /></div>
                  <div className="cand-name">{p.label}</div>
                  <span className="status-pill on">หมุน + ไฟสว่าง</span>
                </div>
              </button>
            ))}
          </div>
          <div className="vote-footer right">
            <span className="hint">ESP32 จะรับคิวภายใน ~0.2s</span>
          </div>
        </section>

        {/* ล่างขวา: หมุน + ไฟดับ */}
        <section className="vote-card soft">
          <div className="section-title">ควบคุม การหมุนโดย <strong>ไฟจะไม่สว่าง</strong></div>
          <div className="candidate-row">
            {players.map((p) => (
              <button
                key={`off-${p.key}`}
                className="candidate btn"
                disabled={loading}
                onClick={() => onRotateNoLight(p.key)}
                title={`เลือก ${p.label} → เซอร์โวหมุน + ไฟดับ`}
              >
                <div className="cand-ring">
                  <div className="avatar"><User size={24} /></div>
                  <div className="cand-name">{p.label}</div>
                  <span className="status-pill">หมุน + ไฟดับ</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
