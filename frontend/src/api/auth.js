import { api } from "./client.js";

// POST /api/v1/auth/login  body: { username, password } -> { tokenType, accessToken }
export function login({ username, password }) {
  return api.post("/auth/login", { username, password }, { auth: false });
}

// GET /api/v1/auth/me -> { userId, username }
export function getMe() {
  return api.get("/auth/me");
}

// POST /api/v1/users  body: { username, email, password } -> { id, username, email, createdAt }
export function signup({ username, email, password }) {
  return api.post("/users", { username, email, password }, { auth: false });
}
