import React from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Layout from "./components/layout";
import ProtectedRoute from "./components/ProtectedRoute";

// pages
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/Register";
import ForgotPasswordPage from "./pages/OTP";
import Programme from "./pages/Programme";  
import Upload from "./pages/upload";
import User from "./pages/User";

import {
  login as apiLogin,
  register as apiRegister,
  getAccessToken
} from "./services/api";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

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
        {/* ✅ Public routes */}
        <Route path="/" element={<Programme />} />   
        <Route path="/upload" element={<Upload />} />
        <Route path="/user" element={<User />} />

        {/* Auth routes */}
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

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
