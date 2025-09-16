// src/pages/ProgrammeDetail.jsx
import { NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import "./ProgrammeDetail.css";

export default function ProgrammeDetail() {
  const { showId } = useParams(); // เช่น "the-voice"
  const navigate = useNavigate();  // ✅ ใช้สำหรับปุ่ม Back

  const title =
    showId?.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ") ||
    "The Voice";

  const formattedDate = new Date().toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="programme-grid">
      {/* คอลัมน์ซ้าย (ข้อมูลรายการ + ปุ่ม) */}
      <aside className="left-pane">
        <h2 className="section-title">Reality Show</h2>

        <div className="show-card">
          <img
            src="/assets/The-Voice.jpg"   // ✅ ชื่อไฟล์ต้องตรงตัวเล็ก-ใหญ่กับใน public/assets
            alt="The Voice"
            className="show-img"
          />

          <div className="show-meta">
            <div className="live-row">
              <span className="live-dot" />
              <span className="show-name">รายการ {title}</span>
            </div>
            <div className="air-time">ถ่ายทอดเวลา : 11.00 น. - 14.00 น.</div>
          </div>

          <div className="action-stack">
            <NavLink
              to="studio"
              className={({ isActive }) =>
                "action-btn" + (isActive ? " active" : "")
              }
            >
              จัดการสตูดิโอ
            </NavLink>

            <NavLink
              to="lights"
              className={({ isActive }) =>
                "action-btn" + (isActive ? " active" : "")
              }
            >
              ควบคุมแสงไฟ
            </NavLink>

            <NavLink
              to="vote"
              className={({ isActive }) =>
                "action-btn" + (isActive ? " active" : "")
              }
            >
              โหวต
            </NavLink>
          </div>
        </div>
      </aside>

      {/* คอลัมน์ขวา (พื้นที่รายละเอียด) */}
      <section className="right-pane">
        {/* ✅ ปุ่ม Back */}
        <button
          onClick={() => navigate("/programme")}  // ถ้าอยากย้อนหน้าก่อนหน้าใช้ navigate(-1)
          className="back-btn"
        >
          ← Back
        </button>

        {/* แถบหัวด้านบนของเพจ */}
        <div className="page-topbar">
          <h3 className="page-title">Programme</h3>
          <span className="top-date">{formattedDate}</span>
          <div className="spacer" />
          
        </div>

        {/* การ์ดรายละเอียดด้านขวา */}
        <div className="detail-panel">
          <div className="detail-placeholder">
            รายละเอียดการถ่ายทอด การดำเนินการของรายการ
          </div>

          {/* child routes จะเรนเดอร์ในนี้ */}
          <Outlet />
        </div>
      </section>
    </div>
  );
}
