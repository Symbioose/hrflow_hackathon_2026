"use client";

import { useEffect, useRef, useState } from "react";
import PixelAgent, { type AgentSource, type AgentState } from "./PixelAgent";
import type { DemoLog } from "@/app/lib/demoSearch";

interface LoadingViewProps {
  query: string;
  profileCount: number;
  agentStatuses: Record<AgentSource, AgentState>;
  feedLogs: DemoLog[];
}

const SOURCE_COLORS: Record<AgentSource, { bg: string; text: string; label: string }> = {
  github:   { bg: "#1f2937", text: "#e5e7eb", label: "GitHub" },
  linkedin: { bg: "#0077b5", text: "#ffffff", label: "LinkedIn" },
  reddit:   { bg: "#ff4500", text: "#ffffff", label: "Reddit" },
  internet: { bg: "#4f46e5", text: "#ffffff", label: "Web" },
};

const LOG_TYPE_COLORS: Record<DemoLog["type"], string> = {
  info:  "#9ca3af",
  found: "#10b981",
  score: "#4f46e5",
  done:  "#6b7280",
};

export default function LoadingView({ query, profileCount, agentStatuses, feedLogs }: LoadingViewProps) {
  const [dots, setDots] = useState(".");
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feedLogs]);

  const agents: { source: AgentSource; state: AgentState }[] = (
    ["github", "linkedin", "reddit", "internet"] as AgentSource[]
  ).map((source) => ({ source, state: agentStatuses[source] ?? "idle" }));

  const doneCount = agents.filter((a) => a.state === "done").length;
  const runningCount = agents.filter((a) => a.state === "running").length;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-8 py-12 overflow-y-auto"
      style={{ background: "#ffffff" }}
    >
      {/* Header */}
      <div className="mb-8 text-center w-full max-w-2xl">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold uppercase tracking-wider"
          style={{ background: "rgba(79,70,229,0.08)", color: "#4f46e5", border: "1px solid rgba(79,70,229,0.15)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4f46e5" }} />
          {runningCount > 0 ? `${runningCount} agent${runningCount > 1 ? "s" : ""} actif${runningCount > 1 ? "s" : ""}` : "Analyse en cours"}
        </div>
        <h2 className="text-2xl font-bold mb-3 tracking-tight" style={{ color: "#111827" }}>
          Recherche en cours{dots}
        </h2>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono"
          style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#374151" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          {query}
        </div>
      </div>

      {/* Pixel agents */}
      <div className="flex gap-8 md:gap-12 flex-wrap justify-center mb-8">
        {agents.map((a) => (
          <PixelAgent key={a.source} source={a.source} state={a.state} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono" style={{ color: "#9ca3af" }}>
            {doneCount}/{agents.length} agents terminés
          </span>
          {profileCount > 0 && (
            <span className="text-xs font-mono font-bold" style={{ color: "#4f46e5" }}>
              +{profileCount} profil{profileCount > 1 ? "s" : ""} trouvé{profileCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "#e5e7eb" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(doneCount / agents.length) * 100}%`,
              background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
            }}
          />
        </div>
      </div>

      {/* Terminal feed */}
      {feedLogs.length > 0 && (
        <div
          className="w-full max-w-2xl rounded-xl overflow-hidden"
          style={{ border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        >
          {/* Terminal header */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ background: "#111827", borderBottom: "1px solid #1f2937" }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#10b981" }} />
            <span className="ml-3 text-xs font-mono" style={{ color: "#6b7280" }}>
              claw4hr — agent feed
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
              <span className="text-[10px] font-mono" style={{ color: "#10b981" }}>LIVE</span>
            </div>
          </div>

          {/* Log lines */}
          <div
            className="p-4 font-mono text-xs flex flex-col gap-1.5 overflow-y-auto"
            style={{ background: "#0d1117", maxHeight: 260 }}
          >
            {feedLogs.slice(-18).map((log, i) => {
              const src = SOURCE_COLORS[log.source];
              const textColor = LOG_TYPE_COLORS[log.type];
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-2.5 animate-fade-in"
                  style={{
                    opacity: Math.min(1, (i + 1) / Math.min(feedLogs.length, 5) + 0.4),
                  }}
                >
                  {/* Timestamp */}
                  <span className="flex-shrink-0 text-[10px] pt-px" style={{ color: "#374151" }}>
                    {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  {/* Source badge */}
                  <span
                    className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{ background: src.bg, color: src.text }}
                  >
                    {src.label}
                  </span>
                  {/* Message */}
                  <span
                    className="flex-1 leading-relaxed"
                    style={{ color: textColor }}
                  >
                    {log.type === "found" && <span style={{ color: "#10b981" }}>→ </span>}
                    {log.type === "score" && <span style={{ color: "#4f46e5" }}>★ </span>}
                    {log.message}
                  </span>
                </div>
              );
            })}
            {/* Cursor clignotant */}
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-[10px]" style={{ color: "#374151" }}>
                {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span
                className="w-2 h-3.5 animate-pulse inline-block"
                style={{ background: "#4f46e5" }}
              />
            </div>
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
