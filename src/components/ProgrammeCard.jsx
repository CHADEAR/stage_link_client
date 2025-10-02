import React from "react";
import "./ProgrammeCard.css";
import Fallback from "../assets/news.jpg"; // รูปสำรองเมื่อโหลดรูปจริงไม่สำเร็จ

function StatusDot({ status = "green" }) {
  return <span className={`status-dot ${status}`} />;
}

export default function ProgrammeCard({ title, time, status, imageUrl, children, onDetailClick }) {
  return (
    <div className="prog-card">
      <div className="thumb">
        <img
          src={imageUrl || Fallback}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = Fallback;
          }}
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
          {/* ✅ กรณีส่ง children เข้ามา */}
          {children}

          {/* ✅ หรือใช้ prop onDetailClick */}
          {onDetailClick && (
            <button className="detail-btn" onClick={onDetailClick}>
              รายละเอียดการจัดการ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
