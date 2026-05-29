import { useEffect } from "react";

// 페이지별 문서 타이틀(브라우저 탭 제목)을 설정한다.
// 예: useDocumentTitle("내 작업함") -> "내 작업함 · SCSA Tracker"
// title이 없으면 기본 "SCSA Issue Tracker"로 되돌린다.
const BASE = "SCSA Tracker";

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : "SCSA Issue Tracker";
    return () => { document.title = "SCSA Issue Tracker"; };
  }, [title]);
}
