// src/hooks/useAuth.js
import { useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

import {
  getAccessToken, getRefreshToken, refreshAccessToken,
  login as apiLogin, logout as apiLogout, clearTokens
} from "../services/api";

export default function useAuth() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(!!getAccessToken());
  const [user, setUser] = useState(null);

function decodeUser(token) {
  try {
    const payload = jwtDecode(token);
    return {
      id: payload.sub,
      role: payload.role,
      email: payload.email || null,
    };
  } catch {
    return null;
  }
}

  useEffect(() => {
    let mounted = true;
    (async () => {
      let tok = getAccessToken();

      if (getRefreshToken() && !tok) {
        tok = await refreshAccessToken();
      }

      setAuthed(!!tok);
      setUser(tok ? decodeUser(tok) : null);

      if (mounted) setReady(true);
    })();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    const userData = await apiLogin(email, password); // backend ส่ง user object
    const tok = getAccessToken();
    setAuthed(true);
    setUser(tok ? decodeUser(tok) : userData); // ใช้ JWT หรือข้อมูลจาก backend
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } finally {
      clearTokens();
      setAuthed(false);
      setUser(null);
    }
  }, []);

  return { ready, authed, user, login, logout };
}
