import React from "react";
import "./SignUpPage.css";
import logo from "../Stage.png";

function SignUpPage({ onSwitchToLogin }) {
  return (
    <div className="signup-container">
    <img src={logo} alt="Stage Logo" className="logo" />
    <div className="logo-text">StageLink</div>
      <h2>Sign Up</h2>
      <div className="signup-input-box">
        <input type="text" placeholder="Username" />
      </div>
      <div className="signup-input-box">
        <input type="email" placeholder="Email" />
      </div>
      <div className="signup-input-box">
        <input type="password" placeholder="Password" />
      </div>
      <button className="signup-btn">Sign Up</button>
      <p className="signup-switch-text">
        Already have an account?{" "}
        <a href="#" onClick={onSwitchToLogin}>
          Login
        </a>
      </p>
    </div>
  );
}

export default SignUpPage;