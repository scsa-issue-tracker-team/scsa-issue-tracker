import { useEffect, useState, useMemo } from "react";
import { getActivityDaily } from "../api/dashboard.js";
import { listNotifications } from "../api/notifications.js";

// 활동 히트맵 — GitHub 잔디 스타일.
// 우선순위:
//   1) GET /dashboard/activity-daily (내가 actor인 활동 일별 집계) — 진짜 잔디
//   2) 실패 시(404 등) GET /notifications 폴백 — "관련 이벤트" 라벨로 정직하게 표시
// 백엔드 PR 머지 전이든 후든 화면이 안 깨지게 자동 전환.
const WEEKS = 12;
const DAYS = WEEKS * 7;

function dayKey(d) {
  const x = new Date(d); x.setHours(0,0,0,0);
  return x.toISOString().slice(0, 10);
}

export default function ActivityHeatmap() {
  const [counts, setCounts] = useState({});
  const [source, setSource] = useState(null); // "activity" | "notifications" | null
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    let alive = true;
    // 1차: 진짜 활동 일별 집계
    getActivityDaily({ days: DAYS })
      .then((rows) => {
        if (!alive) return;
        const acc = {};
        (Array.isArray(rows) ? rows : []).forEach((r) => {
          if (r?.date) acc[r.date] = r.activityCount ?? 0;
        });
        setCounts(acc);
        setSource("activity");
      })
      .catch(() => {
        // 2차 폴백: 알림 기반 (백엔드 새 API 머지 전, 또는 401 외 다른 에러)
        if (!alive) return;
        listNotifications({ limit: 200 })
          .then((res) => {
            if (!alive) return;
            const acc = {};
            (res?.items ?? []).forEach((n) => {
              const k = dayKey(n.createdAt);
              acc[k] = (acc[k] || 0) + 1;
            });
            setCounts(acc);
            setSource("notifications");
          })
          .catch(() => { if (alive) setSource("notifications"); });
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  // 오늘 ~ 84일 전까지의 날짜 배열 (오래된 것부터)
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

  // 라벨은 데이터 소스에 맞게 정직하게
  const title = source === "activity" ? "내 활동" : "최근 관련 활동";
  const sub = source === "activity"
    ? `내가 한 활동 · 최근 ${WEEKS}주`
    : `나와 관련된 이벤트 · 최근 ${WEEKS}주`;

  return (
    <div className="heatmap">
      <div className="heatmap-head">
        <h3 className="heatmap-title">{title}</h3>
        <span className="muted small">{sub}</span>
      </div>

      {loading ? (
        <div className="heatmap-skeleton" />
      ) : (
        <>
          <div className="heatmap-grid" role="img" aria-label={`최근 ${WEEKS}주 활동 히트맵`}>
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
            <span className="muted small">
              {hover ? `${hover.key} · ${hover.count}건` : "칸에 마우스를 올려보세요"}
            </span>
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
