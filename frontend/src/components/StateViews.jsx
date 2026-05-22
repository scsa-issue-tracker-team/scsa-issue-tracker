// 로딩 / 에러 / 빈 상태를 한 곳에서 일관되게 렌더.

export function FullPageLoader({ label = "불러오는 중..." }) {
  return (
    <div className="full-center">
      <div className="spinner" aria-hidden />
      <p className="muted">{label}</p>
    </div>
  );
}

export function Loading({ label = "불러오는 중..." }) {
  return (
    <div className="state-block">
      <div className="spinner" aria-hidden />
      <p className="muted">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="state-block">
      <div className="state-emoji" aria-hidden>
        🗂️
      </div>
      <p className="state-title">{title}</p>
      {description && <p className="muted">{description}</p>}
      {action}
    </div>
  );
}

// ApiError(status 포함)를 받아 401/403/404 별로 다른 안내를 보여준다.
export function ErrorState({ error, onRetry }) {
  const status = error?.status;
  let title = "문제가 발생했습니다";
  let emoji = "⚠️";

  if (status === 401) {
    title = "로그인이 필요합니다";
    emoji = "🔒";
  } else if (status === 403) {
    title = "접근 권한이 없습니다";
    emoji = "🚫";
  } else if (status === 404) {
    title = "찾을 수 없습니다";
    emoji = "🔍";
  } else if (status === 0) {
    title = "서버에 연결할 수 없습니다";
    emoji = "📡";
  }

  return (
    <div className="state-block">
      <div className="state-emoji" aria-hidden>
        {emoji}
      </div>
      <p className="state-title">{title}</p>
      <p className="muted">{error?.message}</p>
      {onRetry && status !== 401 && status !== 403 && (
        <button className="btn" onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  );
}

// 인라인 에러 메시지(폼 제출 실패 등)
export function InlineError({ error }) {
  if (!error) return null;
  return <p className="inline-error">{error.message}</p>;
}
