import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProject } from "../api/projects.js";
import { listIssues, createIssue, updateIssueStatus } from "../api/issues.js";
import { useFetch, useAsync } from "../hooks/useAsync.js";
import { Loading, ErrorState, EmptyState, InlineError, IssueListSkeleton } from "../components/StateViews.jsx";
import Badge from "../components/Badge.jsx";
import Modal from "../components/Modal.jsx";
import MembersPanel from "../components/MembersPanel.jsx";
import MembersModal from "../components/MembersModal.jsx";
import WorkloadBars from "../components/WorkloadBars.jsx";
import { ISSUE_TYPE, ISSUE_STATUS, ISSUE_PRIORITY, typeMeta, statusMeta, priorityMeta } from "../lib/issueMeta.js";
import { timeAgo, formatDueDate, dueState, dueLabel } from "../lib/format.js";
import { useProjectMembers } from "../hooks/useProjectMembers.js";
import { useUserDirectory, nameOf } from "../auth/UserDirectoryContext.jsx";
import { useToast } from "../components/ToastContext.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

export default function ProjectIssuesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const projectQuery = useFetch(() => getProject(projectId), [projectId]);
  useDocumentTitle(projectQuery.data?.name);
  const membersState = useProjectMembers(projectId);
  const { byId } = useUserDirectory();

  const [filters, setFilters] = useState({ status: "", issueType: "", priority: "", assigneeId: "" });
  const [keyword, setKeyword] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // 디바운스된 실제 검색어
  const [sort, setSort] = useState("createdAt,desc");
  const [view, setView] = useState("board"); // list | grouped | board
  const issueFilters =
    view === "board"
      ? { issueType: filters.issueType, priority: filters.priority, assigneeId: filters.assigneeId }
      : filters;
  const issuesQuery = useFetch(
    () => listIssues(projectId, { ...issueFilters, keyword: searchTerm || undefined, sort }),
    [projectId, view, filters.status, filters.issueType, filters.priority, filters.assigneeId, searchTerm, sort]
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  // 서버 데이터를 로컬에 미러링 — 보드 드래그 시 옵티미스틱 갱신을 위해.
  // (훅은 early return보다 위에 있어야 한다 — Rules of Hooks)
  const [localIssues, setLocalIssues] = useState([]);
  useEffect(() => {
    setLocalIssues(issuesQuery.data?.content ?? []);
  }, [issuesQuery.data]);

  // 검색어 디바운스 (입력 멈추고 400ms 후 조회)
  const onSearchSubmit = (e) => { e.preventDefault(); setSearchTerm(keyword.trim()); };

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
  const issues = localIssues;
  const total = issuesQuery.data?.totalElements ?? 0;
  const hasFilter = (view !== "board" && filters.status) || filters.issueType || filters.priority || filters.assigneeId || searchTerm;

  const clearFilters = () => {
    setFilters({ status: "", issueType: "", priority: "", assigneeId: "" });
    setKeyword("");
    setSearchTerm("");
  };

  const openRow = (issue) =>
    navigate(`/projects/${projectId}/issues/${issue.id}`);

  // 보드 뷰 상태 변경 — 옵티미스틱: 즉시 카드 이동 후 서버 반영, 실패 시 복구
  const changeStatus = async (issue, nextStatus) => {
    if (nextStatus === issue.status) return;
    const snapshot = localIssues;
    setLocalIssues((cur) => cur.map((i) => i.id === issue.id ? { ...i, status: nextStatus } : i));
    try {
      await updateIssueStatus(projectId, issue.id, nextStatus);
      toast.success(`#${issue.id} → ${statusMeta(nextStatus).label}`);
    } catch (e) {
      setLocalIssues(snapshot); // 롤백
      toast.error(e?.message || "상태 변경 실패");
    }
  };

  return (
    <div className="page">
      <Breadcrumb projectName={project?.name} />

      <div className="page-head">
        <div className="page-head-text">
          <p className="eyebrow">Project #{projectId}</p>
          <h1>{project?.name ?? (projectQuery.loading ? "불러오는 중..." : "")}</h1>
          {project?.description && <p className="muted project-desc-full">{project.description}</p>}
        </div>
        <div className="head-actions">
          <button className="btn ghost members-mobile-btn" onClick={() => setMembersOpen(true)}>
            멤버 {membersState.members.length > 0 && `(${membersState.members.length})`}
          </button>
          <button className="btn primary" onClick={() => setModalOpen(true)}>
            + 새 이슈
          </button>
        </div>
      </div>

      <div className="project-layout">
        {/* 메인: 이슈 영역 */}
        <section className="issue-area">
          <form className="issue-search" onSubmit={onSearchSubmit}>
            <span className="search-icon" aria-hidden>🔍</span>
            <input
              className="search-input"
              value={keyword}
              placeholder="제목·내용 검색"
              onChange={(e) => setKeyword(e.target.value)}
            />
            {keyword && (
              <button type="button" className="search-clear" aria-label="검색어 지우기"
                onClick={() => { setKeyword(""); setSearchTerm(""); }}>✕</button>
            )}
            <button className="btn primary small" type="submit">검색</button>
          </form>

          <div className="filter-bar">
            {view !== "board" && (
              <FilterSelect label="상태" value={filters.status} options={ISSUE_STATUS}
                onChange={(v) => setFilters({ ...filters, status: v })} />
            )}
            <FilterSelect label="유형" value={filters.issueType} options={ISSUE_TYPE}
              onChange={(v) => setFilters({ ...filters, issueType: v })} />
            <FilterSelect label="우선순위" value={filters.priority} options={ISSUE_PRIORITY}
              onChange={(v) => setFilters({ ...filters, priority: v })} />
            <label className="filter-select">
              <span className="muted small">담당자</span>
              <select value={filters.assigneeId}
                onChange={(e) => setFilters({ ...filters, assigneeId: e.target.value })}>
                <option value="">전체</option>
                {membersState.members.map((m) => (
                  <option key={m.userId} value={m.userId}>{m.username}</option>
                ))}
              </select>
            </label>
            <label className="filter-select">
              <span className="muted small">정렬</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="createdAt,desc">최신순</option>
                <option value="createdAt,asc">오래된순</option>
                <option value="dueDate,asc">마감 빠른순</option>
                <option value="priority,desc">우선순위순</option>
              </select>
            </label>
            <div className="view-toggle" role="tablist" aria-label="보기 방식">
              <button className={view === "list" ? "view-seg active" : "view-seg"}
                onClick={() => setView("list")} title="리스트" aria-label="리스트 보기">☰</button>
              <button className={view === "grouped" ? "view-seg active" : "view-seg"}
                onClick={() => setView("grouped")} title="상태별 묶기" aria-label="상태별 묶기">▤</button>
              <button className={view === "board" ? "view-seg active" : "view-seg"}
                onClick={() => setView("board")} title="보드" aria-label="보드 보기">▦</button>
            </div>
            {hasFilter && (
              <button className="btn ghost small" onClick={clearFilters}>필터 초기화</button>
            )}
            {!issuesQuery.loading && <span className="muted small count">{total}건</span>}
          </div>

          {issuesQuery.loading && <IssueListSkeleton rows={5} />}
          {issuesQuery.error && <ErrorState error={issuesQuery.error} onRetry={issuesQuery.reload} />}

          {!issuesQuery.loading && !issuesQuery.error && issues.length === 0 && (
            <EmptyState
              variant={hasFilter ? "search" : "issue"}
              title="이슈가 없습니다"
              description={hasFilter ? "조건에 맞는 이슈가 없습니다." : "첫 이슈를 만들어 보세요."}
              action={
                <button className="btn primary" onClick={() => setModalOpen(true)}>+ 새 이슈</button>
              }
            />
          )}

          {!issuesQuery.loading && !issuesQuery.error && issues.length > 0 && (
            view === "board"
              ? <BoardView issues={issues} byId={byId} onOpen={openRow} onChangeStatus={changeStatus} />
              : view === "grouped"
                ? <GroupedIssues issues={issues} byId={byId} onOpen={openRow} />
                : <IssueList issues={issues} byId={byId} onOpen={openRow} />
          )}
        </section>

        {/* 사이드: 멤버 패널 (데스크톱 상시 노출) */}
        <aside className="member-side">
          <div className="side-card">
            <h2 className="side-title">멤버 {membersState.members.length > 0 && <span className="muted">({membersState.members.length})</span>}</h2>
            <MembersPanel
              projectId={projectId}
              members={membersState.members}
              loading={membersState.loading}
              error={membersState.error}
              reload={membersState.reload}
            />
          </div>
          {!issuesQuery.loading && issues.length > 0 && (
            <div className="side-card workload-card">
              <WorkloadBars issues={issues} byId={byId} />
            </div>
          )}
        </aside>
      </div>

      <CreateIssueModal
        projectId={projectId}
        members={membersState.members}
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
        membersState={membersState}
      />
    </div>
  );
}

function IssueList({ issues, byId, onOpen }) {
  return (
    <ul className="issue-list">
      {issues.map((issue) => (
        <IssueRow key={issue.id} issue={issue} byId={byId} onOpen={onOpen} />
      ))}
    </ul>
  );
}

// 칸반 보드: 상태별 칼럼. 카드를 드래그해서 다른 칼럼에 떨어뜨리면 상태 변경.
function BoardView({ issues, byId, onOpen, onChangeStatus }) {
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const onDrop = (status) => {
    const issue = issues.find((i) => i.id === dragId);
    setDragId(null);
    setOverCol(null);
    if (issue && issue.status !== status) onChangeStatus(issue, status);
  };

  return (
    <div className="board">
      {ISSUE_STATUS.map((col) => {
        const colIssues = issues.filter((i) => i.status === col.value);
        return (
          <div
            key={col.value}
            className={`board-col ${overCol === col.value ? "drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOverCol(col.value); }}
            onDragLeave={() => setOverCol((c) => (c === col.value ? null : c))}
            onDrop={() => onDrop(col.value)}
          >
            <div className="board-col-head">
              <Badge meta={col} size="sm" />
              <span className="muted small">{colIssues.length}</span>
            </div>
            <div className="board-col-body">
              {colIssues.map((issue) => (
                <BoardCard key={issue.id} issue={issue} byId={byId} onOpen={onOpen}
                  onDragStart={() => setDragId(issue.id)} dragging={dragId === issue.id} />
              ))}
              {colIssues.length === 0 && <p className="board-empty muted small">없음</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BoardCard({ issue, byId, onOpen, onDragStart, dragging }) {
  const ds = dueState(issue.dueDate, issue.status);
  return (
    <div
      className={`board-card ${dragging ? "dragging" : ""} ${issue.priority === "CRITICAL" ? "crit" : ""}`}
      draggable
      onDragStart={onDragStart}
      onClick={() => onOpen(issue)}
      role="button"
      tabIndex={0}
    >
      <div className="board-card-top">
        <span className="issue-key">#{issue.id}</span>
        <Badge meta={priorityMeta(issue.priority)} size="sm" />
      </div>
      <p className="board-card-title">{issue.title}</p>
      <div className="board-card-foot">
        <Badge meta={typeMeta(issue.issueType)} size="sm" />
        {issue.dueDate && (
          <span className={`due-chip due-${ds}`}>{dueLabel(issue.dueDate)}</span>
        )}
      </div>
      <div className="board-card-assignee muted small">
        <span className="avatar xs" aria-hidden>
          {issue.assigneeId ? (nameOf(byId, issue.assigneeId)[0]?.toUpperCase() ?? "?") : "·"}
        </span>
        {nameOf(byId, issue.assigneeId)}
      </div>
    </div>
  );
}
function GroupedIssues({ issues, byId, onOpen }) {
  return (
    <div className="issue-groups">
      {ISSUE_STATUS.map((status) => {
        const group = issues.filter((i) => i.status === status.value);
        if (group.length === 0) return null;
        return (
          <div key={status.value} className="issue-group">
            <div className="issue-group-head">
              <Badge meta={status} size="sm" />
              <span className="muted small">{group.length}</span>
            </div>
            <ul className="issue-list">
              {group.map((issue) => (
                <IssueRow key={issue.id} issue={issue} byId={byId} onOpen={onOpen} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function IssueRow({ issue, byId, onOpen }) {
  const ds = dueState(issue.dueDate, issue.status);
  return (
    <li>
      <button className={`issue-row ${issue.priority === "CRITICAL" ? "crit" : ""}`} onClick={() => onOpen(issue)}>
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
        {issue.content && <p className="issue-row-preview">{issue.content}</p>}
        <div className="issue-row-sub muted small">
          <span className="assignee-tag">
            <span className="avatar xs" aria-hidden>
              {issue.assigneeId ? (nameOf(byId, issue.assigneeId)[0]?.toUpperCase() ?? "?") : "·"}
            </span>
            {nameOf(byId, issue.assigneeId)}
          </span>
          {issue.dueDate && (
            <span className={`due-chip due-${ds}`}>
              {formatDueDate(issue.dueDate)} · {dueLabel(issue.dueDate)}
            </span>
          )}
          <span className="row-time">{timeAgo(issue.updatedAt || issue.createdAt)}</span>
        </div>
      </button>
    </li>
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
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function CreateIssueModal({ projectId, members, open, onClose, onCreated }) {
  const empty = { title: "", content: "", issueType: "FEATURE", priority: "MEDIUM", assigneeId: "", dueDate: "" };
  const [form, setForm] = useState(empty);
  const { run, loading, error, setError } = useAsync((payload) => createIssue(projectId, payload));
  const memberList = Array.isArray(members) ? members : [];

  const submit = async (e) => {
    e.preventDefault();
    // reporterId/status는 보내지 않는다 (reporterId=JWT, status=서버가 OPEN으로 생성)
    const payload = {
      title: form.title,
      content: form.content || null,
      issueType: form.issueType,
      priority: form.priority,
      assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
      dueDate: form.dueDate || null,
    };
    try {
      const created = await run(payload);
      setForm(empty);
      onCreated(created);
    } catch { /* error 표시 */ }
  };

  const close = () => { setError(null); setForm(empty); onClose(); };

  return (
    <Modal open={open} title="새 이슈" onClose={close}>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>제목</span>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
        </label>
        <label className="field">
          <span>내용 (선택)</span>
          <textarea value={form.content} rows={4} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </label>
        <div className="field-row">
          <SelectField label="유형" value={form.issueType} options={ISSUE_TYPE}
            onChange={(v) => setForm({ ...form, issueType: v })} />
          <SelectField label="우선순위" value={form.priority} options={ISSUE_PRIORITY}
            onChange={(v) => setForm({ ...form, priority: v })} />
        </div>
        <div className="field-row">
          <label className="field">
            <span>담당자 (선택)</span>
            <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
              <option value="">미지정</option>
              {memberList.map((m) => <option key={m.userId} value={m.userId}>{m.username}</option>)}
            </select>
          </label>
          <label className="field">
            <span>마감일 (선택)</span>
            <input type="date" value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </label>
        </div>
        <p className="muted small">새 이슈는 '열림(OPEN)' 상태로 생성됩니다.</p>
        <InlineError error={error} />
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={close}>취소</button>
          <button className="btn primary" disabled={loading}>{loading ? "생성 중..." : "이슈 만들기"}</button>
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
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
