import { ISSUE_PRIORITY } from "../lib/issueMeta.js";

// 내 담당 이슈를 우선순위별로 가로 막대.
// CRITICAL이 많으면 빨갛게 길어지니 한눈에 위험 신호가 보인다.
const PRIORITY_COLOR = {
  CRITICAL: "var(--danger)",
  HIGH: "var(--warning)",
  MEDIUM: "var(--primary)",
  LOW: "var(--text-faint)",
};

export default function PriorityBreakdown({ issues }) {
  // 완료(RESOLVED/CLOSED) 제외하고 "지금 살아있는" 우선순위만
  const active = issues.filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS");
  const counts = {};
  active.forEach((i) => { counts[i.priority] = (counts[i.priority] || 0) + 1; });
  const total = active.length;

  if (total === 0) return null;

  return (
    <div className="prio-breakdown">
      <div className="prio-head">
        <h3 className="prio-title">우선순위 분포</h3>
        <span className="muted small">진행 중 {total}건</span>
      </div>
      <ul className="prio-list">
        {ISSUE_PRIORITY.slice().reverse().map((p) => {
          const n = counts[p.value] || 0;
          const pct = total > 0 ? (n / total) * 100 : 0;
          return (
            <li key={p.value} className="prio-row">
              <span className="prio-name">{p.label}</span>
              <span className="prio-track">
                <span className="prio-fill" style={{ width: `${pct}%`, background: PRIORITY_COLOR[p.value] }} />
              </span>
              <span className="prio-count">{n}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
