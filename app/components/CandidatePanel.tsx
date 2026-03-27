"use client";

import { useState } from "react";
import type { HrFlowProfile } from "@/app/lib/types";

/* ─── Props ───────────────────────────────────────────────── */

interface CandidatePanelProps {
  profiles: HrFlowProfile[];
  loading: boolean;
  selectedKey: string | null;
  onSelect: (profile: HrFlowProfile) => void;
  onAsk: (profile: HrFlowProfile) => void;
  scores?: Map<string, number>;
}

/* ─── Utilities ───────────────────────────────────────────── */

function formatDuration(
  dateStart: { iso8601: string | null } | null,
  dateEnd: { iso8601: string | null } | null,
): string {
  if (!dateStart?.iso8601) return "";
  const start = new Date(dateStart.iso8601);
  const end = dateEnd?.iso8601 ? new Date(dateEnd.iso8601) : new Date();
  const months = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}a ${rem}m` : `${years} an${years > 1 ? "s" : ""}`;
}

function totalExperienceYears(profile: HrFlowProfile): number {
  let totalMonths = 0;
  for (const exp of profile.experiences ?? []) {
    if (!exp.date_start?.iso8601) continue;
    const start = new Date(exp.date_start.iso8601);
    const end = exp.date_end?.iso8601 ? new Date(exp.date_end.iso8601) : new Date();
    totalMonths += Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
  }
  return Math.round(totalMonths / 12);
}

/* ─── Panel ───────────────────────────────────────────────── */

export default function CandidatePanel({
  profiles,
  loading,
  selectedKey,
  onSelect,
  onAsk,
  scores,
}: CandidatePanelProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [skillsPreviewKey, setSkillsPreviewKey] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"default" | "score-desc" | "score-asc" | "high-only">("default");

  const toggleSkillsPreview = (key: string) => {
    setSkillsPreviewKey(skillsPreviewKey === key ? null : key);
  };

  /* ─── Sort / filter logic ──────────────────────────────── */
  const sortedProfiles = (() => {
    let list = [...profiles];
    if (sortMode === "high-only") {
      list = list.filter((p) => (scores?.get(p.key) ?? 0) >= 70);
    }
    if (sortMode === "score-desc" || sortMode === "high-only") {
      list.sort((a, b) => (scores?.get(b.key) ?? 0) - (scores?.get(a.key) ?? 0));
    } else if (sortMode === "score-asc") {
      list.sort((a, b) => (scores?.get(a.key) ?? 0) - (scores?.get(b.key) ?? 0));
    }
    return list;
  })();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-3">
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">Candidats</p>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--accent-emerald-dim)] text-[var(--accent-emerald)] font-medium">
            {sortedProfiles.length}{sortMode === "high-only" ? `/${profiles.length}` : ""} charges
          </span>
        </div>
        {scores && scores.size > 0 && (
          <div className="flex items-center gap-2">
            {(["default", "score-desc", "score-asc", "high-only"] as const).map((mode) => {
              const labels = { "default": "Ordre", "score-desc": "Score \u2193", "score-asc": "Score \u2191", "high-only": "\u2265 70%" };
              return (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`text-[10px] px-2 py-1 rounded-full border transition-colors cursor-pointer ${
                    sortMode === mode
                      ? "border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10"
                      : "border-white/10 text-[var(--text-muted)] hover:border-white/20"
                  }`}
                >
                  {labels[mode]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent animate-spin-slow" />
              <p className="text-[12px] text-[var(--text-muted)]">Analyse des profils en cours...</p>
            </div>
          </div>
        )}

        {!loading && sortedProfiles.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[12px] text-[var(--text-muted)]">
              {sortMode === "high-only" ? "Aucun profil avec un score >= 70%." : "Aucun profil trouve."}
            </p>
          </div>
        )}

        {sortedProfiles.map((profile, i) => (
          <CandidateCard
            key={profile.key}
            profile={profile}
            rank={i + 1}
            expanded={expandedKey === profile.key}
            selected={selectedKey === profile.key}
            score={scores?.get(profile.key) ?? null}
            showSkillsPreview={skillsPreviewKey === profile.key}
            onToggle={() => setExpandedKey(expandedKey === profile.key ? null : profile.key)}
            onToggleSkills={() => toggleSkillsPreview(profile.key)}
            onSelect={() => onSelect(profile)}
            onAsk={() => onAsk(profile)}
            delay={i * 80}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Score Ring ───────────────────────────────────────────── */

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "var(--accent-emerald)" :
    score >= 40 ? "var(--accent-amber)" :
    "var(--accent-rose)";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring-animated"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <span className="absolute text-[11px] font-mono font-bold" style={{ color }}>
        {score}%
      </span>
    </div>
  );
}

/* ─── Skill Tag ───────────────────────────────────────────── */

function SkillTag({ name, type }: { name: string; type: string | null }) {
  const isHard = type === "hard";
  return (
    <span
      className={`text-[10px] px-2 py-1 rounded-md border transition-colors ${
        isHard
          ? "bg-[var(--accent-cyan-dim)] border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]"
          : "bg-white/[0.04] border-white/[0.06] text-[var(--text-secondary)]"
      }`}
    >
      {name}
    </span>
  );
}

/* ─── Stat Box ────────────────────────────────────────────── */

function StatBox({
  label,
  value,
  accent,
  onClick,
}: {
  label: string;
  value: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] min-w-[70px] transition-colors ${
        onClick ? "hover:bg-white/[0.06] hover:border-[var(--accent-cyan)]/20 cursor-pointer" : "cursor-default"
      }`}
    >
      <span className={`text-[14px] font-mono font-bold ${accent ? "text-[var(--accent-cyan)]" : "text-[var(--text-primary)]"}`}>
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">{label}</span>
    </button>
  );
}

/* ─── Candidate Card ──────────────────────────────────────── */

function CandidateCard({
  profile,
  rank,
  expanded,
  selected,
  score,
  showSkillsPreview,
  onToggle,
  onToggleSkills,
  onSelect,
  onAsk,
  delay,
}: {
  profile: HrFlowProfile;
  rank: number;
  expanded: boolean;
  selected: boolean;
  score: number | null;
  showSkillsPreview: boolean;
  onToggle: () => void;
  onToggleSkills: () => void;
  onSelect: () => void;
  onAsk: () => void;
  delay: number;
}) {
  const name = profile.info.full_name || "Sans nom";
  const latestExp = profile.experiences?.[0];
  const title = latestExp?.title ?? "Pas de titre";
  const company = latestExp?.company ?? null;
  const location = profile.info.location?.text ?? "Localisation inconnue";
  const allSkills = profile.skills ?? [];
  const hardSkills = allSkills.filter((s) => s.type === "hard");
  const softSkills = allSkills.filter((s) => s.type !== "hard");
  const expCount = profile.experiences?.length ?? 0;
  const eduCount = profile.educations?.length ?? 0;
  const langCount = profile.languages?.length ?? 0;
  const totalYears = totalExperienceYears(profile);
  const email = profile.info.email;

  return (
    <div
      className={`animate-fade-in-up glass rounded-xl overflow-hidden transition-all duration-300 ${
        selected ? "ring-1 ring-[var(--accent-cyan)]/40 bg-[var(--accent-cyan-dim)]/20" : "glass-hover"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* ── Compact row ──────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer" onClick={onToggle}>
        {/* Avatar + rank */}
        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)] border border-white/[0.08] shrink-0">
          <span className="text-[14px] font-bold text-[var(--text-secondary)]">
            {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </span>
          <div className="absolute -top-1 -left-1 flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent-cyan)] text-[9px] font-mono font-bold text-white">
            {rank}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">{name}</p>
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 truncate">
            {title}{company ? ` — ${company}` : ""}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {location}
            </span>
            {totalYears > 0 && (
              <span className="text-[10px] text-[var(--text-muted)]">{totalYears} an{totalYears > 1 ? "s" : ""} exp.</span>
            )}
            {/* Clickable skills badge */}
            {allSkills.length > 0 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleSkills(); }}
                className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border transition-colors ${
                  showSkillsPreview
                    ? "bg-[var(--accent-cyan-dim)] border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]"
                    : "bg-white/[0.04] border-white/[0.06] text-[var(--text-muted)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]/20"
                }`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                {allSkills.length} comp.
              </button>
            )}
          </div>
        </div>

        {/* Score + expand */}
        <div className="flex items-center gap-2 shrink-0">
          {score !== null && <ScoreRing score={score} />}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* ── Skills preview (toggleable without full expand) ── */}
      {showSkillsPreview && !expanded && (
        <div className="px-4 pb-3 animate-slide-down border-t border-white/[0.04]">
          <div className="flex flex-wrap gap-1.5 pt-2.5">
            {allSkills.slice(0, 12).map((skill) => (
              <SkillTag key={skill.name} name={skill.name} type={skill.type} />
            ))}
            {allSkills.length > 12 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="text-[10px] px-2 py-1 text-[var(--accent-cyan)] hover:underline"
              >
                +{allSkills.length - 12} voir tout
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Expanded detail ──────────────────────────────── */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 animate-slide-down space-y-4 border-t border-white/[0.04]">

          {/* Quick stats */}
          <div className="flex items-center gap-2 pt-3 overflow-x-auto">
            <StatBox label="Experiences" value={String(expCount)} accent />
            <StatBox label="Formations" value={String(eduCount)} />
            <StatBox
              label="Competences"
              value={String(allSkills.length)}
              accent
              onClick={onToggleSkills}
            />
            <StatBox label="Langues" value={String(langCount)} />
            {totalYears > 0 && <StatBox label="Annees" value={String(totalYears)} accent />}
          </div>

          {/* Contact */}
          {email && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
              </svg>
              <span className="text-[11px] text-[var(--text-secondary)]">{email}</span>
            </div>
          )}

          {/* Hard skills */}
          {hardSkills.length > 0 && (
            <SkillsSection
              title="Competences techniques"
              count={hardSkills.length}
              skills={hardSkills}
              accent
            />
          )}

          {/* Soft skills */}
          {softSkills.length > 0 && (
            <SkillsSection
              title="Soft skills"
              count={softSkills.length}
              skills={softSkills}
              limit={10}
            />
          )}

          {/* All skills fallback */}
          {hardSkills.length === 0 && softSkills.length === 0 && allSkills.length > 0 && (
            <SkillsSection
              title="Competences"
              count={allSkills.length}
              skills={allSkills}
              limit={15}
            />
          )}

          {/* Languages */}
          {langCount > 0 && (
            <div>
              <SectionTitle text="Langues" />
              <div className="flex flex-wrap gap-1.5">
                {profile.languages.map((lang) => (
                  <span
                    key={lang.name}
                    className="text-[10px] px-2 py-1 rounded-md bg-[var(--accent-emerald-dim)] border border-[var(--accent-emerald)]/20 text-[var(--accent-emerald)]"
                  >
                    {lang.name}{lang.value ? ` — ${lang.value}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience timeline */}
          {expCount > 0 && (
            <div>
              <SectionTitle text={`Parcours professionnel (${expCount})`} />
              <div className="relative pl-4 space-y-3">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--accent-cyan)] via-[var(--accent-cyan)]/30 to-transparent" />
                {profile.experiences.map((exp, i) => (
                  <ExperienceRow key={i} exp={exp} isFirst={i === 0} />
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {eduCount > 0 && (
            <div>
              <SectionTitle text={`Formation (${eduCount})`} />
              <div className="space-y-2">
                {profile.educations.map((edu, i) => (
                  <EducationRow key={i} edu={edu} />
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {profile.info.summary && (
            <div>
              <SectionTitle text="Resume" />
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{profile.info.summary}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAsk(); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] text-[11px] font-medium hover:bg-[var(--accent-cyan)]/20 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              Poser une question
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[11px] font-medium transition-colors ${
                selected
                  ? "bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)]"
                  : "bg-white/[0.04] border border-white/[0.06] text-[var(--text-secondary)] hover:bg-white/[0.08]"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              {selected ? "Selectionne" : "Selectionner"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Reusable sub-components ─────────────────────────────── */

function SectionTitle({ text }: { text: string }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">{text}</p>
  );
}

function SkillsSection({
  title,
  count,
  skills,
  limit,
  accent,
}: {
  title: string;
  count: number;
  skills: { name: string; type: string | null }[];
  limit?: number;
  accent?: boolean;
}) {
  const displayed = limit ? skills.slice(0, limit) : skills;
  const remaining = limit ? skills.length - limit : 0;

  return (
    <div>
      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${
        accent ? "text-[var(--accent-cyan)]" : "text-[var(--text-muted)]"
      }`}>
        {title} ({count})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {displayed.map((skill, i) => (
          <SkillTag key={`${skill.name}-${i}`} name={skill.name} type={skill.type} />
        ))}
        {remaining > 0 && (
          <span className="text-[10px] px-2 py-1 text-[var(--text-muted)]">+{remaining}</span>
        )}
      </div>
    </div>
  );
}

function ExperienceRow({
  exp,
  isFirst,
}: {
  exp: HrFlowProfile["experiences"][number];
  isFirst: boolean;
}) {
  const duration = formatDuration(exp.date_start, exp.date_end);
  const startYear = exp.date_start?.iso8601?.slice(0, 4) ?? "";
  const endYear = exp.date_end?.iso8601?.slice(0, 4) ?? "Actuel";

  return (
    <div className="relative">
      <div className={`absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
        isFirst ? "bg-[var(--accent-cyan)] border-[var(--accent-cyan)]" : "bg-[var(--bg-deep)] border-[var(--accent-cyan)]/40"
      }`} />
      <div className="ml-1">
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-medium text-[var(--text-primary)]">{exp.title ?? "Sans titre"}</p>
          {duration && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[var(--text-muted)] font-mono">
              {duration}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
          {exp.company ?? ""}{exp.location?.text ? ` · ${exp.location.text}` : ""}
        </p>
        {startYear && (
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">{startYear} — {endYear}</p>
        )}
        {exp.description && (
          <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed line-clamp-2">{exp.description}</p>
        )}
      </div>
    </div>
  );
}

function EducationRow({ edu }: { edu: HrFlowProfile["educations"][number] }) {
  const startYear = edu.date_start?.iso8601?.slice(0, 4) ?? "";
  const endYear = edu.date_end?.iso8601?.slice(0, 4) ?? "";

  return (
    <div className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[var(--accent-emerald-dim)] shrink-0 mt-0.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2">
          <path d="m4 6 8-4 8 4" />
          <path d="m18 10 4 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8l4-2" />
          <path d="M14 22v-4a2 2 0 00-4 0v4" />
          <path d="M18 5v17" />
          <circle cx="18" cy="5" r="2" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-[var(--text-primary)] truncate">{edu.title ?? "Sans titre"}</p>
        <p className="text-[10px] text-[var(--text-secondary)] truncate">{edu.school ?? ""}</p>
        {(startYear || endYear) && (
          <p className="text-[9px] text-[var(--text-muted)] mt-0.5 font-mono">
            {startYear}{endYear ? ` — ${endYear}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
