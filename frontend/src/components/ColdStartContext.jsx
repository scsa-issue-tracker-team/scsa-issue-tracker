import { createContext, useContext, useEffect, useRef, useState } from "react";
import { setSlowRequestHooks } from "../api/client.js";

const ColdStartContext = createContext({ slowCount: 0, since: 0 });

const HINTS = [
  "무료 서버는 한동안 요청이 없으면 잠시 잠들어요.",
  "JVM이 기지개를 켜는 중입니다.",
  "Flyway가 데이터베이스 상태를 확인하고 있어요.",
  "Spring Boot가 필요한 부품들을 조립하는 중입니다.",
  "Tomcat이 요청을 받을 준비를 하고 있어요.",
  "첫 요청만 조금 느리고, 다음 요청부터는 훨씬 빨라집니다.",
];

export function ColdStartProvider({ children }) {
  const [slowCount, setSlowCount] = useState(0);
  const [since, setSince] = useState(0);
  const sinceRef = useRef(0);

  useEffect(() => {
    setSlowRequestHooks({
      onStart: () => {
        setSlowCount((current) => {
          const next = current + 1;
          if (current === 0) {
            sinceRef.current = Date.now();
            setSince(sinceRef.current);
          }
          return next;
        });
      },
      onEnd: () => {
        setSlowCount((current) => Math.max(0, current - 1));
      },
    });
  }, []);

  return (
    <ColdStartContext.Provider value={{ slowCount, since }}>
      {children}
      {slowCount > 0 && <ColdStartOverlay since={since} />}
    </ColdStartContext.Provider>
  );
}

export function useColdStart() {
  return useContext(ColdStartContext);
}

function getStages(elapsedSec) {
  return [
    { label: "프론트에서 백엔드로 연결", done: true },
    {
      label: elapsedSec < 35 ? "잠든 서버 깨우는 중" : "서버 부팅 마무리",
      done: elapsedSec >= 35,
      active: elapsedSec < 35,
    },
    {
      label: "데이터 불러오기",
      done: false,
      active: elapsedSec >= 35,
    },
  ];
}

function ColdStartOverlay({ since }) {
  const [elapsed, setElapsed] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setElapsed(Math.floor((Date.now() - since) / 1000));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [since]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setHintIndex((current) => (current + 1) % HINTS.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const progress = Math.min(100, Math.round((elapsed / 60) * 100));
  const stages = getStages(elapsed);
  const tookTooLong = elapsed >= 60;

  return (
    <div className="cold-overlay" role="status" aria-live="polite">
      <div className="cold-card">
        <div className="cold-head">
          <svg viewBox="0 0 32 32" width="36" height="36" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="24" height="24" rx="6" stroke="var(--primary)" strokeWidth="2.5" />
            <path
              d="M10 16.2 L14.5 20.5 L22.5 12"
              stroke="var(--primary)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <h3 className="cold-title">서버를 깨우고 있어요</h3>
            <p className="cold-sub muted">
              무료 서버가 잠시 쉬고 있었습니다. 첫 요청은 조금 걸릴 수 있어요.
            </p>
          </div>
        </div>

        <div className="cold-progress-wrap">
          <div className="cold-progress-track" aria-hidden="true">
            <div className="cold-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="cold-count">{elapsed}s</span>
        </div>

        <ul className="cold-stages">
          {stages.map((stage) => (
            <li
              key={stage.label}
              className={`cold-stage ${stage.done ? "done" : stage.active ? "active" : ""}`}
            >
              <span className="cold-stage-mark" aria-hidden="true">
                {stage.done ? "✓" : stage.active ? "…" : "○"}
              </span>
              <span className="cold-stage-label">{stage.label}</span>
            </li>
          ))}
        </ul>

        <p className="cold-hint" key={hintIndex}>
          {HINTS[hintIndex]}
        </p>

        {tookTooLong && (
          <div className="cold-toolong">
            <p className="muted small">
              평소보다 오래 걸리고 있어요. 계속 멈춰 있으면 새로고침해 주세요.
            </p>
            <button className="btn small" type="button" onClick={() => window.location.reload()}>
              새로고침
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
