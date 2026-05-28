import { ISSUE_STATUS } from "../lib/issueMeta.js";

// statusCounts({OPEN:n,...})를 SVG 도넛으로. 라이브러리 없이 stroke-dasharray로 그린다.
// 중앙에는 완료율(RESOLVED+CLOSED / 전체)을 표시.
const STATUS_COLOR = {
  OPEN: "var(--primary)",
  IN_PROGRESS: "var(--warning)",
  RESOLVED: "var(--success)",
  CLOSED: "var(--text-faint)",
};

export default function StatusDonut({ statusCounts }) {
  const counts = statusCounts || {};
  const segments = ISSUE_STATUS
    .map((s) => ({ ...s, n: counts[s.value] || 0 }))
    .filter((s) => s.n > 0);
  const total = segments.reduce((sum, s) => sum + s.n, 0);

  if (total === 0) {
    return (
      <div className="donut-empty">
        <div className="donut-empty-circle" />
        <p className="muted small">집계할 이슈가 없습니다</p>
      </div>
    );
  }

  const done = (counts.RESOLVED || 0) + (counts.CLOSED || 0);
  const donePct = Math.round((done / total) * 100);

  // 도넛 기하
  const size = 168;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const arcs = segments.map((s) => {
    const frac = s.n / total;
    const dash = frac * circumference;
    const arc = {
      ...s,
      dasharray: `${dash} ${circumference - dash}`,
      dashoffset: -offset,
    };
    offset += dash;
    return arc;
  });

  return (
    <div className="donut-wrap">
      <div className="donut-chart">
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}
          role="img" aria-label={`완료율 ${donePct}퍼센트, 총 ${total}건`}>
          {/* 트랙 */}
          <circle cx={cx} cy={cx} r={r} fill="none"
            stroke="var(--bg-sunken)" strokeWidth={stroke} />
          {/* 세그먼트 */}
          {arcs.map((a) => (
            <circle key={a.value} cx={cx} cy={cx} r={r} fill="none"
              stroke={STATUS_COLOR[a.value]} strokeWidth={stroke}
              strokeDasharray={a.dasharray} strokeDashoffset={a.dashoffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cx})`}
              style={{ transition: "stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease" }} />
          ))}
        </svg>
        <div className="donut-center">
          <span className="donut-pct">{done}<span className="donut-pct-total">/{total}</span></span>
          <span className="donut-sub muted small">완료 {donePct}%</span>
        </div>
      </div>

      <ul className="donut-legend">
        {ISSUE_STATUS.map((s) => (
          <li key={s.value} className="donut-legend-item">
            <span className="legend-dot" style={{ background: STATUS_COLOR[s.value] }} />
            <span className="donut-legend-label">{s.label}</span>
            <span className="donut-legend-count">{counts[s.value] || 0}</span>
          </li>
        ))}
        <li className="donut-legend-item total">
          <span className="legend-dot" style={{ background: "transparent" }} />
          <span className="donut-legend-label">전체</span>
          <span className="donut-legend-count">{total}</span>
        </li>
      </ul>
    </div>
  );
}
