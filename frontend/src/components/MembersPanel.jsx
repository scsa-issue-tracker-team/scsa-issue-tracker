import { useState } from "react";
import Badge from "./Badge.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { addMember, removeMember } from "../api/members.js";
import { Loading, ErrorState, InlineError } from "./StateViews.jsx";
import { useToast } from "./ToastContext.jsx";

export const roleMeta = (role) =>
  role === "OWNER"
    ? { label: "소유자", tone: "type-feature" }
    : { label: "멤버", tone: "priority-low" };

// 멤버 목록 + 추가/제거. 사이드 패널과 모바일 모달에서 공통으로 쓴다.
// members/loading/error/reload는 부모(useProjectMembers)에서 내려준다.
export default function MembersPanel({
  projectId,
  members = [],
  loading,
  error,
  reload,
}) {
  const { currentUser } = useAuth();
  const myRole = members.find((m) => m.userId === currentUser?.userId)?.role;
  const isOwner = myRole === "OWNER";

  return (
    <div className="members-panel">
      {isOwner && <AddMemberForm projectId={projectId} onAdded={reload} />}

      {loading && <Loading label="멤버 불러오는 중..." />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {!loading && !error && (
        <ul className="member-list">
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              isMe={m.userId === currentUser?.userId}
              canRemove={isOwner && m.role !== "OWNER"}
              projectId={projectId}
              onRemoved={reload}
            />
          ))}
        </ul>
      )}

      {!isOwner && !loading && !error && (
        <p className="muted small modal-hint">멤버 추가는 소유자만 가능합니다.</p>
      )}
    </div>
  );
}

function AddMemberForm({ projectId, onAdded }) {
  const toast = useToast();
  const [username, setUsername] = useState("");
  const { run, loading, error, setError } = useAsync((name) =>
    addMember(projectId, { username: name })
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      const added = await run(username.trim());
      setUsername("");
      toast.success(`'${added?.username ?? username.trim()}' 추가됨`);
      onAdded?.();
    } catch {
      /* error 표시 */
    }
  };

  return (
    <form className="add-member-form" onSubmit={submit}>
      <input
        value={username}
        placeholder="추가할 사용자 아이디"
        onChange={(e) => {
          setUsername(e.target.value);
          if (error) setError(null);
        }}
      />
      <button className="btn primary small" disabled={loading || !username.trim()}>
        {loading ? "추가 중..." : "추가"}
      </button>
      <InlineError error={error} />
    </form>
  );
}

function MemberRow({ member, isMe, canRemove, projectId, onRemoved }) {
  const toast = useToast();
  const { run, loading, error } = useAsync(() =>
    removeMember(projectId, member.userId)
  );

  const handleRemove = async () => {
    try {
      await run();
      toast.success(`'${member.username}' 제거됨`);
      onRemoved?.();
    } catch {
      /* error 표시 */
    }
  };

  return (
    <li className="member-row">
      <span className="avatar sm" aria-hidden>
        {member.username?.[0]?.toUpperCase() ?? "?"}
      </span>
      <span className="member-name">
        {member.username}
        {isMe && <span className="muted small"> (나)</span>}
      </span>
      <Badge meta={roleMeta(member.role)} size="sm" />
      {canRemove && (
        <button
          className="icon-btn remove"
          onClick={handleRemove}
          disabled={loading}
          aria-label={`${member.username} 제거`}
          title="멤버 제거"
        >
          {loading ? "…" : "✕"}
        </button>
      )}
      {error && <InlineError error={error} />}
    </li>
  );
}
