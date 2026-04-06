"use client";

import { useEffect, useState } from "react";
import type { ShortlistEntry, OutreachEntry, SourcedProfile } from "@/app/lib/types";

interface PipelineViewProps {
  sessionId: string;
  onOpenProfile: (profile: SourcedProfile) => void;
  onContact: (profile: SourcedProfile) => void;
}

const ACCENT = "#4f46e5";

const SOURCE_COLORS: Record<string, string> = {
  github: "#1f2937",
  linkedin: "#0077b5",
  reddit: "#ff4500",
  internet: "#7c3aed",
};

const COLUMNS = [
  {
    id: "sourced",
    label: "Sourcés",
    sub: "Profils shortlistés par l'IA",
    color: ACCENT,
    bg: "rgba(139,124,248,0.06)",
    dot: ACCENT,
  },
  {
    id: "shortlisted",
    label: "Shortlistés",
    sub: "Sélectionnés pour contact",
    color: "#10b981",
    bg: "rgba(16,185,129,0.06)",
    dot: "#10b981",
  },
  {
    id: "contacted",
    label: "Contactés",
    sub: "Message outreach envoyé",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    dot: "#f59e0b",
  },
] as const;

type ColumnId = (typeof COLUMNS)[number]["id"];

interface PipelineCard {
  key: string;
  profile: SourcedProfile;
  outreach?: OutreachEntry;
}

export default function PipelineView({ sessionId, onOpenProfile, onContact }: PipelineViewProps) {
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);
  const [outreach, setOutreach] = useState<OutreachEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || sessionId === "ssr") return;
    Promise.all([
      fetch(`/api/account/shortlist?session_id=${sessionId}`).then((r) => r.json()),
      fetch(`/api/account/outreach?session_id=${sessionId}`).then((r) => r.json()),
    ]).then(([sl, o]) => {
      setShortlist(sl.data ?? []);
      setOutreach(o.data ?? []);
      setLoading(false);
    });
  }, [sessionId]);

  const contactedKeys = new Set(outreach.map((o) => o.profile_key));

  const columns: Record<ColumnId, PipelineCard[]> = {
    sourced: shortlist
      .filter((e) => !contactedKeys.has(e.profile_key))
      .map((e) => ({ key: e.profile_key, profile: e.profile_data })),
    shortlisted: shortlist.map((e) => ({ key: e.profile_key, profile: e.profile_data })),
    contacted: outreach.map((o) => {
      const sl = shortlist.find((e) => e.profile_key === o.profile_key);
      return {
        key: o.profile_key,
        profile: sl?.profile_data ?? ({
          key: o.profile_key, name: o.profile_name, title: "", location: "", experience_years: 0,
          summary: "", sources: [], skills: [], experiences: [], educations: [],
          hrflow_score: -1, hrflow_key: null, avatar_color: "#6b7280",
        } as SourcedProfile),
        outreach: o,
      };
    }),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f8f9fa" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: ACCENT, borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "#9ca3af" }}>Chargement du pipeline…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 overflow-y-auto" style={{ background: "#f8f9fa" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pipeline</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Suivi de vos candidats par étape de recrutement</p>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-3 gap-5">
        {COLUMNS.map((col) => {
          const cards = columns[col.id];
          return (
            <div key={col.id} className="flex flex-col gap-3">
              {/* Column header */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: col.bg, border: `1px solid ${col.color}22` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.dot }} />
                  <span className="text-sm font-semibold" style={{ color: "#111827" }}>{col.label}</span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${col.color}20`, color: col.color }}
                >
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2.5">
                {cards.length === 0 ? (
                  <div
                    className="rounded-xl p-4 text-center border border-dashed"
                    style={{ borderColor: "#d1d5db", background: "transparent" }}
                  >
                    <p className="text-xs" style={{ color: "#9ca3af" }}>Aucun candidat</p>
                  </div>
                ) : (
                  cards.map((card) => (
                    <CandidateCard
                      key={card.key}
                      card={card}
                      colId={col.id}
                      accentColor={col.color}
                      onOpenProfile={onOpenProfile}
                      onContact={onContact}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CandidateCard({
  card,
  colId,
  accentColor,
  onOpenProfile,
  onContact,
}: {
  card: PipelineCard;
  colId: ColumnId;
  accentColor: string;
  onOpenProfile: (p: SourcedProfile) => void;
  onContact: (p: SourcedProfile) => void;
}) {
  const { profile, outreach } = card;
  const initials = profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const primarySource = profile.sources?.[0];
  const sourceColor = primarySource ? (SOURCE_COLORS[primarySource.type] ?? "#6b7280") : profile.avatar_color ?? "#6b7280";

  return (
    <div
      className="bg-white rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all duration-150 group"
      style={{ border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      onClick={() => onOpenProfile(profile)}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}44`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb"; }}
    >
      {/* Top row */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: profile.avatar_color ?? sourceColor }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{profile.name}</p>
          <p className="text-xs truncate" style={{ color: "#6b7280" }}>{profile.title || "—"}</p>
        </div>
        {profile.hrflow_score > 0 && (
          <div
            className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: profile.hrflow_score >= 70 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              color: profile.hrflow_score >= 70 ? "#10b981" : "#f59e0b",
            }}
          >
            {profile.hrflow_score}%
          </div>
        )}
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#f3f4f6", color: "#374151" }}
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#f3f4f6", color: "#9ca3af" }}>
              +{profile.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Source + outreach preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {primarySource && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${sourceColor}18`, color: sourceColor }}
            >
              {primarySource.type}
            </span>
          )}
          {profile.location && (
            <span className="text-[10px]" style={{ color: "#9ca3af" }}>{profile.location}</span>
          )}
        </div>

        {colId !== "contacted" ? (
          <button
            onClick={(e) => { e.stopPropagation(); onContact(profile); }}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
          >
            Contacter
          </button>
        ) : (
          <span className="text-[10px] font-medium" style={{ color: "#10b981" }}>
            ✓ Envoyé
          </span>
        )}
      </div>

      {/* Outreach preview */}
      {outreach && (
        <div
          className="text-[11px] px-3 py-2 rounded-lg line-clamp-2 leading-relaxed"
          style={{ background: "rgba(245,158,11,0.06)", color: "#78716c", borderLeft: "2px solid #f59e0b" }}
        >
          {outreach.message.slice(0, 100)}…
        </div>
      )}
    </div>
  );
}
