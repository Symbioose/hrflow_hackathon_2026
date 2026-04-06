"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SourcedProfile, ChatMessage } from "@/app/lib/types";
import type { AgentSource, AgentState } from "./PixelAgent";
import SearchView from "./SearchView";
import LoadingView from "./LoadingView";
import ResultsView from "./ResultsView";
import ProfileDetailView from "./ProfileDetailView";
import Sidebar from "./Sidebar";
import type { NavSection } from "./Sidebar";
import ShortlistView from "./ShortlistView";
import OutreachView from "./OutreachView";
import HistoryView from "./HistoryView";
import OutreachModal from "./OutreachModal";
import { streamDemoProfiles } from "@/app/lib/demoProfiles";
import { getSessionId } from "@/app/lib/session";
import { supabase } from "@/app/lib/supabase";

// ─── Types ────────────────────────────────────────────────────

type DashboardView = "search" | "loading" | "results" | "profile" | "shortlist" | "outreach" | "history";

function chatMsg(type: "user" | "agent", text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    type,
    text,
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function viewToSection(view: DashboardView): NavSection {
  if (view === "shortlist") return "shortlist";
  if (view === "outreach") return "outreach";
  if (view === "history") return "history";
  return "search";
}

// ─── Dashboard ────────────────────────────────────────────────

export default function Dashboard() {
  const [view, setView] = useState<DashboardView>("search");
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<SourcedProfile[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentSource, AgentState>>({
    github: "idle", linkedin: "idle", reddit: "idle", internet: "idle",
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SourcedProfile | null>(null);
  const [qaMessages, setQaMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);

  // ─── Account state ─────────────────────────────────────────
  const [sessionId, setSessionId] = useState<string>("ssr");
  const [userProfile, setUserProfile] = useState<{ name: string; company: string; email: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const id = user?.id ?? getSessionId();
      setSessionId(id);
      if (user?.id) {
        const { data } = await supabase
          .from("user_profiles")
          .select("name, company")
          .eq("id", user.id)
          .single();
        setUserProfile({
          name: data?.name ?? "",
          company: data?.company ?? "",
          email: user.email ?? "",
        });
      }
    });
  }, []);
  const [savedProfiles, setSavedProfiles] = useState<Set<string>>(new Set());
  const [shortlistCount, setShortlistCount] = useState(0);
  const [outreachCount, setOutreachCount] = useState(0);
  const [outreachTarget, setOutreachTarget] = useState<SourcedProfile | null>(null);
  const [pendingQuery, setPendingQuery] = useState<string>("");

  const esRef = useRef<EventSource | null>(null);
  const demoCleanupRef = useRef<(() => void) | null>(null);
  const retriesRef = useRef(0);
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchIdRef = useRef(0);

  useEffect(() => {
    connectSSE(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionId || sessionId === "ssr") return;
    fetch(`/api/account/shortlist?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        const keys = new Set<string>((data.data ?? []).map((e: { profile_key: string }) => e.profile_key));
        setSavedProfiles(keys);
        setShortlistCount(keys.size);
      })
      .catch(() => {});

    fetch(`/api/account/outreach?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setOutreachCount((data.data ?? []).length))
      .catch(() => {});
  }, [sessionId]);

  const connectSSE = useCallback((cursor = 0) => {
    if (esRef.current) esRef.current.close();
    const thisSearch = searchIdRef.current;
    const es = new EventSource(`/api/openclaw/stream?cursor=${cursor}`);
    esRef.current = es;

    es.onmessage = (e) => {
      if (searchIdRef.current !== thisSearch) return;
      try {
        const event = JSON.parse(e.data);
        if (event.channel === "profile" && event.payload?.profile) {
          const p = event.payload.profile as SourcedProfile;
          if (demoFallbackTimerRef.current) {
            clearTimeout(demoFallbackTimerRef.current);
            demoFallbackTimerRef.current = null;
          }
          setProfiles((prev) => {
            if (prev.some((x) => x.key === p.key)) return prev;
            return [...prev, p];
          });
          setView((v) => (v === "loading" ? "results" : v));
        }
        if (event.channel === "feed" && event.payload?.source) {
          const source = event.payload.source as AgentSource;
          const status = event.payload.status as "running" | "done" | "error";
          setAgentStatuses((prev) => ({ ...prev, [source]: status }));
        }
        if (event.channel === "chat" && event.payload?.query) {
          setPendingQuery(event.payload.query as string);
        }
      } catch {}
    };

    es.onerror = () => {
      es.close();
      if (searchIdRef.current !== thisSearch) return;
      if (retriesRef.current < 3) {
        retriesRef.current++;
        setTimeout(() => {
          if (searchIdRef.current === thisSearch) connectSSE(cursor);
        }, 2000);
      } else {
        setView("search");
        setIsStreaming(false);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      esRef.current?.close();
      demoCleanupRef.current?.();
      if (demoFallbackTimerRef.current) clearTimeout(demoFallbackTimerRef.current);
      if (streamTimerRef.current) clearTimeout(streamTimerRef.current);
    };
  }, []);

  const handleSearch = useCallback(async (q: string) => {
    const thisSearch = ++searchIdRef.current;
    retriesRef.current = 0;
    if (streamTimerRef.current) clearTimeout(streamTimerRef.current);

    setQuery(q);
    setProfiles([]);
    setAgentStatuses({ github: "idle", linkedin: "idle", reddit: "idle", internet: "idle" });
    setView("loading");
    setIsStreaming(true);

    connectSSE(0);
    setAgentStatuses({ github: "running", linkedin: "running", reddit: "running", internet: "running" });

    if (sessionId && sessionId !== "ssr") {
      fetch("/api/account/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, query: q }),
      }).catch(() => {});
    }

    const res = await fetch("/api/openclaw/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    });

    if (searchIdRef.current !== thisSearch) return;

    const triggerDemoFallback = () => {
      if (searchIdRef.current !== thisSearch) return;
      (["github", "linkedin", "reddit", "internet"] as AgentSource[]).forEach((src, i) => {
        setTimeout(() => {
          if (searchIdRef.current !== thisSearch) return;
          setAgentStatuses((prev) => ({ ...prev, [src]: "done" }));
        }, i * 1500);
      });
      demoCleanupRef.current?.();
      demoCleanupRef.current = streamDemoProfiles((p) => {
        if (searchIdRef.current !== thisSearch) return;
        setProfiles((prev) => {
          if (prev.some((x) => x.key === p.key)) return prev;
          return [...prev, p];
        });
        setView("results");
      }, 1400);
    };

    if (!res.ok) {
      triggerDemoFallback();
    } else {
      if (demoFallbackTimerRef.current) clearTimeout(demoFallbackTimerRef.current);
      demoFallbackTimerRef.current = setTimeout(() => {
        setProfiles((current) => {
          if (current.length === 0) triggerDemoFallback();
          return current;
        });
      }, 6000);
    }

    streamTimerRef.current = setTimeout(() => setIsStreaming(false), 30_000);
  }, [connectSSE, sessionId]);

  const handleSelectProfile = useCallback((profile: SourcedProfile) => {
    setSelectedProfile(profile);
    setQaMessages([]);
    setView("profile");

    setAsking(true);
    const question = "Donne-moi une synthèse de ce profil en 3 points clés pour un recruteur.";
    const fetchPromise = profile.hrflow_key
      ? fetch(`/api/hrflow/ask?profile_key=${profile.hrflow_key}&question=${encodeURIComponent(question)}`).then((r) => r.json())
      : fetch("/api/demo/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, question }),
        }).then((r) => r.json());

    fetchPromise
      .then((data) => {
        const answer = data?.data?.response ?? profile.summary;
        setQaMessages([chatMsg("agent", answer)]);
      })
      .catch(() => {
        setQaMessages([chatMsg("agent", profile.summary)]);
      })
      .finally(() => setAsking(false));
  }, []);

  const handleAsk = useCallback(async (question: string) => {
    if (!selectedProfile || asking) return;
    setQaMessages((prev) => [...prev, chatMsg("user", question)]);
    setAsking(true);
    try {
      let data;
      if (selectedProfile.hrflow_key) {
        const res = await fetch(`/api/hrflow/ask?profile_key=${encodeURIComponent(selectedProfile.hrflow_key)}&question=${encodeURIComponent(question)}`);
        data = await res.json();
      } else {
        const res = await fetch("/api/demo/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: selectedProfile, question }),
        });
        data = await res.json();
      }
      const answer = data?.data?.response ?? "Je n'ai pas pu obtenir de réponse.";
      setQaMessages((prev) => [...prev, chatMsg("agent", answer)]);
    } catch {
      setQaMessages((prev) => [...prev, chatMsg("agent", "Erreur lors de la question. Veuillez réessayer.")]);
    } finally {
      setAsking(false);
    }
  }, [selectedProfile, asking]);

  const handleBack = useCallback(() => {
    setView(profiles.length > 0 ? "results" : "search");
    setSelectedProfile(null);
    setQaMessages([]);
  }, [profiles.length]);

  const handleNewSearch = useCallback(() => {
    esRef.current?.close();
    demoCleanupRef.current?.();
    if (streamTimerRef.current) clearTimeout(streamTimerRef.current);
    if (demoFallbackTimerRef.current) clearTimeout(demoFallbackTimerRef.current);
    setView("search");
    setProfiles([]);
    setQuery("");
    setIsStreaming(false);
    setSelectedProfile(null);
    setQaMessages([]);
  }, []);

  const handleSave = useCallback((profile: SourcedProfile) => {
    const isCurrentlySaved = savedProfiles.has(profile.key);
    setSavedProfiles((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) {
        next.delete(profile.key);
        setShortlistCount((c) => Math.max(0, c - 1));
      } else {
        next.add(profile.key);
        setShortlistCount((c) => c + 1);
      }
      return next;
    });
    if (isCurrentlySaved) {
      fetch("/api/account/shortlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, profile_key: profile.key }),
      }).catch(() => {});
    } else {
      fetch("/api/account/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, profile_key: profile.key, profile_data: profile }),
      }).catch(() => {});
    }
  }, [savedProfiles, sessionId]);

  const handleContact = useCallback((profile: SourcedProfile) => {
    setOutreachTarget(profile);
  }, []);

  const handleOutreachClose = useCallback(() => {
    setOutreachTarget(null);
    fetch(`/api/account/outreach?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setOutreachCount((data.data ?? []).length))
      .catch(() => {});
  }, [sessionId]);

  const handleNavigate = useCallback((section: NavSection) => {
    if (section === "search") {
      // If we have results, go back to results; otherwise search
      if (profiles.length > 0 && view !== "profile") {
        setView("results");
      } else if (view === "profile") {
        handleBack();
      } else {
        setView("search");
      }
    } else {
      setView(section);
    }
  }, [profiles.length, view, handleBack]);

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen" style={{ background: "#f8f9fa" }}>
      {/* Sidebar */}
      <Sidebar
        activeSection={viewToSection(view)}
        shortlistCount={shortlistCount}
        outreachCount={outreachCount}
        sessionId={sessionId}
        userProfile={userProfile}
        onNavigate={handleNavigate}
      />

      {/* Main content */}
      <main className="flex-1 overflow-hidden" style={{ marginLeft: 240 }}>
        {view === "search" && (
          <SearchView onSearch={handleSearch} initialQuery={pendingQuery} />
        )}

        {view === "loading" && (
          <LoadingView query={query} profileCount={profiles.length} agentStatuses={agentStatuses} />
        )}

        {view === "results" && (
          <ResultsView
            profiles={profiles}
            query={query}
            isStreaming={isStreaming}
            agentStatuses={agentStatuses}
            savedProfiles={savedProfiles}
            onSelect={handleSelectProfile}
            onSave={handleSave}
            onContact={handleContact}
            onNewSearch={handleNewSearch}
          />
        )}

        {view === "profile" && selectedProfile && (
          <ProfileDetailView
            profile={selectedProfile}
            messages={qaMessages}
            asking={asking}
            isSaved={savedProfiles.has(selectedProfile.key)}
            onBack={handleBack}
            onSend={handleAsk}
            onSave={handleSave}
            onContact={handleContact}
          />
        )}

        {view === "shortlist" && (
          <ShortlistView
            sessionId={sessionId}
            onOpenProfile={handleSelectProfile}
            onContact={handleContact}
          />
        )}

        {view === "outreach" && (
          <OutreachView sessionId={sessionId} />
        )}

        {view === "history" && (
          <HistoryView
            sessionId={sessionId}
            onRelaunch={(q) => { handleSearch(q); }}
          />
        )}
      </main>

      {/* Outreach modal */}
      {outreachTarget && (
        <OutreachModal
          profile={outreachTarget}
          sessionId={sessionId}
          onClose={handleOutreachClose}
        />
      )}
    </div>
  );
}
