import { useState, useEffect, useCallback } from "react";

const ADMIN_TOKEN_KEY = "unblock_admin_token";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetch(`${import.meta.env.BASE_URL}api/admin/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        setIsAdmin(data.valid === true);
        if (!data.valid) localStorage.removeItem(ADMIN_TOKEN_KEY);
      })
      .catch(() => {
        setIsAdmin(false);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        setIsAdmin(true);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsAdmin(false);
  }, []);

  return { isAdmin, isLoading, login, logout };
}
