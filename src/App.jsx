import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Layout from "./components/layout";
import ProtectedRoute from "./components/ProtectedRoute";

// pages
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/Register";
import ForgotPasswordPage from "./pages/OTP";

// api
import {
  listNotes, createNote,
  login as apiLogin, register as apiRegister,
  getAccessToken
} from "./services/api";

function HomePage() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshNotes() {
    setLoading(true);
    try {
      const data = await listNotes();
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshNotes();
  }, []);

  async function onAddNote(e) {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    await createNote(v);
    setText("");
    await refreshNotes();
  }

  return (
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
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // handlers สำหรับส่งเข้า Login / Register pages
  async function handleLogin({ email, password }) {
    await apiLogin(email.trim(), password);
    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
  }

  async function handleRegister({ email, password, username }) {
    // ถ้า API ต้องการ username ให้ส่ง ถ้าไม่จำเป็นก็ข้ามได้
    await apiRegister(email.trim(), password, username);
    navigate("/", { replace: true });
  }

  const [page, setPage] = useState("login");

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* เส้นทางที่ล็อกอินแล้วเท่านั้น */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* public routes */}
        <Route
          path="/login"
          element={
            !getAccessToken()
              ? <LoginPage
                  onSubmit={handleLogin}
                  onSwitchToSignUp={() => navigate("/register")}
                  onSwitchToForgotPassword={() => navigate("/forgot-password")}
                />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/register"
          element={
            !getAccessToken()
              ? <SignUpPage onSubmit={handleRegister} onSwitchToLogin={() => navigate("/login")} />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage
              onBackToLogin={() => navigate("/login")}
              onSubmit={(email) => {
                // handle forgot password logic here
                alert(`Reset link sent to ${email}`);
              }}
            />
          }
        />

        {/* not found */}
        <Route path="*" element={<Navigate to={getAccessToken() ? "/" : "/login"} replace />} />
      </Route>
    </Routes>
  );
}