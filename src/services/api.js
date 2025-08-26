// src/services/api.js
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ---------- Token helpers ----------
let accessToken = null;
const REFRESH_KEY = "refreshToken";

export function setAccessToken(tok) { accessToken = tok || null; }
export function getAccessToken() { return accessToken; }
export function setRefreshToken(tok) { if (tok) localStorage.setItem(REFRESH_KEY, tok); }
export function getRefreshToken() { return localStorage.getItem(REFRESH_KEY); }
export function clearTokens() { accessToken = null; localStorage.removeItem(REFRESH_KEY); }

// ---------- Low-level fetch (+ auto refresh) ----------
async function doFetch(path, options = {}) {
  const { method = "GET", headers = {}, body, auth = false } = options;
  const h = { ...headers };
  if (auth && accessToken) h.Authorization = `Bearer ${accessToken}`;
  if (body && !h["Content-Type"]) h["Content-Type"] = "application/json";

  const res = await fetch(`${baseURL}${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });

  // ถ้า access หมดอายุและเป็น endpoint ที่ต้อง auth → ลอง refresh แล้ว retry 1 ครั้ง
  if (res.status === 401 && auth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      h.Authorization = `Bearer ${newAccess}`;
      const res2 = await fetch(`${baseURL}${path}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
      if (!res2.ok) throw await parseErr(res2);
      return res2.json();
    }
  }

  if (!res.ok) throw await parseErr(res);
  // บาง endpoint อาจตอบ {ok:true} หรือไม่มี body → พยายาม parse ถ้าไม่ได้ให้คืน {} แทน
  try { return await res.json(); } catch { return {}; }
}

async function parseErr(res) {
  try {
    const data = await res.json();
    throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  } catch {
    throw new Error(`HTTP ${res.status}`);
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

// ---------- Notes ----------
export function listNotes() {
  return doFetch("/notes", { method: "GET" });
}
export function createNote(body) {
  return doFetch("/notes", { method: "POST", auth: true, body: { body } });
}
