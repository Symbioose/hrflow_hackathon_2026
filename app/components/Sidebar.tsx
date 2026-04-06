"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type NavSection = "search" | "shortlist" | "outreach" | "history";

interface SidebarProps {
  activeSection: NavSection;
  shortlistCount: number;
  outreachCount: number;
  sessionId: string;
  userProfile: { name: string; company: string; email: string } | null;
  onNavigate: (section: NavSection) => void;
}

function ClawIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M8 3C6 3 4.5 4.5 4.5 7v6c0 1.5.8 2.5 2 2.5" stroke="#FF6B6B" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M6.5 15.5C7.5 18.5 9.5 20.5 12 20.5s4.5-2 5.5-5" stroke="#FF6B6B" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 3C18 3 19.5 4.5 19.5 7v6c0 1.5-.8 2.5-2 2.5" stroke="#FF6B6B" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 6v5" stroke="#FF6B6B" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

const navItems: { section: NavSection; label: string; icon: React.ReactNode }[] = [
  {
    section: "search",
    label: "Recherche",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    section: "shortlist",
    label: "Shortlist",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    section: "outreach",
    label: "Outreach",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    section: "history",
    label: "Historique",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export type { NavSection };

export default function Sidebar({ activeSection, shortlistCount, outreachCount, sessionId, userProfile, onNavigate }: SidebarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const badges: Record<NavSection, number> = {
    search: 0,
    shortlist: shortlistCount,
    outreach: outreachCount,
    history: 0,
  };

  const displayName = userProfile?.name || "Recruteur";
  const displaySub = userProfile?.company || (sessionId !== "ssr" ? `#${sessionId.slice(0, 8)}` : "—");
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "HR";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-40 select-none"
      style={{
        width: 240,
        background: "#1a1a2e",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }}>🦞</span>
        <span
          className="text-[17px] font-bold tracking-tight text-white"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Claw<span style={{ color: "#FF6B6B" }}>4HR</span>
        </span>
        <span
          className="ml-auto text-[9px] font-mono font-bold px-1.5 py-0.5 rounded tracking-wider"
          style={{ background: "rgba(255,107,107,0.15)", color: "#FF6B6B" }}
        >
          BETA
        </span>
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
          Navigation
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeSection === item.section;
          const badge = badges[item.section];
          return (
            <button
              key={item.section}
              onClick={() => onNavigate(item.section)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 w-full text-left relative group"
              style={{
                background: isActive ? "rgba(255,107,107,0.1)" : "transparent",
                color: isActive ? "#FF6B6B" : "rgba(255,255,255,0.55)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: "#FF6B6B" }}
                />
              )}
              <span
                className="flex-shrink-0 transition-colors"
                style={{ color: isActive ? "#FF6B6B" : "rgba(255,255,255,0.3)" }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
              {badge > 0 && (
                <span
                  className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none py-1"
                  style={{
                    background: isActive ? "#FF6B6B" : "rgba(255,107,107,0.18)",
                    color: isActive ? "#fff" : "#FF6B6B",
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />

      {/* Account */}
      <div className="px-3 pb-5 flex-shrink-0 relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left"
          style={{ background: menuOpen ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => { if (!menuOpen) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
          onMouseLeave={(e) => { if (!menuOpen) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #FF6B6B, #CC4444)" }}
            suppressHydrationWarning
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate" suppressHydrationWarning>{displayName}</p>
            <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }} suppressHydrationWarning>
              {displaySub}
            </p>
          </div>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            className="flex-shrink-0 transition-transform"
            style={{ color: "rgba(255,255,255,0.25)", transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div
            className="absolute left-3 right-3 rounded-xl overflow-hidden z-50"
            style={{
              bottom: "calc(100% - 8px)",
              background: "#1e1e35",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {/* Profile info */}
            {userProfile?.email && (
              <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{userProfile.email}</p>
              </div>
            )}
            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium transition-all"
              style={{ color: "#fca5a5" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,107,107,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
