"use client";

import type { SourcedProfile, SourceType } from "@/app/lib/types";
import ScoreRing from "./ScoreRing";

interface CandidateCardProps {
  profile: SourcedProfile;
  index: number;
  isSaved: boolean;
  onSelect: (profile: SourcedProfile) => void;
  onSave: (profile: SourcedProfile) => void;
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

export default function CandidateCard({ profile, index, isSaved, onSelect, onSave }: CandidateCardProps) {
  const MAX_SKILLS = 4;
  const extra = profile.skills.length - MAX_SKILLS;

  return (
    <div
      className="animate-card-reveal cursor-pointer group"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => onSelect(profile)}
    >
      <div
        className="flex flex-col gap-4 p-5 rounded-lg transition-all duration-200"
        style={{
          background: "#FFFFFF",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(26,26,46,0.08)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = "0 4px 12px rgba(26,26,46,0.12)";
          el.style.borderColor = "var(--coral)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = "0 1px 3px rgba(26,26,46,0.08)";
          el.style.borderColor = "#e5e7eb";
        }}
      >
        {/* Top row: avatar + info + save + score ring */}
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
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onSave(profile); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110"
              style={{
                background: isSaved ? "#fff8e7" : "#f3f4f6",
                border: `1.5px solid ${isSaved ? "#f59e0b" : "#e5e7eb"}`,
              }}
              title={isSaved ? "Retirer de la shortlist" : "Ajouter à la shortlist"}
            >
              <span style={{ fontSize: 14, color: isSaved ? "#f59e0b" : "#9ca3af" }}>
                {isSaved ? "★" : "☆"}
              </span>
            </button>
            <ScoreRing score={profile.hrflow_score} size={52} />
          </div>
        </div>

        {/* Source badges */}
        <div className="flex gap-2 flex-wrap">
          {profile.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all hover:bg-gray-100"
              style={{ background: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb" }}
            >
              {SOURCE_ICONS[s.type]} {s.label}
            </a>
          ))}
        </div>

        {/* Skills */}
        <div className="flex gap-1.5 flex-wrap">
          {profile.skills.slice(0, MAX_SKILLS).map((skill) => (
            <span key={skill} className="px-2.5 py-1 rounded text-[11px] font-mono" style={{ background: "#f0f0f0", color: "#4b5563" }}>
              {skill}
            </span>
          ))}
          {extra > 0 && (
            <span className="px-2.5 py-1 rounded text-[11px] font-mono" style={{ background: "#f0f0f0", color: "var(--coral)" }}>
              +{extra}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          className="w-full py-2 font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:bg-opacity-90"
          style={{ background: "var(--coral)", color: "#fff", border: "none", borderRadius: "6px" }}
        >
          Voir le profil →
        </button>
      </div>
    </div>
  );
}
