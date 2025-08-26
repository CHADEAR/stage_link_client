import React, { useState } from "react";
import "./Login.css";
import logo from "../assets/Stage.png";

function LoginPage({ onSwitchToSignUp, onSubmit, onSwitchToForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit?.({ email, password });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={logo} alt="Stage Logo" />
        <div className="login-logo-text">StageLink</div>
      </div>

      <h2 className="login-title">Login</h2>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="login-input-box">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="login-input-box">
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
          className="login-forgot"
          onClick={onSwitchToForgotPassword}
        >
          Forgot Password?
        </span>

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        
        {error && <div className="login-error">{error}</div>}
      </form>

      <p className="login-switch-text">
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
