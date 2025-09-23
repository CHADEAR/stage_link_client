// src/pages/User.jsx  (หรือ UserTable.jsx ตามที่คุณใช้)
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import FrontSidebar from "../components/FrontSidebar";
import FrontNavbar from "../components/FrontNavbar";
import "./User.css";

import {
  apiAdminUserProgramRoles,
  apiAdminUsersWithoutProgram,
  apiAdminListPrograms,
  apiAdminAssignRole,
  // 👇 ถ้าต้องแก้ชื่อ/อีเมลจริง ให้ทำ API แยก เช่น apiAdminUpdateUser(userId, payload)
} from "../services/api";

const ROLE_OPTIONS = [
  { value: "mc",    label: "พิธีกร (MC)" },
  { value: "judge", label: "แสดงหลัก/กรรมการ (Judge)" },
  { value: "guest", label: "แขกรับเชิญ (Guest)" },
  { value: "voter", label: "ผู้ชม (Voter)" },
];

export default function UserTable() {
  const [sortOrder, setSortOrder] = useState("desc");
  const [filter, setFilter] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [profileImage, setProfileImage] = useState("");
  const fileInputRef = useRef(null);

  // Navbar time
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

  // ===== Data from API =====
  const [programs, setPrograms] = useState([]);
  const [rows, setRows] = useState([]);            // รวม Users×Programs×Roles (ตารางจริงจาก DB)
  const [orphans, setOrphans] = useState([]);      // users without program
  const [loading, setLoading] = useState(true);
  const [partialErr, setPartialErr] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setPartialErr(false);
    const results = await Promise.allSettled([
      apiAdminUserProgramRoles(),     // 0
      apiAdminUsersWithoutProgram(),  // 1
      apiAdminListPrograms(),         // 2
    ]);

    const val = (i) => (results[i].status === "fulfilled" ? results[i].value : null);
    const t = val(0) || [];
    const n = val(1) || [];
    const p = val(2) || [];

    setRows(Array.isArray(t) ? t : []);
    setOrphans(Array.isArray(n) ? n : []);
    setPrograms(Array.isArray(p) ? p : []);

    setPartialErr(results.some((r) => r.status === "rejected"));
    setLoading(false);

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const name = ["user-program-roles", "users/without-program", "programs"][i];
        console.warn(`[UserTable.loadAll] ${name} failed:`, r.reason);
      }
    });
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ===== Compose list for left table =====
  // แปลง rows (ที่มีหลายแถวต่อ user) ให้เหลือ “ล่าสุดต่อ user” เพื่อแสดงเป็นลิสต์เดียว
 const latestByUser = useMemo(() => {
  const m = new Map();
  for (const r of rows) {
    if (!m.has(r.user_id)) {
      m.set(r.user_id, {
        id: r.user_id,
        username: r.username || r.name || "",  // เผื่อใช้ต่อ
        name: r.name || r.username || "",      // ✅ ตอนนี้ r.name = username
        email: r.email,
        program: r.program_title,
        status: r.status_color === "green",
        role: r.program_role,
        title: r.program_title,
        image: "",
      });
    }
  }
  return Array.from(m.values());
}, [rows]);

  // รวมกับ orphans (คนที่ยังไม่มี program) → ใส่ program = "-"
  const users = useMemo(() => {
    const orphanMapped = orphans.map((u) => ({
  id: u.id,
  username: u.username || "",
  name: u.username || u.full_name || (u.email ? u.email.split("@")[0] : ""),
  email: u.email,
  program: "-",
  status: false,
  role: "-",
  title: "-",
  image: "",
}));

    return [...latestByUser, ...orphanMapped];
  }, [latestByUser, orphans]);

  // ===== Filter & Sort =====
  const filteredUsers = useMemo(() => {
    if (filter === "All") return users;
    return users.filter((u) => String(u.program || "-") === filter);
  }, [users, filter]);

  const sortedUsers = useMemo(() => {
    const arr = [...filteredUsers];
    arr.sort((a, b) => (sortOrder === "desc" ? b.id.localeCompare?.(a.id) ?? 0 : a.id.localeCompare?.(b.id) ?? 0));
    return arr;
  }, [filteredUsers, sortOrder]);

  // ===== Profile pane bindings =====
  useEffect(() => {
    if (selectedUser) {
      setProfileImage(selectedUser.image || "");
    }
  }, [selectedUser]);

  const handleEditProfile = () => {
    // ค่าเริ่มต้นของแบบฟอร์ม: ใช้ข้อมูลเดิม + program/role จากรายการล่าสุด
    setEditData({
      id: selectedUser.id,
      name: selectedUser.name,
      email: selectedUser.email,
      title: selectedUser.title === "-" ? "" : selectedUser.title,
      role: ["mc", "judge", "guest", "voter"].includes(selectedUser.role) ? selectedUser.role : "mc",
      programId: (() => {
        const found = programs.find((p) => p.title === selectedUser.program);
        return found ? found.id : (programs[0]?.id || "");
      })(),
    });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setProfileImage(selectedUser?.image || "");
  };

  // 👉 บันทึก = Assign role ให้ user ใน program ที่เลือก
  const handleSaveEdit = async () => {
    try {
      if (!editData?.id) return alert("ไม่พบผู้ใช้");
      if (!editData?.programId) return alert("กรุณาเลือก Program");
      if (!editData?.role) return alert("กรุณาเลือก Role");

      await apiAdminAssignRole({
        userId: editData.id,
        programId: editData.programId,
        role: editData.role,
      });

      // อัปเดตข้อมูลใน list ด้านซ้ายแบบง่าย ๆ: reload ทั้งหมด
      await loadAll();

      // ตั้งค่า selectedUser ใหม่ (ให้โชว์ค่าใหม่)
      const progTitle = programs.find((p) => p.id === editData.programId)?.title || "-";
      setSelectedUser((prev) => prev ? {
        ...prev,
        title: progTitle,
        program: progTitle,
        role: editData.role,
        image: profileImage, // รูปยังเป็นฝั่ง client
      } : prev);

      setEditMode(false);
    } catch (e) {
      alert(e?.message || "Assign ไม่สำเร็จ");
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // อัปโหลดรูป (ยังเก็บฝั่ง client อย่างเดียว)
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleCameraClick = () => {
    if (editMode && fileInputRef.current) fileInputRef.current.click();
  };

  // ===== UI =====
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
      <FrontSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div style={{ flex: 1, padding: 0, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <FrontNavbar dateStr={dateStr} timeStr={timeStr} />

        <div className="user-container" style={{ padding: 24 }}>
          {loading && <div style={{ marginBottom: 8 }}>กำลังโหลดข้อมูล…</div>}
          {partialErr && (
            <div style={{ background: "#fff7ed", border: "1px solid #fdba74", padding: 8, borderRadius: 6, marginBottom: 10 }}>
              ⚠️ โหลดข้อมูลบางส่วนไม่สำเร็จ แต่แสดงส่วนที่โหลดได้แล้ว
            </div>
          )}

          {/* Back button (เมื่ออยู่หน้าโปรไฟล์) */}
          {selectedUser && (
            <div style={{ marginBottom: 10 }}>
              <button
                className="back-btn"
                onClick={() => { setSelectedUser(null); setEditMode(false); }}
                title="Back"
              >
                ← <span style={{ fontSize: 15, marginLeft: 2 }}>back</span>
              </button>
            </div>
          )}

          {/* โปรไฟล์ / ตารางผู้ใช้ */}
          {selectedUser ? (
            <div className="profile-container">
              <div className="profile-image" style={{ cursor: editMode ? "pointer" : "default" }}>
                <img
                  src={profileImage || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                  alt="Profile"
                  onClick={editMode ? handleCameraClick : undefined}
                  style={editMode ? { border: "2px dashed #7cbbeb" } : {}}
                />
                <span
                  className="camera-icon"
                  onClick={handleCameraClick}
                  style={{ cursor: editMode ? "pointer" : "default" }}
                  title={editMode ? "Change profile picture" : ""}
                >
                  📷
                </span>
                {editMode && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                )}
              </div>

              <div className="profile-details">
                {editMode ? (
                  <>
                    {/* ชื่อ/อีเมล: ตอนนี้ไม่ยิง API จริง (ถ้าต้องแก้จริง สร้าง API เพิ่ม) */}
                    <label>
                      <strong>Name :</strong>
                      <input
                        name="name"
                        value={editData.name || ""}
                        onChange={handleChange}
                        style={{ marginLeft: 8 }}
                      />
                    </label>
                    <label>
                      <strong>Email :</strong>
                      <input
                        name="email"
                        value={editData.email || ""}
                        onChange={handleChange}
                        style={{ marginLeft: 8 }}
                      />
                    </label>

                    {/* Program & Role ที่จะ Assign */}
                    <label>
                      <strong>Program :</strong>
                      <select
                        name="programId"
                        value={editData.programId || ""}
                        onChange={handleChange}
                        style={{ marginLeft: 8 }}
                      >
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <strong>Role :</strong>
                      <select
                        name="role"
                        value={editData.role || "mc"}
                        onChange={handleChange}
                        style={{ marginLeft: 8 }}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </label>

                    <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
                      <button className="edit-btn" onClick={handleSaveEdit}>Save</button>
                      <button className="edit-btn" onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>Name :</strong>  {selectedUser.username}</p>
                    <p><strong>Email :</strong> {selectedUser.email}</p>
                    <p><strong>Program :</strong> {selectedUser.title}</p>
                    <p><strong>Role :</strong> {selectedUser.role}</p>
                    <button className="edit-btn" onClick={handleEditProfile} style={{ marginRight: 10 }}>
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="header" style={{ flexDirection: "row", alignItems: "center", position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <h2 style={{ margin: 0, fontWeight: 700 }}>User</h2>
                </div>
                <div className="controls">
                  {/* Filter: ใช้ชื่อโปรแกรมจาก DB */}
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="All">All</option>
                    <option value="-">No Program</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.title}>{p.title}</option>
                    ))}
                  </select>

                  {/* Sort */}
                  <button onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}>⇅</button>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Program</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.program}</td>
                      <td>
                        <span
                          className={`status-dot ${user.status ? "active" : "inactive"}`}
                          title={user.status ? "Active" : "Inactive"}
                        />
                      </td>
                      <td>{user.role}</td>
                      <td>
                        <button
                          style={{
                            padding: "4px 12px",
                            borderRadius: "6px",
                            border: "1px solid #007bff",
                            background: "#fff",
                            color: "#007bff",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                          onClick={() => { setSelectedUser(user); setEditMode(false); }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!sortedUsers.length && (
                    <tr><td colSpan={5} style={{ color: "#666" }}>— ไม่มีข้อมูล —</td></tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
