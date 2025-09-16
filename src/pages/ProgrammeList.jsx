// src/pages/ProgrammeList.jsx
import { useNavigate } from "react-router-dom";
import "./ProgrammeList.css";

export default function ProgrammeList() {
  const navigate = useNavigate();

  // วันเวลาในแถบบน (สไตล์ “วันอาทิตย์ 30 สิงหาคม 2568”)
  const thaiFullDate = new Date().toLocaleDateString("th-TH", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // mock data รายการเดียวให้เหมือนภาพ
  const programme = {
    id: "the-voice",
    title: "The Voice",
    time: "ถ่ายทอดเวลา: 11.00 น. - 14.00 น.",
    img: "/assets/The-Voice.jpg", // ใส่ไว้ที่ public/assets/the-voice.jpg
    live: true,
  };

  return (
    <div className="programme-page">
      {/* แถวหัว */}
      <div className="page-head">
        <h2 className="heading">Programme</h2>

        <div className="head-tools">
          <span className="date-pill">วัน{thaiFullDate}</span>

          <div className="icon-group">
            <button className="icon-btn" title="ปฏิทิน">📅</button>
            <button className="icon-btn" title="ผู้ใช้">👥</button>
          </div>

          
        </div>
      </div>

      {/* รายการโปรแกรม (การ์ดเล็ก + รายละเอียดข้างขวาเล็กน้อย) */}
      <div className="list-area">
        <div className="prog-item" onClick={() => navigate(`/programme/${programme.id}`)}>
          <img className="thumb" src={programme.img} alt={programme.title} />

          <div className="meta">
            <div className="row1">
              {programme.live && <span className="dot-live" />}
              <div className="title-wrap">
                <div className="title">รายการ {programme.title}</div>
                <div className="time">{programme.time}</div>
              </div>
            </div>

            <button
              type="button"
              className="pill-btn"
              onClick={(e) => { e.stopPropagation(); navigate(`/programme/${programme.id}`); }}
            >
              รายละเอียดการจัดรายการ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
