import React, { useState } from "react";
import "./Login.css";
import logo from "../assets/Stage.png";

function LoginPage({ onSwitchToSignUp, onSubmit, onSwitchToForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // state สำหรับ error
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit?.({ email, password });
    } catch (err) {
      // ใช้ message/code จาก api.js ที่ normalize มาแล้ว
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="logo">
        <img src={logo} alt="Stage Logo" />
        <div className="logo-text-login">StageLink</div>
      </div>

      <h2>Login</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="input-box">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <span
          className="forgot-password"
          style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline", display: "block", marginBottom: "10px" }}
          onClick={onSwitchToForgotPassword}
        >
          Forgot Password?
        </span>

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="signup-text">
        Don’t have an account?{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitchToSignUp?.();
          }}
        >
          Sign up
        </a>
      </p>
    </div>
  );
}

export default LoginPage;
