import React, { useState } from "react";
import "./OTP.css";
import logo from "../assets/Stage.png";

export default function ResetPasswordFlow({ onBackToLogin }) {
  const [step, setStep] = useState("email"); // email | otp | change
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    let newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  const handleVerifyEmail = () => {
    if (email) {
      setStep("otp");
      alert("OTP sent to " + email); // เพิ่มบรรทัดนี้เพื่อทดสอบ
    } else {
      alert("กรุณากรอกอีเมล");
    }
  };

  const handleVerifyOtp = () => {
    if (otp.join("").length === 6) {
      setStep("change");
    }
  };

  const handleChangePassword = () => {
    if (password && password === confirmPassword) {
      alert("Password changed successfully! ");
      if (onBackToLogin) onBackToLogin(); // กลับไปหน้า login
    } else {
      alert("Passwords do not match ❌");
    }
  };

  return (
    <div className="reset-container">
      <div className="logo">
        <img src={logo} alt="StageLink Logo" />
        <h2>StageLink</h2>
      </div>

      {/* STEP 1 : EMAIL */}
      {step === "email" && (
        <div className="reset-box">
          <h3>Reset your password</h3>
          <p>
            Forgotten your password? Enter your email address below, <br />
            and we’ll send an OTP to your email to verify it. <br />
            OTP is valid for 15 minute only.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); handleVerifyEmail(); }}>
            <div className="input-group">
              <span className="icon">📧</span>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="verify-btn" type="submit">
              Verify email OTP
            </button>
          </form>
        </div>
      )}

      {/* STEP 2 : OTP */}
      {step === "otp" && (
        <div className="reset-box">
          <h3>Reset your password</h3>
          <p>
            A 6 digit email OTP was sent to <b>{email}</b>. <br />
            Enter that code here to proceed
          </p>

          <div className="otp-inputs">
            {otp.map((data, index) => {
              return (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              );
            })}
          </div>

          <div className="btn-group">
            <button className="back-btn" onClick={() => setStep("email")}>
              Back
            </button>
            <button className="verify-btn" onClick={handleVerifyOtp}>
              Verify email OTP
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 : CHANGE PASSWORD */}
      {step === "change" && (
        <div className="reset-box">
          <div className="icon-lock">🔒</div>
          <h3>Change Password</h3>

          <div className="input-field">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-field">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="btn-group">
            <button className="back-btn" onClick={() => setStep("otp")}>
              Back
            </button>
            <button className="confirm-btn" onClick={handleChangePassword}>
              Change Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
