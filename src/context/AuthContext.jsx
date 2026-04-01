import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_BASE_URL = "/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const [loading, setLoading] = useState(true); // comprueba sesión al arrancar

  // Al montar, si hay token guardado intentamos recuperar el usuario
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchUser(token).finally(() => setLoading(false));
  }, []);

  const fetchUser = async (t) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${t}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Unauthorized");
      const data = await res.json();
      setUser(data);
    } catch {
      // Token inválido o expirado → limpiamos
      localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
    }
  };

  const register = useCallback(async ({ name, email, password, password_confirmation }) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });
    const data = await res.json();
    if (!res.ok) throw data; // lanza los errores de validación de Laravel
    persistSession(data);
    return data;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    persistSession(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
    } finally {
      localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
    }
  }, [token]);

  // Guarda token + usuario en memoria y localStorage
  const persistSession = (data) => {
    // Passport devuelve { access_token, token_type, user } o similar
    const t = data.token ?? data.access_token;
    localStorage.setItem("auth_token", t);
    setToken(t);
    setUser(data.user ?? null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acceso rápido
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}