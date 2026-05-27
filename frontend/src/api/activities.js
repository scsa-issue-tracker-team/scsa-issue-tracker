import { api } from "./client.js";

// GET /api/v1/projects/{projectId}/issues/{issueId}/activities
// -> ActivityLogResponse[]  ({ id, projectId, issueId, actorId, activityType, message, createdAt })
export function listActivities(projectId, issueId) {
  return api.get(`/projects/${projectId}/issues/${issueId}/activities`);
}
