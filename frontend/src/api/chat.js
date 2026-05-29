import { api } from "./client.js";

// 프로젝트 채팅 REST 엔드포인트.
// 백엔드 계약 (feature/project-chat-websocket → backend-dev 머지됨):
//   GET  /api/v1/projects/{projectId}/chat/messages?limit=50&offset=0
//     -> { items: [ChatMessageResponse], total: number }
//   POST /api/v1/projects/{projectId}/chat/messages
//     -> body: { content }, response: ChatMessageResponse
//
// ChatMessageResponse:
//   { id, projectId, senderId, senderUsername, content, createdAt }

export function listChatMessages(projectId, { limit = 50, offset = 0 } = {}) {
  return api.get(`/projects/${projectId}/chat/messages`, { limit, offset });
}

export function postChatMessage(projectId, content) {
  return api.post(`/projects/${projectId}/chat/messages`, { content });
}
