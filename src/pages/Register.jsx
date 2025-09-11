import React, { useState } from "react";
import "./Register.css";
import logo from "../assets/Stage.png";

function SignUpPage({ onSwitchToLogin, onSubmit }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await onSubmit?.({ username, email, password });
      setSuccess("Sign up successful! You can login now.");
      onSwitchToLogin?.();
    } catch (err) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-logo-container">
        <img src={logo} alt="Stage Logo" className="signup-logo" />
        <div className="signup-logo-text">StageLink</div>
      </div>
      <h2 className="signup-title">Sign Up</h2>

      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-input-box">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="signup-input-box">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="signup-input-box">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="signup-error">{error}</div>}
        {success && <div className="signup-success">{success}</div>}

        <button className="signup-btn" type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <p className="signup-switch-text">
        Already have an account?{" "}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSwitchToLogin?.();
          }}
        >
          Login
        </a>
      </p>
    </div>
  );
}

export default SignUpPage;
