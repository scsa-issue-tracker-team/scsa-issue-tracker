import { Outlet, useNavigate, Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useTheme } from "./ThemeContext.jsx";
import { useNotifications } from "./NotificationContext.jsx";
import CommandPalette from "./CommandPalette.jsx";

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { unreadTotal } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // ⌘K 팔레트는 자체 단축키로도 열리지만, 헤더 버튼으로도 연다 (커스텀 이벤트)
  const openPalette = () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <Link to="/dashboard" className="brand">
            <span className="brand-mark">IT</span>
            <span className="brand-text"><strong>SCSA</strong> Tracker</span>
          </Link>
          <nav className="main-nav">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              내 작업함
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              프로젝트
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              알림
              {unreadTotal > 0 && <span className="nav-badge">{unreadTotal > 99 ? "99+" : unreadTotal}</span>}
            </NavLink>
          </nav>
        </div>

        <div className="header-right">
          <button className="cmdk-trigger" onClick={openPalette} title="명령 팔레트 (Ctrl/⌘ K)">
            <span aria-hidden>⌕</span>
            <span className="cmdk-trigger-text">검색</span>
            <kbd>⌘K</kbd>
          </button>
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
          <button className="btn ghost small" onClick={handleLogout}>로그아웃</button>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <CommandPalette />
    </div>
  );
}
