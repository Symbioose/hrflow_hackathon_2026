"use client";

import type { SourcedProfile, ChatMessage, SourceType } from "@/app/lib/types";
import ScoreRing from "./ScoreRing";
import QAPanel from "./QAPanel";

const SOURCE_COLORS: Record<SourceType, string> = {
  github: "#1a1a2e",
  linkedin: "#0077b5",
  reddit: "#ff4500",
  internet: "#6b7280",
  indeed: "#2164f3",
  hellowork: "#e05c2a",
};

interface ProfileDetailViewProps {
  profile: SourcedProfile;
  messages: ChatMessage[];
  asking: boolean;
  onBack: () => void;
  onSend: (question: string) => void;
}

export default function ProfileDetailView({
  profile,
  messages,
  asking,
  onBack,
  onSend,
}: ProfileDetailViewProps) {
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Back button */}
      <div className="px-6 pt-5 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider transition-all duration-100 active:translate-x-0.5 active:translate-y-0.5 px-4 py-2"
          style={{
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            boxShadow: "3px 3px 0 0 rgba(26,26,46,0.15)",
            background: "transparent",
          }}
        >
          ← Retour aux résultats
        </button>
      </div>

      {/* Hero header */}
      <div className="px-6 pb-8 pt-2">
        <div
          className="rounded-2xl p-8 flex items-center justify-between gap-6"
          style={{ background: "var(--navy)", color: "#fff" }}
        >
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-mono font-bold text-white text-2xl flex-shrink-0"
              style={{ backgroundColor: profile.avatar_color }}
            >
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "Georgia, serif" }}>
                {profile.name}
              </h1>
              <p className="text-lg mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>
                {profile.title}
              </p>
              <p className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>
                📍 {profile.location} · {profile.experience_years} ans d&apos;expérience
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {profile.sources.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-full text-xs font-mono transition-opacity hover:opacity-70"
                    style={{
                      background: `${SOURCE_COLORS[s.type]}30`,
                      color: "#fff",
                      border: `1px solid ${SOURCE_COLORS[s.type]}60`,
                    }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <ScoreRing score={profile.hrflow_score} size={80} strokeWidth={5} />
        </div>
      </div>

      {/* 2-column body */}
      <div className="px-6 pb-16 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: profile content (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary */}
          <section
            className="p-6 rounded-2xl"
            style={{ background: "var(--cream-mid)", border: "1.5px solid rgba(26,26,46,0.08)" }}
          >
            <h2
              className="text-lg font-bold mb-3"
              style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
            >
              Résumé
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-text)" }}>
              {profile.summary}
            </p>
          </section>

          {/* Skills */}
          <section
            className="p-6 rounded-2xl"
            style={{ background: "var(--cream-mid)", border: "1.5px solid rgba(26,26,46,0.08)" }}
          >
            <h2
              className="text-lg font-bold mb-3"
              style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
            >
              Compétences
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg text-sm font-mono"
                  style={{ background: "rgba(26,26,46,0.07)", color: "var(--ink)" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Experiences */}
          {profile.experiences.length > 0 && (
            <section
              className="p-6 rounded-2xl"
              style={{ background: "var(--cream-mid)", border: "1.5px solid rgba(26,26,46,0.08)" }}
            >
              <h2
                className="text-lg font-bold mb-4"
                style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
              >
                Expériences
              </h2>
              <div className="space-y-5">
                {profile.experiences.map((exp, i) => (
                  <div key={i} className="flex gap-4">
                    <div
                      className="w-1 flex-shrink-0 rounded-full mt-1.5"
                      style={{ background: i === 0 ? "var(--coral)" : "rgba(26,26,46,0.15)", minHeight: 40 }}
                    />
                    <div>
                      <p className="font-bold text-sm" style={{ color: "var(--ink)" }}>{exp.title}</p>
                      <p className="text-sm font-mono" style={{ color: "var(--coral)" }}>{exp.company}</p>
                      <p className="text-xs font-mono mb-1" style={{ color: "var(--muted-text)" }}>
                        {exp.location} · {exp.period}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--muted-text)" }}>
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Educations */}
          {profile.educations.length > 0 && (
            <section
              className="p-6 rounded-2xl"
              style={{ background: "var(--cream-mid)", border: "1.5px solid rgba(26,26,46,0.08)" }}
            >
              <h2
                className="text-lg font-bold mb-4"
                style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
              >
                Formation
              </h2>
              <div className="space-y-3">
                {profile.educations.map((edu, i) => (
                  <div key={i}>
                    <p className="font-bold text-sm" style={{ color: "var(--ink)" }}>{edu.degree}</p>
                    <p className="text-sm font-mono" style={{ color: "var(--coral)" }}>{edu.school}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--muted-text)" }}>{edu.period}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: Q&A panel (2/5) */}
        <div className="lg:col-span-2" style={{ height: "fit-content", position: "sticky", top: 80 }}>
          <QAPanel profile={profile} messages={messages} asking={asking} onSend={onSend} />
        </div>
      </div>
    </div>
  );
}
