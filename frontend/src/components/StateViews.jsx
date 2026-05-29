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

// ── 빈 상태 일러스트 (맥락별). 모두 같은 톤·선 두께로 그려 일관성 유지 ──
function IllustFrame({ children }) {
  return (
    <svg className="empty-illust" viewBox="0 0 120 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {children}
    </svg>
  );
}

const ILLUSTRATIONS = {
  // 문서 + 추가(+) — 일반/이슈 없음
  issue: (
    <IllustFrame>
      <rect x="22" y="20" width="76" height="60" rx="8" fill="var(--bg-elev-2)" stroke="var(--border)" strokeWidth="2" />
      <rect x="34" y="34" width="40" height="6" rx="3" fill="var(--border-strong)" />
      <rect x="34" y="46" width="52" height="5" rx="2.5" fill="var(--border)" />
      <rect x="34" y="56" width="30" height="5" rx="2.5" fill="var(--border)" />
      <circle cx="92" cy="68" r="16" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="2" />
      <path d="M92 61v14M85 68h14" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
    </IllustFrame>
  ),
  // 종 — 알림 없음
  notification: (
    <IllustFrame>
      <path d="M60 26c-9 0-16 7-16 16v10l-5 8h42l-5-8V42c0-9-7-16-16-16z"
        fill="var(--bg-elev-2)" stroke="var(--border-strong)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M53 70a7 7 0 0014 0" fill="none" stroke="var(--border-strong)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="22" r="3" fill="var(--primary)" />
      <circle cx="78" cy="40" r="9" fill="var(--success-soft)" stroke="var(--success)" strokeWidth="2" />
      <path d="M74.5 40l2.5 2.5 4.5-5" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </IllustFrame>
  ),
  // 돋보기 + 빈 종이 — 검색 결과 없음
  search: (
    <IllustFrame>
      <rect x="26" y="20" width="56" height="60" rx="8" fill="var(--bg-elev-2)" stroke="var(--border)" strokeWidth="2" />
      <rect x="36" y="32" width="30" height="5" rx="2.5" fill="var(--border)" />
      <rect x="36" y="42" width="22" height="5" rx="2.5" fill="var(--border)" />
      <circle cx="78" cy="62" r="15" fill="var(--bg-elev)" stroke="var(--primary)" strokeWidth="2.5" />
      <path d="M89 73l8 8" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
    </IllustFrame>
  ),
  // 폴더 + 별 — 프로젝트 없음
  project: (
    <IllustFrame>
      <path d="M24 34c0-3 2-5 5-5h17l6 7h39c3 0 5 2 5 5v30c0 3-2 5-5 5H29c-3 0-5-2-5-5V34z"
        fill="var(--bg-elev-2)" stroke="var(--border-strong)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 46l3.2 6.5 7.2 1-5.2 5.1 1.2 7.1-6.4-3.4-6.4 3.4 1.2-7.1-5.2-5.1 7.2-1z"
        fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="1.8" strokeLinejoin="round" />
    </IllustFrame>
  ),
};

export function EmptyState({ title, description, action, variant = "issue" }) {
  return (
    <div className="state-block">
      {ILLUSTRATIONS[variant] ?? ILLUSTRATIONS.issue}
      <p className="state-title">{title}</p>
      {description && <p className="muted">{description}</p>}
      {action}
    </div>
  );
}

// ── 에러 상태 (status별 일러스트 + 안내). EmptyState와 같은 톤의 SVG로 통일 ──
function ErrorIllust({ status }) {
  // 자물쇠(401/403), 돋보기(404), 안테나(0=연결끊김), 경고(기타)
  if (status === 401 || status === 403) {
    return (
      <IllustFrame>
        <rect x="40" y="44" width="40" height="32" rx="6" fill="var(--bg-elev-2)" stroke="var(--border-strong)" strokeWidth="2" />
        <path d="M48 44v-8a12 12 0 0124 0v8" fill="none" stroke="var(--border-strong)" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="60" cy="58" r="4" fill="var(--danger)" />
        <rect x="58.5" y="60" width="3" height="8" rx="1.5" fill="var(--danger)" />
      </IllustFrame>
    );
  }
  if (status === 0) {
    return (
      <IllustFrame>
        <path d="M40 64a20 20 0 0140 0" fill="none" stroke="var(--border-strong)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M48 64a12 12 0 0124 0" fill="none" stroke="var(--border)" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="60" cy="64" r="4" fill="var(--danger)" />
        <path d="M86 34L34 86" stroke="var(--danger)" strokeWidth="2.4" strokeLinecap="round" />
      </IllustFrame>
    );
  }
  return (
    <IllustFrame>
      <path d="M60 26l34 56H26z" fill="var(--danger-soft)" stroke="var(--danger)" strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="58" y="48" width="4" height="16" rx="2" fill="var(--danger)" />
      <circle cx="60" cy="72" r="2.6" fill="var(--danger)" />
    </IllustFrame>
  );
}

// ApiError(status 포함)를 받아 401/403/404 별로 다른 안내를 보여준다.
export function ErrorState({ error, onRetry }) {
  const status = error?.status;
  let title = "문제가 발생했습니다";

  if (status === 401) title = "로그인이 필요합니다";
  else if (status === 403) title = "접근 권한이 없습니다";
  else if (status === 404) title = "찾을 수 없습니다";
  else if (status === 0) title = "서버에 연결할 수 없습니다";

  return (
    <div className="state-block">
      <ErrorIllust status={status} />
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
