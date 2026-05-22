import { useFetch } from "./useAsync.js";
import { listMembers } from "../api/members.js";

// 프로젝트 멤버 목록을 불러와 userId -> username 매핑을 만든다.
// 이슈/댓글의 reporterId, assigneeId, authorId 같은 숫자 ID를 사람 이름으로 보여주기 위함.
// byId 매핑은 실패해도 빈 맵으로 안전하게 폴백되고(이름 대신 #id 표시),
// loading/error/reload는 멤버 패널에서 상태 표시에 쓴다.
export function useProjectMembers(projectId) {
  const { data, loading, error, reload } = useFetch(
    () => listMembers(projectId),
    [projectId]
  );

  const members = Array.isArray(data) ? data : [];
  const byId = {};
  members.forEach((m) => {
    byId[m.userId] = m.username;
  });

  return { members, byId, loading, error, reload };
}

// 매핑에 이름이 있으면 username, 없으면 #id 폴백.
export function userLabel(byId, userId) {
  if (userId == null || userId === "") return "미지정";
  return byId?.[userId] ?? `#${userId}`;
}
