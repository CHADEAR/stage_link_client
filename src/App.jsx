// src/App.jsx
import { useEffect, useState } from "react";
import {
  listNotes, createNote,
  login, register as apiRegister,
  forgotPasswordCode, resetPasswordWithCode,  // << เปลี่ยนชื่อฟังก์ชัน
  logout, refreshAccessToken,
  getAccessToken, setAccessToken, getRefreshToken
} from "./services/api";

export default function App() {
  // auth state
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register' | 'forgot' | 'reset'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // forgot/reset state (ใช้ email + code + new password)
  const [forgotInfo, setForgotInfo] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");      // 6 หลัก
  const [resetNewPass, setResetNewPass] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  // notes state
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  // ตอนเปิดหน้า: ถ้ามี refreshToken ลอง refresh access เพื่อ restore session
  useEffect(() => {
    (async () => {
      if (getRefreshToken()) {
        const ok = await refreshAccessToken();
        if (ok) setUser({ email: "(restored)", role: "(unknown)" });
      }
    })();
  }, []);

  // โหลดโน้ต
  async function refreshNotes() {
    setLoading(true);
    try {
      const data = await listNotes();
      setNotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refreshNotes(); }, []);

  // เพิ่มโน้ต (ต้อง logged-in)
  async function onAddNote(e) {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    try {
      await createNote(v);
      setText("");
      await refreshNotes();
    } catch (e) {
      alert(`สร้างโน้ตไม่สำเร็จ: ${e.message}`);
    }
  }

  // Login / Register
  async function onSubmitAuth(e) {
    e.preventDefault();
    setAuthError("");
    try {
      let u;
      if (authMode === "login") {
        u = await login(email.trim(), password);
      } else if (authMode === "register") {
        u = await apiRegister(email.trim(), password);
      } else {
        return;
      }
      setUser(u);
      setEmail("");
      setPassword("");
      await refreshNotes();
    } catch (e) {
      setAuthError(e.message || "เกิดข้อผิดพลาด");
    }
  }

  function onLogout() {
    logout().finally(() => {
      setUser(null);
      setAccessToken(null);
    });
  }

  // Forgot: ขอรหัส 6 หลัก
  async function onSubmitForgot(e) {
    e.preventDefault();
    setForgotInfo("");
    try {
      const r = await forgotPasswordCode(email.trim());
      if (r?.code && import.meta.env.MODE !== "production") {
        setForgotInfo(`รหัสสำหรับ dev: ${r.code} (หมดอายุใน ${r.expiresInMin} นาที)`);
        setResetEmail(email.trim()); // เติมให้อัตโนมัติไปหน้า reset
      } else {
        setForgotInfo("ถ้าอีเมลนี้มีอยู่ เราได้ส่งรหัสยืนยันไปแล้ว");
      }
    } catch (e) {
      setForgotInfo(e.message || "เกิดข้อผิดพลาด");
    }
  }

  // Reset: ใช้ email + code + new password
  async function onSubmitReset(e) {
    e.preventDefault();
    setResetMsg("");
    try {
      await resetPasswordWithCode(resetEmail.trim(), resetCode.trim(), resetNewPass);
      setResetMsg("ตั้งรหัสผ่านใหม่สำเร็จ! โปรดไปหน้า Login");
      setResetNewPass("");
      setResetCode("");
    } catch (e) {
      setResetMsg(e.message || "รีเซ็ตไม่สำเร็จ");
    }
  }

  const loggedIn = !!getAccessToken();

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Stage Link — Demo</h1>

      {/* Auth panel */}
      {!loggedIn ? (
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 24 }}>
          {/* tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {["login","register","forgot","reset"].map(m => (
              <button
                key={m}
                onClick={() => setAuthMode(m)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  background: authMode === m ? "#eee" : "#fff"
                }}
              >
                {m === "login" ? "Login"
                 : m === "register" ? "Register"
                 : m === "forgot" ? "Forgot Password (Code)"
                 : "Reset Password (Code)"}
              </button>
            ))}
          </div>

          {/* forms */}
          {(authMode === "login" || authMode === "register") && (
            <form onSubmit={onSubmitAuth} style={{ display: "grid", gap: 8 }}>
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <button type="submit" style={{ padding: 10, borderRadius: 6, border: "1px solid #999" }}>
                {authMode === "login" ? "Login" : "Register"}
              </button>
              {authError && <p style={{ color: "crimson", margin: 0 }}>{authError}</p>}
            </form>
          )}

          {authMode === "forgot" && (
            <form onSubmit={onSubmitForgot} style={{ display: "grid", gap: 8 }}>
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <button type="submit" style={{ padding: 10, borderRadius: 6, border: "1px solid #999" }}>
                ส่งรหัสรีเซ็ต
              </button>
              {forgotInfo && <p style={{ margin: 0 }}>{forgotInfo}</p>}
            </form>
          )}

          {authMode === "reset" && (
            <form onSubmit={onSubmitReset} style={{ display: "grid", gap: 8 }}>
              <input
                type="email"
                placeholder="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <input
                type="text"
                placeholder="6-digit code"
                value={resetCode}
                onChange={e => setResetCode(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <input
                type="password"
                placeholder="new password"
                value={resetNewPass}
                onChange={e => setResetNewPass(e.target.value)}
                required
                style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
              />
              <button type="submit" style={{ padding: 10, borderRadius: 6, border: "1px solid #999" }}>
                ตั้งรหัสใหม่
              </button>
              {resetMsg && <p style={{ margin: 0 }}>{resetMsg}</p>}
            </form>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <span>✅ Logged in</span>
          <button onClick={onLogout} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc" }}>
            Logout
          </button>
        </div>
      )}

      {/* Notes */}
      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Notes</h2>

        <form onSubmit={onAddNote} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={getAccessToken() ? "Type note..." : "Login ก่อนจึงจะเพิ่มได้"}
            disabled={!getAccessToken()}
            style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
          />
          <button type="submit" disabled={!getAccessToken()} style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid #999" }}>
            Add
          </button>
        </form>

        {loading ? <p>Loading…</p> : (
          <ul style={{ paddingLeft: 18 }}>
            {notes.map(n => (
              <li key={n.id} style={{ marginBottom: 6 }}>
                <strong>#{n.id}</strong> — {n.body}{" "}
                <em style={{ opacity: 0.7 }}>({new Date(n.created_at).toLocaleString()})</em>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
