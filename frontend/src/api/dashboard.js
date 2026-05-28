import { api } from "./client.js";

// GET /api/v1/dashboard/activity-daily?days=N
// 응답: [{ date: "YYYY-MM-DD", activityCount: N, breakdown?: { ACTIVITY_TYPE: N, ... } }, ...]
// 의미: 로그인 사용자가 actorId인 활동 로그를 날짜별로 집계.
// (백엔드 feature/dashboard-activity-daily 브랜치에서 추가됨)
export function getActivityDaily({ days = 84 } = {}) {
  return api.get("/dashboard/activity-daily", { days });
}
