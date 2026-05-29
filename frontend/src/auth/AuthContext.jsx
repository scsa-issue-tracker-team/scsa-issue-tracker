import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { setAuthHooks } from "../api/client.js";
import * as authApi from "../api/auth.js";

const TOKEN_KEY = "scsaIssueTrackerAccessToken";
const USER_KEY = "scsaIssueTrackerCurrentUser";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });
  const [booting, setBooting] = useState(true); // 새로고침 시 me 복원 중인지
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const logout = useCallback(() => {
    tokenRef.current = "";
    setToken("");
    setCurrentUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  // client.js에 토큰 getter와 401 핸들러를 주입한다.
  useEffect(() => {
    setAuthHooks({
      getToken: () => tokenRef.current,
      onUnauthorized: () => logout(),
    });
  }, [logout]);

  // 부팅: 저장된 토큰이 있으면 현재 사용자 복원, 만료/무효면 로그아웃.
  useEffect(() => {
    let cancelled = false;
    async function restore() {
      if (!tokenRef.current) {
        setBooting(false);
        return;
      }
      try {
        const me = await authApi.getMe();
        if (!cancelled) {
          setCurrentUser(me);
          localStorage.setItem(USER_KEY, JSON.stringify(me));
        }
      } catch (error) {
        if (!cancelled && error?.status === 401) logout();
      } finally {
        if (!cancelled) setBooting(false);
      }
    }
    restore();
    return () => {
      cancelled = true;
    };
    // 최초 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async ({ username, password }) => {
    const { accessToken } = await authApi.login({ username, password });
    tokenRef.current = accessToken;
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    const me = await authApi.getMe();
    setCurrentUser(me);
    localStorage.setItem(USER_KEY, JSON.stringify(me));
    return me;
  }, []);

  const value = {
    token,
    currentUser,
    booting,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
