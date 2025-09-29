import React, { useState } from "react";
import "./OTP.css";
import logo from "../assets/Stage.png";
import { forgot as forgotPasswordCode, reset as resetPasswordWithCode } from "../services/api";

export default function ResetPasswordFlow({ onBackToLogin }) {
  const [step, setStep] = useState("email"); // email | otp | change
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const otpValue = otp.join("");

  async function handleSendEmail(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      await forgotPasswordCode(email);
      setMsg("We sent a 6-digit code to your email (dev: console log).");
      setStep("otp");
    } catch (e) {
      setErr(e.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(i, val) {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
  }

  function proceedToChange(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    if (otpValue.length !== 6) {
      setErr("Please enter the 6-digit code.");
      return;
    }
    // ไม่มี endpoint verify แยก → ไปขั้นเปลี่ยนรหัสเลย
    setStep("change");
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    if (!password || password !== confirmPassword) {
      setErr("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      await resetPasswordWithCode(email, otpValue, password);
      setMsg("Password changed. You can sign in now.");
    } catch (e) {
      setErr(e.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="otp-wrapper">
      <div className="otp-logo">
        <img src={logo} alt="StageLink" />
      </div>

      {step === "email" && (
        <form className="otp-card" onSubmit={handleSendEmail}>
          <h2>Forgot Password</h2>
          <p>Enter your email to receive a reset code.</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="otp-btn" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Code"}
          </button>
          {msg && <p className="otp-note otp-ok">{msg}</p>}
          {err && <p className="otp-note otp-error">{err}</p>}
          <button type="button" className="otp-link" onClick={onBackToLogin}>Back to Login</button>
        </form>
      )}

      {step === "otp" && (
        <form className="otp-card" onSubmit={proceedToChange}>
          <h2>Enter Code</h2>
          <div className="otp-boxes">
            {otp.map((v, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={v}
                onChange={(e) => handleOtpChange(i, e.target.value)}
              />
            ))}
          </div>
          <button className="otp-btn" type="submit">Continue</button>
          {msg && <p className="otp-note otp-ok">{msg}</p>}
          {err && <p className="otp-note otp-error">{err}</p>}
        </form>
      )}

      {step === "change" && (
        <form className="otp-card" onSubmit={handleChangePassword}>
          <h2>Set New Password</h2>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button className="otp-btn" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Change Password"}
          </button>
          {msg && <p className="otp-note otp-ok">{msg}</p>}
          {err && <p className="otp-note otp-error">{err}</p>}
          <button type="button" className="otp-link" onClick={onBackToLogin}>Back to Login</button>
        </form>
      )}
    </div>
  );
}
