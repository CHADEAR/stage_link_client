import React, { useState } from "react";
import "./OTP.css";
import logo from "../assets/Stage.png";
import { 
  forgotPasswordCode, 
  resetPasswordWithCode, 
  verifyPasswordCode, 
} from "../services/api";

export default function ResetPasswordFlow({ onBackToLogin }) {
  const [step, setStep] = useState("email"); // email | otp | change
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleOtpChange = (el, index) => {
    if (isNaN(el.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = el.value;
    setOtp(newOtp);
    if (el.nextSibling && el.value !== "") el.nextSibling.focus();
  };

  async function handleVerifyEmail(e) {
    e?.preventDefault?.();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const r = await forgotPasswordCode(email.trim());
      if (r?.code) {
        setMsg(`DEV: โค้ดคือ ${r.code} (หมดอายุใน ${r.expiresInMin} นาที)`);
      } else {
        setMsg("ถ้าอีเมลนี้มีอยู่ ระบบได้ส่ง OTP ไปแล้ว");
      }
      setStep("otp");
    } catch (e) {
      setErr(e.message || "ส่ง OTP ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setErr(""); setMsg("");

    const code = otp.join("");
    if (code.length !== 6) {
      setErr("กรุณากรอก OTP ให้ครบ 6 หลัก");
      return;
    }

    setLoading(true);
    try {
      await verifyPasswordCode(email.trim(), code);
      setMsg("OTP ถูกต้อง โปรดตั้งรหัสผ่านใหม่");
      setStep("change");
    } catch (e) {
      setErr(e.message || "OTP ไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e?.preventDefault?.();
    setErr(""); setMsg(""); setLoading(true);
    try {
      if (!password) throw new Error("กรุณากรอกรหัสผ่านใหม่");
      if (password !== confirmPassword) throw new Error("รหัสผ่านไม่ตรงกัน");
      const code = otp.join("");
      await resetPasswordWithCode(email.trim(), code, password);
      setMsg("ตั้งรหัสผ่านใหม่สำเร็จ! โปรดไปที่หน้า Login");
      setPassword(""); setConfirmPassword("");
      onBackToLogin?.();
    } catch (e) {
      setErr(e.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="otp-container">
      <div className="otp-logo">
        <img src={logo} alt="StageLink Logo" />
        <h2 className="otp-logo-text">StageLink</h2>
      </div>

      {/* STEP 1 : EMAIL */}
      {step === "email" && (
        <div className="otp-box">
          <h3 className="otp-title">Reset your password</h3>
          <p className="otp-desc">
            Forgotten your password? Enter your email address below,<br />
            and we’ll send an OTP to your email.<br />
            OTP is valid for 15 minute only.
          </p>
          <form className="otp-form" onSubmit={handleVerifyEmail}>
            <div className="otp-input-group">
              <span className="otp-icon"></span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="otp-btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Verify email OTP"}
            </button>
          </form>
          {msg && <p className="otp-note otp-ok">{msg}</p>}
          {err && <p className="otp-note otp-error">{err}</p>}
        </div>
      )}

      {/* STEP 2 : OTP */}
      {step === "otp" && (
        <div className="otp-box">
          <h3 className="otp-title">Reset your password</h3>
          <p className="otp-desc">
            A 6 digit email OTP was sent to <b>{email}</b>.<br />
            Enter that code here to proceed
          </p>

          <div className="otp-inputs">
            {otp.map((v, idx) => (
              <input
                key={idx}
                type="text"
                maxLength="1"
                value={v}
                onChange={(e) => handleOtpChange(e.target, idx)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          <button className="otp-btn" onClick={handleVerifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify email OTP"}
          </button>

          <div style={{ marginTop: 12 }}>
            <button className="otp-link-btn" onClick={handleVerifyEmail} disabled={loading}>
              Resend OTP
            </button>
          </div>

          {msg && <p className="otp-note otp-ok">{msg}</p>}
          {err && <p className="otp-note otp-error">{err}</p>}
        </div>
      )}

      {/* STEP 3 : CHANGE PASSWORD */}
      {step === "change" && (
        <div className="otp-box">
          <h3 className="otp-title">Change Password</h3>

          <form className="otp-form" onSubmit={handleChangePassword}>
            <div className="otp-input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="otp-input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button className="otp-btn" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Change Password"}
            </button>
          </form>
          {msg && <p className="otp-note otp-ok">{msg}</p>}
          {err && <p className="otp-note otp-error">{err}</p>}
        </div>
      )}
    </div>
  );
}
