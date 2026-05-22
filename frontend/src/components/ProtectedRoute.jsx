import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { FullPageLoader } from "./StateViews.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  // 새로고침 직후 토큰으로 사용자 복원 중일 때 깜빡임 방지
  if (booting) return <FullPageLoader label="세션 확인 중..." />;

  if (!isAuthenticated) {
    // 로그인 후 원래 가려던 곳으로 돌려보내기 위해 from 저장
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
