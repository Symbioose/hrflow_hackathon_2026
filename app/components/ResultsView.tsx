"use client";

import { useState } from "react";
import type { SourcedProfile } from "@/app/lib/types";
import CandidateCard from "./CandidateCard";

type SortMode = "score-desc" | "score-asc" | "high-only" | "arrival";

interface ResultsViewProps {
  profiles: SourcedProfile[];
  query: string;
  isStreaming: boolean;
  onSelect: (profile: SourcedProfile) => void;
  onNewSearch: () => void;
}

function sortProfiles(profiles: SourcedProfile[], mode: SortMode): SourcedProfile[] {
  const copy = [...profiles];
  switch (mode) {
    case "score-desc": return copy.sort((a, b) => b.hrflow_score - a.hrflow_score);
    case "score-asc":  return copy.sort((a, b) => a.hrflow_score - b.hrflow_score);
    case "high-only":  return copy.filter((p) => p.hrflow_score >= 70).sort((a, b) => b.hrflow_score - a.hrflow_score);
    case "arrival":    return copy;
  }
}

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "score-desc", label: "Score ↓" },
  { mode: "score-asc",  label: "Score ↑" },
  { mode: "high-only",  label: "≥ 70%" },
  { mode: "arrival",    label: "Ordre" },
];

export default function ResultsView({ profiles, query, isStreaming, onSelect, onNewSearch }: ResultsViewProps) {
  const [sort, setSort] = useState<SortMode>("score-desc");
  const sorted = sortProfiles(profiles, sort);

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-mono"
            style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", color: "var(--ink)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            {query}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isStreaming && (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono"
              style={{ background: "#fed7d7", color: "var(--coral)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--coral)" }} />
              Recherche en cours...
            </div>
          )}
          <span className="text-sm font-mono" style={{ color: "#6b7280" }}>
            {profiles.length} profil{profiles.length > 1 ? "s" : ""}
          </span>
          <button
            onClick={onNewSearch}
            className="px-4 py-2 rounded-md text-sm font-mono font-bold transition-all"
            style={{ background: "var(--ink)", color: "#fff" }}
          >
            ← Nouvelle recherche
          </button>
        </div>
      </header>

      {/* Sort controls */}
      <div className="flex gap-2 px-6 py-4">
        {SORT_OPTIONS.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setSort(mode)}
            className="px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all"
            style={{
              background: sort === mode ? "var(--ink)" : "transparent",
              color: sort === mode ? "var(--cream)" : "var(--ink)",
              border: `1px solid ${sort === mode ? "var(--ink)" : "rgba(26,26,46,0.2)"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-lg font-mono" style={{ color: "var(--muted-text)" }}>
            {sort === "high-only" ? "Aucun profil ≥ 70% pour l'instant." : "Recherche en cours..."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-6 pb-12">
          {sorted.map((p, i) => (
            <CandidateCard key={p.key} profile={p} index={i} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
