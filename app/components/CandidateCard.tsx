"use client";

import type { SourcedProfile, SourceType } from "@/app/lib/types";
import ScoreRing from "./ScoreRing";

interface CandidateCardProps {
  profile: SourcedProfile;
  index: number;
  onSelect: (profile: SourcedProfile) => void;
}

const SOURCE_COLORS: Record<SourceType, string> = {
  github: "#1a1a2e",
  linkedin: "#0077b5",
  reddit: "#ff4500",
  internet: "#6b7280",
  indeed: "#2164f3",
  hellowork: "#e05c2a",
};

const SOURCE_ICONS: Record<SourceType, string> = {
  github: "⬛",
  linkedin: "🔵",
  reddit: "🟠",
  internet: "🌐",
  indeed: "🟦",
  hellowork: "🟧",
};

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-white text-base flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

export default function CandidateCard({ profile, index, onSelect }: CandidateCardProps) {
  const MAX_SKILLS = 4;
  const extra = profile.skills.length - MAX_SKILLS;

  return (
    <div
      className="animate-card-reveal cursor-pointer group"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => onSelect(profile)}
    >
      <div
        className="flex flex-col gap-4 p-5 rounded-2xl transition-all duration-200"
        style={{
          background: "var(--cream-mid)",
          border: "1.5px solid rgba(26,26,46,0.08)",
          boxShadow: "3px 3px 0 0 rgba(26,26,46,0.06)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = "4px 4px 0 0 var(--coral)";
          el.style.borderColor = "var(--coral)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = "3px 3px 0 0 rgba(26,26,46,0.06)";
          el.style.borderColor = "rgba(26,26,46,0.08)";
        }}
      >
        {/* Top row: avatar + info + score ring */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={profile.name} color={profile.avatar_color} />
            <div>
              <p className="font-bold text-[15px]" style={{ color: "var(--ink)" }}>
                {profile.name}
              </p>
              <p className="text-sm" style={{ color: "var(--muted-text)" }}>
                {profile.title}
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: "var(--muted-text)" }}>
                📍 {profile.location} · {profile.experience_years} ans XP
              </p>
            </div>
          </div>
          <ScoreRing score={profile.hrflow_score} size={52} />
        </div>

        {/* Source badges */}
        <div className="flex gap-1.5 flex-wrap">
          {profile.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-medium transition-opacity hover:opacity-70"
              style={{
                background: `${SOURCE_COLORS[s.type]}18`,
                color: SOURCE_COLORS[s.type],
                border: `1px solid ${SOURCE_COLORS[s.type]}30`,
              }}
            >
              {SOURCE_ICONS[s.type]} {s.label}
            </a>
          ))}
        </div>

        {/* Skills */}
        <div className="flex gap-1.5 flex-wrap">
          {profile.skills.slice(0, MAX_SKILLS).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-lg text-xs font-mono"
              style={{ background: "rgba(26,26,46,0.06)", color: "var(--ink)" }}
            >
              {skill}
            </span>
          ))}
          {extra > 0 && (
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-mono"
              style={{ background: "var(--coral-glow)", color: "var(--coral)" }}
            >
              +{extra}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          className="w-full py-2.5 font-mono font-bold text-xs uppercase tracking-wider transition-all duration-100 active:translate-x-0.5 active:translate-y-0.5"
          style={{
            background: "var(--coral)",
            color: "#fff",
            boxShadow: "3px 3px 0 0 var(--coral-deep)",
          }}
        >
          Voir le profil →
        </button>
      </div>
    </div>
  );
}
