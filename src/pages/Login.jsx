import React from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "../components/LoginPage.css";
import logo from "../Stage.png";

function LoginPage({ onSwitchToSignUp }) {
  return (
    <div className="login-container">
      <img src={logo} alt="Stage Logo" className="logo" />
      <div className="logo-text">StageLink</div>

      <h2>Login</h2>

      <div className="input-box">
        <input type="email" placeholder="Email" />
      </div>

      <div className="input-box">
        <input type="password" placeholder="Password" />
      </div>

      <span className="forgot-password">Forgot Password?</span>

      <button className="login-btn">Login</button>

      <p className="signup-text">
        Don’t have an account?{" "}
        <a href="#" onClick={onSwitchToSignUp}>
          Sign up
        </a>
      </p>
    </div>
  );
}

export default LoginPage;

