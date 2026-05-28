import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { listUsers } from "../api/users.js";
import { useAuth } from "../auth/AuthContext.jsx";

// 전역 사용자 디렉터리. GET /users를 한 번 불러 userId -> username 매핑을 만든다.
// 이슈/댓글/활동/알림의 actorId·reporterId·assigneeId 등 숫자 ID를 사람 이름으로 보여주기 위함.
// (백엔드 응답에 username이 없어서 프론트가 보강한다.)
const UserDirectoryContext = createContext(null);

export function UserDirectoryProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [byId, setById] = useState({});

  const load = useCallback(async () => {
    try {
      const list = await listUsers();
      const arr = Array.isArray(list) ? list : [];
      setUsers(arr);
      const map = {};
      arr.forEach((u) => { map[u.id] = u.username; });
      setById(map);
    } catch {
      // 실패해도 앱은 동작 — 이름 대신 #id로 폴백된다.
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  return (
    <UserDirectoryContext.Provider value={{ users, byId, reload: load }}>
      {children}
    </UserDirectoryContext.Provider>
  );
}

export function useUserDirectory() {
  const ctx = useContext(UserDirectoryContext);
  if (!ctx) throw new Error("useUserDirectory must be used within UserDirectoryProvider");
  return ctx;
}

// 매핑에 이름이 있으면 username, 없으면 #id 폴백.
export function nameOf(byId, userId) {
  if (userId == null || userId === "") return "미지정";
  return byId?.[userId] ?? `#${userId}`;
}
