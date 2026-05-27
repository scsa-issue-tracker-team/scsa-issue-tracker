// 백엔드 enum과 1:1로 맞춘 표시용 메타데이터.
// 백엔드 enum이 바뀌면 이 파일만 고치면 된다.
// 값(value)은 백엔드로 그대로 보내고, label/tone은 화면 표시에만 쓴다.

export const ISSUE_TYPE = [
  { value: "BUG", label: "버그", tone: "type-bug" },
  { value: "FEATURE", label: "기능", tone: "type-feature" },
  { value: "REQUEST", label: "요청", tone: "type-request" },
  { value: "TASK", label: "작업", tone: "type-task" },
];

// 상태는 OPEN / IN_PROGRESS / RESOLVED / CLOSED (DONE 폐기).
// 이슈 생성 시에는 서버가 OPEN으로 고정하므로 생성 폼에서는 선택하지 않는다.
// 상태 변경은 전용 API(PATCH .../status)로만 한다.
export const ISSUE_STATUS = [
  { value: "OPEN", label: "열림", tone: "status-open" },
  { value: "IN_PROGRESS", label: "진행 중", tone: "status-progress" },
  { value: "RESOLVED", label: "해결됨", tone: "status-resolved" },
  { value: "CLOSED", label: "닫힘", tone: "status-closed" },
];

export const ISSUE_PRIORITY = [
  { value: "LOW", label: "낮음", tone: "priority-low" },
  { value: "MEDIUM", label: "보통", tone: "priority-medium" },
  { value: "HIGH", label: "높음", tone: "priority-high" },
  { value: "CRITICAL", label: "긴급", tone: "priority-critical" },
];

// 반응 타입 (이모지 + 라벨). 백엔드 ReactionType과 1:1.
export const REACTION_TYPE = [
  { value: "THUMBS_UP", emoji: "👍", label: "좋아요" },
  { value: "HEART", emoji: "❤️", label: "하트" },
  { value: "EYES", emoji: "👀", label: "주목" },
  { value: "ROCKET", emoji: "🚀", label: "로켓" },
  { value: "CHECK", emoji: "✅", label: "확인" },
  { value: "LAUGH", emoji: "😄", label: "웃음" },
];

// 알림 타입 라벨/아이콘. 백엔드 NotificationType과 1:1.
export const NOTIFICATION_TYPE = [
  { value: "ISSUE_ASSIGNED", label: "이슈 배정", icon: "📌", tone: "type-feature" },
  { value: "ISSUE_STATUS_CHANGED", label: "상태 변경", icon: "🔄", tone: "status-progress" },
  { value: "COMMENT_CREATED", label: "새 댓글", icon: "💬", tone: "type-task" },
  { value: "REPLY_CREATED", label: "새 답글", icon: "↩️", tone: "type-task" },
  { value: "REACTION_ADDED", label: "반응", icon: "😀", tone: "type-request" },
];

function lookup(list, value) {
  return list.find((item) => item.value === value) ?? { value, label: value, tone: "" };
}

export const typeMeta = (v) => lookup(ISSUE_TYPE, v);
export const statusMeta = (v) => lookup(ISSUE_STATUS, v);
export const priorityMeta = (v) => lookup(ISSUE_PRIORITY, v);
export const reactionMeta = (v) => REACTION_TYPE.find((r) => r.value === v) ?? { value: v, emoji: "•", label: v };
export const notificationMeta = (v) => lookup(NOTIFICATION_TYPE, v);

// 서버 알림/활동 메시지에 박힌 영어 enum 토큰을 한글 라벨로 치환한다.
// 예: "이슈 상태가 IN_PROGRESS(으)로 변경되었습니다." -> "이슈 상태가 '진행 중'으로 변경되었습니다."
const ENUM_LABEL = {};
[...ISSUE_STATUS, ...ISSUE_TYPE, ...ISSUE_PRIORITY].forEach((m) => { ENUM_LABEL[m.value] = m.label; });

export function humanizeMessage(message) {
  if (!message) return message;
  // 긴 enum부터 치환 (IN_PROGRESS가 OPEN보다 먼저 매칭되도록 길이 내림차순)
  const tokens = Object.keys(ENUM_LABEL).sort((a, b) => b.length - a.length);
  let out = message;
  tokens.forEach((token) => {
    const re = new RegExp(`\\b${token}\\b`, "g");
    out = out.replace(re, `'${ENUM_LABEL[token]}'`);
  });
  // 조사 정리: "'진행 중'(으)로" 의 (으)로를 받침에 맞게
  out = out.replace(/'([^']+)'\(으\)로/g, (_, label) => {
    const last = label[label.length - 1];
    const code = last.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const hasJong = (code - 0xac00) % 28 !== 0;
      return `'${label}'${hasJong ? "으로" : "로"}`;
    }
    return `'${label}'로`;
  });
  return out;
}
