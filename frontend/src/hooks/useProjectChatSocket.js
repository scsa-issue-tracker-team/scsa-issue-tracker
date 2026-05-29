import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useAuth } from "../auth/AuthContext.jsx";

const LOCAL_WS_URL = "ws://localhost:8081/ws";
const PRODUCTION_WS_URL = "wss://scsa-issue-tracker-api.onrender.com/ws";

function resolveWsUrl() {
  const envOverride = import.meta.env.VITE_WS_URL;
  if (envOverride) return envOverride;

  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  return isLocalhost ? LOCAL_WS_URL : PRODUCTION_WS_URL;
}

// status: "idle" | "connecting" | "connected" | "reconnecting" | "error"
export function useProjectChatSocket(projectId, onMessage) {
  const { token } = useAuth();
  const [status, setStatus] = useState("idle");
  const clientRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!projectId || !token) return undefined;

    const client = new Client({
      brokerURL: resolveWsUrl(),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
    });

    client.onConnect = () => {
      setStatus("connected");
      client.subscribe(`/topic/projects/${projectId}/chat`, (frame) => {
        try {
          onMessageRef.current?.(JSON.parse(frame.body));
        } catch {
          // Ignore malformed chat frames.
        }
      });
    };

    client.onWebSocketClose = () => {
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

  const sendMessage = useCallback((content) => {
    const client = clientRef.current;
    if (!client?.connected) return false;

    client.publish({
      destination: `/app/projects/${projectId}/chat.send`,
      body: JSON.stringify({ content }),
    });
    return true;
  }, [projectId]);

  return { status, sendMessage };
}
