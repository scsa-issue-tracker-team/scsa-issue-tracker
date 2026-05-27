import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { signup as signupApi } from "../api/auth.js";
import { InlineError } from "../components/StateViews.jsx";
import { useToast } from "../components/ToastContext.jsx";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
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
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark lg">IT</span>
          <h1>SCSA Issue Tracker</h1>
          <p className="muted">팀 이슈를 한 곳에서 추적하세요</p>
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
  );
}
