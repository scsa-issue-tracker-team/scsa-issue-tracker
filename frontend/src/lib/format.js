// LocalDateTime(예: "2026-05-21T13:45:30") 문자열을 사람이 읽기 좋게 변환.
export function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// "방금 전 / N분 전 / N시간 전 / N일 전" 형태의 상대 시간.
export function timeAgo(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "방금 전";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}일 전`;
  return formatDateTime(value);
}

// --- 마감일(LocalDate, "YYYY-MM-DD") 유틸 ---

// 오늘 날짜를 YYYY-MM-DD로 (input[type=date] value, dueDateFrom 등에 사용)
export function todayISO() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

// 마감일 표시용: "2026-05-21" -> "5월 21일" / 올해 아니면 "2025. 5. 21."
export function formatDueDate(value) {
  if (!value) return "";
  const date = new Date(value + "T00:00:00");
  if (Number.isNaN(date.getTime())) return String(value);
  const now = new Date();
  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(date);
  }
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

// 마감일 상태: overdue(지남) / soon(3일 이내) / normal / none
// 완료(RESOLVED/CLOSED) 이슈는 마감 강조를 끈다.
export function dueState(dueDate, status) {
  if (!dueDate) return "none";
  if (status === "RESOLVED" || status === "CLOSED") return "done";
  const due = new Date(dueDate + "T23:59:59");
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "soon";
  return "normal";
}

// 마감일 라벨: "3일 지남" / "오늘" / "내일" / "3일 남음"
export function dueLabel(dueDate) {
  if (!dueDate) return "";
  const due = new Date(dueDate + "T23:59:59");
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return `${Math.abs(diffDays)}일 지남`;
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "내일";
  return `${diffDays}일 남음`;
}
