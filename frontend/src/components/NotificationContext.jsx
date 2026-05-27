import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { listNotifications } from "../api/notifications.js";
import { useAuth } from "../auth/AuthContext.jsx";

// 헤더 배지용 안읽음 알림 수. 로그인 중 60초마다 가볍게 갱신.
// 알림 화면에서 읽음/삭제 후 refresh()로 즉시 동기화한다.
const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [unreadTotal, setUnreadTotal] = useState(0);
  const timer = useRef(null);

  const refresh = useCallback(async () => {
    try {
      // 안읽음 수만 알면 되므로 최소 페이지만 요청 (응답의 unreadTotal 사용)
      const res = await listNotifications({ limit: 1, offset: 0 });
      setUnreadTotal(res?.unreadTotal ?? 0);
    } catch {
      /* 무시 — 배지만 못 갱신될 뿐 */
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadTotal(0);
      return;
    }
    refresh();
    timer.current = setInterval(refresh, 60000);
    return () => clearInterval(timer.current);
  }, [isAuthenticated, refresh]);

  return (
    <NotificationContext.Provider value={{ unreadTotal, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
