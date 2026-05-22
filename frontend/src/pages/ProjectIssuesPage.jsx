import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProject } from "../api/projects.js";
import { listIssues, createIssue } from "../api/issues.js";
import { useFetch, useAsync } from "../hooks/useAsync.js";
import { Loading, ErrorState, EmptyState, InlineError } from "../components/StateViews.jsx";
import Badge from "../components/Badge.jsx";
import Modal from "../components/Modal.jsx";
import { ISSUE_TYPE, ISSUE_STATUS, ISSUE_PRIORITY, typeMeta, statusMeta, priorityMeta } from "../lib/issueMeta.js";
import { timeAgo } from "../lib/format.js";
import MembersModal from "../components/MembersModal.jsx";
import { useProjectMembers, userLabel } from "../hooks/useProjectMembers.js";
import { useToast } from "../components/ToastContext.jsx";

export default function ProjectIssuesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const projectQuery = useFetch(() => getProject(projectId), [projectId]);
  const { byId: memberById } = useProjectMembers(projectId);
  const [filters, setFilters] = useState({ status: "", issueType: "", priority: "" });
  const [sort, setSort] = useState("createdAt,desc");
  const issuesQuery = useFetch(
    () => listIssues(projectId, { ...filters, sort }),
    [projectId, filters.status, filters.issueType, filters.priority, sort]
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  // 프로젝트 자체 조회 실패(403/404)는 페이지 전체 에러로
  if (projectQuery.error) {
    return (
      <div className="page">
        <Breadcrumb projectName={null} />
        <ErrorState error={projectQuery.error} onRetry={projectQuery.reload} />
      </div>
    );
  }

  const project = projectQuery.data;
  const issues = issuesQuery.data?.content ?? [];
  const total = issuesQuery.data?.totalElements ?? 0;

  return (
    <div className="page">
      <Breadcrumb projectName={project?.name} />

      <div className="page-head">
        <div>
          <p className="eyebrow">Project #{projectId}</p>
          <h1>{project?.name ?? (projectQuery.loading ? "불러오는 중..." : "")}</h1>
          {project?.description && <p className="muted">{project.description}</p>}
        </div>
        <div className="head-actions">
          <button className="btn ghost" onClick={() => setMembersOpen(true)}>
            멤버
          </button>
          <button className="btn primary" onClick={() => setModalOpen(true)}>
            + 새 이슈
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <FilterSelect
          label="상태"
          value={filters.status}
          options={ISSUE_STATUS}
          onChange={(v) => setFilters({ ...filters, status: v })}
        />
        <FilterSelect
          label="유형"
          value={filters.issueType}
          options={ISSUE_TYPE}
          onChange={(v) => setFilters({ ...filters, issueType: v })}
        />
        <FilterSelect
          label="우선순위"
          value={filters.priority}
          options={ISSUE_PRIORITY}
          onChange={(v) => setFilters({ ...filters, priority: v })}
        />
        <label className="filter-select">
          <span className="muted small">정렬</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="createdAt,desc">최신순</option>
            <option value="createdAt,asc">오래된순</option>
          </select>
        </label>
        {(filters.status || filters.issueType || filters.priority) && (
          <button
            className="btn ghost small"
            onClick={() => setFilters({ status: "", issueType: "", priority: "" })}
          >
            필터 초기화
          </button>
        )}
        {!issuesQuery.loading && <span className="muted small count">{total}건</span>}
      </div>

      {issuesQuery.loading && <Loading label="이슈 불러오는 중..." />}
      {issuesQuery.error && <ErrorState error={issuesQuery.error} onRetry={issuesQuery.reload} />}

      {!issuesQuery.loading && !issuesQuery.error && issues.length === 0 && (
        <EmptyState
          title="이슈가 없습니다"
          description="필터를 바꾸거나 새 이슈를 만들어 보세요."
          action={
            <button className="btn primary" onClick={() => setModalOpen(true)}>
              + 새 이슈
            </button>
          }
        />
      )}

      {!issuesQuery.loading && !issuesQuery.error && issues.length > 0 && (
        <ul className="issue-list">
          {issues.map((issue) => (
            <li key={issue.id}>
              <button
                className="issue-row"
                onClick={() => navigate(`/projects/${projectId}/issues/${issue.id}`)}
              >
                <div className="issue-row-top">
                  <div className="issue-row-main">
                    <span className="issue-key">#{issue.id}</span>
                    <span className="issue-title">{issue.title}</span>
                  </div>
                  <div className="issue-row-meta">
                    <Badge meta={typeMeta(issue.issueType)} size="sm" />
                    <Badge meta={statusMeta(issue.status)} size="sm" />
                    <Badge meta={priorityMeta(issue.priority)} size="sm" />
                  </div>
                </div>
                {issue.content && (
                  <p className="issue-row-preview">{issue.content}</p>
                )}
                <div className="issue-row-sub muted small">
                  <span>담당 {userLabel(memberById, issue.assigneeId)}</span>
                  <span>·</span>
                  <span>{timeAgo(issue.updatedAt || issue.createdAt)}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <CreateIssueModal
        projectId={projectId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(created) => {
          setModalOpen(false);
          toast.success("이슈가 생성되었습니다");
          if (created?.id) navigate(`/projects/${projectId}/issues/${created.id}`);
        }}
      />

      <MembersModal
        projectId={projectId}
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
      />
    </div>
  );
}

function Breadcrumb({ projectName }) {
  return (
    <nav className="breadcrumb">
      <Link to="/projects">프로젝트</Link>
      <span className="sep">/</span>
      <span className="current">{projectName ?? "..."}</span>
    </nav>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="filter-select">
      <span className="muted small">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">전체</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CreateIssueModal({ projectId, open, onClose, onCreated }) {
  const empty = {
    title: "",
    content: "",
    issueType: "FEATURE",
    priority: "MEDIUM",
    assigneeId: "",
  };
  const [form, setForm] = useState(empty);
  const { run, loading, error, setError } = useAsync((payload) => createIssue(projectId, payload));

  const submit = async (e) => {
    e.preventDefault();
    // reporterId/status는 보내지 않는다 (reporterId=JWT, status=서버가 OPEN으로 생성)
    const payload = {
      title: form.title,
      content: form.content || null,
      issueType: form.issueType,
      priority: form.priority,
      assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
    };
    try {
      const created = await run(payload);
      setForm(empty);
      onCreated(created);
    } catch {
      /* error 표시 */
    }
  };

  const close = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} title="새 이슈" onClose={close}>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>제목</span>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            autoFocus
          />
        </label>
        <label className="field">
          <span>내용 (선택)</span>
          <textarea
            value={form.content}
            rows={4}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </label>
        <div className="field-row">
          <SelectField label="유형" value={form.issueType} options={ISSUE_TYPE}
            onChange={(v) => setForm({ ...form, issueType: v })} />
          <SelectField label="우선순위" value={form.priority} options={ISSUE_PRIORITY}
            onChange={(v) => setForm({ ...form, priority: v })} />
        </div>
        <p className="muted small">새 이슈는 '열림(OPEN)' 상태로 생성됩니다.</p>
        <label className="field">
          <span>담당자 ID (선택)</span>
          <input
            inputMode="numeric"
            value={form.assigneeId}
            placeholder="비워두면 미지정"
            onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
          />
        </label>
        <InlineError error={error} />
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={close}>
            취소
          </button>
          <button className="btn primary" disabled={loading}>
            {loading ? "생성 중..." : "이슈 만들기"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
