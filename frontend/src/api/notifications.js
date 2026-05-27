import { api } from "./client.js";

// GET /api/v1/notifications
// 응답: { items: NotificationResponse[], total, unreadTotal }
// 필터: read(true/false), unreadOnly(bool), notificationType, projectId / 페이징: limit, offset
export function listNotifications({ read, unreadOnly, notificationType, projectId, limit = 30, offset = 0 } = {}) {
  return api.get("/notifications", { read, unreadOnly, notificationType, projectId, limit, offset });
}

// PATCH /api/v1/notifications/{id}/read -> NotificationResponse
export function markNotificationRead(notificationId) {
  return api.patch(`/notifications/${notificationId}/read`);
}

// PATCH /api/v1/notifications/read-all -> 204
export function markAllNotificationsRead() {
  return api.patch(`/notifications/read-all`);
}

// DELETE /api/v1/notifications/{id} -> 204
export function deleteNotification(notificationId) {
  return api.delete(`/notifications/${notificationId}`);
}
