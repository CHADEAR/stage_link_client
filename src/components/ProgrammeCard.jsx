import React from "react";
import "./ProgrammeCard.css";
import Fallback from "../assets/news.jpg"; // รูปสำรองเมื่อโหลดรูปจริงไม่สำเร็จ

function StatusDot({ status = "green" }) {
  return <span className={`status-dot ${status}`} />;
}

export default function ProgrammeCard({ title, time, status, imageUrl }) {
  return (
    <div className="prog-card">
      <div className="thumb">
        <img
          src={imageUrl || Fallback}
          alt={title}
          loading="lazy"
          decoding="async"
          // กันลูป onError (ถ้า fallback ก็พัง จะไม่เรียก onError ซ้ำ)
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = Fallback; }}
        />
      </div>

      <div className="prog-body">
        <div className="hdline">
          <div className="line">
            <StatusDot status={status} />
            <span className="label">รายการ {title}</span>
          </div>
          <div className="time">ถ่ายทอดเวลา : {time}</div>
        </div>

        <div className="action-row">
          <button className="detail-btn">รายละเอียดการจัดรายการ</button>
        </div>
      </div>
    </div>
  );
}
