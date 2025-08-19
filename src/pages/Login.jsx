import React, { useState } from "react";
import "./Login.css";
import logo from "../assets/Stage.png";

function LoginPage({ onSwitchToSignUp, onSubmit }) {
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

        {/* ข้าม reset password ตามที่ตกลง */}
        {/* <span className="forgot-password">Forgot Password?</span> */}

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
