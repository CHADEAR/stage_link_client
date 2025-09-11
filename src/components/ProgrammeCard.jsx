import React from "react";
import "./ProgrammeCard.css";
import Img from "../assets/news.jpg";

function StatusDot({ status = "green" }) {
  return <span className={`status-dot ${status}`} />;
}

export default function ProgrammeCard({ title, time, img, status }) {
  return (
    <div className="prog-card">
      <div className="thumb">
        <img src={Img}  />
      </div>

      <div className="prog-body">
        <div className="line">
          <StatusDot status={status} />
          <span className="label">รายการ {title}</span>
        </div>
        <div className="time">ถ่ายทอดเวลา : {time}</div>

        <div className="action-row">
          <button className="detail-btn">รายละเอียดการจัดรายการ</button>
        </div>
      </div>
    </div>
  );
}
