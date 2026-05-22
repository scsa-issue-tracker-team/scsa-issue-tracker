import { useFetch } from "./useAsync.js";
import { listMembers } from "../api/members.js";

// 프로젝트 멤버 목록을 불러와 userId -> username 매핑을 만든다.
// 이슈/댓글의 reporterId, assigneeId, authorId 같은 숫자 ID를 사람 이름으로 보여주기 위함.
// 멤버 조회가 실패해도 화면은 떠야 하므로 에러는 삼키고 빈 맵으로 폴백한다.
export function useProjectMembers(projectId) {
  const { data, loading, reload } = useFetch(
    () => listMembers(projectId).catch(() => []),
    [projectId]
  );

  const members = data ?? [];
  const byId = {};
  members.forEach((m) => {
    byId[m.userId] = m.username;
  });

  return { members, byId, loading, reload };
}

// 매핑에 이름이 있으면 username, 없으면 #id 폴백.
export function userLabel(byId, userId) {
  if (userId == null || userId === "") return "미지정";
  return byId?.[userId] ?? `#${userId}`;
}
