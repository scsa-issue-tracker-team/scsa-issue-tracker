// enum 메타(label + tone)를 받아 색 뱃지로 표시.
export default function Badge({ meta, size = "md" }) {
  if (!meta) return null;
  return <span className={`badge ${meta.tone} badge-${size}`}>{meta.label}</span>;
}
