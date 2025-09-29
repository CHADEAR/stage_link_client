import React, { useState } from "react";
import "./Register.css";
import logo from "../assets/Stage.png";
import { register as apiRegister } from "../services/api";

function SignUpPage({ onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      // backend ใช้ full_name แทน username
      await apiRegister({ email, password, full_name: username });
      setSuccess("Registered. You can log in now.");
    } catch (e) {
      setError(e.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-logo">
        <img src={logo} alt="StageLink" />
      </div>
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create an account</h2>
        <input type="text" placeholder="Full name" value={username} onChange={(e)=>setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Sign up"}</button>
        {success && <p className="signup-ok">{success}</p>}
        {error && <p className="signup-error">{error}</p>}
        <p className="signup-switch">
          Already have an account?{" "}
          <a href="#" onClick={(e)=>{e.preventDefault(); onSwitchToLogin?.();}}>Login</a>
        </p>
      </form>
    </div>
  );
}

export default SignUpPage;
