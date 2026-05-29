import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { listChatMessages, postChatMessage } from "../api/chat.js";
import { useProjectChatSocket } from "../hooks/useProjectChatSocket.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { Loading, ErrorState } from "./StateViews.jsx";
import { useToast } from "./ToastContext.jsx";

// 시간 포맷 (HH:MM)
function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// 날짜 라벨 (YYYY-MM-DD → "오늘"/"어제"/"M월 D일")
function dateLabel(iso) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 연결 상태 뱃지
function StatusDot({ status }) {
  const map = {
    idle: { label: "대기", cls: "idle" },
    connecting: { label: "연결 중", cls: "connecting" },
    connected: { label: "실시간", cls: "connected" },
    reconnecting: { label: "재연결 중", cls: "reconnecting" },
    error: { label: "연결 오류", cls: "error" },
  };
  const m = map[status] ?? map.idle;
  return (
    <span className={`chat-status chat-status-${m.cls}`} title={m.label}>
      <span className="chat-status-dot" />
      <span className="chat-status-label">{m.label}</span>
    </span>
  );
}

// 채팅 메인 컴포넌트.
// REST로 이력 조회 + STOMP로 실시간 수신. 전송은 STOMP 우선, 안 되면 REST 폴백.
export default function ChatPanel({ projectId, projectName }) {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // REST 이력 1회 로드 (최신 50개)
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await listChatMessages(projectId, { limit: 50, offset: 0 });
      const items = res?.items ?? [];
      // 최신순으로 올 수 있어 시간 오름차순 정렬 (오래된 -> 최신, 아래가 최신)
      items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(items);
    } catch (e) {
      setHistoryError(e);
    } finally {
      setHistoryLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // 실시간 수신 핸들러
  const onIncoming = useCallback((msg) => {
    setMessages((prev) => {
      // 중복 방지 (id 기준). 같은 클라이언트가 보낸 REST 결과 + STOMP 브로드캐스트 모두 받을 수 있음.
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const { status, sendMessage } = useProjectChatSocket(projectId, onIncoming);

  // 새 메시지 도착 시 맨 아래로 스크롤 (사용자가 위로 스크롤 중이면 방해 안 하게 임계치)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // 사용자가 이미 거의 바닥에 있거나 첫 로드면 자동 스크롤
    if (distanceFromBottom < 120) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // 첫 이력 로드 직후엔 무조건 바닥으로
  useEffect(() => {
    if (!historyLoading && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [historyLoading]);

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      // 우선 STOMP 시도. 안 되면 REST 폴백.
      const sentViaWs = sendMessage(text);
      if (!sentViaWs) {
        const saved = await postChatMessage(projectId, text);
        // STOMP 브로드캐스트로 다시 받을 가능성 있으므로 onIncoming이 중복 방지
        onIncoming(saved);
      }
      setDraft("");
      // 입력창 다시 포커스
      inputRef.current?.focus();
    } catch (e) {
      toast.error(e?.message || "메시지 전송 실패");
    } finally {
      setSending(false);
    }
  };

  // 입력창 Enter는 전송, Shift+Enter는 줄바꿈
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 메시지를 날짜별로 그룹핑 (가독성)
  const groups = useMemo(() => {
    const acc = [];
    let lastKey = null;
    for (const m of messages) {
      const key = m.createdAt?.slice(0, 10) ?? "";
      if (key !== lastKey) {
        acc.push({ key, label: dateLabel(m.createdAt), items: [] });
        lastKey = key;
      }
      acc[acc.length - 1].items.push(m);
    }
    return acc;
  }, [messages]);

  return (
    <div className="chat-panel">
      <div className="chat-head">
        <div>
          <h3 className="chat-title">프로젝트 채팅</h3>
          {projectName && <p className="chat-sub muted small">{projectName}</p>}
        </div>
        <StatusDot status={status} />
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        {historyLoading && <Loading label="채팅 불러오는 중..." />}
        {historyError && <ErrorState error={historyError} onRetry={loadHistory} />}
        {!historyLoading && !historyError && messages.length === 0 && (
          <div className="chat-empty">
            <p className="muted small">아직 메시지가 없습니다. 첫 메시지를 남겨보세요 👋</p>
          </div>
        )}

        {groups.map((g) => (
          <div key={g.key} className="chat-group">
            <div className="chat-day">
              <span>{g.label}</span>
            </div>
            {g.items.map((m) => {
              const isMine = currentUser && m.senderId === currentUser.userId;
              return (
                <div key={m.id} className={`chat-msg ${isMine ? "mine" : "other"}`}>
                  {!isMine && (
                    <span className="chat-avatar" aria-hidden>
                      {m.senderUsername?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}
                  <div className="chat-bubble-wrap">
                    {!isMine && <span className="chat-sender">{m.senderUsername}</span>}
                    <div className="chat-bubble">{m.content}</div>
                    <span className="chat-time">{formatTime(m.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={handleSend}>
        <textarea
          ref={inputRef}
          className="chat-input"
          rows={1}
          placeholder="메시지 입력... (Shift+Enter 줄바꿈)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={status === "error"}
        />
        <button
          type="submit"
          className="btn primary chat-send"
          disabled={!draft.trim() || sending}
        >
          {sending ? "..." : "전송"}
        </button>
      </form>
    </div>
  );
}
