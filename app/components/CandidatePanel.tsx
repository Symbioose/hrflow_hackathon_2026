"use client";

import { useState } from "react";
import type { HrFlowProfile } from "@/app/lib/types";

interface CandidatePanelProps {
  profiles: HrFlowProfile[];
  loading: boolean;
  selectedKey: string | null;
  onSelect: (profile: HrFlowProfile) => void;
  onAsk: (profile: HrFlowProfile) => void;
}

export default function CandidatePanel({ profiles, loading, selectedKey, onSelect, onAsk }: CandidatePanelProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[var(--bg-surface)]">
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">Candidats</p>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-emerald-dim)] text-[var(--accent-emerald)] font-medium">
          {profiles.length} charges
        </span>
      </div>

      {/* Candidate list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent animate-spin-slow" />
              <p className="text-[12px] text-[var(--text-muted)]">Chargement des profils...</p>
            </div>
          </div>
        )}

        {!loading && profiles.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[12px] text-[var(--text-muted)]">Aucun profil trouve.</p>
          </div>
        )}

        {profiles.map((profile, i) => (
          <CandidateCard
            key={profile.key}
            profile={profile}
            rank={i + 1}
            expanded={expandedKey === profile.key}
            selected={selectedKey === profile.key}
            onToggle={() => setExpandedKey(expandedKey === profile.key ? null : profile.key)}
            onSelect={() => onSelect(profile)}
            onAsk={() => onAsk(profile)}
            delay={i * 80}
          />
        ))}
      </div>
    </div>
  );
}

function CandidateCard({
  profile,
  rank,
  expanded,
  selected,
  onToggle,
  onSelect,
  onAsk,
  delay,
}: {
  profile: HrFlowProfile;
  rank: number;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onAsk: () => void;
  delay: number;
}) {
  const name = profile.info.full_name || "Sans nom";
  const latestExp = profile.experiences?.[0];
  const title = latestExp?.title ?? "Pas de titre";
  const company = latestExp?.company ?? null;
  const location = profile.info.location?.text ?? "Localisation inconnue";
  const skills = (profile.skills ?? []).slice(0, 6);
  const expCount = profile.experiences?.length ?? 0;
  const eduCount = profile.educations?.length ?? 0;

  return (
    <div
      className={`animate-fade-in-up glass rounded-xl overflow-hidden transition-all duration-300 ${
        selected ? "ring-1 ring-[var(--accent-cyan)]/40 bg-[var(--accent-cyan-dim)]/20" : "glass-hover"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Main row — click to expand */}
      <div className="flex items-center gap-3 px-3.5 py-3 cursor-pointer" onClick={onToggle}>
        {/* Avatar initials */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-elevated)] border border-white/[0.06] shrink-0">
          <span className="text-[13px] font-semibold text-[var(--text-secondary)]">
            {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">#{rank}</span>
            <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{name}</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
            {title}{company ? ` — ${company}` : ""}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-[var(--text-muted)]">{location}</span>
            <span className="text-[10px] text-[var(--text-muted)]">{expCount} exp.</span>
            <span className="text-[10px] text-[var(--text-muted)]">{eduCount} formations</span>
          </div>
        </div>

        {/* Expand arrow */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          className={`shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-3.5 pb-3.5 pt-0 animate-slide-down space-y-3 border-t border-white/[0.04]">
          {/* Skills */}
          {skills.length > 0 && (
            <div className="pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Competences</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="text-[10px] px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[var(--text-secondary)]"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experiences */}
          {profile.experiences?.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Experiences</p>
              <div className="space-y-1.5">
                {profile.experiences.slice(0, 3).map((exp, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-[var(--accent-cyan)] mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-[var(--text-primary)] truncate">{exp.title ?? "Sans titre"}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">
                        {exp.company ?? ""}
                        {exp.date_start?.iso8601 ? ` — ${exp.date_start.iso8601.slice(0, 4)}` : ""}
                        {exp.date_end?.iso8601 ? `-${exp.date_end.iso8601.slice(0, 4)}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {profile.info.summary && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Resume</p>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                {profile.info.summary}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onAsk(); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] text-[11px] font-medium hover:bg-[var(--accent-cyan)]/20 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Poser une question
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                selected
                  ? "bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]"
                  : "bg-white/[0.04] border border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.08]"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
              {selected ? "Selectionne" : "Selectionner"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
