import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="full-center">
      <div className="state-emoji" aria-hidden>🔍</div>
      <p className="state-title">페이지를 찾을 수 없습니다</p>
      <Link className="btn primary" to="/projects">프로젝트로 돌아가기</Link>
    </div>
  );
}
