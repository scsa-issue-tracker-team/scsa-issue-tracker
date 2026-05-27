import { api } from "./client.js";

// GET /api/v1/projects/{projectId}/members -> ProjectMemberResponse[]
// ProjectMemberResponse: { id, projectId, userId, username, role('OWNER'|'MEMBER'), createdAt }
// 접근: 프로젝트 멤버 누구나
export function listMembers(projectId) {
  return api.get(`/projects/${projectId}/members`);
}

// POST /api/v1/projects/{projectId}/members  body: { username }  -> ProjectMemberResponse (201)
// 접근: OWNER만. 추가되는 멤버는 항상 MEMBER 역할.
export function addMember(projectId, { username }) {
  return api.post(`/projects/${projectId}/members`, { username });
}

// DELETE /api/v1/projects/{projectId}/members/{userId} -> 204
// 접근: OWNER만. OWNER/생성자는 제거 불가(백엔드에서 막음).
export function removeMember(projectId, userId) {
  return api.delete(`/projects/${projectId}/members/${userId}`);
}

// PATCH /api/v1/projects/{projectId}/members/{userId}/role  body: { role: 'OWNER'|'MEMBER' }
// 접근: OWNER만.
export function updateMemberRole(projectId, userId, role) {
  return api.patch(`/projects/${projectId}/members/${userId}/role`, { role });
}
