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

  // 로컬에서 토글된 반응 배열을 계산 (옵티미스틱 갱신용)
  const applyToggle = (list, type) => {
    const existing = list.find((r) => r.reactionType === type);
    if (existing) {
      const delta = existing.reactedByMe ? -1 : 1;
      return list
        .map((r) => r.reactionType === type
          ? { ...r, count: r.count + delta, reactedByMe: !r.reactedByMe }
          : r)
        .filter((r) => r.count > 0 || r.reactedByMe);
    }
    // 새 반응 추가
    return [...list, { reactionType: type, count: 1, reactedByMe: true }];
  };

  const toggle = async (type) => {
    const existing = countOf(type);
    const prev = reactions; // 롤백용 스냅샷
    // 1) 즉시 화면 반영 (옵티미스틱)
    setReactions((cur) => applyToggle(cur, type));
    setPicker(false);
    setBusy(type);
    try {
      // 2) 서버 반영 후 정답으로 동기화
      const res = existing?.reactedByMe
        ? await removeReaction(type)
        : await addReaction(type);
      if (res?.reactions) setReactions(res.reactions);
    } catch {
      // 3) 실패 시 롤백
      setReactions(prev);
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
