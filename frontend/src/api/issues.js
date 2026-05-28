import { api } from "./client.js";

// GET /api/v1/projects/{projectId}/issues
// 응답: Spring Page<IssueResponse> = { content, totalElements, totalPages, number, size, ... }
// 필터: status, issueType, priority, assigneeId, reporterId, dueDateFrom, dueDateTo(YYYY-MM-DD), keyword
// 페이징: page, size, sort
export function listIssues(projectId, {
  status, issueType, priority, assigneeId, reporterId,
  dueDateFrom, dueDateTo, keyword,
  page = 0, size = 50, sort = "createdAt,desc",
} = {}) {
  return api.get(`/projects/${projectId}/issues`, {
    status, issueType, priority, assigneeId, reporterId,
    dueDateFrom, dueDateTo, keyword,
    page, size, sort,
  });
}

// GET /api/v1/issues/my -> Spring Page<IssueResponse>
// role: ALL | ASSIGNEE | REPORTER, status 선택, 페이징 page/size/sort
export function listMyIssues({ role = "ALL", status, page = 0, size = 50, sort = "dueDate,asc" } = {}) {
  return api.get(`/issues/my`, { role, status, page, size, sort });
}

// GET /api/v1/issues/my/summary
// -> { totalRelatedCount, assignedToMeCount, reportedByMeCount, overdueCount, dueSoonCount, statusCounts:{[STATUS]:n} }
export function getMyIssueSummary() {
  return api.get(`/issues/my/summary`);
}

// POST /api/v1/projects/{projectId}/issues
// body: { title, content?, issueType, priority, assigneeId?, dueDate?(YYYY-MM-DD) }
// status는 보내지 않는다 — 서버가 OPEN으로 생성. reporterId도 JWT로 결정.
export function createIssue(projectId, payload) {
  return api.post(`/projects/${projectId}/issues`, payload);
}

// GET /api/v1/projects/{projectId}/issues/{issueId} -> IssueResponse
export function getIssue(projectId, issueId) {
  return api.get(`/projects/${projectId}/issues/${issueId}`);
}

// PATCH /api/v1/projects/{projectId}/issues/{issueId}  body: 변경할 필드만
// status는 이 API로 보내지 않는다 — 상태 변경은 전용 API(updateIssueStatus) 사용.
export function updateIssue(projectId, issueId, payload) {
  return api.patch(`/projects/${projectId}/issues/${issueId}`, payload);
}

// PATCH /api/v1/projects/{projectId}/issues/{issueId}/status  body: { status }
// 상태 변경 전용 엔드포인트.
export function updateIssueStatus(projectId, issueId, status) {
  return api.patch(`/projects/${projectId}/issues/${issueId}/status`, { status });
}

// DELETE /api/v1/projects/{projectId}/issues/{issueId} -> 204
export function deleteIssue(projectId, issueId) {
  return api.delete(`/projects/${projectId}/issues/${issueId}`);
}
