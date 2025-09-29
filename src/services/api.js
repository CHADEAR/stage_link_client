const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiLogin(email, password) {
  return doFetch("/auth/login", { method: "POST", body: { email, password } });
}
export async function apiRegister(data) {
  return doFetch("/auth/register", { method: "POST", body: data });
}
export async function apiForgot(email) {
  return doFetch("/auth/forgot", { method: "POST", body: { email } });
}
export async function apiReset(email, otp, new_password) {
  return doFetch("/auth/reset", { method: "POST", body: { email, otp, new_password } });
}

export async function apiListProgrammes() {
  return doFetch("/programmes");
}
export async function apiCreateProgramme(payload, token) {
  return doFetch("/programmes", { method: "POST", body: payload, auth: true, token });
}
export async function apiProgrammeUploads(programmeId) {
  return doFetch(`/programmes/${programmeId}/uploads`);
}

export async function apiListUsers(token) {
  return doFetch("/users", { auth: true, token });
}
export async function apiUserAccess(userId, token) {
  return doFetch(`/users/${userId}/access`, { auth: true, token });
}
export async function apiSetUserAccess(userId, payload, token) {
  return doFetch(`/users/${userId}/access`, { method: "POST", body: payload, auth: true, token });
}

export async function apiUploadProgram(formData, token) {
  return doFetch(`/uploads/program`, { method: "POST", body: formData, auth: true, token, isForm: true });
}

// ตัวอย่าง doFetch:
async function doFetch(path, { method="GET", body, auth=false, token, isForm=false }={}) {
  const headers = {};
  let fetchBody;
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  } else if (isForm) {
    fetchBody = body; // เป็น FormData ห้าม set content-type เอง
  }
  const res = await fetch(`${baseURL}${path}`, { method, headers, body: fetchBody });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}
