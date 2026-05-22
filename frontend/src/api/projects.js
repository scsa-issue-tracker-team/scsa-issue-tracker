import { api } from "./client.js";

// GET /api/v1/projects -> ProjectResponse[]  (JWT 사용자 기준, userId 파라미터 없음)
export function listProjects() {
  return api.get("/projects");
}

// POST /api/v1/projects  body: { name, description }  (createdById는 백엔드가 JWT로 결정)
export function createProject({ name, description }) {
  return api.post("/projects", { name, description });
}

// GET /api/v1/projects/{projectId} -> ProjectResponse
// ProjectResponse: { id, createdById, name, description, createdAt, updatedAt }
export function getProject(projectId) {
  return api.get(`/projects/${projectId}`);
}
