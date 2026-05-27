import { api } from "./client.js";

// 댓글/대댓글 응답(CommentResponse): { id, authorId, issueId, parentId, content, deleted, replyCount, createdAt, updatedAt }
// deleted=true면 content는 "삭제된 댓글입니다."로 내려온다 (soft delete).

// --- 댓글 ---
// GET .../comments -> { items, total }  (limit, offset)
export function listComments(projectId, issueId, { limit = 50, offset = 0 } = {}) {
  return api.get(`/projects/${projectId}/issues/${issueId}/comments`, { limit, offset });
}
export function createComment(projectId, issueId, { content }) {
  return api.post(`/projects/${projectId}/issues/${issueId}/comments`, { content });
}
export function updateComment(projectId, issueId, commentId, { content }) {
  return api.patch(`/projects/${projectId}/issues/${issueId}/comments/${commentId}`, { content });
}
export function deleteComment(projectId, issueId, commentId) {
  return api.delete(`/projects/${projectId}/issues/${issueId}/comments/${commentId}`);
}

// --- 대댓글 ---
// GET .../comments/{commentId}/replies -> { items, total }  (limit, offset)
export function listReplies(projectId, issueId, commentId, { limit = 50, offset = 0 } = {}) {
  return api.get(`/projects/${projectId}/issues/${issueId}/comments/${commentId}/replies`, { limit, offset });
}
export function createReply(projectId, issueId, commentId, { content }) {
  return api.post(`/projects/${projectId}/issues/${issueId}/comments/${commentId}/replies`, { content });
}
export function updateReply(projectId, issueId, commentId, replyId, { content }) {
  return api.patch(`/projects/${projectId}/issues/${issueId}/comments/${commentId}/replies/${replyId}`, { content });
}
export function deleteReply(projectId, issueId, commentId, replyId) {
  return api.delete(`/projects/${projectId}/issues/${issueId}/comments/${commentId}/replies/${replyId}`);
}
