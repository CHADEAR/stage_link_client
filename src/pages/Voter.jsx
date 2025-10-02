// src/pages/Voter.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, RotateCcw } from "lucide-react";
import FrontSidebar from "../components/Sidebar";
import FrontNavbar from "../components/Topbar";
import "./Voter.css";

// ใช้ env ของ frontend (.env) เช่น VITE_API_BASE_URL=http://localhost:3000
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
  const [rows, setRows] = useState([]); // [{player, value}]
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const pollTimerRef = useRef(null);

  // สำหรับไฮไลต์ปุ่มของการ์ดล่าง (เลือกได้หลายคน)
  const [pickedOn, setPickedOn] = useState(() => new Set());   // ฝั่งไฟสว่าง
  const [pickedOff, setPickedOff] = useState(() => new Set()); // ฝั่งไฟดับ

  // helpers
  const fetchJSON = async (url, options = {}) => {
    const r = await fetch(url, options);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };

  const loadVotes = async () => {
    try {
      const data = await fetchJSON(`${API_VOTE}/snapshot`);
      if (Array.isArray(data?.items)) setRows(data.items);
      setErr("");
    } catch (e) {
      console.error(e);
      setErr("เชื่อมต่อ API ไม่ได้");
    }
  };

  // Poll ทุก 1.5s เฉพาะตอนแท็บ active
  useEffect(() => {
    loadVotes();
    pollTimerRef.current = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      loadVotes();
    }, 1500);
    return () => clearInterval(pollTimerRef.current);
  }, []);

  // map player -> value
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
      // โหลดผลใหม่ให้เร็วขึ้น
      setTimeout(loadVotes, 350);
      setErr("");
    } catch (e) {
      console.error(e);
      setErr("ส่งคำสั่งไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // กดปุ่มในการ์ดล่างซ้าย: หมุน + ไฟสว่าง
  const onRotateWithLight = async (player) => {
    // toggle ไฮไลต์แบบหลายตัวเลือก
    setPickedOn((prev) => {
      const next = new Set(prev);
      next.has(player) ? next.delete(player) : next.add(player);
      return next;
    });
    await postJson(`${API_CTRL}/enqueue`, { player, light: true });
  };

  // การ์ดล่างขวา: หมุน + ไฟดับ
  const onRotateNoLight = async (player) => {
    setPickedOff((prev) => {
      const next = new Set(prev);
      next.has(player) ? next.delete(player) : next.add(player);
      return next;
    });
    await postJson(`${API_CTRL}/enqueue`, { player, light: false });
  };

  // Reset UI เฉพาะการ์ดล่าง
  const onResetOnUI = () => setPickedOn(new Set());
  const onResetOffUI = () => setPickedOff(new Set());

  // Refresh (รีเซ็ตฮาร์ดแวร์ + สแนปช็อตให้เป็น 0 ทั้งหมด)
  const onRefreshResetAll = async () => {
    await postJson(`${API_CTRL}/reset`, { all: true });
    setPickedOn(new Set());
    setPickedOff(new Set());
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
      <FrontSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* เฮดเดอร์ (มีวัน/เวลา) */}
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

        {/* การ์ดบน: แสดงผลการเลือก + กรอบน้ำเงิน */}
        <section className="vote-card">
          <div className="section-title">
            แสดงผลการเลือกของกรรมการ <strong>The Voice</strong>
          </div>
          {err && <div className="warn">{err}</div>}

          <div className="blue-box">
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
          </div>

          <div className="vote-footer">
            <button className="link-back" onClick={() => navigate(-1)}>&lt; Back</button>
            <button className="btn-refresh" onClick={onRefreshResetAll} disabled={loading}>
              <RotateCcw size={16} /> {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </section>

        {/* การ์ดล่างวางคู่ */}
        <div className="ctrl-grid">
          {/* ล่างซ้าย: ไฟจะสว่าง */}
          <section className="ctrl-card">
            <div className="ctrl-head">ควบคุม การหมุนโดย <strong>ไฟจะสว่าง</strong></div>
            <div className="mini-row">
              {players.map((p) => (
                <button
                  key={`on-${p.key}`}
                  className={`mini ${pickedOn.has(p.key) ? "is-on" : ""}`}
                  disabled={loading}
                  onClick={() => onRotateWithLight(p.key)}
                  title={`เลือก ${p.label} → เซอร์โวหมุน + ไฟสว่าง`}
                >
                  <div className="mini-avatar"><User size={22} /></div>
                  <div className="mini-name">{p.label}</div>
                </button>
              ))}
            </div>
            <div className="ctrl-foot">
              <span />
              <button className="reset" onClick={onResetOnUI} title="Reset">
                Reset <RotateCcw size={16} />
              </button>
            </div>
          </section>

          {/* ล่างขวา: ไฟจะไม่สว่าง */}
          <section className="ctrl-card alt">
            <div className="ctrl-head">ควบคุม การหมุนโดย <strong>ไฟจะไม่สว่าง</strong></div>
            <div className="mini-row">
              {players.map((p) => (
                <button
                  key={`off-${p.key}`}
                  className={`mini ${pickedOff.has(p.key) ? "is-off" : ""}`}
                  disabled={loading}
                  onClick={() => onRotateNoLight(p.key)}
                  title={`เลือก ${p.label} → เซอร์โวหมุน + ไฟดับ`}
                >
                  <div className="mini-avatar"><User size={22} /></div>
                  <div className="mini-name">{p.label}</div>
                </button>
              ))}
            </div>
            <div className="ctrl-foot">
              <span />
              <button className="reset" onClick={onResetOffUI} title="Reset">
                Reset <RotateCcw size={16} />
              </button>
            </div>
          </section>
        </div>

        <div style={{ maxWidth: 1100, margin: "8px 18px 24px", color: "#64748b", fontSize: 13 }}>
          ESP32 จะรับคิวภายใน ~0.2s
        </div>
      </div>
    </div>
  );
}
