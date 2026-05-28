import { useEffect, useState, useMemo } from "react";
import { listNotifications } from "../api/notifications.js";

// 활동 히트맵 — GitHub 잔디 스타일.
// 데이터: /notifications 의 createdAt을 일별로 카운트.
// "내가 받은 알림" ≈ "나와 관련된 활동" 으로 정직하게 라벨링.
const WEEKS = 12;
const DAYS = WEEKS * 7;

function dayKey(d) {
  const x = new Date(d); x.setHours(0,0,0,0);
  return x.toISOString().slice(0, 10);
}

export default function ActivityHeatmap() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    let alive = true;
    // 충분히 큰 limit로 가져와서 클라에서 일별 집계.
    // 알림이 너무 많은 환경에선 잘릴 수 있는데, 화면 안내로 정직하게 처리.
    listNotifications({ limit: 200 })
      .then((res) => {
        if (!alive) return;
        const acc = {};
        (res?.items ?? []).forEach((n) => {
          const k = dayKey(n.createdAt);
          acc[k] = (acc[k] || 0) + 1;
        });
        setCounts(acc);
      })
      .catch(() => { /* 무시 — 빈 히트맵으로 */ })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  // 오늘 ~ 84일 전까지의 날짜 배열을 만든다 (오래된 것부터)
  const cells = useMemo(() => {
    const arr = [];
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const k = dayKey(d);
      arr.push({ date: d, key: k, count: counts[k] || 0 });
    }
    return arr;
  }, [counts]);

  const maxCount = Math.max(...cells.map((c) => c.count), 1);
  const levelOf = (n) => {
    if (n === 0) return 0;
    const ratio = n / maxCount;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  // 12주 × 7일 그리드 (열=주, 행=요일)
  const weeks = [];
  for (let w = 0; w < WEEKS; w++) {
    weeks.push(cells.slice(w * 7, (w + 1) * 7));
  }

  return (
    <div className="heatmap">
      <div className="heatmap-head">
        <h3 className="heatmap-title">최근 활동</h3>
        <span className="muted small">알림 기준 · 최근 {WEEKS}주</span>
      </div>

      {loading ? (
        <div className="heatmap-skeleton" />
      ) : (
        <>
          <div className="heatmap-grid" role="img" aria-label="최근 12주 활동 히트맵">
            {weeks.map((week, wi) => (
              <div key={wi} className="heatmap-col">
                {week.map((c) => (
                  <div
                    key={c.key}
                    className={`heatmap-cell level-${levelOf(c.count)}`}
                    onMouseEnter={() => setHover(c)}
                    onMouseLeave={() => setHover(null)}
                    title={`${c.key} · ${c.count}건`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="heatmap-foot">
            <span className="muted small">{hover ? `${hover.key} · ${hover.count}건` : "칸에 마우스를 올려보세요"}</span>
            <span className="heatmap-legend">
              <span className="muted small">적음</span>
              <span className="heatmap-cell level-0" />
              <span className="heatmap-cell level-1" />
              <span className="heatmap-cell level-2" />
              <span className="heatmap-cell level-3" />
              <span className="heatmap-cell level-4" />
              <span className="muted small">많음</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
