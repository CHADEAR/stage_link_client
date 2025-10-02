// src/components/ProgrammeCard.jsx
import React from "react";
import "./ProgrammeCard.css";
import Fallback from "../assets/news.jpg";

function StatusDot({ status = "green" }) {
  return <span className={`status-dot ${status}`} />;
}

/** onOpen: ฟังก์ชันที่ถูกเรียกเมื่อกดปุ่มรายละเอียด */
export default function ProgrammeCard({ title, time, status, imageUrl, onOpen, children }) {
  const onImgError = (e) => { e.currentTarget.src = Fallback; };

  return (
    <div className="prog-card">
      <div className="thumb">
        <img src={imageUrl || Fallback} alt={title} onError={onImgError} loading="lazy" />
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
          {children ?? (
            <button className="detail-btn" onClick={onOpen}>
              รายละเอียดการจัดรายการ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
