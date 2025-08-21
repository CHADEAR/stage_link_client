// src/services/api.js
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// -------------------- Token helpers --------------------
let accessToken = null; // memory
const REFRESH_KEY = "refreshToken"; // localStorage

export function setAccessToken(tok) { accessToken = tok || null; }
export function getAccessToken() { return accessToken; }
export function setRefreshToken(tok) { if (tok) localStorage.setItem(REFRESH_KEY, tok); }
export function getRefreshToken() { return localStorage.getItem(REFRESH_KEY); }
export function clearTokens() { accessToken = null; localStorage.removeItem(REFRESH_KEY); }

// -------------------- Low-level fetch with auto-refresh --------------------
async function request(path, { method = "GET", headers = {}, body, auth = false } = {}) {
  const finalHeaders = { ...(headers || {}) };
  if (auth && accessToken) finalHeaders["Authorization"] = `Bearer ${accessToken}`;
  if (body && !finalHeaders["Content-Type"]) finalHeaders["Content-Type"] = "application/json";

  const doFetch = async () =>
    fetch(`${baseURL}${path}`, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  // ถ้า access หมดอายุบน endpoint ที่ต้อง auth -> ลอง refresh 1 ครั้งแล้ว retry
  if (res.status === 401 && auth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      finalHeaders["Authorization"] = `Bearer ${newAccess}`;
      res = await doFetch();
    }
  }

  if (!res.ok) throw await errorFromResponse(res);
  return safeJson(res);
}

// อ่าน JSON แบบปลอดภัย (กรณีไม่มี body)
async function safeJson(res) {
  try { return await res.json(); }
  catch { return null; }
}

// map error ให้เป็นข้อความสวย ๆ ตาม code/ข้อความ
function normalizeErrorMessage(raw, code) {
  if (code === "EMAIL_EXISTS") return "อีเมลนี้ถูกใช้ไปแล้ว";
  if (code === "USER_NOT_FOUND") return "ไม่พบบัญชีผู้ใช้นี้";
  if (code === "BAD_PASSWORD")   return "รหัสผ่านไม่ถูกต้อง";
  if (code === "MISSING_TOKEN")  return "กรุณาเข้าสู่ระบบใหม่";
  if (code === "INVALID_TOKEN")  return "เข้าสู่ระบบหมดอายุ/ไม่ถูกต้อง";
  if (code === "INPUT_REQUIRED") return "กรอกข้อมูลให้ครบถ้วน";

  const m = String(raw || "").toLowerCase();
  if (m.includes("invalid credentials")) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (m.includes("email exists")) return "อีเมลนี้ถูกใช้ไปแล้ว";
  if (m.includes("email & password required")) return "กรอกอีเมลและรหัสผ่านให้ครบ";
  return raw || "เกิดข้อผิดพลาด";
}

async function errorFromResponse(res) {
  let data = null;
  try { data = await res.json(); } catch { /* ignore JSON parse errors */ }
  const rawMsg = data?.error || data?.message || res.statusText;
  const code = data?.code || null;
  const nice = normalizeErrorMessage(rawMsg, code);

  const err = new Error(nice);
  err.status = res.status;
  err.code = code;
  err.raw = rawMsg;
  return err;
}

// -------------------- Auth API --------------------
export async function register(email, password, username) {
  const data = await request("/auth/register", {
    method: "POST",
    body: { email, password, username },
  });
  
  return data.user; 
}

export async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setAccessToken(data.token);
  setRefreshToken(data.refreshToken);
  return data.user;
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const data = await request("/auth/refresh", {
      method: "POST",
      body: { refreshToken: refresh },
    });
    setAccessToken(data.token);
    return data.token;
  } catch {
    clearTokens();
    return null;
  }
}

export async function logout() {
  try { await request("/auth/logout", { method: "POST", auth: true }); } catch { /* ignore JSON parse errors */}
  clearTokens();
}

// Forgot / Reset (OTP)
export async function forgotPasswordCode(email) {
  return request("/auth/forgot", { method: "POST", body: { email } });
}
export async function resetPasswordWithCode(email, code, password) {
  return request("/auth/reset-code", { method: "POST", body: { email, code, password } });
}

// -------------------- Notes API --------------------
export async function listNotes() {
  return request("/notes", { method: "GET" });
}
export async function createNote(body) {
  return request("/notes", { method: "POST", auth: true, body: { body } });
}
