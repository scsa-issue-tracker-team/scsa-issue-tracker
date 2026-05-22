import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getIssue, updateIssue, updateIssueStatus, deleteIssue } from "../api/issues.js";
import { listComments, createComment } from "../api/comments.js";
import { useFetch, useAsync } from "../hooks/useAsync.js";
import { Loading, ErrorState, EmptyState, InlineError } from "../components/StateViews.jsx";
import Badge from "../components/Badge.jsx";
import { ISSUE_TYPE, ISSUE_STATUS, ISSUE_PRIORITY, typeMeta, statusMeta, priorityMeta } from "../lib/issueMeta.js";
import { formatDateTime, timeAgo } from "../lib/format.js";
import { useProjectMembers, userLabel } from "../hooks/useProjectMembers.js";
import { useToast } from "../components/ToastContext.jsx";

export default function IssueDetailPage() {
  const { projectId, issueId } = useParams();
  const navigate = useNavigate();

  const issueQuery = useFetch(() => getIssue(projectId, issueId), [projectId, issueId]);
  const { byId: memberById } = useProjectMembers(projectId);
  const [editing, setEditing] = useState(false);

  if (issueQuery.loading) {
    return (
      <div className="page">
        <Breadcrumb projectId={projectId} issueId={issueId} />
        <Loading label="이슈 불러오는 중..." />
      </div>
    );
  }

  if (issueQuery.error) {
    return (
      <div className="page">
        <Breadcrumb projectId={projectId} issueId={issueId} />
        <ErrorState error={issueQuery.error} onRetry={issueQuery.reload} />
      </div>
    );
  }

  const issue = issueQuery.data;

  return (
    <div className="page narrow">
      <Breadcrumb projectId={projectId} issueId={issueId} title={issue.title} />

      {editing ? (
        <IssueEditForm
          projectId={projectId}
          issue={issue}
          members={memberById}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            issueQuery.reload();
          }}
        />
      ) : (
        <IssueView
          issue={issue}
          projectId={projectId}
          memberById={memberById}
          onEdit={() => setEditing(true)}
          onStatusChanged={issueQuery.reload}
          onDeleted={() => navigate(`/projects/${projectId}`, { replace: true })}
        />
      )}

      <CommentSection projectId={projectId} issueId={issueId} memberById={memberById} />
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

function IssueView({ issue, projectId, memberById, onEdit, onDeleted, onStatusChanged }) {
  const toast = useToast();
  const del = useAsync(() => deleteIssue(projectId, issue.id));
  const statusUpdate = useAsync((next) => updateIssueStatus(projectId, issue.id, next));
  const [confirming, setConfirming] = useState(false);

  const handleStatusChange = async (next) => {
    if (next === issue.status) return;
    try {
      await statusUpdate.run(next);
      toast.success(`상태가 '${statusMeta(next).label}'(으)로 변경됨`);
      onStatusChanged();
    } catch {
      /* error는 InlineError로 표시 */
    }
  };

  const handleDelete = async () => {
    try {
      await del.run();
      toast.success("이슈가 삭제되었습니다");
      onDeleted();
    } catch {
      /* error 표시 */
    }
  };

  return (
    <article className="issue-detail">
      <header className="issue-detail-head">
        <div className="badges">
          <Badge meta={typeMeta(issue.issueType)} />
          <Badge meta={statusMeta(issue.status)} />
          <Badge meta={priorityMeta(issue.priority)} />
        </div>
        <div className="row-actions">
          <label className="status-control">
            <span className="muted small">상태</span>
            <select
              value={issue.status}
              disabled={statusUpdate.loading}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              {ISSUE_STATUS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button className="btn ghost small" onClick={onEdit}>수정</button>
          <button className="btn danger small" onClick={() => setConfirming(true)}>삭제</button>
        </div>
      </header>

      <InlineError error={statusUpdate.error} />

      <h1 className="issue-detail-title">
        <span className="issue-key">#{issue.id}</span> {issue.title}
      </h1>

      <div className="issue-detail-meta muted small">
        <span>작성자 {userLabel(memberById, issue.reporterId)}</span>
        <span>·</span>
        <span>담당자 {userLabel(memberById, issue.assigneeId)}</span>
        <span>·</span>
        <span>생성 {formatDateTime(issue.createdAt)}</span>
        {issue.updatedAt && issue.updatedAt !== issue.createdAt && (
          <>
            <span>·</span>
            <span>수정 {timeAgo(issue.updatedAt)}</span>
          </>
        )}
      </div>

      <div className="issue-detail-body">
        {issue.content ? issue.content : <span className="muted">내용이 없습니다.</span>}
      </div>

      {confirming && (
        <div className="confirm-bar">
          <span>정말 이 이슈를 삭제할까요? 되돌릴 수 없습니다.</span>
          <div className="row-actions">
            <button className="btn ghost small" onClick={() => setConfirming(false)} disabled={del.loading}>
              취소
            </button>
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
  });
  const { run, loading, error } = useAsync((payload) => updateIssue(projectId, issue.id, payload));
  const memberEntries = Object.entries(members ?? {}); // [userId, username]

  const submit = async (e) => {
    e.preventDefault();
    // status는 여기서 보내지 않는다 — 상태 변경은 상세 화면의 상태 셀렉터(전용 API)로.
    const payload = {
      title: form.title,
      content: form.content || null,
      issueType: form.issueType,
      priority: form.priority,
      assigneeId: form.assigneeId === "" ? null : Number(form.assigneeId),
    };
    try {
      await run(payload);
      toast.success("이슈가 수정되었습니다");
      onSaved();
    } catch {
      /* error 표시 */
    }
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
      <p className="muted small">상태는 상세 화면의 '상태' 셀렉터로 변경하세요.</p>
      <label className="field">
        <span>담당자</span>
        {memberEntries.length > 0 ? (
          <select
            value={form.assigneeId === null ? "" : String(form.assigneeId)}
            onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
          >
            <option value="">미지정</option>
            {memberEntries.map(([uid, name]) => (
              <option key={uid} value={uid}>{name}</option>
            ))}
          </select>
        ) : (
          <input inputMode="numeric" value={form.assigneeId} placeholder="비워두면 미지정"
            onChange={(e) => setForm({ ...form, assigneeId: e.target.value })} />
        )}
      </label>
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
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function CommentSection({ projectId, issueId, memberById }) {
  const toast = useToast();
  const commentsQuery = useFetch(() => listComments(projectId, issueId), [projectId, issueId]);
  const [content, setContent] = useState("");
  const { run, loading, error } = useAsync((body) => createComment(projectId, issueId, body));

  const items = commentsQuery.data?.items ?? [];
  const total = commentsQuery.data?.total ?? 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await run({ content });
      setContent("");
      toast.success("댓글이 등록되었습니다");
      commentsQuery.reload();
    } catch {
      /* error 표시 */
    }
  };

  return (
    <section className="comment-section">
      <h2 className="section-title">댓글 {total > 0 && <span className="muted">({total})</span>}</h2>

      <form className="comment-form" onSubmit={submit}>
        <textarea
          value={content}
          rows={2}
          maxLength={2000}
          placeholder="댓글을 입력하세요"
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="btn primary" disabled={loading || !content.trim()}>
          {loading ? "등록 중..." : "댓글 작성"}
        </button>
      </form>
      <InlineError error={error} />

      {commentsQuery.loading && <Loading label="댓글 불러오는 중..." />}
      {commentsQuery.error && <ErrorState error={commentsQuery.error} onRetry={commentsQuery.reload} />}

      {!commentsQuery.loading && !commentsQuery.error && items.length === 0 && (
        <EmptyState title="아직 댓글이 없습니다" description="첫 댓글을 남겨보세요." />
      )}

      {items.length > 0 && (
        <ul className="comment-list">
          {items.map((c) => {
            const author = userLabel(memberById, c.authorId);
            return (
              <li key={c.id} className="comment-item">
                <div className="comment-head">
                  <span className="avatar sm" aria-hidden>
                    {author?.[0]?.toUpperCase() ?? "?"}
                  </span>
                  <span className="comment-author">{author}</span>
                  <span className="muted small">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="comment-content">{c.content}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
