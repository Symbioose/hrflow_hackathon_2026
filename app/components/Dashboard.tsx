"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SourcedProfile, ChatMessage } from "@/app/lib/types";
import type { AgentSource, AgentState } from "./PixelAgent";
import SearchView from "./SearchView";
import LoadingView from "./LoadingView";
import ResultsView from "./ResultsView";
import ProfileDetailView from "./ProfileDetailView";
import { streamDemoProfiles } from "@/app/lib/demoProfiles";

// ─── Types ────────────────────────────────────────────────────

type DashboardState = "search" | "loading" | "results" | "profile";

function chatMsg(type: "user" | "agent", text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    type,
    text,
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── Dashboard ────────────────────────────────────────────────

export default function Dashboard() {
  const [view, setView] = useState<DashboardState>("search");
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<SourcedProfile[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentSource, AgentState>>({
    github: "idle",
    linkedin: "idle",
    reddit: "idle",
    internet: "idle",
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SourcedProfile | null>(null);
  const [qaMessages, setQaMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);

  const esRef = useRef<EventSource | null>(null);
  const demoCleanupRef = useRef<(() => void) | null>(null);

  // ─── SSE connection ────────────────────────────────────────

  const connectSSE = useCallback((cursor = 0) => {
    if (esRef.current) esRef.current.close();
    const es = new EventSource(`/api/openclaw/stream?cursor=${cursor}`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);

        // Profile received
        if (event.channel === "profile" && event.payload?.profile) {
          const p = event.payload.profile as SourcedProfile;
          setProfiles((prev) => {
            if (prev.some((x) => x.key === p.key)) return prev;
            return [...prev, p];
          });
          setView((v) => (v === "loading" ? "results" : v));
        }

        // Agent status update
        if (event.channel === "feed" && event.payload?.source) {
          const source = event.payload.source as AgentSource;
          const status = event.payload.status as "running" | "done" | "error";
          setAgentStatuses((prev) => ({ ...prev, [source]: status }));
        }
      } catch {}
    };

    es.onerror = () => {
      es.close();
    };
  }, []);

  useEffect(() => {
    return () => {
      esRef.current?.close();
      demoCleanupRef.current?.();
    };
  }, []);

  // ─── Search handler ────────────────────────────────────────

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    setProfiles([]);
    setAgentStatuses({ github: "idle", linkedin: "idle", reddit: "idle", internet: "idle" });
    setView("loading");
    setIsStreaming(true);

    connectSSE(0);

    const res = await fetch("/api/openclaw/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    });

    if (!res.ok) {
      // OpenClaw not available — demo fallback
      setAgentStatuses({ github: "running", linkedin: "running", reddit: "running", internet: "running" });

      (["github", "linkedin", "reddit", "internet"] as AgentSource[]).forEach((src, i) => {
        setTimeout(() => {
          setAgentStatuses((prev) => ({ ...prev, [src]: "done" }));
        }, 2000 + i * 1500);
      });

      demoCleanupRef.current?.();
      demoCleanupRef.current = streamDemoProfiles((p) => {
        setProfiles((prev) => {
          if (prev.some((x) => x.key === p.key)) return prev;
          return [...prev, p];
        });
        setView("results");
      }, 1400);
    }

    setTimeout(() => setIsStreaming(false), 30_000);
  }, [connectSSE]);

  // ─── Profile Q&A ──────────────────────────────────────────

  const handleSelectProfile = useCallback((profile: SourcedProfile) => {
    setSelectedProfile(profile);
    setQaMessages([]);
    setView("profile");

    if (profile.hrflow_key) {
      setAsking(true);
      fetch(`/api/hrflow/ask?profile_key=${profile.hrflow_key}&question=${encodeURIComponent("Donne-moi une synthèse de ce profil en 3 points clés pour un recruteur.")}`)
        .then((r) => r.json())
        .then((data) => {
          const answer = data?.data?.response ?? "Profil analysé avec succès.";
          setQaMessages([chatMsg("agent", answer)]);
        })
        .catch(() => {
          setQaMessages([chatMsg("agent", `${profile.name} — ${profile.title} à ${profile.location}. ${profile.summary}`)]);
        })
        .finally(() => setAsking(false));
    } else {
      setQaMessages([chatMsg("agent", profile.summary)]);
    }
  }, []);

  const handleAsk = useCallback(async (question: string) => {
    if (!selectedProfile || asking) return;
    setQaMessages((prev) => [...prev, chatMsg("user", question)]);
    setAsking(true);

    try {
      const profileKey = selectedProfile.hrflow_key ?? selectedProfile.key;
      const res = await fetch(`/api/hrflow/ask?profile_key=${encodeURIComponent(profileKey)}&question=${encodeURIComponent(question)}`);
      const data = await res.json();
      const answer = data?.data?.response ?? "Je n'ai pas pu obtenir de réponse.";
      setQaMessages((prev) => [...prev, chatMsg("agent", answer)]);
    } catch {
      setQaMessages((prev) => [...prev, chatMsg("agent", "Erreur lors de la question. Veuillez réessayer.")]);
    } finally {
      setAsking(false);
    }
  }, [selectedProfile, asking]);

  const handleBack = useCallback(() => {
    setView("results");
    setSelectedProfile(null);
    setQaMessages([]);
  }, []);

  const handleNewSearch = useCallback(() => {
    esRef.current?.close();
    demoCleanupRef.current?.();
    setView("search");
    setProfiles([]);
    setQuery("");
    setIsStreaming(false);
    setSelectedProfile(null);
    setQaMessages([]);
  }, []);

  // ─── Render ────────────────────────────────────────────────

  if (view === "search") {
    return <SearchView onSearch={handleSearch} />;
  }

  if (view === "loading") {
    return <LoadingView query={query} profileCount={profiles.length} agentStatuses={agentStatuses} />;
  }

  if (view === "results") {
    return (
      <ResultsView
        profiles={profiles}
        query={query}
        isStreaming={isStreaming}
        onSelect={handleSelectProfile}
        onNewSearch={handleNewSearch}
      />
    );
  }

  if (view === "profile" && selectedProfile) {
    return (
      <ProfileDetailView
        profile={selectedProfile}
        messages={qaMessages}
        asking={asking}
        onBack={handleBack}
        onSend={handleAsk}
      />
    );
  }

  return null;
}
