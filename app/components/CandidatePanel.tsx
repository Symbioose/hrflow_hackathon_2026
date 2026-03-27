"use client";

import { useState } from "react";

interface Candidate {
  id: number;
  name: string;
  score: number;
  source: "Indeed" | "GitHub" | "LinkedIn";
  title: string;
  location: string;
  experience: string;
  skills: { name: string; level: number }[];
  explanation: string;
  gap: string;
  isPassive?: boolean;
}

const CANDIDATES: Candidate[] = [
  {
    id: 1,
    name: "Marie Dupont",
    score: 92,
    source: "Indeed",
    title: "Senior Python Developer",
    location: "Paris 11e",
    experience: "6 ans",
    skills: [
      { name: "Python", level: 95 },
      { name: "Django", level: 88 },
      { name: "AWS", level: 75 },
      { name: "PostgreSQL", level: 82 },
    ],
    explanation: "Profil tres solide avec experience confirmee en Python backend. Leadership demontre sur 2 projets transverses. Stack technique alignee a 92% avec le poste.",
    gap: "Kubernetes : rattrapable en 4-6 semaines avec formation ciblee.",
  },
  {
    id: 2,
    name: "Lucas Martin",
    score: 87,
    source: "Indeed",
    title: "Developpeur Full-Stack Python",
    location: "Lyon (mobile)",
    experience: "4 ans",
    skills: [
      { name: "Python", level: 90 },
      { name: "FastAPI", level: 85 },
      { name: "Docker", level: 78 },
      { name: "React", level: 70 },
    ],
    explanation: "Developpeur polyvalent, forte progression de carriere. Bilingue FR/EN, atout pour equipe internationale. Motivation elevee — candidature spontanee.",
    gap: "Experience managériale absente. AWS a renforcer.",
  },
  {
    id: 3,
    name: "Sarah Cohen",
    score: 84,
    source: "Indeed",
    title: "ML Engineer / Python",
    location: "Remote (Paris)",
    experience: "5 ans",
    skills: [
      { name: "Python", level: 92 },
      { name: "ML/AI", level: 88 },
      { name: "Kubernetes", level: 72 },
      { name: "FastAPI", level: 68 },
    ],
    explanation: "Expertise rare en ML applique. Profil atypique pour un poste backend pur mais competences Python exceptionnelles. Teletravail souhaite.",
    gap: "Django non maitrise. Profil oriente data, transition backend a accompagner.",
  },
  {
    id: 4,
    name: "Antoine Moreau",
    score: 79,
    source: "GitHub",
    title: "Open Source Contributor",
    location: "Bordeaux",
    experience: "7 ans",
    skills: [
      { name: "Python", level: 94 },
      { name: "Go", level: 80 },
      { name: "Linux", level: 90 },
      { name: "CI/CD", level: 85 },
    ],
    explanation: "Top contributeur sur 3 projets Python majeurs (800+ stars). Expertise systeme rare. N'a jamais postule — talent passif identifie via GitHub.",
    gap: "Pas d'experience en entreprise classique. Framework web a valider.",
    isPassive: true,
  },
  {
    id: 5,
    name: "Camille Rousseau",
    score: 76,
    source: "LinkedIn",
    title: "Backend Lead chez DataScale",
    location: "Paris 8e",
    experience: "8 ans",
    skills: [
      { name: "Python", level: 88 },
      { name: "Architecture", level: 92 },
      { name: "AWS", level: 85 },
      { name: "Management", level: 78 },
    ],
    explanation: "Profil senior avec experience de lead. Actuellement en poste mais profil LinkedIn signale ouverture aux opportunites. Contact via Proxycurl.",
    gap: "Surcalifie pour le poste ? Verifier attentes salariales.",
    isPassive: true,
  },
];

export default function CandidatePanel() {
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const inbound = CANDIDATES.filter((c) => !c.isPassive);
  const passive = CANDIDATES.filter((c) => c.isPassive);

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[var(--bg-surface)]">
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">Candidats</p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-emerald-dim)] text-[var(--accent-emerald)] font-medium">
            {inbound.length} Indeed
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--accent-cyan-dim)] text-[var(--accent-cyan)] font-medium">
            {passive.length} Passifs
          </span>
        </div>
      </div>

      {/* Scrollable candidate list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {/* Inbound section */}
        <SectionHeader label="Candidatures recues" count={inbound.length} />
        {inbound.map((c, i) => (
          <CandidateCard
            key={c.id}
            candidate={c}
            rank={i + 1}
            expanded={expandedId === c.id}
            onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
            delay={i * 120}
          />
        ))}

        {/* Passive section */}
        <div className="pt-3">
          <SectionHeader label="Talents passifs" count={passive.length} isPassive />
        </div>
        {passive.map((c, i) => (
          <CandidateCard
            key={c.id}
            candidate={c}
            rank={inbound.length + i + 1}
            expanded={expandedId === c.id}
            onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
            delay={(inbound.length + i) * 120 + 300}
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ label, count, isPassive }: { label: string; count: number; isPassive?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-1 py-1.5">
      <div className={`w-1 h-4 rounded-full ${isPassive ? "bg-[var(--accent-cyan)]" : "bg-[var(--accent-emerald)]"}`} />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </span>
      <span className="text-[10px] text-[var(--text-muted)]">({count})</span>
    </div>
  );
}

function CandidateCard({
  candidate: c,
  rank,
  expanded,
  onToggle,
  delay,
}: {
  candidate: Candidate;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const scoreColor =
    c.score >= 90
      ? "var(--accent-emerald)"
      : c.score >= 80
        ? "var(--accent-cyan)"
        : c.score >= 70
          ? "var(--accent-amber)"
          : "var(--accent-rose)";

  const sourceColors: Record<string, string> = {
    Indeed: "text-[var(--accent-emerald)] bg-[var(--accent-emerald-dim)]",
    GitHub: "text-[var(--text-primary)] bg-white/[0.08]",
    LinkedIn: "text-[#0a66c2] bg-[#0a66c2]/10",
  };

  // SVG circle math for score ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (c.score / 100) * circumference;

  return (
    <div
      className="animate-fade-in-up glass glass-hover rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onToggle}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Score ring */}
        <div className="relative shrink-0">
          <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
            <circle cx="32" cy="32" r={radius} fill="none" stroke="var(--bg-elevated)" strokeWidth="3" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="score-ring-animated"
              style={{ animationDelay: `${delay + 200}ms`, filter: `drop-shadow(0 0 4px ${scoreColor})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[15px] font-bold" style={{ color: scoreColor }}>{c.score}</span>
            <span className="text-[8px] text-[var(--text-muted)]">/ 100</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">#{rank}</span>
            <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{c.name}</span>
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${sourceColors[c.source]}`}>
              {c.source}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">{c.title}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-[var(--text-muted)]">{c.location}</span>
            <span className="text-[10px] text-[var(--text-muted)]">{c.experience}</span>
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
          {/* Skills bars */}
          <div className="pt-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Competences</p>
            {c.skills.map((skill, i) => (
              <div key={skill.name} className="flex items-center gap-2">
                <span className="text-[11px] text-[var(--text-secondary)] w-20 shrink-0">{skill.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full skill-bar-fill"
                    style={{
                      width: `${skill.level}%`,
                      background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}88)`,
                      animationDelay: `${i * 100 + 200}ms`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)] w-7 text-right">{skill.level}</span>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Analyse HrFlow</p>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{c.explanation}</p>
          </div>

          {/* Gap */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--accent-amber)]/[0.06] border border-[var(--accent-amber)]/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-[11px] text-[var(--accent-amber)]/80">{c.gap}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] text-[11px] font-medium hover:bg-[var(--accent-cyan)]/20 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Poser une question
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[var(--text-secondary)] text-[11px] font-medium hover:bg-white/[0.08] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Voir le CV
            </button>
            <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[var(--text-muted)] hover:text-[var(--accent-rose)] hover:bg-[var(--accent-rose)]/10 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
