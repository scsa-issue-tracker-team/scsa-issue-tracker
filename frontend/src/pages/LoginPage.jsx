import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { signup as signupApi } from "../api/auth.js";
import { InlineError } from "../components/StateViews.jsx";
import { useToast } from "../components/ToastContext.jsx";
import BrandMark from "../components/BrandMark.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  useDocumentTitle(mode === "login" ? "로그인" : "회원가입");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const from = location.state?.from?.pathname ?? "/dashboard";

  const loginAsync = useAsync(login);
  const signupAsync = useAsync(signupApi);
  const [notice, setNotice] = useState("");

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({ username: "", email: "", password: "" });

  const onLogin = async (e) => {
    e.preventDefault();
    setNotice("");
    try {
      const me = await loginAsync.run(loginForm);
      toast.success(`${me?.username ?? ""}님 환영합니다`);
      navigate(from, { replace: true });
    } catch {
      /* 에러는 loginAsync.error로 표시 */
    }
  };

  const onSignup = async (e) => {
    e.preventDefault();
    setNotice("");
    try {
      await signupAsync.run(signupForm);
      setMode("login");
      setLoginForm({ username: signupForm.username, password: "" });
      setNotice("가입 완료! 이제 로그인하세요.");
    } catch {
      /* 에러는 signupAsync.error로 표시 */
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-layout">
        {/* 좌측 브랜드 패널 (데스크톱) */}
        <aside className="auth-hero">
          <div className="auth-hero-inner">
            <BrandMark size="lg" invert />
            <h1 className="auth-hero-title">팀의 모든 이슈를<br />한 곳에서.</h1>
            <p className="auth-hero-sub">
              프로젝트, 이슈, 댓글, 알림까지 — 협업에 필요한 모든 흐름을 빠르게.
            </p>
            <ul className="auth-feature-list">
              <li><span className="auth-feat-ic">⌘</span> 커맨드 팔레트로 어디든 빠르게 이동</li>
              <li><span className="auth-feat-ic">▦</span> 칸반 보드로 상태를 드래그 한 번에</li>
              <li><span className="auth-feat-ic">◷</span> 마감·활동·알림을 실시간으로 추적</li>
            </ul>
          </div>
          <div className="auth-hero-glow" aria-hidden />
        </aside>

        {/* 우측 폼 */}
        <div className="auth-form-side">
          <div className="auth-card">
            <div className="auth-brand auth-brand-mobile">
              <BrandMark size="lg" />
              <h1>SCSA Issue Tracker</h1>
              <p className="muted">팀 이슈를 한 곳에서 추적하세요</p>
            </div>

            <div className="auth-card-head">
              <h2>{mode === "login" ? "다시 오신 걸 환영해요" : "계정 만들기"}</h2>
              <p className="muted small">
                {mode === "login" ? "계속하려면 로그인하세요." : "몇 초면 시작할 수 있어요."}
              </p>
            </div>

            <div className="tabs">
              <button
                className={mode === "login" ? "tab active" : "tab"}
                onClick={() => setMode("login")}
              >
                로그인
              </button>
              <button
                className={mode === "signup" ? "tab active" : "tab"}
                onClick={() => setMode("signup")}
              >
                회원가입
              </button>
            </div>

            {notice && <p className="notice">{notice}</p>}

            {mode === "login" ? (
              <form className="form" onSubmit={onLogin}>
                <label className="field">
                  <span>아이디</span>
                  <input
                    value={loginForm.username}
                    autoComplete="username"
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>비밀번호</span>
                  <input
                    type="password"
                    value={loginForm.password}
                    autoComplete="current-password"
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                </label>
                <InlineError error={loginAsync.error} />
                <button className="btn primary block" disabled={loginAsync.loading}>
                  {loginAsync.loading ? "로그인 중..." : "로그인"}
                </button>
              </form>
            ) : (
              <form className="form" onSubmit={onSignup}>
                <label className="field">
                  <span>아이디</span>
                  <input
                    value={signupForm.username}
                    onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>이메일</span>
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>비밀번호</span>
                  <input
                    type="password"
                    value={signupForm.password}
                    autoComplete="new-password"
                    minLength={4}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    required
                  />
                </label>
                <InlineError error={signupAsync.error} />
                <button className="btn primary block" disabled={signupAsync.loading}>
                  {signupAsync.loading ? "가입 중..." : "계정 만들기"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
