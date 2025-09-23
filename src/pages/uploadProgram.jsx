// src/pages/AdminPrograms.jsx
import { useEffect, useState } from "react";
import { apiAdminCreateProgram, apiAdminListPrograms } from "../services/api";

export default function AdminPrograms() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState([]);

  async function load() {
    const list = await apiAdminListPrograms();
    setItems(list || []);
  }
  useEffect(() => { load(); }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await apiAdminCreateProgram({ title: title.trim(), category: category.trim() || null });
    setTitle(""); setCategory("");
    await load();
  }

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h2>Admin: Programs</h2>

      <form onSubmit={onSubmit} style={{ display: "flex", gap: 10, margin: "10px 0" }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (optional)" />
        <button type="submit">Upsert</button>
      </form>

      <h3>รายการทั้งหมด</h3>
      <ul>
        {items.map(p => (
          <li key={p.id}><strong>{p.title}</strong> {p.category ? <em>({p.category})</em> : null}</li>
        ))}
      </ul>
    </div>
  );
}
