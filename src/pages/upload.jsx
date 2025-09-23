// src/pages/Upload.jsx
export default function Upload() {
  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>Upload (Demo)</h2>
      <p>ยังไม่ได้ต่อ API อัปโหลดจริง — หน้านี้เป็น placeholder สำหรับทดสอบการป้องกันด้วย ProtectedRoute</p>
      <ol>
        <li>อนาคต: ดึงรายการที่ฉันมีสิทธิ์ แล้วให้เลือก program</li>
        <li>เลือกไฟล์ → POST /uploads (ต้องเพิ่มฝั่ง backend)</li>
      </ol>
import React from "react";
import { useNavigate } from "react-router-dom";
import FrontSidebar from "../components/FrontSidebar";
import FrontNavbar from "../components/FrontNavbar";
import "./Upload.css";

export default function UploadPage() {
  const now = new Date();
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

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [startTime, setStartTime] = React.useState("12:00");
  const [endTime, setEndTime] = React.useState("15:00");
  const [previewImage, setPreviewImage] = React.useState(null);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current && fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      navigate("/programme"); // ไปหน้า Programme หลังอัพโหลดเสร็จ
    }, 1500); // แสดงข้อความ 1.5 วินาที
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}>
      <FrontSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <FrontNavbar dateStr={dateStr} timeStr={timeStr} />
        <div className="upload-container" style={{ maxWidth: "none", width: "100%", padding: "40px 32px" }}>
          <h2 className="title" style={{ marginBottom: 40 }}>อัปโหลดรายการ</h2>
          {uploadSuccess && (
            <div
              style={{
                background: "#d4edda",
                color: "#155724",
                border: "1px solid #c3e6cb",
                borderRadius: 6,
                padding: "12px 20px",
                marginBottom: 20,
                fontWeight: "bold",
                fontSize: 16,
                textAlign: "center"
              }}
            >
              อัพโหลดเสร็จสิ้น
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="content" style={{ gap: 40 }}>
              {/* ฝั่งซ้าย */}
              <div className="left-panel" style={{ width: 320 }}>
                <div
                  className="video-box"
                  style={{
                    height: 220,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    border: "2px dashed #b0b0b0",
                    background: "#eaeaea",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onClick={handleBoxClick}
                  title="คลิกเพื่ออัปโหลดรูป"
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block"
                      }}
                    />
                  ) : (
                    <span className="play-icon" style={{ fontSize: 32, color: "#888" }}>+</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                  {!previewImage && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 10,
                        left: 0,
                        width: "100%",
                        textAlign: "center",
                        color: "#888",
                        fontSize: 13
                      }}
                    >
                      อัปโหลดรูปภาพ
                    </span>
                  )}
                </div>
                <button className="menu-btn" type="button">การจัดการสตูดิโอ</button>
                <button className="menu-btn" type="button">การควบคุมไฟ</button>
                <button className="menu-btn" type="button">การโหวต</button>
              </div>

              {/* ฝั่งขวา */}
              <div className="right-panel" style={{ flex: 1 }}>
                <div className="form-group">
                  <label>ชื่อรายการ</label>
                  <div className="input-with-icon">
                    <input type="text" defaultValue="นักร้องข้ามกำแพง" />
                    <button className="edit-btn" type="button">✎</button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>วันที่ถ่ายทำ</label>
                    <input type="date" defaultValue="2025-09-12" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>เวลาถ่ายทำ</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <span style={{ alignSelf: "center" }}>ถึง</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>รายละเอียดการถ่ายทำ</label>
                  <textarea defaultValue="schedule"></textarea>
                </div>

                <button className="submit-btn" style={{ width: "100%", marginTop: 20 }}>
                  บันทึกการอัปโหลด
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
