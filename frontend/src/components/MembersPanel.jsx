import { useState } from "react";
import Badge from "./Badge.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { addMember, removeMember, updateMemberRole } from "../api/members.js";
import { useUserDirectory } from "../auth/UserDirectoryContext.jsx";
import { Loading, ErrorState, InlineError } from "./StateViews.jsx";
import { useToast } from "./ToastContext.jsx";

export const roleMeta = (role) =>
  role === "OWNER"
    ? { label: "소유자", tone: "type-feature" }
    : { label: "멤버", tone: "priority-low" };

// 멤버 목록 + 추가/제거/역할변경. 사이드 패널과 모바일 모달에서 공통으로 쓴다.
export default function MembersPanel({ projectId, members = [], loading, error, reload }) {
  const { currentUser } = useAuth();
  const myRole = members.find((m) => m.userId === currentUser?.userId)?.role;
  const isOwner = myRole === "OWNER";
  const ownerCount = members.filter((m) => m.role === "OWNER").length;

  return (
    <div className="members-panel">
      {isOwner && <AddMemberForm projectId={projectId} members={members} onAdded={reload} />}

      {loading && <Loading label="멤버 불러오는 중..." />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {!loading && !error && (
        <ul className="member-list">
          {members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              isMe={m.userId === currentUser?.userId}
              isOwner={isOwner}
              ownerCount={ownerCount}
              projectId={projectId}
              onChanged={reload}
            />
          ))}
        </ul>
      )}

      {!isOwner && !loading && !error && (
        <p className="muted small modal-hint">멤버 관리는 소유자만 가능합니다.</p>
      )}
    </div>
  );
}

function AddMemberForm({ projectId, members, onAdded }) {
  const toast = useToast();
  const { users } = useUserDirectory();
  const [username, setUsername] = useState("");
  const { run, loading, error, setError } = useAsync((name) =>
    addMember(projectId, { username: name })
  );

  // 이미 멤버인 사람 제외한 추천 목록 (자동완성)
  const memberIds = new Set(members.map((m) => m.userId));
  const candidates = users.filter((u) => !memberIds.has(u.id));

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    try {
      const added = await run(username.trim());
      setUsername("");
      toast.success(`'${added?.username ?? username.trim()}' 추가됨`);
      onAdded?.();
    } catch { /* error 표시 */ }
  };

  return (
    <form className="add-member-form" onSubmit={submit}>
      <input
        value={username}
        placeholder="사용자 아이디로 추가"
        list="member-candidates"
        onChange={(e) => { setUsername(e.target.value); if (error) setError(null); }}
      />
      <datalist id="member-candidates">
        {candidates.map((u) => <option key={u.id} value={u.username} />)}
      </datalist>
      <button className="btn primary small" disabled={loading || !username.trim()}>
        {loading ? "추가 중..." : "추가"}
      </button>
      <InlineError error={error} />
    </form>
  );
}

function MemberRow({ member, isMe, isOwner, ownerCount, projectId, onChanged }) {
  const toast = useToast();
  const remove = useAsync(() => removeMember(projectId, member.userId));
  const role = useAsync((next) => updateMemberRole(projectId, member.userId, next));

  // 마지막 소유자는 강등 불가(프로젝트에 소유자 0명 방지)
  const isLastOwner = member.role === "OWNER" && ownerCount <= 1;
  const canRemove = isOwner && member.role !== "OWNER";
  const canChangeRole = isOwner && !isLastOwner;

  const handleRemove = async () => {
    try { await remove.run(); toast.success(`'${member.username}' 제거됨`); onChanged?.(); }
    catch { /* */ }
  };
  const handleRole = async () => {
    const next = member.role === "OWNER" ? "MEMBER" : "OWNER";
    try {
      await role.run(next);
      toast.success(`'${member.username}' → ${next === "OWNER" ? "소유자" : "멤버"}`);
      onChanged?.();
    } catch { /* */ }
  };

  return (
    <li className="member-row">
      <span className="avatar sm" aria-hidden>{member.username?.[0]?.toUpperCase() ?? "?"}</span>
      <span className="member-name">
        {member.username}{isMe && <span className="muted small"> (나)</span>}
      </span>
      <Badge meta={roleMeta(member.role)} size="sm" />
      {isOwner && (
        <div className="member-row-actions">
          {canChangeRole && (
            <button className="icon-btn" onClick={handleRole} disabled={role.loading}
              title={member.role === "OWNER" ? "멤버로 강등" : "소유자로 승격"}
              aria-label="역할 변경">
              {role.loading ? "…" : (member.role === "OWNER" ? "↓" : "↑")}
            </button>
          )}
          {canRemove && (
            <button className="icon-btn remove" onClick={handleRemove} disabled={remove.loading}
              title="멤버 제거" aria-label={`${member.username} 제거`}>
              {remove.loading ? "…" : "✕"}
            </button>
          )}
        </div>
      )}
      {(remove.error || role.error) && <InlineError error={remove.error || role.error} />}
    </li>
  );
}
