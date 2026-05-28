import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

// 사용자 입력(이슈 본문·댓글)을 마크다운으로 렌더한다.
// marked로 파싱 후 DOMPurify로 살균 — XSS 방지 때문에 직접 구현 대신 검증된 라이브러리 사용.
marked.setOptions({ breaks: true, gfm: true });

export default function Markdown({ children, className = "" }) {
  const html = useMemo(() => {
    const raw = String(children ?? "");
    if (!raw.trim()) return "";
    const parsed = marked.parse(raw);
    return DOMPurify.sanitize(parsed, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "em", "del", "code", "pre", "blockquote",
        "ul", "ol", "li", "a", "h1", "h2", "h3", "h4", "hr", "table",
        "thead", "tbody", "tr", "th", "td", "img",
      ],
      ALLOWED_ATTR: ["href", "title", "target", "rel", "src", "alt"],
    });
  }, [children]);

  if (!html) return <span className="muted">내용이 없습니다.</span>;

  return (
    <div
      className={`markdown ${className}`}
      // 살균된 HTML이므로 안전
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
