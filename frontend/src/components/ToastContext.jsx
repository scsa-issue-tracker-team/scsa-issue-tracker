import { createContext, useContext, useState, useCallback } from "react";

// 가벼운 토스트. 액션 결과(저장/삭제/오류)를 잠깐 띄운다.
// action 토스트는 '실행취소' 같은 버튼을 함께 띄운다.
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message, opts = {}) => {
      const id = `${Date.now()}-${Math.random()}`;
      const duration = opts.duration ?? 3000;
      setToasts((list) => [...list, { id, type, message, actionLabel: opts.actionLabel, onAction: opts.onAction }]);
      setTimeout(() => remove(id), duration);
      return id;
    },
    [remove]
  );

  const toast = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
    // 실행취소 등 액션이 붙은 토스트 (기본 5초)
    action: (m, actionLabel, onAction) =>
      push("info", m, { actionLabel, onAction, duration: 5000 }),
  };

  const handleAction = (t) => {
    t.onAction?.();
    remove(t.id);
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type} ${t.actionLabel ? "toast-action" : ""}`}>
            <span className="toast-msg" onClick={() => remove(t.id)}>{t.message}</span>
            {t.actionLabel && (
              <button className="toast-btn" onClick={() => handleAction(t)}>{t.actionLabel}</button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
