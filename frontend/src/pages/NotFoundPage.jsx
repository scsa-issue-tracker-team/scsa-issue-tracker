import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function NotFoundPage() {
  useDocumentTitle("페이지를 찾을 수 없음");
  return (
    <div className="full-center">
      <div className="state-emoji" aria-hidden>🔍</div>
      <p className="state-title">페이지를 찾을 수 없습니다</p>
      <Link className="btn primary" to="/dashboard">대시보드로 돌아가기</Link>
    </div>
  );
}
