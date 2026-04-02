"use client";

import { useState, useRef } from "react";
import type { SourceType } from "@/app/lib/types";

interface SearchViewProps {
  onSearch: (query: string) => void;
}

const SUGGESTIONS = [
  "Data Scientist NLP — Paris",
  "Lead DevOps AWS/GCP — Remote",
  "Full-Stack React/Node — Lyon",
];

const CONNECTORS: { type: SourceType; label: string; color: string; active: boolean }[] = [
  { type: "github", label: "GitHub", color: "#1a1a2e", active: true },
  { type: "linkedin", label: "LinkedIn", color: "#0077b5", active: true },
  { type: "reddit", label: "Reddit", color: "#ff4500", active: true },
  { type: "internet", label: "Internet", color: "#6b7280", active: true },
  { type: "indeed", label: "Indeed", color: "#2164f3", active: false },
  { type: "hellowork", label: "HelloWork", color: "#e05c2a", active: false },
];

export default function SearchView({ onSearch }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const q = query.trim();
    if (!q) return;
    onSearch(q);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--cream)" }}
    >
      {/* Logo */}
      <div className="mb-12 text-center animate-card-reveal">
        <div className="inline-flex items-center gap-3 mb-4">
          <span style={{ fontSize: 40 }}>🦞</span>
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display, Georgia, serif)", color: "var(--ink)" }}
          >
            Claw<span style={{ color: "var(--coral)" }}>4HR</span>
          </h1>
        </div>
        <p className="text-lg" style={{ color: "var(--muted-text)", fontFamily: "Georgia, serif" }}>
          Trouvez les talents passifs que vos concurrents ne voient pas.
        </p>
      </div>

      {/* Search bar */}
      <div
        className="w-full max-w-2xl flex items-center gap-3 px-5 py-4 rounded-2xl animate-card-reveal"
        style={{
          background: "#fff",
          boxShadow: "6px 6px 0 0 var(--ink)",
          border: "2px solid var(--ink)",
          animationDelay: "100ms",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Dev Python senior à Paris avec 5 ans d'XP..."
          className="flex-1 bg-transparent outline-none text-base"
          style={{ color: "var(--ink)", fontFamily: "Georgia, serif" }}
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!query.trim()}
          className="px-6 py-2 font-mono font-bold text-sm uppercase tracking-wider transition-all duration-100 active:translate-x-1 active:translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: query.trim() ? "var(--coral)" : "#e5e7eb",
            color: query.trim() ? "#fff" : "var(--muted-text)",
            boxShadow: query.trim() ? "3px 3px 0 0 var(--coral-deep)" : "none",
          }}
        >
          Chercher
        </button>
      </div>

      {/* Suggestions */}
      <div
        className="flex flex-wrap gap-2 mt-4 justify-center animate-card-reveal"
        style={{ animationDelay: "200ms" }}
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setQuery(s); inputRef.current?.focus(); }}
            className="px-4 py-2 rounded-full text-sm font-mono transition-all duration-150 hover:border-[var(--coral)] hover:text-[var(--coral)]"
            style={{ border: "1px solid var(--ink)", color: "var(--ink)", background: "transparent" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Connectors */}
      <div
        className="mt-16 flex flex-wrap gap-3 justify-center animate-card-reveal"
        style={{ animationDelay: "350ms" }}
      >
        {CONNECTORS.map((c) => (
          <div
            key={c.type}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              border: `1px solid ${c.active ? c.color : "#e5e7eb"}`,
              background: c.active ? `${c.color}10` : "transparent",
              opacity: c.active ? 1 : 0.5,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: c.active ? c.color : "#d1d5db" }}
            />
            <span className="text-xs font-mono" style={{ color: c.active ? c.color : "#9ca3af" }}>
              {c.label}
              {!c.active && " (bientôt)"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
