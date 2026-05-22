import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "./ThemeContext.jsx";

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/projects" className="brand">
          <span className="brand-mark">IT</span>
          <span className="brand-text">
            <strong>SCSA</strong> Issue Tracker
          </span>
        </Link>

        <div className="header-right">
          <button
            className="icon-btn theme-toggle"
            onClick={toggle}
            aria-label={theme === "dark" ? "라이트 모드로" : "다크 모드로"}
            title={theme === "dark" ? "라이트 모드" : "다크 모드"}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          {currentUser && (
            <span className="user-chip" title={`사용자 #${currentUser.userId}`}>
              <span className="avatar" aria-hidden>
                {currentUser.username?.[0]?.toUpperCase() ?? "?"}
              </span>
              <span className="user-name">{currentUser.username}</span>
            </span>
          )}
          <button className="btn ghost" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
