import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listProjects } from "../api/projects.js";
import { useTheme } from "./ThemeContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

// ⌘K / Ctrl+K 커맨드 팔레트.
// 페이지 이동 · 프로젝트 점프 · 새 이슈 · 테마 전환 · 로그아웃을 키보드만으로.
export default function CommandPalette() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [projects, setProjects] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // 전역 단축키
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 열릴 때 프로젝트 로드 + 입력 포커스 + 초기화
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 20);
    listProjects().then((p) => setProjects(Array.isArray(p) ? p : [])).catch(() => {});
  }, [open]);

  const close = useCallback(() => setOpen(false), []);
  const run = useCallback((fn) => { close(); fn(); }, [close]);

  // 명령 목록 구성
  const commands = useMemo(() => {
    const base = [
      { id: "nav-dashboard", icon: "🏠", label: "내 작업함", hint: "이동", action: () => navigate("/dashboard") },
      { id: "nav-projects", icon: "📁", label: "프로젝트", hint: "이동", action: () => navigate("/projects") },
      { id: "nav-notif", icon: "🔔", label: "알림", hint: "이동", action: () => navigate("/notifications") },
      { id: "act-theme", icon: theme === "dark" ? "☀" : "☾", label: theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환", hint: "액션", action: toggle },
      { id: "act-logout", icon: "🚪", label: "로그아웃", hint: "액션", action: () => { logout(); navigate("/login", { replace: true }); } },
    ];
    const projectCmds = projects.map((p) => ({
      id: `proj-${p.id}`,
      icon: "→",
      label: p.name,
      hint: "프로젝트",
      action: () => navigate(`/projects/${p.id}`),
    }));
    return [...base, ...projectCmds];
  }, [projects, theme, navigate, toggle, logout]);

  // 필터링
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => { setActive(0); }, [query]);

  // 키보드 내비게이션
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const cmd = filtered[active]; if (cmd) run(cmd.action); }
  };

  // 활성 항목 스크롤
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div className="cmdk-overlay" onClick={close}>
      <div className="cmdk-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="명령 팔레트">
        <div className="cmdk-input-wrap">
          <span className="cmdk-search-icon" aria-hidden>⌕</span>
          <input
            ref={inputRef}
            className="cmdk-input"
            value={query}
            placeholder="명령 검색 · 프로젝트 이동..."
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className="cmdk-esc">ESC</kbd>
        </div>
        <ul className="cmdk-list" ref={listRef}>
          {filtered.length === 0 && <li className="cmdk-empty">결과 없음</li>}
          {filtered.map((cmd, i) => (
            <li
              key={cmd.id}
              data-idx={i}
              className={`cmdk-item ${i === active ? "active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => run(cmd.action)}
            >
              <span className="cmdk-item-icon" aria-hidden>{cmd.icon}</span>
              <span className="cmdk-item-label">{cmd.label}</span>
              <span className="cmdk-item-hint">{cmd.hint}</span>
            </li>
          ))}
        </ul>
        <div className="cmdk-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> 이동</span>
          <span><kbd>↵</kbd> 실행</span>
          <span><kbd>esc</kbd> 닫기</span>
        </div>
      </div>
    </div>
  );
}
