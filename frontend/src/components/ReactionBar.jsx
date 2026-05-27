import { useState, useEffect, useCallback } from "react";
import { REACTION_TYPE, reactionMeta } from "../lib/issueMeta.js";

// 이슈/댓글 공용 반응 바.
// fetchFn() -> { reactions: [{reactionType, count, reactedByMe}] }
// addFn(type), removeFn(type) 로 토글.
export default function ReactionBar({ fetchReactions, addReaction, removeReaction }) {
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetchReactions();
      setReactions(res?.reactions ?? []);
    } catch {
      setReactions([]);
    } finally {
      setLoading(false);
    }
  }, [fetchReactions]);

  useEffect(() => { load(); }, [load]);

  const countOf = (type) => reactions.find((r) => r.reactionType === type);

  const toggle = async (type) => {
    const existing = countOf(type);
    setBusy(type);
    try {
      const res = existing?.reactedByMe
        ? await removeReaction(type)
        : await addReaction(type);
      setReactions(res?.reactions ?? []);
      setPicker(false);
    } catch {
      /* 무시 — 서버 거부 시 상태 유지 */
    } finally {
      setBusy(null);
    }
  };

  if (loading) return null;

  const active = reactions.filter((r) => r.count > 0);

  return (
    <div className="reaction-bar">
      {active.map((r) => {
        const meta = reactionMeta(r.reactionType);
        return (
          <button
            key={r.reactionType}
            className={`reaction-chip ${r.reactedByMe ? "reacted" : ""}`}
            onClick={() => toggle(r.reactionType)}
            disabled={busy === r.reactionType}
            title={meta.label}
          >
            <span aria-hidden>{meta.emoji}</span>
            <span className="reaction-count">{r.count}</span>
          </button>
        );
      })}

      <div className="reaction-add-wrap">
        <button
          className="reaction-add"
          onClick={() => setPicker((p) => !p)}
          aria-label="반응 추가"
          title="반응 추가"
        >
          ＋
        </button>
        {picker && (
          <div className="reaction-picker">
            {REACTION_TYPE.map((rt) => (
              <button
                key={rt.value}
                className={`reaction-pick ${countOf(rt.value)?.reactedByMe ? "reacted" : ""}`}
                onClick={() => toggle(rt.value)}
                disabled={busy === rt.value}
                title={rt.label}
                aria-label={rt.label}
              >
                {rt.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
