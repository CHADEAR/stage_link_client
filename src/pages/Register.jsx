import React, { useState } from "react";
import "./Register.css";
import logo from "../assets/Stage.png";

function SignUpPage({ onSwitchToLogin, onSubmit }) {
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit?.({ username, email, password });
  }

  return (
    <div className="signup-container">
      <img src={logo} alt="Stage Logo" className="logo" />
      <div className="logo-text-register">StageLink</div>
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit}>
        <div className="signup-input-box">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        <div className="signup-input-box">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="signup-input-box">
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="signup-btn" type="submit">Sign Up</button>
      </form>

      <p className="signup-switch-text">
        Already have an account?{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin?.(); }}>
          Login
        </a>
      </p>
    </div>
  );
}

export default SignUpPage;
