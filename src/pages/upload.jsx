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
    </div>
  );
}
