import { api } from "./client.js";

// GET /api/v1/users -> UserResponse[]  ({ id, username, email, createdAt })
// 멤버 추가 시 사용자 검색/선택, 전역 id→username 매핑에 사용.
export function listUsers() {
  return api.get("/users");
}
