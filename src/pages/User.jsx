import React, { useState, useEffect, useRef } from "react";
import FrontSidebar from "../components/FrontSidebar";
import FrontNavbar from "../components/FrontNavbar";
import "./User.css";

export default function UserTable() {
  const [sortOrder, setSortOrder] = useState("desc");
  const [filter, setFilter] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [profileImage, setProfileImage] = useState(""); // เพิ่ม state สำหรับรูปโปรไฟล์
  const fileInputRef = useRef(null);

  // สำหรับแสดงวันที่และเวลาใน FrontNavbar
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

  const [users, setUsers] = useState([
    {
      id: 3,
      name: "chatchaya jinda",
      program: "IoT",
      status: false,
      role: "User",
      email: "chatchaya@gmail.com",
      title: "IoT",
      image: "",
    },
    {
      id: 2,
      name: "chadear suwan",
      program: "Vote",
      status: true,
      role: "User",
      email: "chadear@gmail.com",
      title: "Vote",
      image: "",
    },
    {
      id: 1,
      name: "pimlada sangsawad",
      program: "News",
      status: true,
      role: "User",
      email: "pimlada@gmail.com",
      title: "News",
      image: "",
    },
  ]);

  // กรองตามหมวดหมู่
  const filteredUsers =
    filter === "All" ? users : users.filter((u) => u.program === filter);

  // เรียงตาม id (ใหม่ไปเก่า)
  const sortedUsers = [...filteredUsers].sort((a, b) =>
    sortOrder === "desc" ? b.id - a.id : a.id - b.id
  );

  // เมื่อเลือก user ให้แสดงรูปที่เคยอัปโหลดไว้
  useEffect(() => {
    if (selectedUser) {
      setProfileImage(selectedUser.image || "");
    }
  }, [selectedUser]);

  // เริ่มแก้ไข
  const handleEditProfile = () => {
    setEditData(selectedUser);
    setEditMode(true);
  };

  // ยกเลิกแก้ไข
  const handleCancelEdit = () => {
    setEditMode(false);
    setProfileImage(selectedUser.image || "");
  };

  // บันทึกข้อมูล
  const handleSaveEdit = () => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editData.id ? { ...u, ...editData, image: profileImage } : u
      )
    );
    setSelectedUser({ ...editData, image: profileImage });
    setEditMode(false);
  };

  // อัปเดตค่า input
  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // อัปโหลดรูปโปรไฟล์
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // คลิกที่ไอคอนกล้องเพื่อเลือกไฟล์
  const handleCameraClick = () => {
    if (editMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}
    >
      <FrontSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        style={{
          flex: 1,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <FrontNavbar dateStr={dateStr} timeStr={timeStr} />

        <div className="user-container" style={{ padding: 24 }}>
          {/* ปุ่ม back เฉพาะหน้าโปรไฟล์ */}
          {selectedUser && (
            <div style={{ marginBottom: 10 }}>
              <button
                className="back-btn"
                onClick={() => {
                  setSelectedUser(null);
                  setEditMode(false);
                }}
                title="Back"
              >
                ← <span style={{ fontSize: 15, marginLeft: 2 }}>back</span>
              </button>
            </div>
          )}
          {/* ถ้าเลือก user แล้ว → แสดงหน้าโปรไฟล์ */}
          {selectedUser ? (
            <div className="profile-container">
              <div className="profile-image" style={{ cursor: editMode ? "pointer" : "default" }}>
                <img
                  src={
                    profileImage ||
                    "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  }
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
                {/* input file ซ่อน */}
                {editMode && (
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                )}
              </div>
              <div className="profile-details">
                {editMode ? (
                  <>
                    <label>
                      <strong>Name :</strong>
                      <input
                        name="name"
                        value={editData.name}
                        onChange={handleChange}
                        style={{ marginLeft: 8 }}
                      />
                    </label>
                    <label>
                      <strong>Email :</strong>
                      <input
                        name="email"
                        value={editData.email}
                        onChange={handleChange}
                        style={{ marginLeft: 8 }}
                      />
                    </label>
                    <label>
                      <strong>Title :</strong>
                      <input
                        name="title"
                        value={editData.title}
                        onChange={handleChange}
                        style={{ marginLeft: 8 }}
                      />
                    </label>
                    <label>
                      <strong>Role :</strong>
                      <input
                        name="role"
                        value={editData.role}
                        onChange={handleChange}
                        style={{ marginLeft: 8 }}
                      />
                    </label>
                    <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
                      <button className="edit-btn" onClick={handleSaveEdit}>
                        Save
                      </button>
                      <button className="edit-btn" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Name :</strong> {selectedUser.name}
                    </p>
                    <p>
                      <strong>Email :</strong> {selectedUser.email}
                    </p>
                    <p>
                      <strong>Title :</strong> {selectedUser.title}
                    </p>
                    <p>
                      <strong>Role :</strong> {selectedUser.role}
                    </p>
                    <button
                      className="edit-btn"
                      onClick={handleEditProfile}
                      style={{ marginRight: 10 }}
                    >
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
                  <h2 style={{ margin: "0 0 0 0", fontWeight: 700 }}>User</h2>
                </div>
                <div className="controls">
                  {/* Filter หมวดหมู่ */}
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="News">News</option>
                    <option value="Vote">Vote</option>
                    <option value="IoT">IoT</option>
                  </select>
                  {/* Sort */}
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                    }
                  >
                    ⇅
                  </button>
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
                          className={`status-dot ${
                            user.status ? "active" : "inactive"
                          }`}
                          title={user.status ? "Active" : "Inactive"}
                        ></span>
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
                          onClick={() => {
                            setSelectedUser(user);
                            setEditMode(false);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
