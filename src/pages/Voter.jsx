// src/pages/Vote1.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, RotateCcw } from "lucide-react";
import FrontSidebar from "../components/Sidebar";
import FrontNavbar from "../components/Topbar";
import "./Voter.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const API_VOTE = `${BASE_URL}/api/vote`;
const API_CTRL = `${BASE_URL}/api/control`;

export default function Vote1() {
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
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // keep reference of active polling to cancel
  const pollTimerRef = useRef(null);

  const fetchWithAbort = async (url, options = {}, controller) => {
    const r = await fetch(url, { ...options, signal: controller.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };

  const loadVotes = async (controller) => {
    try {
      const data = await fetchWithAbort(`${API_VOTE}/current`, {}, controller);
      if (Array.isArray(data?.rows)) setRows(data.rows);
      setErr("");
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
        setErr("เชื่อมต่อ API ไม่ได้");
      }
    }
  };

  // polling: หยุดเมื่อแท็บไม่ active
  useEffect(() => {
    const controller = new AbortController();

    const startPolling = () => {
      // เรียกครั้งแรกทันที
      loadVotes(controller);
      // ตั้ง interval
      pollTimerRef.current = setInterval(() => {
        // ถ้าแท็บไม่ active ให้ข้าม
        if (document.visibilityState !== "visible") return;
        const c = new AbortController();
        loadVotes(c);
      }, 1500);
    };

    const stopPolling = () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      controller.abort();
    };

    startPolling();
    document.addEventListener("visibilitychange", () => {
      // เมื่อกลับมา active ก็ปล่อยให้รอบต่อไปดึงเอง
    });

    return () => {
      stopPolling();
    };
  }, []);

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

  // === actions ===
  const postJson = async (url, body) => {
    setLoading(true);
    const controller = new AbortController();
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      // refresh หลังสั่งสำเร็จ
      await loadVotes(new AbortController());
      setErr("");
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
        setErr("ส่งคำสั่งไม่สำเร็จ");
      }
    } finally {
      setLoading(false);
    }
  };

  const onSpinOnly = (player) => postJson(`${API_CTRL}/spin-only`, { player });
  const onVoteAndSpin = (player) => postJson(`${API_CTRL}/vote`, { player });

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

        {/* แผงผลโหวตปัจจุบัน */}
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
                    <div className="avatar">
                      <User size={28} />
                    </div>
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
            <button className="btn-refresh" onClick={() => loadVotes(new AbortController())} disabled={loading}>
              <RotateCcw size={16} /> {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </section>

        {/* แผงล่างซ้าย: หมุนอย่างเดียว (ไม่ถือเป็นโหวต) */}
        <section className="vote-card soft">
          <div className="section-title">
            ควบคุม การหมุนโดย <strong>ไม่นับเป็นโหวต</strong>
          </div>
          <div className="candidate-row">
            {players.map((p) => (
              <button
                key={`spin-${p.key}`}
                className="candidate btn"
                disabled={loading}
                onClick={() => onSpinOnly(p.key)}
                title="หมุนอย่างเดียว ไฟไม่ติด ไม่บันทึกโหวต"
              >
                <div className="cand-ring">
                  <div className="avatar">
                    <User size={24} />
                  </div>
                  <div className="cand-name">{p.label}</div>
                  <span className="status-pill">หมุน</span>
                </div>
              </button>
            ))}
          </div>
          <div className="vote-footer right">
            <span className="hint">สั่งหมุน → ESP32 จะรับคิวใน ~0.2s</span>
          </div>
        </section>

        {/* แผงล่างขวา: โหวต + หมุน (ไฟติด) */}
        <section className="vote-card soft">
          <div className="section-title">
            ควบคุม การหมุนโดย <strong>โหวตไปด้วย</strong>
          </div>
          <div className="candidate-row">
            {players.map((p) => (
              <button
                key={`vote-${p.key}`}
                className="candidate btn"
                disabled={loading}
                onClick={() => onVoteAndSpin(p.key)}
                title="โหวต + สั่งหมุน ไฟจะติด"
              >
                <div className="cand-ring">
                  <div className="avatar">
                    <User size={24} />
                  </div>
                  <div className="cand-name">{p.label}</div>
                  <span className="status-pill on">โหวต + หมุน</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
