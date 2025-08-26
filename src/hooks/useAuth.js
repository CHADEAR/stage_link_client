// src/hooks/useAuth.js
import { useEffect, useState, useCallback } from "react";
import {
  getAccessToken, getRefreshToken, refreshAccessToken,
  login as apiLogin, logout as apiLogout, clearTokens
} from "../services/api";

export default function useAuth() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(!!getAccessToken());

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (getRefreshToken() && !getAccessToken()) {
        const newAccess = await refreshAccessToken();
        if (mounted) setAuthed(!!newAccess);
      } else {
        setAuthed(!!getAccessToken());
      }
      if (mounted) setReady(true);
    })();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    const user = await apiLogin(email, password);
    setAuthed(true);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } finally { clearTokens(); setAuthed(false); }
  }, []);

  return { ready, authed, login, logout };
}
