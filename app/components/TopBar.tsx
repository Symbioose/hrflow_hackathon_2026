"use client";

export default function TopBar() {
  return (
    <header className="relative flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-[var(--bg-base)]">
      {/* Scan line effect */}
      <div className="scan-line absolute inset-0 overflow-hidden pointer-events-none" />

      <div className="flex items-center gap-4">
        {/* Logo mark */}
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[#0088aa] shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
            <path d="M11 8v6" />
            <path d="M8 11h6" />
          </svg>
        </div>

        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">
            Passive Talent Intelligence
          </h1>
          <p className="text-[11px] text-[var(--text-muted)] tracking-wide uppercase">
            Agent IA de Recrutement
          </p>
        </div>
      </div>

      {/* Connection status indicators */}
      <div className="flex items-center gap-5">
        <StatusPill label="OpenClaw" status="connected" />
        <StatusPill label="Indeed" status="connected" />
        <StatusPill label="HrFlow" status="connected" />
        <StatusPill label="Ollama" status="active" />

        <div className="ml-2 h-8 w-px bg-white/[0.06]" />

        {/* Pipeline counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-cyan-dim)] border border-[var(--accent-cyan)]/20">
          <span className="text-[11px] font-mono font-medium text-[var(--accent-cyan)]">
            47 CVs traites
          </span>
        </div>
      </div>
    </header>
  );
}

function StatusPill({ label, status }: { label: string; status: "connected" | "active" | "error" }) {
  const dotColor =
    status === "connected"
      ? "bg-[var(--accent-emerald)]"
      : status === "active"
        ? "bg-[var(--accent-cyan)]"
        : "bg-[var(--accent-rose)]";

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <div className={`absolute inset-0 w-2 h-2 rounded-full ${dotColor} animate-pulse-dot`} />
      </div>
      <span className="text-[11px] font-medium text-[var(--text-secondary)]">{label}</span>
    </div>
  );
}
