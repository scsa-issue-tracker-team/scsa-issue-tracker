import { api } from "./client.js";

// 반응 응답: { reactions: [{ reactionType, count, reactedByMe }] }

// 이슈 반응
export function getIssueReactions(projectId, issueId) {
  return api.get(`/projects/${projectId}/issues/${issueId}/reactions`);
}
export function addIssueReaction(projectId, issueId, reactionType) {
  return api.post(`/projects/${projectId}/issues/${issueId}/reactions`, { reactionType });
}
export function removeIssueReaction(projectId, issueId, reactionType) {
  return api.delete(`/projects/${projectId}/issues/${issueId}/reactions/${reactionType}`);
}

// 댓글 반응
export function getCommentReactions(projectId, issueId, commentId) {
  return api.get(`/projects/${projectId}/issues/${issueId}/comments/${commentId}/reactions`);
}
export function addCommentReaction(projectId, issueId, commentId, reactionType) {
  return api.post(`/projects/${projectId}/issues/${issueId}/comments/${commentId}/reactions`, { reactionType });
}
export function removeCommentReaction(projectId, issueId, commentId, reactionType) {
  return api.delete(`/projects/${projectId}/issues/${issueId}/comments/${commentId}/reactions/${reactionType}`);
}
