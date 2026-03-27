"use client";

interface FeedItem {
  id: number;
  time: string;
  action: string;
  detail: string;
  status: "done" | "running" | "pending";
  type: "connect" | "parse" | "score" | "source" | "analyze" | "notify";
}

const FEED_DATA: FeedItem[] = [
  { id: 1, time: "14:32:01", action: "Connexion Indeed", detail: "Authentification reussie via OpenClaw", status: "done", type: "connect" },
  { id: 2, time: "14:32:03", action: "Scan candidatures", detail: "47 nouvelles candidatures detectees", status: "done", type: "connect" },
  { id: 3, time: "14:32:05", action: "Parsing CV #1-10", detail: "POST /profile/parsing/file — batch 1/5", status: "done", type: "parse" },
  { id: 4, time: "14:32:12", action: "Parsing CV #11-20", detail: "POST /profile/parsing/file — batch 2/5", status: "done", type: "parse" },
  { id: 5, time: "14:32:19", action: "Parsing CV #21-30", detail: "POST /profile/parsing/file — batch 3/5", status: "done", type: "parse" },
  { id: 6, time: "14:32:26", action: "Parsing CV #31-40", detail: "POST /profile/parsing/file — batch 4/5", status: "done", type: "parse" },
  { id: 7, time: "14:32:33", action: "Parsing CV #41-47", detail: "POST /profile/parsing/file — batch 5/5", status: "done", type: "parse" },
  { id: 8, time: "14:32:35", action: "Indexation profils", detail: "47 profils indexes dans HrFlow Source", status: "done", type: "parse" },
  { id: 9, time: "14:32:40", action: "Scoring candidats", detail: "GET /profiles/scoring — Dev Python Senior", status: "done", type: "score" },
  { id: 10, time: "14:33:01", action: "Analyse top 5", detail: "GET /profile/upskilling — explications FR", status: "done", type: "analyze" },
  { id: 11, time: "14:33:15", action: "Q&A profil", detail: 'GET /profile/asking — "equipe managee ?"', status: "done", type: "analyze" },
  { id: 12, time: "14:33:20", action: "Vivier insuffisant", detail: "Lancement sourcing passif automatique", status: "done", type: "source" },
  { id: 13, time: "14:33:22", action: "GitHub API", detail: "Recherche : python senior paris — 12 profils", status: "done", type: "source" },
  { id: 14, time: "14:33:30", action: "Proxycurl", detail: "Enrichissement LinkedIn — 8 profils trouves", status: "done", type: "source" },
  { id: 15, time: "14:33:45", action: "Scoring passifs", detail: "GET /profiles/scoring — talents passifs", status: "running", type: "score" },
  { id: 16, time: "—", action: "Notification WhatsApp", detail: "Envoi resume top 3 au recruteur", status: "pending", type: "notify" },
];

const TYPE_ICONS: Record<FeedItem["type"], string> = {
  connect: "M13 10V3L4 14h7v7l9-11h-7z",
  parse: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  score: "M12 20V10 M18 20V4 M6 20v-4",
  source: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  analyze: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  notify: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
};

export default function AgentFeed() {
  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-2.5">
          <div className="relative w-2.5 h-2.5">
            <div className="absolute inset-0 rounded-full bg-[var(--accent-cyan)] animate-pulse-dot" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)]" />
          </div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">Pipeline Agent</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">14/16 etapes</span>
          <div className="w-24 h-1.5 rounded-full bg-[var(--bg-card)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-emerald)] skill-bar-fill"
              style={{ width: "87.5%" }}
            />
          </div>
        </div>
      </div>

      {/* Feed items */}
      <div className="flex-1 overflow-y-auto">
        {FEED_DATA.map((item, i) => (
          <FeedRow key={item.id} item={item} index={i} />
        ))}
      </div>

      {/* Bottom stats bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-4">
          <Stat label="Parses" value="47" />
          <Stat label="Scores" value="47" />
          <Stat label="Passifs" value="20" />
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          Latence moy. : 340ms
        </span>
      </div>
    </div>
  );
}

function FeedRow({ item, index }: { item: FeedItem; index: number }) {
  const statusEl =
    item.status === "done" ? (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ) : item.status === "running" ? (
      <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent animate-spin-slow" />
    ) : (
      <div className="w-3 h-3 rounded-full border border-white/20" />
    );

  const iconPaths = TYPE_ICONS[item.type];

  return (
    <div
      className={`animate-fade-in-left flex items-start gap-3 px-4 py-2.5 border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${
        item.status === "running" ? "bg-[var(--accent-cyan-dim)]/30" : ""
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Timeline dot + status */}
      <div className="flex flex-col items-center gap-1 pt-0.5">
        {statusEl}
      </div>

      {/* Icon */}
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/[0.04] shrink-0 mt-0.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={iconPaths} />
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <p className={`text-[12px] font-medium truncate ${item.status === "running" ? "text-[var(--accent-cyan)]" : "text-[var(--text-primary)]"}`}>
            {item.action}
          </p>
          <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">{item.time}</span>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{item.detail}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[12px] font-mono font-semibold text-[var(--accent-cyan)]">{value}</span>
      <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
    </div>
  );
}
