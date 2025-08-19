// src/api.js
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// -------------------- Token helpers --------------------
let accessToken = null; // memory
const REFRESH_KEY = "refreshToken"; // localStorage

export function setAccessToken(tok) {
  accessToken = tok || null;
}
export function getAccessToken() {
  return accessToken;
}
export function setRefreshToken(tok) {
  if (tok) localStorage.setItem(REFRESH_KEY, tok);
}
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}
export function clearTokens() {
  accessToken = null;
  localStorage.removeItem(REFRESH_KEY);
}

// -------------------- Low-level fetch with auto-refresh --------------------
async function request(path, { method = "GET", headers = {}, body, auth = false } = {}) {
  const finalHeaders = { ...(headers || {}) };
  if (auth && accessToken) {
    finalHeaders["Authorization"] = `Bearer ${accessToken}`;
  }
  if (body && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(`${baseURL}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // ถ้า access หมดอายุ → ลอง refresh แล้ว retry 1 ครั้ง
  if (res.status === 401 && auth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      finalHeaders["Authorization"] = `Bearer ${newAccess}`;
      const res2 = await fetch(`${baseURL}${path}`, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res2.ok) throw await errorFromResponse(res2);
      return res2.json();
    }
  }

  if (!res.ok) throw await errorFromResponse(res);
  return res.json();
}

async function errorFromResponse(res) {
  let msg = `HTTP ${res.status}`;
  try {
    const data = await res.json();
    if (data?.error) msg = data.error;
    else if (data?.message) msg = data.message;
  } catch {
    // intentionally empty: ignore errors during logout
  }
  return new Error(msg);
}

// -------------------- Auth API --------------------
export async function register(email, password) {
  const data = await request("/auth/register", { method: "POST", body: { email, password } });
  setAccessToken(data.token);
  setRefreshToken(data.refreshToken);
  return data.user;
}

export async function login(email, password) {
  const data = await request("/auth/login", { method: "POST", body: { email, password } });
  setAccessToken(data.token);
  setRefreshToken(data.refreshToken);
  return data.user;
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const data = await request("/auth/refresh", { method: "POST", body: { refreshToken: refresh } });
    setAccessToken(data.token);
    return data.token;
  } catch {
    clearTokens();
    return null;
  }
}

export async function logout() {
  try { await request("/auth/logout", { method: "POST", auth: true }); } catch {
    // intentionally empty: ignore errors during logout
  }
  clearTokens();
}

// Forgot / Reset
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
