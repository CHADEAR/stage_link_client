// src/pages/Upload.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import FrontSidebar from "../components/Sidebar";
import FrontNavbar from "../components/Topbar";
import "./Upload.css";

import { createProgramme, uploadProgrammeFile } from "../services/api";

export default function UploadPage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("th-TH", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("th-TH", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // ฟิลด์ฟอร์ม (ตรงกับคอลัมน์ DB)
  const [title, setTitle] = React.useState("นักร้องข้ามกำแพง");
  const [shootDate, setShootDate] = React.useState(() => {
    const tz = now.getTimezoneOffset() * 60 * 1000;
    return new Date(now.getTime() - tz).toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [startTime, setStartTime] = React.useState("12:00"); // TIME (HH:MM)
  const [endTime, setEndTime] = React.useState("15:00");     // TIME (HH:MM)
  const [details, setDetails] = React.useState("schedule");

  // ไฟล์ที่จะอัปโหลด (program_uploads)
  const [file, setFile] = React.useState(null);
  const [previewImage, setPreviewImage] = React.useState(null);

  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();

  const handleFilePick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f && f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewImage(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreviewImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("กรุณากรอกชื่อรายการ");
    if (!file) return alert("กรุณาเลือกไฟล์ที่จะอัปโหลด");

    // ✅ ตรวจสอบรูปแบบเบื้องต้น
    const hhmm = /^\d{2}:\d{2}$/;
    if (!hhmm.test(startTime) || !hhmm.test(endTime)) {
      return alert("เวลาไม่ถูกต้อง (รูปแบบ HH:MM)");
    }
    if (shootDate && !/^\d{4}-\d{2}-\d{2}$/.test(shootDate)) {
      return alert("วันที่ถ่ายทำไม่ถูกต้อง (รูปแบบ YYYY-MM-DD)");
    }
    // (ตัวเลือก) ตรวจว่า end > start
    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    if (toMin(endTime) <= toMin(startTime)) {
      return alert("เวลาสิ้นสุด ต้องมากกว่าเวลาเริ่มต้น");
    }

    try {
      setSubmitting(true);

      const description = (details || "").trim();

      // ✅ 1) สร้างรายการ พร้อมผูกคอลัมน์เวลา/วันที่จริงลง DB
      const programme = await createProgramme({
        title: title.trim(),
        description,
        shoot_date: shootDate,   // ✅ map -> programmes.shoot_date (DATE)
        start_time: startTime,   // ✅ map -> programmes.start_time (TIME)
        end_time: endTime,       // ✅ map -> programmes.end_time (TIME)
        // category / cover_image ยังไม่ใช้ในฟอร์มนี้
      });

      // ✅ 2) อัปโหลดไฟล์ผูกกับรายการ (program_uploads)
      await uploadProgrammeFile({
        programme_id: programme.id,
        file
      });

      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        navigate("/"); // หรือ "/programme"
      }, 1200);

    } catch (err) {
      console.error("[Upload] submit error:", err);
      alert(err?.message || "อัปโหลดไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
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
            <div style={{
              background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb",
              borderRadius: 6, padding: "12px 20px", marginBottom: 20,
              fontWeight: "bold", fontSize: 16, textAlign: "center"
            }}>
              อัพโหลดเสร็จสิ้น
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="content" style={{ gap: 40 }}>
              {/* ฝั่งซ้าย: กล่องเลือกไฟล์ */}
              <div className="left-panel" style={{ width: 320 }}>
                <div
                  className="video-box"
                  style={{
                    height: 220, cursor: "pointer", position: "relative", overflow: "hidden",
                    border: "2px dashed #a7a6a6ff", background: "#efefefff",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                  onClick={handleFilePick}
                  title="คลิกเพื่ออัปโหลดไฟล์"
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", color: "#666" }}>
                      <div style={{ fontSize: 32, marginBottom: 6 }}>+</div>
                      <div style={{ fontSize: 13 }}>
                        {file ? file.name : "อัปโหลดไฟล์ (รูป/วิดีโอ/เอกสาร)"}
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="*/*"
                    onChange={handleFileChange}
                  />
                </div>

                <button className="menu-btn" type="button">การจัดการสตูดิโอ</button>
                <button className="menu-btn" type="button">การควบคุมไฟ</button>
                <button className="menu-btn" type="button">การโหวต</button>
              </div>

              {/* ฝั่งขวา: ฟอร์มข้อมูลรายการ */}
              <div className="right-panel" style={{ flex: 1 }}>
                <div className="form-group">
                  <label>ชื่อรายการ</label>
                  <div className="input-with-icon">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="เช่น นักร้องข้ามกำแพง"
                      required
                    />
                    <button className="edit-btn-upload" type="button">✎</button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>วันที่ถ่ายทำ</label>
                    <input
                      type="date"
                      value={shootDate}
                      onChange={(e) => setShootDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>เวลาถ่ายทำ</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <span style={{ alignSelf: "center" }}>ถึง</span>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>รายละเอียดการถ่ายทำ</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="เช่น สคริปต์/คิวกล้อง/หมายเหตุ"
                  />
                </div>

                <button
                  className="submit-btn"
                  style={{ width: "100%", marginTop: 20 }}
                  disabled={submitting}
                >
                  {submitting ? "กำลังอัปโหลด..." : "บันทึกการอัปโหลด"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
