// src/pages/Admin.jsx
import React, { useState, useEffect, useRef } from "react";
import FrontNavbar from "../components/Topbar";
import FrontSidebar from "../components/Sidebar";
import "./Admin.css";

// ใช้ setUserAccess จาก api.js เป็น apiAdminAssignRole
import { setUserAccess as apiAdminAssignRole, listProgrammes } from "../services/api";

export default function Admin() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // เวลา/วันที่ สำหรับ Navbar
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
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

  // ✅ โหลด admin จริงจาก localStorage
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const [admin, setAdmin] = useState(storedUser);

  // state สำหรับ edit mode
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(admin);
  const [profileImage, setProfileImage] = useState(admin.avatar || "");
  const fileInputRef = useRef(null);

  // รายการ programme
  const [programs, setPrograms] = useState([]);
  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await listProgrammes();
        setPrograms(res);
      } catch (e) {
        console.error("โหลดรายการ programmes ไม่ได้", e);
      }
    }
    fetchPrograms();
  }, []);

  // --- event handler ---
  const handleEditProfile = () => {
    setEditData(admin);
    setProfileImage(admin.avatar || "");
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setProfileImage(admin.avatar || "");
  };

  const handleSaveEdit = async () => {
    try {
      if (!editData.id) return alert("ไม่พบผู้ใช้");
      if (!editData.role) return alert("กรุณาเลือก Role");

      // ส่ง API จริงเหมือน User.jsx
      await apiAdminAssignRole(editData.id, {
        programme_id: editData.programId || null,
        role: editData.role,
      });

      const progTitle =
        programs.find((p) => p.id === editData.programId)?.title || "-";

      const updatedAdmin = {
        ...editData,
        avatar: profileImage,
        title: progTitle,
      };

      // อัปเดต state + localStorage
      setAdmin(updatedAdmin);
      localStorage.setItem("user", JSON.stringify(updatedAdmin));

      setEditMode(false);
      alert("✅ บันทึกข้อมูลสำเร็จ");
    } catch (e) {
      alert(e?.message || "❌ Assign role ไม่สำเร็จ");
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
      {/* Sidebar */}
      <FrontSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <FrontNavbar dateStr={dateStr} timeStr={timeStr} />

        {/* Content */}
        <div className="admin-profile-container" style={{ padding: 24 }}>
          <h2>Admin</h2>
          <div className="admin-profile-content">
            <div
              className="admin-avatar"
              style={{ cursor: editMode ? "pointer" : "default" }}
            >
              <img
                src={profileImage || admin.avatar || "/default-avatar.png"}
                alt="avatar"
                onClick={handleCameraClick}
                style={editMode ? { border: "2px dashed #7cbbeb" } : {}}
              />
              <div
                className="camera-icon"
                onClick={handleCameraClick}
                style={{ cursor: editMode ? "pointer" : "default" }}
                title={editMode ? "Change profile picture" : ""}
              >
                📷
              </div>
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

            <div className="admin-info">
              {editMode ? (
                <>
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
                  <label>
                    <strong>Programme :</strong>
                    <select
                      name="programId"
                      value={editData.programId || ""}
                      onChange={handleChange}
                      style={{ marginLeft: 8 }}
                    >
                      <option value="">-- Select Programme --</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <strong>Role :</strong>
                    <select
                      name="role"
                      value={editData.role || ""}
                      onChange={handleChange}
                      style={{ marginLeft: 8 }}
                    >
                      <option value="Team">Team</option>
                      <option value="SuperAdmin">SuperAdmin</option>
                      <option value="Moderator">Moderator</option>
                    </select>
                  </label>

                  <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
                    <button className="edit-profile-btn" onClick={handleSaveEdit}>
                      Save
                    </button>
                    <button className="edit-profile-btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p><strong>Name :</strong> {admin.name}</p>
                  <p><strong>Email :</strong> {admin.email}</p>
                  <p><strong>Title :</strong> {admin.title}</p>
                  <p><strong>Role :</strong> {admin.role}</p>
                  <button className="edit-profile-btn" onClick={handleEditProfile}>
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
