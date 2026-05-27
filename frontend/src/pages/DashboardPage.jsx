import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMyIssueSummary, listMyIssues } from "../api/issues.js";
import { listNotifications } from "../api/notifications.js";
import { useFetch } from "../hooks/useAsync.js";
import { Loading, ErrorState, EmptyState, Skeleton } from "../components/StateViews.jsx";
import Badge from "../components/Badge.jsx";
import StatusDonut from "../components/StatusDonut.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useUserDirectory, nameOf } from "../auth/UserDirectoryContext.jsx";
import { ISSUE_STATUS, statusMeta, typeMeta, priorityMeta, notificationMeta, humanizeMessage } from "../lib/issueMeta.js";
import { formatDueDate, dueState, dueLabel, timeAgo } from "../lib/format.js";

// 0 -> target 카운트업 (대시보드 지표에 생동감)
function useCountUp(target, duration = 700) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const end = Number(target) || 0;
    if (end === 0) { setN(0); return; }
    let raf; const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(Math.round(eased * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const summaryQuery = useFetch(getMyIssueSummary, []);
  const assignedQuery = useFetch(
    () => listMyIssues({ role: "ASSIGNEE", size: 6, sort: "dueDate,asc" }),
    []
  );
  const notifQuery = useFetch(() => listNotifications({ limit: 5 }), []);

  return (
    <div className="page dashboard">
      <div className="page-head">
        <div className="page-head-text">
          <p className="eyebrow">Dashboard</p>
          <h1>{currentUser?.username ? `${currentUser.username}님의 작업함` : "내 작업함"}</h1>
        </div>
      </div>

      {/* 요약 지표 */}
      {summaryQuery.loading && (
        <div className="metric-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="metric-card skeleton-row">
              <Skeleton w="50%" h={12} />
              <Skeleton w="35%" h={28} />
            </div>
          ))}
        </div>
      )}
      {summaryQuery.error && <ErrorState error={summaryQuery.error} onRetry={summaryQuery.reload} />}
      {summaryQuery.data && <SummarySection summary={summaryQuery.data} />}

      <div className="dashboard-grid">
        {/* 내 담당 이슈 (마감 빠른 순) */}
        <section className="dash-card">
          <div className="dash-card-head">
            <h2>내 담당 이슈</h2>
            <button className="btn ghost small" onClick={() => navigate("/projects")}>
              전체 보기
            </button>
          </div>
          {assignedQuery.loading && <Loading label="불러오는 중..." />}
          {assignedQuery.error && <ErrorState error={assignedQuery.error} onRetry={assignedQuery.reload} />}
          {assignedQuery.data && (
            assignedQuery.data.content?.length > 0 ? (
              <ul className="mini-issue-list">
                {assignedQuery.data.content.map((issue) => (
                  <MiniIssueRow key={issue.id} issue={issue} onClick={() =>
                    navigate(`/projects/${issue.projectId}/issues/${issue.id}`)} />
                ))}
              </ul>
            ) : (
              <EmptyState title="담당 이슈 없음" description="현재 나에게 배정된 이슈가 없습니다." />
            )
          )}
        </section>

        {/* 최근 알림 */}
        <section className="dash-card">
          <div className="dash-card-head">
            <h2>최근 알림</h2>
            <button className="btn ghost small" onClick={() => navigate("/notifications")}>
              전체 보기
            </button>
          </div>
          {notifQuery.loading && <Loading label="불러오는 중..." />}
          {notifQuery.error && <ErrorState error={notifQuery.error} onRetry={notifQuery.reload} />}
          {notifQuery.data && (
            notifQuery.data.items?.length > 0 ? (
              <ul className="mini-notif-list">
                {notifQuery.data.items.map((n) => (
                  <MiniNotifRow key={n.id} notif={n} onClick={() => {
                    if (n.projectId && n.issueId) navigate(`/projects/${n.projectId}/issues/${n.issueId}`);
                    else navigate("/notifications");
                  }} />
                ))}
              </ul>
            ) : (
              <EmptyState title="알림 없음" description="아직 받은 알림이 없습니다." />
            )
          )}
        </section>
      </div>
    </div>
  );
}

function SummarySection({ summary }) {
  const cards = [
    { label: "관련 이슈", value: summary.totalRelatedCount, tone: "" },
    { label: "내 담당", value: summary.assignedToMeCount, tone: "info" },
    { label: "마감 임박", value: summary.dueSoonCount, tone: "warning" },
    { label: "마감 지남", value: summary.overdueCount, tone: "danger" },
  ];
  const hasStatus = summary.statusCounts &&
    Object.values(summary.statusCounts).some((v) => v > 0);

  return (
    <>
      <div className="metric-grid">
        {cards.map((c) => (
          <MetricCard key={c.label} label={c.label} value={c.value ?? 0} tone={c.tone} />
        ))}
      </div>
      {hasStatus && (
        <section className="dash-card donut-card">
          <div className="dash-card-head">
            <h2>상태 분포</h2>
          </div>
          <StatusDonut statusCounts={summary.statusCounts} />
        </section>
      )}
    </>
  );
}

function MetricCard({ label, value, tone }) {
  const n = useCountUp(value);
  return (
    <div className={`metric-card ${tone ? `metric-${tone}` : ""}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{n}</span>
    </div>
  );
}

function MiniIssueRow({ issue, onClick }) {
  const ds = dueState(issue.dueDate, issue.status);
  return (
    <li>
      <button className="mini-issue" onClick={onClick}>
        <div className="mini-issue-main">
          <Badge meta={statusMeta(issue.status)} size="sm" />
          <span className="mini-issue-title">{issue.title}</span>
        </div>
        <div className="mini-issue-meta">
          <Badge meta={priorityMeta(issue.priority)} size="sm" />
          {issue.dueDate && (
            <span className={`due-chip due-${ds}`}>
              {formatDueDate(issue.dueDate)} · {dueLabel(issue.dueDate)}
            </span>
          )}
        </div>
      </button>
    </li>
  );
}

function MiniNotifRow({ notif, onClick }) {
  const { byId } = useUserDirectory();
  const meta = notificationMeta(notif.notificationType);
  return (
    <li>
      <button className={`mini-notif ${notif.read ? "" : "unread"}`} onClick={onClick}>
        <span className="notif-icon" aria-hidden>{meta.icon}</span>
        <div className="mini-notif-body">
          <span className="mini-notif-msg">{humanizeMessage(notif.message) || meta.label}</span>
          <span className="mini-notif-time muted small">
            {nameOf(byId, notif.actorId)} · {timeAgo(notif.createdAt)}
          </span>
        </div>
        {!notif.read && <span className="unread-dot" aria-label="안읽음" />}
      </button>
    </li>
  );
}
