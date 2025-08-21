import React, { useState } from "react";
import "./Login.css";
import logo from "../assets/Stage.png";

function LoginPage({ onSwitchToSignUp, onSubmit, onSwitchToForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit?.({ email, password });
  }

  return (
    <div className="login-container">
      <img src={logo} alt="Stage Logo" className="logo" />
      <div className="logo-text">StageLink</div>

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div className="input-box">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <div className="input-box">
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <span
          className="forgot-password"
          style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline", display: "block", marginBottom: "10px" }}
          onClick={onSwitchToForgotPassword}
        >
          Forgot Password?
        </span>

        <button className="login-btn" type="submit">Login</button>
      </form>

      <p className="signup-text">
        Don’t have an account?{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignUp?.(); }}>
          Sign up
        </a>
      </p>
    </div>
  );
}

export default LoginPage;
