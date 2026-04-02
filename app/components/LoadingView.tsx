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
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--cream)" }}
    >
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-2">
          <span style={{ fontSize: 28 }}>🦞</span>
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
          >
            Claw<span style={{ color: "var(--coral)" }}>4HR</span>
          </span>
        </div>
        <h2
          className="text-3xl font-bold mt-4 mb-2"
          style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
        >
          Recherche en cours{dots}
        </h2>
        <p className="font-mono text-sm" style={{ color: "var(--muted-text)" }}>
          &ldquo;{query}&rdquo;
        </p>
      </div>

      {/* Pixel agents */}
      <div className="flex gap-8 md:gap-12 flex-wrap justify-center mb-12">
        {agents.map((a) => (
          <PixelAgent key={a.source} source={a.source} state={a.state} />
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="w-full max-w-md h-2 rounded-full overflow-hidden mb-4"
        style={{ background: "rgba(26,26,46,0.1)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${(doneCount / agents.length) * 100}%`,
            background: "var(--coral)",
          }}
        />
      </div>

      {/* Profile counter */}
      {profileCount > 0 && (
        <p
          className="font-mono text-sm font-bold animate-card-reveal"
          style={{ color: "var(--coral)" }}
        >
          +{profileCount} profil{profileCount > 1 ? "s" : ""} trouvé{profileCount > 1 ? "s" : ""}
        </p>
      )}

      {/* Step indicator */}
      <p className="mt-2 text-xs font-mono" style={{ color: "var(--muted-text)" }}>
        {doneCount}/{agents.length} agents terminés
      </p>
    </div>
  );
}
