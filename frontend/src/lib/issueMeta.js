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

function lookup(list, value) {
  return list.find((item) => item.value === value) ?? { value, label: value, tone: "" };
}

export const typeMeta = (v) => lookup(ISSUE_TYPE, v);
export const statusMeta = (v) => lookup(ISSUE_STATUS, v);
export const priorityMeta = (v) => lookup(ISSUE_PRIORITY, v);
