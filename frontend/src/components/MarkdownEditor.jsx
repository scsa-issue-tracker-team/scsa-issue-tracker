import { useState } from "react";
import Markdown from "./Markdown.jsx";

export default function MarkdownEditor({
  value,
  onChange,
  rows = 4,
  maxLength,
  placeholder = "Markdown으로 작성할 수 있습니다.",
}) {
  const [mode, setMode] = useState("write");
  const isPreview = mode === "preview";

  return (
    <div className="markdown-editor">
      <div className="markdown-editor-tabs" role="tablist" aria-label="Markdown editor mode">
        <button
          type="button"
          className={mode === "write" ? "editor-tab active" : "editor-tab"}
          onClick={() => setMode("write")}
        >
          쓰기
        </button>
        <button
          type="button"
          className={isPreview ? "editor-tab active" : "editor-tab"}
          onClick={() => setMode("preview")}
        >
          미리보기
        </button>
      </div>

      {isPreview ? (
        <div className="markdown-preview" tabIndex={0}>
          <Markdown>{value}</Markdown>
        </div>
      ) : (
        <textarea
          value={value}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
