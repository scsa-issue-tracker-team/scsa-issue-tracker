import { useState } from "react";
import Modal from "./Modal.jsx";
import Badge from "./Badge.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useFetch, useAsync } from "../hooks/useAsync.js";
import { listMembers, addMember, removeMember } from "../api/members.js";
import { Loading, ErrorState, InlineError } from "./StateViews.jsx";
import { useToast } from "./ToastContext.jsx";

const roleMeta = (role) =>
  role === "OWNER"
    ? { label: "소유자", tone: "type-feature" }
    : { label: "멤버", tone: "priority-low" };

export default function MembersModal({ projectId, open, onClose }) {
  const { currentUser } = useAuth();
  const membersQuery = useFetch(
    () => (open ? listMembers(projectId) : Promise.resolve(null)),
    [projectId, open]
  );

  const members = membersQuery.data ?? [];
  const myRole = members.find((m) => m.userId === currentUser?.userId)?.role;
  const isOwner = myRole === "OWNER";

  return (
    <Modal open={open} title="프로젝트 멤버" onClose={onClose}>
      {isOwner && (
        <AddMemberForm
          projectId={projectId}
          onAdded={() => membersQuery.reload()}
        />
      )}

      {membersQuery.loading && <Loading label="멤버 불러오는 중..." />}
      {membersQuery.error && (
        <ErrorState error={membersQuery.error} onRetry={membersQuery.reload} />
      )}

      {!membersQuery.loading && !membersQuery.error && (
        <ul className="member-list">
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              isMe={m.userId === currentUser?.userId}
              canRemove={isOwner && m.role !== "OWNER"}
              projectId={projectId}
              onRemoved={() => membersQuery.reload()}
            />
          ))}
        </ul>
      )}

      {!isOwner && !membersQuery.loading && (
        <p className="muted small modal-hint">멤버 추가는 소유자만 가능합니다.</p>
      )}
    </Modal>
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
      onAdded();
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
      <button className="btn primary" disabled={loading || !username.trim()}>
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
      onRemoved();
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
