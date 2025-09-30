// src/pages/Vote1.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, RotateCcw } from "lucide-react";
import "./Vote1.css";

const API_VOTE = "http://localhost:3000/api/vote";
const API_CTRL = "http://localhost:3000/api/control";

export default function Vote1() {
  const navigate = useNavigate();

  const players = [
    { key: "player1", label: "User 1" },
    { key: "player2", label: "User 2" },
    { key: "player3", label: "User 3" },
    { key: "player4", label: "User 4" },
  ];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadVotes = async () => {
    try {
      const r = await fetch(`${API_VOTE}/current`);
      const data = await r.json();
      if (Array.isArray(data?.rows)) setRows(data.rows);
      setErr("");
    } catch (e) {
      console.error(e);
      setErr("เชื่อมต่อ API ไม่ได้");
    }
  };

  useEffect(() => {
    loadVotes();
    const id = setInterval(loadVotes, 1500);
    return () => clearInterval(id);
  }, []);

  const valueMap = useMemo(() => {
    const m = new Map();
    rows.forEach((r) => m.set(r.player, Number(r.value)));
    return m;
  }, [rows]);

  const fmt = new Date().toLocaleString("th-TH", {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

  // === actions ===
  const postJson = async (url, body) => {
    setLoading(true);
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await loadVotes(); // อัปเดตสถานะด้านบน
    } catch (e) {
      console.error(e);
      setErr("ส่งคำสั่งไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const onSpinOnly = (player) => postJson(`${API_CTRL}/spin-only`, { player });
  const onVoteAndSpin = (player) => postJson(`${API_CTRL}/vote`, { player });

  return (
    <div className="vote-page">
      <div className="vote-topbar-spacer" />
      <div className="vote-header-row">
        <div className="vote-head-left">
          <h1 className="vote-title">โหวต</h1>
          <div className="vote-breadcrumb">
            <span>รายการ </span><strong>The Voice</strong>
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
                  <div className="avatar"><User size={28} color="#64748b" /></div>
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
            <RotateCcw size={16} /> Refresh
          </button>
        </div>
      </section>

      {/* แผงล่างซ้าย: หมุนอย่างเดียว (ไม่ถือเป็นโหวต) */}
      <section className="vote-card soft">
        <div className="section-title">ควบคุม การหมุนโดย <strong>ไม่นับเป็นโหวต</strong></div>
        <div className="candidate-row">
          {players.map((p) => (
            <button
              key={p.key}
              className="candidate btn"
              disabled={loading}
              onClick={() => onSpinOnly(p.key)}
              title="หมุนอย่างเดียว ไฟไม่ติด ไม่บันทึกโหวต"
            >
              <div className="cand-ring">
                <div className="avatar"><User size={24} /></div>
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
        <div className="section-title">ควบคุม การหมุนโดย <strong>โหวตไปด้วย</strong></div>
        <div className="candidate-row">
          {players.map((p) => (
            <button
              key={p.key}
              className="candidate btn"
              disabled={loading}
              onClick={() => onVoteAndSpin(p.key)}
              title="โหวต + สั่งหมุน ไฟจะติด"
            >
              <div className="cand-ring">
                <div className="avatar"><User size={24} /></div>
                <div className="cand-name">{p.label}</div>
                <span className="status-pill on">โหวต + หมุน</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
