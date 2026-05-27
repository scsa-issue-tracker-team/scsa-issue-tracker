import { nameOf } from "../auth/UserDirectoryContext.jsx";

// 이슈 배열을 담당자별로 집계해 가로 막대로. 진행 중(OPEN/IN_PROGRESS) 비중을 보여준다.
// "누가 얼마나 들고 있나"를 한눈에. 미완료 이슈만 카운트.
export default function WorkloadBars({ issues, byId, max = 6 }) {
  const active = issues.filter((i) => i.status === "OPEN" || i.status === "IN_PROGRESS");
  if (active.length === 0) return null;

  const grouped = {};
  active.forEach((i) => {
    const key = i.assigneeId ?? "none";
    grouped[key] = (grouped[key] || 0) + 1;
  });

  const rows = Object.entries(grouped)
    .map(([key, count]) => ({
      key,
      label: key === "none" ? "미지정" : nameOf(byId, Number(key)),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, max);

  const peak = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="workload">
      <div className="workload-head">
        <h3 className="workload-title">담당자별 진행 중 이슈</h3>
        <span className="muted small">총 {active.length}건</span>
      </div>
      <ul className="workload-list">
        {rows.map((r) => (
          <li key={r.key} className="workload-row">
            <span className="workload-name" title={r.label}>
              <span className="avatar xs" aria-hidden>
                {r.label === "미지정" ? "·" : r.label[0]?.toUpperCase()}
              </span>
              {r.label}
            </span>
            <span className="workload-track">
              <span className="workload-fill" style={{ width: `${(r.count / peak) * 100}%` }} />
            </span>
            <span className="workload-count">{r.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
