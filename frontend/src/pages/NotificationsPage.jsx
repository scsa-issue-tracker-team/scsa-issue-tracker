import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listNotifications, markNotificationRead,
  markAllNotificationsRead, deleteNotification,
} from "../api/notifications.js";
import { useFetch, useAsync } from "../hooks/useAsync.js";
import { Loading, ErrorState, EmptyState } from "../components/StateViews.jsx";
import { useUserDirectory, nameOf } from "../auth/UserDirectoryContext.jsx";
import { useNotifications } from "../components/NotificationContext.jsx";
import { useToast } from "../components/ToastContext.jsx";
import { NOTIFICATION_TYPE, notificationMeta, humanizeMessage } from "../lib/issueMeta.js";
import { timeAgo } from "../lib/format.js";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { byId } = useUserDirectory();
  const { refresh: refreshBadge } = useNotifications();

  const [filter, setFilter] = useState({ tab: "all", type: "" }); // tab: all | unread
  const query = useFetch(
    () => listNotifications({
      unreadOnly: filter.tab === "unread",
      notificationType: filter.type || undefined,
      limit: 50,
    }),
    [filter.tab, filter.type]
  );

  const readAll = useAsync(markAllNotificationsRead);

  const items = query.data?.items ?? [];
  const unreadTotal = query.data?.unreadTotal ?? 0;

  const handleReadAll = async () => {
    try {
      await readAll.run();
      toast.success("모두 읽음 처리했습니다");
      query.reload();
      refreshBadge();
    } catch { /* */ }
  };

  const afterChange = () => { query.reload(); refreshBadge(); };

  return (
    <div className="page">
      <div className="page-head">
        <div className="page-head-text">
          <p className="eyebrow">Notifications</p>
          <h1>알림 {unreadTotal > 0 && <span className="muted">· 안읽음 {unreadTotal}</span>}</h1>
        </div>
        {unreadTotal > 0 && (
          <button className="btn ghost" onClick={handleReadAll} disabled={readAll.loading}>
            {readAll.loading ? "처리 중..." : "모두 읽음"}
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div className="seg-tabs">
          <button className={filter.tab === "all" ? "seg active" : "seg"}
            onClick={() => setFilter({ ...filter, tab: "all" })}>전체</button>
          <button className={filter.tab === "unread" ? "seg active" : "seg"}
            onClick={() => setFilter({ ...filter, tab: "unread" })}>안읽음</button>
        </div>
        <label className="filter-select">
          <span className="muted small">유형</span>
          <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
            <option value="">전체</option>
            {NOTIFICATION_TYPE.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
      </div>

      {query.loading && <Loading label="알림 불러오는 중..." />}
      {query.error && <ErrorState error={query.error} onRetry={query.reload} />}
      {!query.loading && !query.error && items.length === 0 && (
        <EmptyState title="알림이 없습니다"
          description={filter.tab === "unread" ? "안읽은 알림이 없습니다." : "아직 받은 알림이 없습니다."} />
      )}

      {items.length > 0 && (
        <ul className="notif-list">
          {items.map((n) => (
            <NotifRow key={n.id} notif={n} byId={byId} navigate={navigate}
              onChanged={afterChange} toast={toast} />
          ))}
        </ul>
      )}
    </div>
  );
}

function NotifRow({ notif, byId, navigate, onChanged, toast }) {
  const meta = notificationMeta(notif.notificationType);
  const readOne = useAsync(() => markNotificationRead(notif.id));
  const del = useAsync(() => deleteNotification(notif.id));

  const goTo = async () => {
    if (!notif.read) { try { await readOne.run(); onChanged(); } catch { /* */ } }
    if (notif.projectId && notif.issueId) {
      navigate(`/projects/${notif.projectId}/issues/${notif.issueId}`);
    }
  };

  const handleRead = async (e) => {
    e.stopPropagation();
    try { await readOne.run(); onChanged(); } catch { /* */ }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try { await del.run(); toast.success("알림을 삭제했습니다"); onChanged(); } catch { /* */ }
  };

  return (
    <li className={`notif-row ${notif.read ? "" : "unread"}`} onClick={goTo}>
      <span className={`notif-icon-lg ${meta.tone}`} aria-hidden>{meta.icon}</span>
      <div className="notif-body">
        <div className="notif-top">
          <span className="notif-type-label">{meta.label}</span>
          {!notif.read && <span className="unread-dot" aria-label="안읽음" />}
        </div>
        <p className="notif-msg">{humanizeMessage(notif.message) || meta.label}</p>
        <span className="muted small">
          {nameOf(byId, notif.actorId)} · {timeAgo(notif.createdAt)}
          {notif.projectId && notif.issueId && " · 이동하려면 클릭"}
        </span>
      </div>
      <div className="notif-actions" onClick={(e) => e.stopPropagation()}>
        {!notif.read && (
          <button className="icon-btn" onClick={handleRead} disabled={readOne.loading}
            title="읽음 처리" aria-label="읽음 처리">✓</button>
        )}
        <button className="icon-btn remove" onClick={handleDelete} disabled={del.loading}
          title="삭제" aria-label="알림 삭제">✕</button>
      </div>
    </li>
  );
}
