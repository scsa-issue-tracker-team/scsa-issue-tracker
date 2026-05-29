import { useEffect, useRef } from "react";

// 가벼운 모달. 오버레이 클릭 또는 ESC로 닫힌다.
// 접근성: 열릴 때 모달 안으로 포커스 이동, Tab을 모달 내부에 가두고(focus trap),
// 닫으면 직전에 포커스됐던 요소로 되돌린다.
export default function Modal({ open, title, onClose, children, footer }) {
  const cardRef = useRef(null);
  const prevFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    // 직전 포커스 저장
    prevFocusRef.current = document.activeElement;

    const card = cardRef.current;
    const getFocusable = () =>
      card
        ? Array.from(
            card.querySelectorAll(
              'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];

    // 열릴 때 첫 입력 요소(없으면 모달 카드)로 포커스
    const focusables = getFocusable();
    (focusables[0] ?? card)?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const items = getFocusable();
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // 닫힐 때 직전 포커스 복원
      if (prevFocusRef.current instanceof HTMLElement) {
        prevFocusRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
