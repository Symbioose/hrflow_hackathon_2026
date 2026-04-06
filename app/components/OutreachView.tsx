"use client";

import { useEffect, useState } from "react";
import type { OutreachEntry } from "@/app/lib/types";

interface OutreachViewProps {
  sessionId: string;
}

export default function OutreachView({ sessionId }: OutreachViewProps) {
  const [entries, setEntries] = useState<OutreachEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<OutreachEntry | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId || sessionId === "ssr") return;
    fetch(`/api/account/outreach?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setEntries(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8f9fa" }}>
      <div className="flex h-screen overflow-hidden">
        {/* List */}
        <div
          className="flex flex-col overflow-hidden"
          style={{
            width: selected ? 380 : "100%",
            maxWidth: selected ? 380 : "none",
            flexShrink: 0,
            borderRight: selected ? "1px solid #e5e7eb" : "none",
            background: "#fff",
            transition: "width 200ms ease",
          }}
        >
          {/* Header */}
          <div className="px-6 py-6 flex-shrink-0" style={{ borderBottom: "1px solid #f3f4f6" }}>
            <div className="flex items-center gap-3 mb-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <h1 className="text-xl font-bold" style={{ color: "#1a1a2e" }}>Outreach</h1>
            </div>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              {loading ? "Chargement…" : `${entries.length} message${entries.length !== 1 ? "s" : ""} envoyé${entries.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: "#FF6B6B", animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 px-8">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.15)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-base mb-1" style={{ color: "#1a1a2e" }}>Aucun message envoyé</p>
                  <p className="text-sm" style={{ color: "#6b7280" }}>Sourcez des candidats et générez vos premiers messages d&apos;approche.</p>
                </div>
              </div>
            ) : (
              <div>
                {entries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => { setSelected(entry); setCopied(false); }}
                    className="w-full text-left px-6 py-4 transition-colors"
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: selected?.id === entry.id ? "rgba(255,107,107,0.04)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (selected?.id !== entry.id) (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb";
                    }}
                    onMouseLeave={(e) => {
                      if (selected?.id !== entry.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ background: "linear-gradient(135deg, #FF6B6B, #CC4444)" }}
                      >
                        {entry.profile_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="font-semibold text-sm truncate" style={{ color: "#1a1a2e" }}>
                            {entry.profile_name}
                          </p>
                          {entry.created_at && (
                            <span className="text-[11px] flex-shrink-0 font-mono" style={{ color: "#9ca3af" }}>
                              {formatDate(entry.created_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "#6b7280" }}>
                          {entry.message.slice(0, 100)}…
                        </p>
                      </div>
                    </div>
                    {selected?.id === entry.id && (
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px]"
                        style={{ background: "#FF6B6B" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#f8f9fa" }}>
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-8 py-5 flex-shrink-0"
              style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}
            >
              <div>
                <p className="font-bold text-base" style={{ color: "#1a1a2e" }}>{selected.profile_name}</p>
                {selected.created_at && (
                  <p className="text-xs font-mono mt-0.5" style={{ color: "#9ca3af" }}>
                    Envoyé le {formatDate(selected.created_at)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selected.message)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: copied ? "#10b981" : "#FF6B6B",
                    color: "#fff",
                  }}
                >
                  {copied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                      Copié
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copier
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                  style={{ background: "#f3f4f6", color: "#6b7280" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Message */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <div
                className="max-w-2xl rounded-2xl p-8"
                style={{ background: "#fff", border: "1px solid #e5e7eb", lineHeight: 1.8 }}
              >
                <p className="text-sm whitespace-pre-wrap" style={{ color: "#374151" }}>
                  {selected.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
