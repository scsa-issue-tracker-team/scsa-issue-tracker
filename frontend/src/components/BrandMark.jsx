// 브랜드 마크 — 작은 사각 카드 위에 체크 표시. 이슈 트래커의 "할 일 체크" 모티프.
// 글자 의존이 없어서 어떤 폰트 환경에서도 일관된 모양이 나온다.
export default function BrandMark({ size = "md", invert = false }) {
  const sizes = {
    sm: 26,
    md: 32,
    lg: 52,
  };
  const px = sizes[size] ?? sizes.md;
  return (
    <span
      className={`brand-mark brand-mark-${size}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" width="60%" height="60%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="24" height="24" rx="6"
          stroke={invert ? "rgba(255,255,255,0.9)" : "currentColor"}
          strokeWidth="2.5" />
        <path d="M10 16.5 L14.5 21 L22.5 12"
          stroke={invert ? "#fff" : "currentColor"}
          strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
