import { useEffect } from "react";
import ChatPanel from "./ChatPanel.jsx";

// 채팅 드로어 — 데스크톱에선 우측에서 슬라이드, 모바일에선 풀스크린.
// ESC로 닫힘. 배경 클릭으로도 닫힘.
export default function ChatDrawer({ open, onClose, projectId, projectName }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="chat-drawer-backdrop" onClick={onClose}>
      <aside
        className="chat-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="프로젝트 채팅"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="chat-drawer-close icon-btn"
          onClick={onClose}
          aria-label="닫기"
          title="닫기 (ESC)"
        >
          ✕
        </button>
        <ChatPanel projectId={projectId} projectName={projectName} />
      </aside>
    </div>
  );
}
