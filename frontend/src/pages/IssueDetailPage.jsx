import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getIssue, updateIssue, updateIssueStatus, deleteIssue } from "../api/issues.js";
import {
  getIssueReactions, addIssueReaction, removeIssueReaction,
} from "../api/reactions.js";
import { useFetch, useAsync } from "../hooks/useAsync.js";
import { Loading, ErrorState, InlineError } from "../components/StateViews.jsx";
import Badge from "../components/Badge.jsx";
import ReactionBar from "../components/ReactionBar.jsx";
import ActivityTimeline from "../components/ActivityTimeline.jsx";
import CommentSection from "../components/CommentSection.jsx";
import Markdown from "../components/Markdown.jsx";
import { ISSUE_TYPE, ISSUE_STATUS, ISSUE_PRIORITY, typeMeta, statusMeta, priorityMeta } from "../lib/issueMeta.js";
import { formatDateTime, timeAgo, formatDueDate, dueState, dueLabel, todayISO } from "../lib/format.js";
import { useProjectMembers } from "../hooks/useProjectMembers.js";
import { useUserDirectory, nameOf } from "../auth/UserDirectoryContext.jsx";
import { useToast } from "../components/ToastContext.jsx";

export default function IssueDetailPage() {
  const { projectId, issueId } = useParams();
  const navigate = useNavigate();

  const issueQuery = useFetch(() => getIssue(projectId, issueId), [projectId, issueId]);
  const { members } = useProjectMembers(projectId);
  const { byId } = useUserDirectory();
  const [editing, setEditing] = useState(false);

  if (issueQuery.loading) {
    return (
      <div className="page narrow">
        <Breadcrumb projectId={projectId} />
        <Loading label="이슈 불러오는 중..." />
      </div>
    );
  }
  if (issueQuery.error) {
    return (
      <div className="page narrow">
        <Breadcrumb projectId={projectId} />
        <ErrorState error={issueQuery.error} onRetry={issueQuery.reload} />
      </div>
    );
  }

  const issue = issueQuery.data;

  return (
    <div className="page">
      <Breadcrumb projectId={projectId} title={issue.title} />

      {editing ? (
        <IssueEditForm
          projectId={projectId}
          issue={issue}
          members={members}
          onCancel={() => setEditing(false)}
          onSaved={() => { setEditing(false); issueQuery.reload(); }}
        />
      ) : (
        <div className="issue-detail-layout">
          <div className="issue-detail-main">
            <IssueView
              issue={issue}
              projectId={projectId}
              byId={byId}
              onEdit={() => setEditing(true)}
              onStatusChanged={issueQuery.reload}
              onDeleted={() => navigate(`/projects/${projectId}`, { replace: true })}
            />
            <CommentSection projectId={projectId} issueId={issueId} />
            <ActivityTimeline projectId={projectId} issueId={issueId} />
          </div>
          <IssueMetaSidebar issue={issue} byId={byId} />
        </div>
      )}
    </div>
  );
}

// 우측 메타 사이드바: 상태·담당자·작성자·우선순위·마감을 한눈에
function IssueMetaSidebar({ issue, byId }) {
  const ds = dueState(issue.dueDate, issue.status);
  return (
    <aside className="issue-meta-side">
      <div className="side-card meta-card">
        <MetaRow label="상태"><Badge meta={statusMeta(issue.status)} size="sm" /></MetaRow>
        <MetaRow label="유형"><Badge meta={typeMeta(issue.issueType)} size="sm" /></MetaRow>
        <MetaRow label="우선순위"><Badge meta={priorityMeta(issue.priority)} size="sm" /></MetaRow>
        <div className="meta-divider" />
        <MetaRow label="담당자">
          <span className="meta-person">
            <span className="avatar xs" aria-hidden>
              {issue.assigneeId ? (nameOf(byId, issue.assigneeId)[0]?.toUpperCase() ?? "?") : "·"}
            </span>
            {nameOf(byId, issue.assigneeId)}
          </span>
        </MetaRow>
        <MetaRow label="작성자">
          <span className="meta-person">
            <span className="avatar xs" aria-hidden>{nameOf(byId, issue.reporterId)[0]?.toUpperCase() ?? "?"}</span>
            {nameOf(byId, issue.reporterId)}
          </span>
        </MetaRow>
        <div className="meta-divider" />
        <MetaRow label="마감일">
          {issue.dueDate
            ? <span className={`due-chip due-${ds}`}>{formatDueDate(issue.dueDate)} · {dueLabel(issue.dueDate)}</span>
            : <span className="muted small">없음</span>}
        </MetaRow>
        <MetaRow label="생성"><span className="muted small">{formatDateTime(issue.createdAt)}</span></MetaRow>
        {issue.updatedAt && issue.updatedAt !== issue.createdAt && (
          <MetaRow label="수정"><span className="muted small">{timeAgo(issue.updatedAt)}</span></MetaRow>
        )}
      </div>
    </aside>
  );
}

function MetaRow({ label, children }) {
  return (
    <div className="meta-row">
      <span className="meta-label">{label}</span>
      <span className="meta-value">{children}</span>
    </div>
  );
}

function Breadcrumb({ projectId, title }) {
  return (
    <nav className="breadcrumb">
      <Link to="/projects">프로젝트</Link>
      <span className="sep">/</span>
      <Link to={`/projects/${projectId}`}>이슈 목록</Link>
      <span className="sep">/</span>
      <span className="current">{title ?? "..."}</span>
    </nav>
  );
}

function IssueView({ issue, projectId, byId, onEdit, onDeleted, onStatusChanged }) {
  const toast = useToast();
  const del = useAsync(() => deleteIssue(projectId, issue.id));
  const statusUpdate = useAsync((next) => updateIssueStatus(projectId, issue.id, next));
  const [confirming, setConfirming] = useState(false);
  const ds = dueState(issue.dueDate, issue.status);

  const handleStatusChange = async (next) => {
    if (next === issue.status) return;
    try {
      await statusUpdate.run(next);
      toast.success(`상태가 '${statusMeta(next).label}'(으)로 변경됨`);
      onStatusChanged();
    } catch { /* */ }
  };
  const handleDelete = async () => {
    try { await del.run(); toast.success("이슈가 삭제되었습니다"); onDeleted(); }
    catch { /* */ }
  };

  return (
    <article className="issue-detail">
      <header className="issue-detail-head">
        <label className="status-control">
          <span className="muted small">상태</span>
          <select value={issue.status} disabled={statusUpdate.loading}
            onChange={(e) => handleStatusChange(e.target.value)}>
            {ISSUE_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <div className="row-actions">
          <button className="btn ghost small" onClick={onEdit}>수정</button>
          <button className="btn danger small" onClick={() => setConfirming(true)}>삭제</button>
        </div>
      </header>

      <InlineError error={statusUpdate.error} />

      <h1 className="issue-detail-title">
        <span className="issue-key">#{issue.id}</span> {issue.title}
      </h1>

      {issue.dueDate && (
        <div className={`due-banner due-${ds}`}>
          <span aria-hidden>🗓️</span>
          마감 {formatDueDate(issue.dueDate)}
          <span className="due-banner-label">· {dueLabel(issue.dueDate)}</span>
        </div>
      )}

      <div className="issue-detail-body">
        <Markdown>{issue.content}</Markdown>
      </div>

      <ReactionBar
        fetchReactions={() => getIssueReactions(projectId, issue.id)}
        addReaction={(t) => addIssueReaction(projectId, issue.id, t)}
        removeReaction={(t) => removeIssueReaction(projectId, issue.id, t)}
      />

      {confirming && (
        <div className="confirm-bar">
          <span>정말 이 이슈를 삭제할까요? 되돌릴 수 없습니다.</span>
          <div className="row-actions">
            <button className="btn ghost small" onClick={() => setConfirming(false)} disabled={del.loading}>취소</button>
            <button className="btn danger small" onClick={handleDelete} disabled={del.loading}>
              {del.loading ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>
      )}
      <InlineError error={del.error} />
    </article>
  );
}

function IssueEditForm({ projectId, issue, members, onCancel, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: issue.title ?? "",
    content: issue.content ?? "",
    issueType: issue.issueType,
    priority: issue.priority,
    assigneeId: issue.assigneeId ?? "",
    dueDate: issue.dueDate ?? "",
  });
  const { run, loading, error } = useAsync((payload) => updateIssue(projectId, issue.id, payload));

  const submit = async (e) => {
    e.preventDefault();
    // status는 여기서 보내지 않는다 — 상태 변경은 전용 셀렉터로.
    const payload = {
      title: form.title,
      content: form.content || null,
      issueType: form.issueType,
      priority: form.priority,
      assigneeId: form.assigneeId === "" ? null : Number(form.assigneeId),
      dueDate: form.dueDate || null,
    };
    try { await run(payload); toast.success("이슈가 수정되었습니다"); onSaved(); }
    catch { /* */ }
  };

  return (
    <form className="issue-detail form" onSubmit={submit}>
      <h2 className="section-title">이슈 수정</h2>
      <label className="field">
        <span>제목</span>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <label className="field">
        <span>내용</span>
        <textarea value={form.content} rows={5} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      </label>
      <div className="field-row">
        <EditSelect label="유형" value={form.issueType} options={ISSUE_TYPE} onChange={(v) => setForm({ ...form, issueType: v })} />
        <EditSelect label="우선순위" value={form.priority} options={ISSUE_PRIORITY} onChange={(v) => setForm({ ...form, priority: v })} />
      </div>
      <div className="field-row">
        <label className="field">
          <span>담당자</span>
          <select value={form.assigneeId === null ? "" : String(form.assigneeId)}
            onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
            <option value="">미지정</option>
            {members.map((m) => <option key={m.userId} value={m.userId}>{m.username}</option>)}
          </select>
        </label>
        <label className="field">
          <span>마감일</span>
          <input type="date" value={form.dueDate || ""}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </label>
      </div>
      <p className="muted small">상태는 상세 화면의 '상태' 셀렉터로 변경하세요.</p>
      <InlineError error={error} />
      <div className="form-actions">
        <button type="button" className="btn ghost" onClick={onCancel}>취소</button>
        <button className="btn primary" disabled={loading}>{loading ? "저장 중..." : "저장"}</button>
      </div>
    </form>
  );
}

function EditSelect({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
