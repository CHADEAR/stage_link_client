// src/services/api.js
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/** =====================
 * Token helpers (localStorage)
 * ====================== */
const ACCESS_KEY = "stagelink_access_token";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}
export function setAccessToken(token) {
  if (token) localStorage.setItem(ACCESS_KEY, token);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
}

// (stub เพื่อให้ useAuth ไม่พัง)
export function getRefreshToken() { return null; }
export async function refreshAccessToken() {
  return getAccessToken();
}

/** =====================
 * Auth
 * ====================== */
export async function login(email, password) {
  const data = await doFetch("/auth/login", { method: "POST", body: { email, password } });
  if (data?.token) setAccessToken(data.token);
  return data;
}
export async function logout() {
  clearTokens();
  return { ok: true };
}
export async function register({ email, password, full_name }) {
  return doFetch("/auth/register", { method: "POST", body: { email, password, full_name } });
}
export async function forgot(email) {
  return doFetch("/auth/forgot", { method: "POST", body: { email } });
}
export async function reset(email, otp, newPassword) {
  return doFetch("/auth/reset", { method: "POST", body: { email, otp, new_password: newPassword } });
}

/** =====================
 * Programmes
 * ====================== */
export async function listProgrammes(params) {
  const qs = new URLSearchParams();
  if (params?.date) qs.set("date", params.date);                         // YYYY-MM-DD
  if (params?.date_from) qs.set("date_from", params.date_from);
  if (params?.date_to) qs.set("date_to", params.date_to);
  if (Array.isArray(params?.categories)) {
    // ส่งแบบ multi-key: ?categories=news&categories=variety
    for (const c of params.categories) qs.append("categories", c);
  } else if (typeof params?.categories === "string") {
    qs.set("categories", params.categories);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return doFetch(`/programmes${suffix}`);
}
export async function createProgramme(payload, token = getAccessToken()) {
  return doFetch("/programmes", { method: "POST", body: payload, auth: true, token });
}
export async function programmeUploads(programmeId) {
  return doFetch(`/programmes/${programmeId}/uploads`);
}

/** =====================
 * Users (admin)
 * ====================== */
// export async function listUsers(token = getAccessToken()) {
//   return doFetch("/users", { auth: true, token });
// }

export async function listUsersByRole(role, token = getAccessToken()) {
  const qs = role ? `?role=${encodeURIComponent(role)}` : "";
  return doFetch(`/users${qs}`, { auth: true, token });
}
export async function userAccess(userId, token = getAccessToken()) {
  return doFetch(`/users/${userId}/access`, { auth: true, token });
}
export async function setUserAccess(userId, payload, token = getAccessToken()) {
  return doFetch(`/users/${userId}/access`, { method: "POST", body: payload, auth: true, token });
}

/** =====================
 * Upload (admin)
 * ====================== */
export async function uploadProgrammeFile({ programme_id, file }, token = getAccessToken()) {
  const form = new FormData();
  form.append("programme_id", programme_id);
  form.append("file", file);
  return doFetch("/uploads/program", { method: "POST", body: form, auth: true, token, isForm: true });
}

/** =====================
 * Low-level fetch
 * ====================== */
export default async function doFetch(path, { method="GET", body, auth=false, token, isForm=false } = {}) {
  const headers = {};
  let fetchBody;
  if (auth) {
    const t = token || getAccessToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  if (body && !isForm) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  } else if (isForm) {
    fetchBody = body; // FormData ห้ามตั้ง content-type เอง
  }

  const res = await fetch(`${baseURL}${path}`, { method, headers, body: fetchBody });
  let json;
  try { json = await res.json(); } catch { /* ignore */ }
  if (!res.ok) {
    const msg = (json && (json.error || json.message)) || res.statusText;
    throw new Error(msg);
  }
  return json;
}
