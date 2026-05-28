import { useMemo } from "react";
import { formatDueDate, dueState, dueLabel } from "../lib/format.js";
import Badge from "./Badge.jsx";
import { priorityMeta } from "../lib/issueMeta.js";

// 내 담당 중 마감일 있는 이슈를 가로 시간 축에 점으로.
// 오늘을 기준으로 좌(지난) ~ 우(앞으로) 14일 범위 + KPI + 임박 이슈 목록.
const WINDOW_DAYS = 14;
const HALF = Math.floor(WINDOW_DAYS / 2);

export default function DueTimeline({ issues, onOpenIssue }) {
  const dueItems = useMemo(() => issues.filter((i) =>
    i.dueDate && i.status !== "RESOLVED" && i.status !== "CLOSED"
  ), [issues]);

  // 오늘을 0일째로 환산
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const items = dueItems.map((i) => {
    const due = new Date(i.dueDate + "T00:00:00");
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
    return { issue: i, diff, ds: dueState(i.dueDate, i.status) };
  }).sort((a, b) => a.diff - b.diff);

  const inRange = items.filter((x) => x.diff >= -HALF && x.diff <= HALF);
  const overflowPast = items.filter((x) => x.diff < -HALF).length;
  const overflowFuture = items.filter((x) => x.diff > HALF).length;

  if (items.length === 0) return null;

  // KPI 카운트
  const overdueCount = items.filter((x) => x.diff < 0).length;
  const todayCount = items.filter((x) => x.diff === 0).length;
  const soonCount = items.filter((x) => x.diff > 0 && x.diff <= 7).length;

  // 임박한 이슈 3건 (마감 빠른 순, 완료 제외)
  const upcoming = items.slice(0, 3);

  const posOf = (diff) => ((diff + HALF) / WINDOW_DAYS) * 100;

  return (
    <div className="due-timeline">
      <div className="due-head">
        <h3 className="due-title">마감 타임라인</h3>
        <span className="muted small">최근 {HALF}일 ~ 앞으로 {HALF}일</span>
      </div>

      {/* KPI 한 줄 */}
      <div className="due-kpi">
        <div className="due-kpi-item">
          <span className="due-kpi-num due-overdue-num">{overdueCount}</span>
          <span className="due-kpi-label">지난 마감</span>
        </div>
        <div className="due-kpi-divider" />
        <div className="due-kpi-item">
          <span className="due-kpi-num due-soon-num">{todayCount}</span>
          <span className="due-kpi-label">오늘</span>
        </div>
        <div className="due-kpi-divider" />
        <div className="due-kpi-item">
          <span className="due-kpi-num">{soonCount}</span>
          <span className="due-kpi-label">7일 이내</span>
        </div>
      </div>

      {/* 시간축 */}
      <div className="due-axis">
        <div className="due-axis-labels">
          <span>-{HALF}일</span>
          <span className="today-label">오늘</span>
          <span>+{HALF}일</span>
        </div>
        <div className="due-axis-line">
          <div className="due-today-marker" style={{ left: "50%" }} />
          {inRange.map((x) => (
            <button
              key={x.issue.id}
              className={`due-dot due-${x.ds}`}
              style={{ left: `${posOf(x.diff)}%` }}
              onClick={() => onOpenIssue?.(x.issue)}
              title={`#${x.issue.id} ${x.issue.title} · ${formatDueDate(x.issue.dueDate)} (${dueLabel(x.issue.dueDate)})`}
              aria-label={`${x.issue.title}, ${dueLabel(x.issue.dueDate)}`}
            />
          ))}
        </div>
        {(overflowPast > 0 || overflowFuture > 0) && (
          <div className="due-overflow muted small">
            <span>{overflowPast > 0 ? `← 더 지난 ${overflowPast}건` : ""}</span>
            <span>{overflowFuture > 0 ? `앞으로 ${overflowFuture}건 →` : ""}</span>
          </div>
        )}
      </div>

      {/* 임박 이슈 목록 — 점 클릭 안 해도 보이게 */}
      <div className="due-upcoming">
        <span className="due-upcoming-title muted small">임박한 이슈</span>
        <ul className="due-upcoming-list">
          {upcoming.map((x) => (
            <li key={x.issue.id}>
              <button className="due-upcoming-row" onClick={() => onOpenIssue?.(x.issue)}>
                <span className={`due-pill due-${x.ds}`}>{dueLabel(x.issue.dueDate)}</span>
                <span className="due-upcoming-name">{x.issue.title}</span>
                <Badge meta={priorityMeta(x.issue.priority)} size="sm" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
