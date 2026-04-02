"use client";

import { useMemo, useState } from "react";
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

/* ── Analytics helpers ── */

function useAnalytics(profiles: SourcedProfile[]) {
  return useMemo(() => {
    const scored = profiles.filter((p) => p.hrflow_score >= 0);
    const avgScore =
      scored.length > 0
        ? Math.round(scored.reduce((s, p) => s + p.hrflow_score, 0) / scored.length)
        : 0;

    // Most common skill
    const skillCount: Record<string, number> = {};
    for (const p of profiles) {
      for (const sk of p.skills) {
        skillCount[sk] = (skillCount[sk] || 0) + 1;
      }
    }
    const topSkill =
      Object.entries(skillCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    // Unique source types
    const sourceTypes = new Set<string>();
    for (const p of profiles) {
      for (const src of p.sources) {
        sourceTypes.add(src.type);
      }
    }

    return { avgScore, topSkill, activeSources: sourceTypes.size };
  }, [profiles]);
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
  const { avgScore, topSkill, activeSources } = useAnalytics(profiles);

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

      {/* Analytics Stats Bar */}
      {profiles.length > 0 && (
        <div
          className="mx-6 mb-4 flex flex-wrap gap-4 rounded-lg px-5 py-3 font-mono"
          style={{ background: "#fff", border: "1px solid #e5e7eb" }}
        >
          {/* Profils trouvés */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "#9ca3af" }}>Profils trouvés</p>
              <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>{profiles.length}</p>
            </div>
          </div>

          {/* Score moyen */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "#9ca3af" }}>Score moyen</p>
              <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>{avgScore}%</p>
            </div>
          </div>

          {/* Top compétence */}
          <div className="flex items-center gap-2 min-w-[140px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "#9ca3af" }}>Top compétence</p>
              <p className="text-sm font-bold truncate max-w-[160px]" style={{ color: "var(--ink)" }}>{topSkill}</p>
            </div>
          </div>

          {/* Sources actives */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <div>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "#9ca3af" }}>Sources actives</p>
              <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>{activeSources}/4</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          {sort === "high-only" ? (
            <>
              <p className="text-lg font-mono text-center" style={{ color: "var(--muted-text)" }}>
                Aucun profil avec un score &ge; 70% pour cette recherche.
              </p>
              <p className="text-sm font-mono text-center" style={{ color: "#9ca3af" }}>
                Essayez d&apos;élargir vos critères ou consultez tous les profils.
              </p>
              <button
                onClick={() => setSort("score-desc")}
                className="mt-2 px-5 py-2 rounded-md text-sm font-mono font-bold transition-all"
                style={{ background: "var(--ink)", color: "#fff" }}
              >
                Voir tous les profils
              </button>
            </>
          ) : (
            <p className="text-lg font-mono" style={{ color: "var(--muted-text)" }}>
              Recherche en cours...
            </p>
          )}
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
