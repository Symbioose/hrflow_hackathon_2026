"use client";

import { useEffect, useRef, useState } from "react";
import { PixelSprite, SOURCE_CONFIG, type AgentSource, type AgentState } from "./PixelAgent";
import type { DemoLog } from "@/app/lib/demoSearch";

interface LoadingViewProps {
  query: string;
  profileCount: number;
  agentStatuses: Record<AgentSource, AgentState>;
  feedLogs: DemoLog[];
}

const LOG_TYPE_COLORS: Record<DemoLog["type"], string> = {
  info:  "#94a3b8",
  found: "#10b981",
  score: "#818cf8",
  done:  "#64748b",
};

// Terminal badge colors (bg + text) for log lines
const BADGE_COLORS: Record<AgentSource, { bg: string; text: string; label: string }> = {
  github:   { bg: "#1f2937", text: "#e5e7eb", label: "GitHub" },
  linkedin: { bg: "#0077b5", text: "#ffffff", label: "LinkedIn" },
  reddit:   { bg: "#ff4500", text: "#ffffff", label: "Reddit" },
  internet: { bg: "#4f46e5", text: "#ffffff", label: "Web" },
};

const AGENT_NAMES: Record<AgentSource, string> = {
  github: "Agent GitHub",
  linkedin: "Agent LinkedIn",
  reddit: "Agent Reddit",
  internet: "Agent Web",
};

const AGENT_SUBTITLES: Record<AgentSource, string> = {
  github: "Open source · Repositories · Commits",
  linkedin: "Profils · Expériences · Formations",
  reddit: "Posts techniques · Karma · Auteurs",
  internet: "Blogs · Portfolios · Conférences",
};

// Fake scanning counter per agent
const AGENT_SCAN_TOTALS: Record<AgentSource, number> = {
  github: 2847,
  linkedin: 1240,
  reddit: 847,
  internet: 3200,
};

function AgentCard({
  source,
  state,
  foundCount,
}: {
  source: AgentSource;
  state: AgentState;
  foundCount: number;
}) {
  const config = SOURCE_CONFIG[source];
  const [frame, setFrame] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    if (state !== "running") return;
    const t = setInterval(() => setFrame((f) => (f + 1) % 3), 150);
    return () => clearInterval(t);
  }, [state]);

  // Animate scan counter up to total
  useEffect(() => {
    if (state === "idle") return;
    const total = AGENT_SCAN_TOTALS[source];
    const duration = 4000;
    const steps = 60;
    const increment = total / steps;
    let current = 0;
    const t = setInterval(() => {
      current = Math.min(current + increment, total);
      setScanCount(Math.floor(current));
      if (current >= total) clearInterval(t);
    }, duration / steps);
    return () => clearInterval(t);
  }, [state, source]);

  const isRunning = state === "running";
  const isDone = state === "done";
  const isIdle = state === "idle";

  const borderColor = isDone
    ? "#10b981"
    : isRunning
    ? config.color
    : "#1e293b";

  const glowColor = isRunning ? config.color : isDone ? "#10b981" : "transparent";

  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(135deg, #0f172a 0%, #131e2e 100%)",
        border: `1px solid ${borderColor}${isRunning ? "80" : isDone ? "60" : "30"}`,
        borderRadius: 16,
        padding: "20px 18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        minWidth: 160,
        overflow: "hidden",
        transition: "border-color 0.4s ease, box-shadow 0.4s ease",
        boxShadow: isRunning
          ? `0 0 32px ${glowColor}20, 0 0 8px ${glowColor}10, inset 0 1px 0 rgba(255,255,255,0.04)`
          : isDone
          ? `0 0 16px #10b98118, inset 0 1px 0 rgba(255,255,255,0.04)`
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Animated glow ring when running */}
      {isRunning && (
        <div
          className="animate-agent-pulse-ring"
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 16,
            border: `1px solid ${config.color}50`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Top accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "25%",
          right: "25%",
          height: 2,
          background: isDone
            ? "linear-gradient(90deg, transparent, #10b981, transparent)"
            : isRunning
            ? `linear-gradient(90deg, transparent, ${config.color}, transparent)`
            : "transparent",
          borderRadius: "0 0 2px 2px",
          transition: "background 0.4s",
        }}
      />

      {/* Scan line animation when running */}
      {isRunning && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "100%",
            overflow: "hidden",
            pointerEvents: "none",
            borderRadius: 16,
          }}
        >
          <div
            className="animate-agent-scan-bar"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "30%",
              background: `linear-gradient(90deg, transparent, ${config.color}10, transparent)`,
              animationDuration: "2s",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
          />
        </div>
      )}

      {/* Sprite at 2x scale */}
      <div
        style={{
          transform: isIdle ? "scale(1.5)" : "scale(2)",
          transformOrigin: "center",
          marginTop: 6,
          opacity: isIdle ? 0.35 : 1,
          transition: "opacity 0.3s, transform 0.3s",
        }}
        className={isRunning ? "animate-pixel-bounce" : ""}
      >
        <PixelSprite color={config.color} frame={frame} />
      </div>

      {/* Agent name */}
      <div
        style={{
          color: isDone ? "#10b981" : isIdle ? "#334155" : config.color,
          fontFamily: "monospace",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          transition: "color 0.3s",
        }}
      >
        {AGENT_NAMES[source]}
      </div>

      {/* Subtitle */}
      <div
        style={{
          color: "#334155",
          fontFamily: "monospace",
          fontSize: 9,
          textAlign: "center",
          lineHeight: 1.4,
        }}
      >
        {AGENT_SUBTITLES[source]}
      </div>

      {/* Divider */}
      <div style={{ width: "100%", height: 1, background: "#1e293b" }} />

      {/* Stats row */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#475569", fontFamily: "monospace", fontSize: 9 }}>
          {isIdle ? "—" : `${scanCount.toLocaleString("fr-FR")} scannés`}
        </span>
        {isDone ? (
          <span
            style={{
              color: "#10b981",
              fontFamily: "monospace",
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            ✓ Terminé
          </span>
        ) : isRunning ? (
          <span
            style={{
              color: config.color,
              fontFamily: "monospace",
              fontSize: 9,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: config.color,
                animation: "pulse-dot 1s ease-in-out infinite",
              }}
            />
            LIVE
          </span>
        ) : null}
      </div>

      {foundCount > 0 && (
        <div
          style={{
            background: `${config.color}18`,
            border: `1px solid ${config.color}30`,
            borderRadius: 8,
            padding: "3px 10px",
            color: config.color,
            fontFamily: "monospace",
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {foundCount} profil{foundCount > 1 ? "s" : ""} trouvé{foundCount > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

export default function LoadingView({
  query,
  profileCount,
  agentStatuses,
  feedLogs,
}: LoadingViewProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);

  // Elapsed timer (for demo feel)
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feedLogs]);

  const agents: { source: AgentSource; state: AgentState }[] = (
    ["linkedin", "github", "reddit", "internet"] as AgentSource[]
  ).map((source) => ({ source, state: agentStatuses[source] ?? "idle" }));

  const doneCount = agents.filter((a) => a.state === "done").length;
  const runningCount = agents.filter((a) => a.state === "running").length;
  const progress = (doneCount / agents.length) * 100;

  // Count found profiles per source
  const foundPerSource: Record<AgentSource, number> = {
    linkedin: 0,
    github: 0,
    reddit: 0,
    internet: 0,
  };
  feedLogs.forEach((log) => {
    if (log.type === "found") foundPerSource[log.source]++;
  });

  const elapsedStr = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div
      className="min-h-screen flex flex-col overflow-y-auto"
      style={{
        background: "linear-gradient(180deg, #020817 0%, #0a0e1a 40%, #060a14 100%)",
        color: "#f1f5f9",
      }}
    >
      {/* Star dots background */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `
            radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.15) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.10) 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 8%, rgba(255,255,255,0.12) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 55%, rgba(255,255,255,0.08) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 22%, rgba(255,255,255,0.14) 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 45%, rgba(255,255,255,0.10) 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 70%, rgba(255,255,255,0.08) 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 85%, rgba(255,255,255,0.12) 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 75%, rgba(255,255,255,0.09) 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 90%, rgba(255,255,255,0.11) 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 12%, rgba(255,255,255,0.13) 0%, transparent 100%),
            radial-gradient(1px 1px at 3% 92%, rgba(255,255,255,0.07) 0%, transparent 100%)
          `,
          zIndex: 0,
        }}
      />

      <div className="relative flex flex-col items-center px-6 py-10 gap-8" style={{ zIndex: 1 }}>
        {/* ── Header ── */}
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold uppercase tracking-wider"
            style={{
              background: "rgba(99,102,241,0.12)",
              color: "#818cf8",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#818cf8", animation: "pulse-dot 1.2s ease-in-out infinite" }}
            />
            {runningCount > 0
              ? `${runningCount} agent${runningCount > 1 ? "s" : ""} en action`
              : "Analyse en cours"}
            <span style={{ color: "#475569", marginLeft: 4 }}>{elapsedStr}</span>
          </div>

          <h2
            className="text-3xl font-bold mb-3 tracking-tight"
            style={{ color: "#f1f5f9", letterSpacing: "-0.02em" }}
          >
            Nos agents IA chassent pour vous
          </h2>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono"
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(99,102,241,0.2)",
              color: "#94a3b8",
              maxWidth: 520,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <span className="truncate">{query}</span>
          </div>
        </div>

        {/* ── Agent cards 2×2 ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            width: "100%",
            maxWidth: 780,
          }}
        >
          {agents.map((a) => (
            <AgentCard
              key={a.source}
              source={a.source}
              state={a.state}
              foundCount={foundPerSource[a.source]}
            />
          ))}
        </div>

        {/* ── Progress section ── */}
        <div style={{ width: "100%", maxWidth: 780 }}>
          <div
            style={{
              background: "rgba(15,23,42,0.6)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Spinning ring */}
                <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" style={{ position: "absolute" }}>
                    <circle cx="14" cy="14" r="11" fill="none" stroke="#1e293b" strokeWidth="2" />
                    <circle
                      cx="14" cy="14" r="11"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * 11}`}
                      strokeDashoffset={`${2 * Math.PI * 11 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 14 14)"
                      style={{ transition: "stroke-dashoffset 0.8s ease" }}
                    />
                  </svg>
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "monospace",
                      fontSize: 7,
                      fontWeight: 700,
                      color: "#818cf8",
                    }}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>
                <span style={{ color: "#94a3b8", fontFamily: "monospace", fontSize: 12 }}>
                  {doneCount}/{agents.length} agents terminés
                </span>
              </div>

              {profileCount > 0 && (
                <div
                  className="animate-profile-pop"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    borderRadius: 10,
                    padding: "4px 12px",
                  }}
                >
                  <span style={{ color: "#10b981", fontSize: 14 }}>✦</span>
                  <span
                    style={{
                      color: "#10b981",
                      fontFamily: "monospace",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {profileCount} profil{profileCount > 1 ? "s" : ""} trouvé{profileCount > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: "100%",
                height: 4,
                background: "#1e293b",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #4f46e5, #7c3aed, #818cf8)",
                  borderRadius: 2,
                  transition: "width 0.8s ease",
                  boxShadow: "0 0 8px rgba(99,102,241,0.5)",
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Terminal feed ── */}
        {feedLogs.length > 0 && (
          <div
            style={{
              width: "100%",
              maxWidth: 780,
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {/* Terminal bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                background: "#0d1117",
                borderBottom: "1px solid #161b22",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
              </div>
              <span style={{ color: "#475569", fontFamily: "monospace", fontSize: 11, marginLeft: 8 }}>
                claw4hr — agent feed
              </span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#22c55e",
                    display: "inline-block",
                    animation: "pulse-dot 1.2s ease-in-out infinite",
                  }}
                />
                <span style={{ color: "#22c55e", fontFamily: "monospace", fontSize: 10, fontWeight: 700 }}>
                  LIVE
                </span>
              </div>
            </div>

            {/* Log lines */}
            <div
              style={{
                background: "#0d1117",
                padding: "12px 16px",
                fontFamily: "monospace",
                fontSize: 11,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 240,
                overflowY: "auto",
              }}
            >
              {feedLogs.slice(-20).map((log, i) => {
                const src = BADGE_COLORS[log.source];
                const textColor = LOG_TYPE_COLORS[log.type];
                const totalShown = Math.min(feedLogs.length, 20);
                const opacity = Math.min(1, (i + 2) / Math.min(totalShown, 5) + 0.3);
                return (
                  <div
                    key={log.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      opacity,
                    }}
                  >
                    <span style={{ color: "#334155", fontSize: 9, paddingTop: 1, flexShrink: 0 }}>
                      {new Date().toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: 8,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: src.bg,
                        color: src.text,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {src.label}
                    </span>
                    <span style={{ color: textColor, lineHeight: 1.5 }}>
                      {log.type === "found" && (
                        <span style={{ color: "#10b981", marginRight: 2 }}>→ </span>
                      )}
                      {log.type === "score" && (
                        <span style={{ color: "#818cf8", marginRight: 2 }}>★ </span>
                      )}
                      {log.message}
                    </span>
                  </div>
                );
              })}
              {/* Blinking cursor */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <span style={{ color: "#334155", fontSize: 9 }}>
                  {new Date().toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    width: 7,
                    height: 12,
                    background: "#4f46e5",
                    animation: "pulse-dot 0.8s ease-in-out infinite",
                  }}
                />
              </div>
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
