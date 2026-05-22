import { api } from "./client.js";

// GET /api/v1/projects/{projectId}/issues/{issueId}/comments
// 응답: { items: CommentResponse[], total }  (페이징: limit, offset — 이슈 목록과 형식이 다름)
export function listComments(projectId, issueId, { limit = 50, offset = 0 } = {}) {
  return api.get(`/projects/${projectId}/issues/${issueId}/comments`, {
    limit,
    offset,
  });
}

// POST /api/v1/projects/{projectId}/issues/{issueId}/comments
// body: { content }  (authorId는 백엔드가 JWT로 결정)
export function createComment(projectId, issueId, { content }) {
  return api.post(`/projects/${projectId}/issues/${issueId}/comments`, { content });
}
