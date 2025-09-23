// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { apiProgramsMine, apiMeStatus } from "../services/api";
import RoleBadge from "../components/RoleBadge";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("red");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [mine, st] = await Promise.all([apiProgramsMine(), apiMeStatus()]);
        if (!mounted) return;
        setItems(mine || []);
        setStatus(st?.status_color || "red");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>Dashboard</h2>
      <div style={{ margin: "10px 0" }}>
        สถานะ: <span style={{
          display: "inline-block", width: 10, height: 10, borderRadius: 999,
          background: status === "green" ? "#22c55e" : "#ef4444"
        }} /> {status}
      </div>

      <h3>รายการของฉัน</h3>
      {items.length === 0 ? (
        <div style={{ color: "#555" }}>ยังไม่มีสิทธิ์ในรายการใด — รอแอดมิน assign</div>
      ) : (
        <ul>
          {items.map(p => (
            <li key={p.id} style={{ marginBottom: 12 }}>
              <strong>{p.title}</strong>{" "}
              {Array.isArray(p.roles) && p.roles.map(r => <RoleBadge key={r} role={r} />)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
