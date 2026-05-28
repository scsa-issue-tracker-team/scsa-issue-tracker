import { useMemo } from "react";
import { formatDueDate, dueState, dueLabel } from "../lib/format.js";

// 내 담당 중 마감일 있는 이슈를 가로 시간 축에 점으로.
// 오늘을 기준으로 좌(지난) ~ 우(앞으로) 14일 범위를 보여준다.
const WINDOW_DAYS = 14;
const HALF = Math.floor(WINDOW_DAYS / 2);

export default function DueTimeline({ issues, onOpenIssue }) {
  const dueItems = useMemo(() => issues.filter((i) =>
    i.dueDate && i.status !== "RESOLVED" && i.status !== "CLOSED"
  ), [issues]);

  // 오늘을 0일째로, -7 ~ +7 범위에 들어오는 것만
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const items = dueItems.map((i) => {
    const due = new Date(i.dueDate + "T00:00:00");
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
    return { issue: i, diff, ds: dueState(i.dueDate, i.status) };
  });
  const inRange = items.filter((x) => x.diff >= -HALF && x.diff <= HALF);
  const overflowPast = items.filter((x) => x.diff < -HALF).length;
  const overflowFuture = items.filter((x) => x.diff > HALF).length;

  if (items.length === 0) return null;

  // 위치 계산 (0%=좌끝, 50%=오늘, 100%=우끝)
  const posOf = (diff) => ((diff + HALF) / WINDOW_DAYS) * 100;

  return (
    <div className="due-timeline">
      <div className="due-head">
        <h3 className="due-title">마감 타임라인</h3>
        <span className="muted small">최근 {HALF}일 ~ 앞으로 {HALF}일</span>
      </div>

      <div className="due-axis">
        {/* 축 라벨 */}
        <div className="due-axis-labels">
          <span>-{HALF}일</span>
          <span className="today-label">오늘</span>
          <span>+{HALF}일</span>
        </div>

        {/* 축선 + 오늘 표시 */}
        <div className="due-axis-line">
          <div className="due-today-marker" style={{ left: "50%" }} />
          {/* 이슈 점들 */}
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
            {overflowPast > 0 && <span>← 더 지난 {overflowPast}건</span>}
            {overflowFuture > 0 && <span>앞으로 {overflowFuture}건 →</span>}
          </div>
        )}
      </div>
    </div>
  );
}
