import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Mock authentication for the demo. Replace with the client's SSO / identity provider later.
export const DEMO_EMAIL = 'demo@lupin.com';
export const DEMO_PASSWORD = 'Lupin@123';
const KEY = 'lupin.session';

const AuthContext = createContext(null);

function readSession() {
  try {
    const raw = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  const start = useCallback((u, remember) => {
    setUser(u);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(u));
      if (remember) localStorage.setItem(KEY, JSON.stringify(u));
    } catch { /* storage unavailable */ }
  }, []);

  const login = useCallback(async (email, password, remember) => {
    await new Promise((r) => setTimeout(r, 600));
    if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
      start({ name: 'Demo User', email: DEMO_EMAIL, role: 'Commercial Analyst' }, remember);
      return { ok: true };
    }
    return { ok: false, error: 'Invalid email or password. Use the demo credentials shown below.' };
  }, [start]);

  const loginSso = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 900));
    start({ name: 'Demo User', email: DEMO_EMAIL, role: 'Commercial Analyst' }, false);
  }, [start]);

  const logout = useCallback(() => {
    setUser(null);
    try {
      sessionStorage.removeItem(KEY);
      localStorage.removeItem(KEY);
    } catch { /* ignore */ }
  }, []);

  const value = useMemo(() => ({ user, login, loginSso, logout }), [user, login, loginSso, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
