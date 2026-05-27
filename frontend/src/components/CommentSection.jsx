import { useState } from "react";
import {
  listComments, createComment, updateComment, deleteComment,
  listReplies, createReply, updateReply, deleteReply,
} from "../api/comments.js";
import {
  getCommentReactions, addCommentReaction, removeCommentReaction,
} from "../api/reactions.js";
import { useFetch, useAsync } from "../hooks/useAsync.js";
import { Loading, ErrorState, EmptyState, InlineError } from "./StateViews.jsx";
import ReactionBar from "./ReactionBar.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { useUserDirectory, nameOf } from "../auth/UserDirectoryContext.jsx";
import { useToast } from "./ToastContext.jsx";
import { timeAgo } from "../lib/format.js";

export default function CommentSection({ projectId, issueId }) {
  const toast = useToast();
  const query = useFetch(() => listComments(projectId, issueId), [projectId, issueId]);
  const [content, setContent] = useState("");
  const create = useAsync((body) => createComment(projectId, issueId, body));

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await create.run({ content });
      setContent("");
      toast.success("댓글이 등록되었습니다");
      query.reload();
    } catch { /* */ }
  };

  return (
    <section className="comment-section">
      <h2 className="section-title">댓글 {total > 0 && <span className="muted">({total})</span>}</h2>

      <form className="comment-form" onSubmit={submit}>
        <textarea value={content} rows={2} maxLength={2000}
          placeholder="댓글을 입력하세요" onChange={(e) => setContent(e.target.value)} />
        <button className="btn primary" disabled={create.loading || !content.trim()}>
          {create.loading ? "등록 중..." : "댓글 작성"}
        </button>
      </form>
      <InlineError error={create.error} />

      {query.loading && <Loading label="댓글 불러오는 중..." />}
      {query.error && <ErrorState error={query.error} onRetry={query.reload} />}
      {!query.loading && !query.error && items.length === 0 && (
        <EmptyState title="아직 댓글이 없습니다" description="첫 댓글을 남겨보세요." />
      )}

      {items.length > 0 && (
        <ul className="comment-list">
          {items.map((c) => (
            <CommentItem key={c.id} comment={c} projectId={projectId} issueId={issueId}
              onChanged={query.reload} />
          ))}
        </ul>
      )}
    </section>
  );
}

function CommentItem({ comment, projectId, issueId, onChanged }) {
  const toast = useToast();
  const { currentUser } = useAuth();
  const { byId } = useUserDirectory();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(false);

  const isMine = comment.authorId === currentUser?.userId && !comment.deleted;
  const author = nameOf(byId, comment.authorId);

  const upd = useAsync((text) => updateComment(projectId, issueId, comment.id, { content: text }));
  const del = useAsync(() => deleteComment(projectId, issueId, comment.id));

  const saveEdit = async () => {
    if (!editText.trim()) return;
    try { await upd.run(editText); setEditing(false); toast.success("댓글이 수정되었습니다"); onChanged(); }
    catch { /* */ }
  };
  const handleDelete = async () => {
    try { await del.run(); toast.success("댓글이 삭제되었습니다"); onChanged(); }
    catch { /* */ }
  };

  return (
    <li className="comment-item">
      <div className="comment-head">
        <span className="avatar sm" aria-hidden>{comment.deleted ? "–" : (author?.[0]?.toUpperCase() ?? "?")}</span>
        <span className="comment-author">{comment.deleted ? "(삭제됨)" : author}</span>
        <span className="muted small">{timeAgo(comment.createdAt)}</span>
        {isMine && !editing && (
          <span className="comment-actions">
            <button className="link-btn" onClick={() => { setEditing(true); setEditText(comment.content); }}>수정</button>
            <button className="link-btn danger" onClick={handleDelete} disabled={del.loading}>삭제</button>
          </span>
        )}
      </div>

      {editing ? (
        <div className="comment-edit">
          <textarea value={editText} rows={2} maxLength={2000} onChange={(e) => setEditText(e.target.value)} />
          <div className="form-actions">
            <button className="btn ghost small" onClick={() => setEditing(false)}>취소</button>
            <button className="btn primary small" onClick={saveEdit} disabled={upd.loading}>
              {upd.loading ? "저장 중..." : "저장"}
            </button>
          </div>
          <InlineError error={upd.error} />
        </div>
      ) : (
        <p className={`comment-content ${comment.deleted ? "deleted" : ""}`}>{comment.content}</p>
      )}

      {/* 삭제되지 않은 댓글만 반응/답글 가능 */}
      {!comment.deleted && !editing && (
        <div className="comment-foot">
          <ReactionBar
            fetchReactions={() => getCommentReactions(projectId, issueId, comment.id)}
            addReaction={(t) => addCommentReaction(projectId, issueId, comment.id, t)}
            removeReaction={(t) => removeCommentReaction(projectId, issueId, comment.id, t)}
          />
          <button className="link-btn" onClick={() => setShowReplies((s) => !s)}>
            답글 {comment.replyCount > 0 ? `${comment.replyCount}` : ""} {showReplies ? "▴" : "▾"}
          </button>
        </div>
      )}

      {showReplies && (
        <ReplyThread projectId={projectId} issueId={issueId} commentId={comment.id}
          onChanged={onChanged} />
      )}
    </li>
  );
}

function ReplyThread({ projectId, issueId, commentId, onChanged }) {
  const toast = useToast();
  const { currentUser } = useAuth();
  const { byId } = useUserDirectory();
  const query = useFetch(() => listReplies(projectId, issueId, commentId), [projectId, issueId, commentId]);
  const [text, setText] = useState("");
  const create = useAsync((body) => createReply(projectId, issueId, commentId, body));

  const items = query.data?.items ?? [];

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await create.run({ content: text });
      setText("");
      toast.success("답글이 등록되었습니다");
      query.reload();
      onChanged?.(); // 부모 replyCount 갱신
    } catch { /* */ }
  };

  return (
    <div className="reply-thread">
      {query.loading && <Loading label="답글 불러오는 중..." />}
      {items.length > 0 && (
        <ul className="reply-list">
          {items.map((r) => (
            <ReplyItem key={r.id} reply={r} projectId={projectId} issueId={issueId}
              commentId={commentId} currentUser={currentUser} byId={byId}
              onChanged={() => { query.reload(); onChanged?.(); }} />
          ))}
        </ul>
      )}
      <form className="reply-form" onSubmit={submit}>
        <input value={text} maxLength={2000} placeholder="답글 입력"
          onChange={(e) => setText(e.target.value)} />
        <button className="btn primary small" disabled={create.loading || !text.trim()}>
          {create.loading ? "..." : "답글"}
        </button>
      </form>
      <InlineError error={create.error} />
    </div>
  );
}

function ReplyItem({ reply, projectId, issueId, commentId, currentUser, byId, onChanged }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content);
  const isMine = reply.authorId === currentUser?.userId && !reply.deleted;
  const author = nameOf(byId, reply.authorId);

  const upd = useAsync((t) => updateReply(projectId, issueId, commentId, reply.id, { content: t }));
  const del = useAsync(() => deleteReply(projectId, issueId, commentId, reply.id));

  const saveEdit = async () => {
    if (!editText.trim()) return;
    try { await upd.run(editText); setEditing(false); toast.success("답글이 수정되었습니다"); onChanged(); }
    catch { /* */ }
  };
  const handleDelete = async () => {
    try { await del.run(); toast.success("답글이 삭제되었습니다"); onChanged(); }
    catch { /* */ }
  };

  return (
    <li className="reply-item">
      <div className="comment-head">
        <span className="avatar xs" aria-hidden>{reply.deleted ? "–" : (author?.[0]?.toUpperCase() ?? "?")}</span>
        <span className="comment-author">{reply.deleted ? "(삭제됨)" : author}</span>
        <span className="muted small">{timeAgo(reply.createdAt)}</span>
        {isMine && !editing && (
          <span className="comment-actions">
            <button className="link-btn" onClick={() => { setEditing(true); setEditText(reply.content); }}>수정</button>
            <button className="link-btn danger" onClick={handleDelete} disabled={del.loading}>삭제</button>
          </span>
        )}
      </div>
      {editing ? (
        <div className="comment-edit">
          <input value={editText} maxLength={2000} onChange={(e) => setEditText(e.target.value)} />
          <div className="form-actions">
            <button className="btn ghost small" onClick={() => setEditing(false)}>취소</button>
            <button className="btn primary small" onClick={saveEdit} disabled={upd.loading}>저장</button>
          </div>
          <InlineError error={upd.error} />
        </div>
      ) : (
        <p className={`comment-content ${reply.deleted ? "deleted" : ""}`}>{reply.content}</p>
      )}
    </li>
  );
}
