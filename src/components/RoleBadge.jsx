// src/components/RoleBadge.jsx
export default function RoleBadge({ role }) {
  const map = {
    mc: "พิธีกร (MC)",
    judge: "แสดงหลัก/กรรมการ",
    guest: "แขกรับเชิญ",
    voter: "ผู้ชม",
  };
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", marginRight: 6,
      borderRadius: 999, background: "#eef", fontSize: 12
    }}>
      {map[role] || role}
    </span>
  );
}
