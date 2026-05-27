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

// 스켈레톤: 로딩 중 레이아웃을 유지하며 회색 깜빡임을 보여준다 (스피너보다 고급스럽고 안정적).
export function Skeleton({ w = "100%", h = 14, r = 6, style }) {
  return <span className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden />;
}

// 이슈 리스트용 스켈레톤 행 n개
export function IssueListSkeleton({ rows = 4 }) {
  return (
    <ul className="issue-list" aria-busy="true" aria-label="이슈 불러오는 중">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i}>
          <div className="issue-row skeleton-row">
            <div className="issue-row-top">
              <Skeleton w="55%" h={15} />
              <Skeleton w={120} h={18} r={999} />
            </div>
            <Skeleton w="80%" h={12} />
            <Skeleton w="40%" h={11} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// 카드 그리드용 스켈레톤
export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="card-grid" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="project-card skeleton-row">
          <Skeleton w="30%" h={11} />
          <Skeleton w="65%" h={18} />
          <Skeleton w="100%" h={12} />
          <Skeleton w="80%" h={12} />
        </div>
      ))}
    </div>
  );
}
