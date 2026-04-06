"use client";

import { useEffect, useState } from "react";
import PixelAgent, { type AgentSource, type AgentState } from "./PixelAgent";

interface LoadingViewProps {
  query: string;
  profileCount: number;
  agentStatuses: Record<AgentSource, AgentState>;
}

export default function LoadingView({ query, profileCount, agentStatuses }: LoadingViewProps) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500);
    return () => clearInterval(t);
  }, []);

  const agents: { source: AgentSource; state: AgentState }[] = (
    ["github", "linkedin", "reddit", "internet"] as AgentSource[]
  ).map((source) => ({ source, state: agentStatuses[source] ?? "idle" }));

  const doneCount = agents.filter((a) => a.state === "done").length;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 py-16"
      style={{ background: "#f8f9fa" }}
    >
      {/* Status */}
      <div className="mb-10 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-mono font-bold uppercase tracking-wider"
          style={{ background: "rgba(255,107,107,0.08)", color: "#FF6B6B", border: "1px solid rgba(255,107,107,0.15)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#FF6B6B" }} />
          Agents actifs
        </div>
        <h2
          className="text-2xl font-bold mb-3 tracking-tight"
          style={{ color: "#1a1a2e" }}
        >
          Recherche en cours{dots}
        </h2>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono"
          style={{ background: "#fff", border: "1px solid #e5e7eb", color: "#6b7280" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          {query}
        </div>
      </div>

      {/* Pixel agents */}
      <div className="flex gap-8 md:gap-12 flex-wrap justify-center mb-12">
        {agents.map((a) => (
          <PixelAgent key={a.source} source={a.source} state={a.state} />
        ))}
      </div>

      {/* Progress */}
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono" style={{ color: "#9ca3af" }}>
            {doneCount}/{agents.length} agents terminés
          </span>
          {profileCount > 0 && (
            <span className="text-xs font-mono font-bold" style={{ color: "#FF6B6B" }}>
              +{profileCount} profil{profileCount > 1 ? "s" : ""} trouvé{profileCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: "#e5e7eb" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(doneCount / agents.length) * 100}%`,
              background: "linear-gradient(90deg, #FF6B6B, #CC4444)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
