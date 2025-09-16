// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Layout from "./components/layout";
import ProtectedRoute from "./components/ProtectedRoute";

// pages (public)
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/Register";
import ForgotPasswordPage from "./pages/OTP";

// pages (protected)
import ProgrammeList from "./pages/ProgrammeList";        // ✅ หน้าแบบ “รูปที่ 1”
import ProgrammeDetail from "./pages/ProgrammeDetail";    // หน้ารายละเอียดรายการ
import StudioManage from "./pages/StudioManage";
import LightsControl from "./pages/LightsControl";
import Vote1 from "./pages/Vote1";
import Test from "./pages/Test";

// api
import { login as apiLogin, register as apiRegister, getAccessToken } from "./services/api";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogin({ email, password }) {
    await apiLogin(email.trim(), password);
    const from = location.state?.from?.pathname || "/programme";
    navigate(from, { replace: true });
  }

  async function handleRegister({ email, password, username }) {
    await apiRegister(email.trim(), password, username);
    alert("สมัครสำเร็จ กรุณาเข้าสู่ระบบ");
    navigate("/login", { replace: true });
  }

  return (
    <Routes>
      {/* ===== Public routes (ไม่มี Sidebar) ===== */}
      <Route
        path="/login"
        element={
          !getAccessToken() ? (
            <LoginPage
              onSubmit={handleLogin}
              onSwitchToSignUp={() => navigate("/register")}
              onSwitchToForgotPassword={() => navigate("/forgot-password")}
            />
          ) : (
            <Navigate to="/programme" replace />
          )
        }
      />
      <Route
        path="/register"
        element={
          !getAccessToken() ? (
            <SignUpPage onSubmit={handleRegister} onSwitchToLogin={() => navigate("/login")} />
          ) : (
            <Navigate to="/programme" replace />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          <ForgotPasswordPage
            onBackToLogin={() => navigate("/login")}
            onSubmit={(email) => alert(`Reset link sent to ${email}`)}
          />
        }
      />

      {/* ===== Protected routes (ใต้ Layout → มี Sidebar/Topbar) ===== */}
      <Route element={<Layout />}>
        <Route element={<ProtectedRoute />}>
          {/* ให้ root ไปหน้า ProgrammeList */}
          <Route path="/" element={<Navigate to="/programme" replace />} />

          {/* ✅ ใช้หน้า ProgrammeList แบบ “รูปที่ 1” */}
          <Route path="/programme" element={<ProgrammeList />} />

          {/* รายละเอียดรายการ + หน้าย่อย */}
          <Route path="/programme/:showId" element={<ProgrammeDetail />} />
          <Route path="/programme/:showId/studio" element={<StudioManage />} />
          <Route path="/programme/:showId/lights" element={<LightsControl />} />
          <Route path="/programme/:showId/vote" element={<Vote1 />} />

          {/* อื่น ๆ */}
          <Route path="/test" element={<Test />} />
        </Route>

        {/* not found */}
        <Route
          path="*"
          element={<Navigate to={getAccessToken() ? "/programme" : "/login"} replace />}
        />
      </Route>
    </Routes>
  );
}
