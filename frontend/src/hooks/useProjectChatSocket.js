import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import { useAuth } from "../auth/AuthContext.jsx";

// WebSocket URL 계산.
// - 개발: vite proxy 안 통하니까 백엔드 8081로 직접
// - 운영(Vercel): 같은 호스트에서 wss://...vercel.app/ws 로 보내면
//   Vercel rewrites가 Render로 프록시. 단 WebSocket rewrites는 Vercel에서
//   추가 설정이 필요할 수 있어 fallback으로 Render 직접 주소도 시도.
function resolveWsUrl() {
  const loc = window.location;
  const isLocalhost = loc.hostname === "localhost" || loc.hostname === "127.0.0.1";
  const proto = loc.protocol === "https:" ? "wss:" : "ws:";

  if (isLocalhost) {
    // 로컬: 백엔드 8081로 직접 (vite proxy 우회 — WebSocket은 proxy 안정성 떨어짐)
    return "ws://localhost:8081/ws";
  }

  // 운영: vercel.json rewrite를 따른다고 가정. 같은 origin /ws 로 보냄.
  // 만약 Vercel rewrite가 WebSocket을 안 받으면 환경변수 VITE_WS_URL로 override.
  const envOverride = import.meta.env.VITE_WS_URL;
  if (envOverride) return envOverride;

  return `${proto}//${loc.host}/ws`;
}

// 프로젝트 채팅용 STOMP 훅.
// 반환: { status, sendMessage, lastMessage }
// status: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'
export function useProjectChatSocket(projectId, onMessage) {
  const { token } = useAuth();
  const [status, setStatus] = useState("idle");
  const clientRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  // 최신 콜백 추적 (재구독 회피)
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    if (!projectId || !token) return;

    const client = new Client({
      brokerURL: resolveWsUrl(),
      connectHeaders: {
        // 백엔드에서 STOMP CONNECT 시 이 헤더로 토큰 검증
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {}, // 콘솔 스팸 방지
    });

    client.onConnect = () => {
      setStatus("connected");
      client.subscribe(`/topic/projects/${projectId}/chat`, (frame) => {
        try {
          const payload = JSON.parse(frame.body);
          onMessageRef.current?.(payload);
        } catch {
          // 파싱 실패는 조용히 무시 (잘못된 메시지 방어)
        }
      });
    };

    client.onWebSocketClose = () => {
      // 활성 상태 → 끊기면 재연결 중으로
      setStatus((prev) => (prev === "connected" ? "reconnecting" : prev));
    };
    client.onStompError = () => setStatus("error");
    client.onWebSocketError = () => setStatus("error");

    setStatus("connecting");
    clientRef.current = client;
    client.activate();

    return () => {
      clientRef.current = null;
      client.deactivate().catch(() => {});
      setStatus("idle");
    };
  }, [projectId, token]);

  // WebSocket으로 메시지 전송. 연결 안 됐으면 false 반환 (호출 측에서 REST 폴백 가능)
  const sendMessage = useCallback((content) => {
    const c = clientRef.current;
    if (!c?.connected) return false;
    c.publish({
      destination: `/app/projects/${projectId}/chat.send`,
      body: JSON.stringify({ content }),
    });
    return true;
  }, [projectId]);

  return { status, sendMessage };
}
