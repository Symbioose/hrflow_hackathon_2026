"use client";

import { useEffect, useState } from "react";
import type { SavedSearch } from "@/app/lib/types";

interface HistoryViewProps {
  sessionId: string;
  onRelaunch: (query: string) => void;
}

export default function HistoryView({ sessionId, onRelaunch }: HistoryViewProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || sessionId === "ssr") return;
    fetch(`/api/account/searches?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setSearches(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  function handleDelete(id: string) {
    setSearches((prev) => prev.filter((s) => s.id !== id));
    fetch("/api/account/searches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, id }),
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen px-8 py-8" style={{ background: "#f8f9fa" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <h1 className="text-xl font-bold" style={{ color: "#1a1a2e" }}>Historique</h1>
        </div>
        <p className="text-sm" style={{ color: "#6b7280" }}>
          {loading ? "Chargement…" : `${searches.length} recherche${searches.length !== 1 ? "s" : ""} effectuée${searches.length !== 1 ? "s" : ""}`}
        </p>
      </div>

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
      ) : searches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.15)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-semibold text-base mb-1" style={{ color: "#1a1a2e" }}>Aucune recherche</p>
            <p className="text-sm" style={{ color: "#6b7280" }}>Votre historique de recherches apparaîtra ici.</p>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl flex flex-col gap-2">
          {searches.map((search, i) => (
            <div
              key={search.id}
              className="flex items-center justify-between rounded-xl px-5 py-4 transition-all"
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                animationDelay: `${i * 40}ms`,
              }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,107,107,0.08)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: "#1a1a2e" }}>{search.query}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {search.created_at && (
                      <span className="text-[11px] font-mono" style={{ color: "#9ca3af" }}>
                        {formatDate(search.created_at)}
                      </span>
                    )}
                    {search.profile_count > 0 && (
                      <span
                        className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,107,107,0.08)", color: "#FF6B6B" }}
                      >
                        {search.profile_count} profils
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => onRelaunch(search.query)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: "#1a1a2e", color: "#fff" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#FF6B6B")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1a1a2e")}
                >
                  Relancer
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(search.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                  style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#9ca3af" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#fee2e2";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#fca5a5";
                    (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#f9fafb";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb";
                    (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
                  }}
                  title="Supprimer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
