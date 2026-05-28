import { listActivities } from "../api/activities.js";
import { useFetch } from "../hooks/useAsync.js";
import { useUserDirectory, nameOf } from "../auth/UserDirectoryContext.jsx";
import { Loading, EmptyState } from "./StateViews.jsx";
import { formatDateTime } from "../lib/format.js";
import { humanizeMessage } from "../lib/issueMeta.js";

const ACTIVITY_META = {
  ISSUE_CREATED: { icon: "✨", label: "이슈 생성" },
  ISSUE_UPDATED: { icon: "✏️", label: "이슈 수정" },
  ISSUE_STATUS_CHANGED: { icon: "🔄", label: "상태 변경" },
  ISSUE_ASSIGNEE_CHANGED: { icon: "👤", label: "담당자 변경" },
  COMMENT_CREATED: { icon: "💬", label: "댓글 작성" },
};

export default function ActivityTimeline({ projectId, issueId }) {
  const { byId } = useUserDirectory();
  const query = useFetch(() => listActivities(projectId, issueId), [projectId, issueId]);

  const activities = Array.isArray(query.data) ? query.data : [];

  return (
    <section className="activity-section">
      <h2 className="section-title">활동 기록</h2>
      {query.loading && <Loading label="활동 불러오는 중..." />}
      {!query.loading && activities.length === 0 && (
        <EmptyState title="활동 기록 없음" description="아직 기록된 활동이 없습니다." />
      )}
      {activities.length > 0 && (
        <ul className="activity-timeline">
          {activities.map((a) => {
            const meta = ACTIVITY_META[a.activityType] || { icon: "•", label: a.activityType };
            return (
              <li key={a.id} className="activity-item">
                <span className="activity-icon" aria-hidden>{meta.icon}</span>
                <div className="activity-body">
                  <p className="activity-msg">
                    <strong>{nameOf(byId, a.actorId)}</strong>{" "}
                    {humanizeMessage(a.message) || meta.label}
                  </p>
                  <span className="muted small">{formatDateTime(a.createdAt)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
