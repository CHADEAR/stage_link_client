// src/pages/Vote1.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import "./Vote1.css";

// ⚠️ แก้ URL ให้ตรงกับ server ของคุณ
const API_BASE = "http://localhost:3000/api/vote";
 

export default function Vote1() {
  const navigate = useNavigate();

  const players = [
    { key: "player1", label: "User 1" },
    { key: "player2", label: "User 2" },
    { key: "player3", label: "User 3" },
    { key: "player4", label: "User 4" },
  ];

  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // ดึงค่าโหวตจาก API
  const loadVotes = async () => {
    try {
      const res = await fetch(`${API_BASE}/vote/current`);
      const data = await res.json();
      if (Array.isArray(data?.rows)) {
        setRows(data.rows);
      }
    } catch (err) {
      console.error("loadVotes error", err);
      setError("เชื่อมต่อ API ไม่ได้");
    }
  };

  useEffect(() => {
    loadVotes();

    // refresh ทุก 2 วินาที
    const id = setInterval(loadVotes, 2000);
    return () => clearInterval(id);
  }, []);

  // สร้าง map ไว้เช็คว่าใคร active
  const valueMap = useMemo(() => {
    const m = new Map();
    rows.forEach((r) => m.set(r.player, Number(r.value)));
    return m;
  }, [rows]);

  const formattedDate = new Date().toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="vote-page">
      <div className="vote-topbar-spacer" />

      <div className="vote-header-row">
        <div className="vote-head-left">
          <h1 className="vote-title">Reality Show</h1>
          <div className="vote-breadcrumb">
            <span>รายการ&nbsp;</span>
            <strong>The Voice</strong>
            <span>&nbsp;&gt;&nbsp;โหวต</span>
          </div>
        </div>
        <span className="vote-datetime">{formattedDate}</span>
      </div>

      <section className="vote-card">
        <div className="section-title">
          แสดงผลการเลือกของกรรมการ <strong>The Voice</strong>
        </div>

        {error && <div className="warn">{error}</div>}

        <div className="candidate-row">
          {players.map((p) => {
            const active = valueMap.get(p.key) === 1;
            return (
              <div
                key={p.key}
                className={`candidate ${active ? "active" : ""}`}
              >
                <div className="cand-ring">
                  <div className="avatar">
                    <User size={28} color="#64748b" strokeWidth={2} />
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
          <button className="link-back" onClick={() => navigate(-1)}>
            &lt; Back
          </button>
          <button className="btn-refresh" onClick={loadVotes}>
            Refresh
          </button>
        </div>
      </section>
    </div>
  );
}
