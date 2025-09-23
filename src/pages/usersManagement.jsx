// src/pages/AdminUsers.jsx
import { useEffect, useState, useCallback } from "react";
import {
  apiAdminUserProgramRoles,
  apiAdminUsersWithoutProgram,
  apiAdminListPrograms,
  apiAdminAssignRole,
  apiAdminRemoveRole
} from "../services/api";
import RoleBadge from "../components/RoleBadge";

const ROLE_OPTIONS = [
  { value: "mc",    label: "พิธีกร (MC)" },
  { value: "judge", label: "แสดงหลัก/กรรมการ (Judge)" },
  { value: "guest", label: "แขกรับเชิญ (Guest)" },
  { value: "voter", label: "ผู้ชม (Voter)" },
];

export default function AdminUsers() {
  const [table, setTable] = useState([]);
  const [noProg, setNoProg] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [assign, setAssign] = useState({ userId: "", programId: "", role: "mc" });
  const [busy, setBusy] = useState(false);
  const [partialErr, setPartialErr] = useState(false);

  // ใช้ allSettled เพื่อให้ส่วนที่โหลดสำเร็จยังแสดงได้
  const loadAll = useCallback(async () => {
    const results = await Promise.allSettled([
      apiAdminUserProgramRoles(),     // 0
      apiAdminUsersWithoutProgram(),  // 1
      apiAdminListPrograms()          // 2
    ]);

    const pick = (i) => (results[i].status === "fulfilled" ? results[i].value : []);

    const t = pick(0);
    const n = pick(1);
    const p = pick(2);

    setTable(Array.isArray(t) ? t : []);
    setNoProg(Array.isArray(n) ? n : []);
    setPrograms(Array.isArray(p) ? p : []);

    // ตั้งค่า programId เริ่มต้นหากยังไม่ได้เลือก
    if (Array.isArray(p) && p.length) {
      setAssign((a) => (a.programId ? a : { ...a, programId: p[0].id }));
    }

    // ถ้ามีตัวไหนล้ม ให้ขึ้น warning เล็ก ๆ
    setPartialErr(results.some((r) => r.status === "rejected"));

    // log เพื่อ debug
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const name = ["user-program-roles", "users/without-program", "programs"][i];
        console.warn(`[AdminUsers.loadAll] ${name} failed:`, r.reason);
      }
    });
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function onAssign(e) {
    e.preventDefault();
    if (!assign.userId) return alert("กรุณากรอก User ID");
    if (!assign.programId) return alert("กรุณาเลือก Program");
    if (!assign.role) return alert("กรุณาเลือก Role");

    setBusy(true);
    try {
      await apiAdminAssignRole(assign);
      setAssign((a) => ({ ...a, userId: "" }));
      await loadAll();
    } catch (err) {
      alert(err?.message || "Assign ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(userId, programId, role) {
    setBusy(true);
    try {
      await apiAdminRemoveRole({ userId, programId, role });
      await loadAll();
    } finally {
      setBusy(false);
    }
  }

  const noProgramsYet = programs.length === 0;

  return (
    <div style={{ maxWidth: 1000, margin: "20px auto" }}>
      <h2>Admin: User Management</h2>

      {partialErr && (
        <div style={{ background: "#fff7ed", border: "1px solid #fdba74", padding: 8, borderRadius: 6, margin: "8px 0" }}>
          ⚠️ โหลดข้อมูลบางส่วนไม่สำเร็จ แต่ยังแสดงข้อมูลที่โหลดได้ให้แล้ว
        </div>
      )}

      <section style={{ margin: "16px 0", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>Assign Role ให้ผู้ใช้</h3>

        {noProgramsYet && (
          <div style={{ background: "#eef2ff", border: "1px solid #c7d2fe", padding: 8, borderRadius: 6, marginBottom: 10 }}>
            ยังไม่มี Program — ไปสร้างที่เมนู <strong>Admin: Programs</strong> ก่อน แล้วกลับมาหน้านี้
          </div>
        )}

        <form onSubmit={onAssign} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            style={{ minWidth: 260 }}
            placeholder="User ID (UUID)"
            value={assign.userId}
            onChange={(e) => setAssign((a) => ({ ...a, userId: e.target.value }))}
          />

          <select
            disabled={noProgramsYet}
            value={assign.programId}
            onChange={(e) => setAssign((a) => ({ ...a, programId: e.target.value }))}
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <select
            value={assign.role}
            onChange={(e) => setAssign((a) => ({ ...a, role: e.target.value }))}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>

          <button disabled={busy || noProgramsYet || !assign.userId} type="submit">Assign</button>
        </form>

        <small style={{ color: "#666" }}>
          TIP: ดู “Users without program” ด้านล่างเพื่อ copy userId
        </small>
      </section>

      <section style={{ margin: "16px 0" }}>
        <h3>Users × Programs × Roles</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>User</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Program</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Role</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Status</th>
              <th style={{ borderBottom: "1px solid #ccc" }}></th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr key={i}>
                <td>
                  {row.name}
                  <div style={{ color: "#666", fontSize: 12 }}>{row.email}</div>
                </td>
                <td>{row.program_title}</td>
                <td><RoleBadge role={row.program_role} /></td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: row.status_color === "green" ? "#22c55e" : "#ef4444"
                    }}
                  />{" "}
                  {row.status_color}
                </td>
                <td>
                  <button
                    disabled={busy}
                    onClick={() => onRemove(row.user_id, row.program_id, row.program_role)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!table.length && (
              <tr>
                <td colSpan={5} style={{ color: "#666" }}>ยังไม่มีการ assign</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section style={{ margin: "16px 0" }}>
        <h3>Users without program</h3>
        <ul>
          {noProg.map((u) => (
            <li key={u.id}>
              <code>{u.id}</code> — {u.email} {u.full_name ? `(${u.full_name})` : ""}
            </li>
          ))}
          {!noProg.length && <li style={{ color: "#666" }}>— ว่าง —</li>}
        </ul>
      </section>
    </div>
  );
}
