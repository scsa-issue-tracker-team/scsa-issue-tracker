import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listProjects, createProject } from "../api/projects.js";
import { listIssues } from "../api/issues.js";
import { useFetch, useAsync } from "../hooks/useAsync.js";
import { Loading, ErrorState, EmptyState, InlineError } from "../components/StateViews.jsx";
import Modal from "../components/Modal.jsx";
import { timeAgo } from "../lib/format.js";
import { useToast } from "../components/ToastContext.jsx";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: projects, loading, error, reload } = useFetch(listProjects, []);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Projects</p>
          <h1>내 프로젝트</h1>
        </div>
        <button className="btn primary" onClick={() => setModalOpen(true)}>
          + 새 프로젝트
        </button>
      </div>

      {loading && <Loading label="프로젝트 불러오는 중..." />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {!loading && !error && projects?.length === 0 && (
        <EmptyState
          title="아직 프로젝트가 없습니다"
          description="첫 프로젝트를 만들어 이슈 추적을 시작하세요."
          action={
            <button className="btn primary" onClick={() => setModalOpen(true)}>
              + 새 프로젝트
            </button>
          }
        />
      )}

      {!loading && !error && projects?.length > 0 && (
        <div className="card-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={() => navigate(`/projects/${p.id}`)} />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(created) => {
          setModalOpen(false);
          reload();
          toast.success(`프로젝트 '${created?.name ?? ""}' 생성됨`);
          if (created?.id) navigate(`/projects/${created.id}`);
        }}
      />
    </div>
  );
}

function ProjectCard({ project, onOpen }) {
  const [stats, setStats] = useState(null);

  // 카드별로 이슈 통계를 가볍게 로드 (전체 / 진행 중 / 열림)
  useEffect(() => {
    let alive = true;
    listIssues(project.id, { size: 100 })
      .then((page) => {
        if (!alive) return;
        const items = page?.content ?? [];
        setStats({
          total: page?.totalElements ?? items.length,
          open: items.filter((i) => i.status === "OPEN").length,
          progress: items.filter((i) => i.status === "IN_PROGRESS").length,
        });
      })
      .catch(() => { if (alive) setStats({ total: 0, open: 0, progress: 0 }); });
    return () => { alive = false; };
  }, [project.id]);

  return (
    <button className="project-card" onClick={onOpen}>
      <div className="project-card-top">
        <span className="project-id">#{project.id}</span>
      </div>
      <strong className="project-name">{project.name}</strong>
      <p className="project-desc">{project.description || "설명 없음"}</p>
      <div className="project-stats">
        {stats ? (
          <>
            <span className="pstat"><strong>{stats.total}</strong> 이슈</span>
            <span className="pstat-dot status-open" /><span className="pstat">{stats.open} 열림</span>
            <span className="pstat-dot status-progress" /><span className="pstat">{stats.progress} 진행</span>
          </>
        ) : (
          <span className="muted small">집계 중...</span>
        )}
      </div>
      <span className="muted small">생성 {timeAgo(project.createdAt)}</span>
    </button>
  );
}

function CreateProjectModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const { run, loading, error, setError } = useAsync(createProject);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const created = await run(form);
      setForm({ name: "", description: "" });
      onCreated(created);
    } catch {
      /* error로 표시 */
    }
  };

  const close = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} title="새 프로젝트" onClose={close}>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>프로젝트명</span>
          <input
            value={form.name}
            maxLength={100}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            autoFocus
          />
        </label>
        <label className="field">
          <span>설명 (선택)</span>
          <textarea
            value={form.description}
            maxLength={1000}
            rows={3}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <InlineError error={error} />
        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={close}>
            취소
          </button>
          <button className="btn primary" disabled={loading}>
            {loading ? "생성 중..." : "만들기"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
