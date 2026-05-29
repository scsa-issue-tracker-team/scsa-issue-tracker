// 모든 백엔드 호출의 단일 진입점.
// - JWT 토큰을 Authorization 헤더에 자동으로 붙인다.
// - 비정상 응답을 ApiError(status 포함)로 정규화한다.
// - 401이면 등록된 핸들러(보통 로그아웃)를 호출한다.

const BASE = "/api/v1";

// AuthContext가 부팅 시 토큰 getter와 401 핸들러를 주입한다.
let getToken = () => null;
let onUnauthorized = () => {};
// ColdStartContext가 "일정 시간 넘게 응답이 안 오는 요청"과 "응답이 돌아온 요청"을 구독한다.
// Render 무료 콜드 스타트(50초) 감지용.
let onSlowRequestStart = () => {};
let onSlowRequestEnd = () => {};
const SLOW_THRESHOLD_MS = 3000;

export function setAuthHooks(hooks) {
  if (hooks.getToken) getToken = hooks.getToken;
  if (hooks.onUnauthorized) onUnauthorized = hooks.onUnauthorized;
}

export function setSlowRequestHooks(hooks) {
  if (hooks.onStart) onSlowRequestStart = hooks.onStart;
  if (hooks.onEnd) onSlowRequestEnd = hooks.onEnd;
}

export class ApiError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 401 / 403 / 404 / 409 / 500 ...
    this.data = data;
  }
}

function buildQuery(params) {
  if (!params) return "";
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    usp.append(key, value);
  });
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

async function request(path, { method = "GET", body, params, auth = true } = {}) {
  const token = auth ? getToken() : null;

  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  // 이 요청이 SLOW_THRESHOLD_MS 넘게 걸리면 계수기 올리고,
  // 응답 올 때까지 이 요청은 "slow" 상태로 카운팅된다.
  let slowTimer = null;
  let markedSlow = false;
  slowTimer = setTimeout(() => {
    markedSlow = true;
    onSlowRequestStart();
  }, SLOW_THRESHOLD_MS);

  try {
    response = await fetch(`${BASE}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    clearTimeout(slowTimer);
    if (markedSlow) onSlowRequestEnd();
    // 네트워크 자체 실패(백엔드 다운 등) → status 0
    throw new ApiError(0, "서버에 연결할 수 없습니다.");
  }
  clearTimeout(slowTimer);
  if (markedSlow) onSlowRequestEnd();

  // 본문 파싱 (없을 수도 있음)
  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  const data =
    text && contentType.includes("application/json")
      ? JSON.parse(text)
      : text || null;

  if (response.ok) return data;

  if (response.status === 401) onUnauthorized();

  const message =
    (data && typeof data === "object" && (data.message || data.error)) ||
    defaultMessage(response.status);

  throw new ApiError(response.status, message, data);
}

function defaultMessage(status) {
  switch (status) {
    case 400:
      return "요청 형식이 올바르지 않습니다.";
    case 401:
      return "로그인이 필요합니다.";
    case 403:
      return "접근 권한이 없습니다.";
    case 404:
      return "찾을 수 없습니다.";
    case 409:
      return "이미 존재하거나 충돌이 발생했습니다.";
    default:
      return "서버 오류가 발생했습니다.";
  }
}

export const api = {
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body, opts) => request(path, { method: "POST", body, ...opts }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
