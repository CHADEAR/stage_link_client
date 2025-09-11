import React from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Layout from "./components/layout";
import ProtectedRoute from "./components/ProtectedRoute";

// pages
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/Register";
import ForgotPasswordPage from "./pages/OTP";
import Programme from "./pages/Programme";   // ⬅️ หน้าหลักใหม่

import {
  login as apiLogin,
  register as apiRegister,
  getAccessToken
} from "./services/api";

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
    await apiRegister(email.trim(), password, username);
    alert("สมัครสำเร็จ กรุณาเข้าสู่ระบบ");
    navigate("/login", { replace: true });
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* เส้นทางที่ต้องล็อกอินก่อน */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Programme />} />   {/* ⬅️ หน้าแรก = Programme */}
        </Route>

        {/* public routes */}
        <Route
          path="/login"
          element={
            !getAccessToken()
              ? (
                <LoginPage
                  onSubmit={handleLogin}
                  onSwitchToSignUp={() => navigate("/register")}
                  onSwitchToForgotPassword={() => navigate("/forgot-password")}
                />
              )
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
              onSubmit={(email) => alert(`Reset link sent to ${email}`)}
            />
          }
        />

        {/* not found */}
        <Route path="*" element={<Navigate to={getAccessToken() ? "/" : "/login"} replace />} />
      </Route>
    </Routes>
  );
}
