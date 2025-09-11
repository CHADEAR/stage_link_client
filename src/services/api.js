// src/services/api.js
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ---------- Token helpers ----------

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function setAccessToken(tok) {
  if (tok) {
    localStorage.setItem(ACCESS_KEY, tok);
  } else {
    localStorage.removeItem(ACCESS_KEY);
  }
}

export function getAccessToken() {
  const tok = localStorage.getItem(ACCESS_KEY);
  if (!tok || tok === "null" || tok === "undefined") return null;
  return tok;
}

export function setRefreshToken(tok) {
  if (tok) localStorage.setItem(REFRESH_KEY, tok);
  else localStorage.removeItem(REFRESH_KEY);
}

export function getRefreshToken() {
  const tok = localStorage.getItem(REFRESH_KEY);
  if (!tok || tok === "null" || tok === "undefined") return null;
  return tok;
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ---------- Low-level fetch (+ auto refresh) ----------

async function doFetch(path, options = {}) {
  const { method = "GET", headers = {}, body, auth = false } = options;

  const h = { ...headers };
  if (body && !h["Content-Type"]) h["Content-Type"] = "application/json";
  if (!h["Accept"]) h["Accept"] = "application/json";

  // ✅ อ่าน token สดจาก localStorage ทุกครั้ง (ไม่พึ่งตัวแปรในหน่วยความจำ)
  if (auth) {
    const tok = getAccessToken();
    if (tok) h.Authorization = `Bearer ${tok}`;
  }

  const req = () =>
    fetch(`${baseURL}${path}`, {
      method,
      headers: h,
      body: body ? JSON.stringify(body) : undefined,
    });

  let res = await req();

  // ถ้า 401 และต้อง auth -> refresh แล้วลองใหม่ 1 ครั้ง
  if (res.status === 401 && auth) {
    const newAccess = await refreshAccessToken(); // ควร setAccessToken ภายในฟังก์ชันนี้แล้ว
    if (newAccess) {
      h.Authorization = `Bearer ${newAccess}`;
      res = await req();
    }
  }

  if (!res.ok) throw await parseErr(res);

  // รองรับ 204/ไม่มี body
  if (res.status === 204) return {};

  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function parseErr(res) {
  try {
    const data = await res.json();
    return new Error(data?.error || data?.message || `HTTP ${res.status}`);
  } catch {
    return new Error(`HTTP ${res.status}`);
  }
}

// ---------- Auth ----------

export async function register(email, password, username) {
  // backend ปัจจุบันไม่คืน token ใน /register
  return doFetch("/auth/register", { method: "POST", body: { email, password, username } });
}

export async function login(email, password) {
  const data = await doFetch("/auth/login", { method: "POST", body: { email, password } });
  setAccessToken(data.token);
  setRefreshToken(data.refreshToken);
  return data.user;
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const data = await doFetch("/auth/refresh", { method: "POST", body: { refreshToken: refresh } });
    setAccessToken(data.token);
    return data.token;
  } catch {
    clearTokens();
    return null;
  }
}

export async function logout() {
  try { await doFetch("/auth/logout", { method: "POST", auth: true }); } catch {
    // intentionally ignore errors during logout
  }
  clearTokens();
}

// ---------- Forgot / Verify / Reset ----------
export function forgotPasswordCode(email) {
  return doFetch("/auth/forgot", { method: "POST", body: { email } });
}

export function verifyPasswordCode(email, code) {
  return doFetch("/auth/verify-code", { method: "POST", body: { email, code } });
}

export function resetPasswordWithCode(email, code, password) {
  return doFetch("/auth/reset-code", { method: "POST", body: { email, code, password } });
}

