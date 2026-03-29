"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HrFlowProfile, FeedEvent, ChatMessage } from "@/app/lib/types";
import TopBar from "./TopBar";
import WhatsAppPanel from "./WhatsAppPanel";
import AgentFeed from "./AgentFeed";
import CandidatePanel from "./CandidatePanel";

/* ─── Helpers ─────────────────────────────────────────────── */

function feedEvent(
  action: string,
  detail: string,
  type: FeedEvent["type"],
  status: FeedEvent["status"] = "done",
): FeedEvent {
  return {
    id: crypto.randomUUID(),
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    action,
    detail,
    status,
    type,
  };
}

function chatMsg(type: "user" | "agent", text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    type,
    text,
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

/* ─── Keyword extraction from natural language query ──────── */

const STOP_WORDS = new Set([
  "je", "tu", "il", "nous", "vous", "ils", "me", "te", "se", "le", "la", "les", "un", "une", "des",
  "de", "du", "au", "aux", "a", "en", "et", "ou", "mais", "donc", "car", "ni", "que", "qui", "quoi",
  "ce", "cette", "ces", "mon", "ton", "son", "notre", "votre", "leur", "pour", "par", "sur", "dans",
  "avec", "sans", "sous", "entre", "vers", "chez", "pas", "ne", "plus", "moins", "tres", "trop",
  "est", "sont", "suis", "es", "etre", "avoir", "fait", "faire", "dit", "dire",
  "trouve", "trouve-moi", "trouvez", "cherche", "cherche-moi", "cherchez", "recherche",
  "source", "source-moi", "sourcez", "donne", "donne-moi", "donnez", "montre", "montre-moi",
  "moi", "veux", "voudrais", "besoin", "faut", "peux", "peut", "fais",
  "profils", "profil", "candidats", "candidat", "talents", "talent", "personnes", "gens",
  "meilleurs", "meilleur", "bons", "bon", "top",
]);

function extractKeywords(query: string): string {
  const words = query
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9+#\s-]/g, " ") // keep alphanumeric, +, #, -
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  return words.slice(0, 3).join(",");
}

/* ─── Dashboard component ─────────────────────────────────── */

export default function Dashboard() {
  const [profiles, setProfiles] = useState<HrFlowProfile[]>([]);
  const [visibleProfiles, setVisibleProfiles] = useState<HrFlowProfile[]>([]);
  const [scores, setScores] = useState<Map<string, number>>(new Map());
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [cvCount, setCvCount] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<HrFlowProfile | null>(null);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);
  const [pipelineDone, setPipelineDone] = useState(false);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [jobKey, setJobKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  
  const pipelineStarted = useRef(false);
  const searchQueryRef = useRef("");
  const cursorRef = useRef(0);

  /* ─── State updaters ──────────────────────────────────── */

  const addFeed = useCallback((event: FeedEvent) => {
    setFeed((prev) => [...prev, event]);
  }, []);

  const updateLastFeed = useCallback((status: FeedEvent["status"], detail?: string) => {
    setFeed((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const last = { ...updated[updated.length - 1], status };
      if (detail) last.detail = detail;
      updated[updated.length - 1] = last;
      return updated;
    });
  }, []);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleReset = useCallback(() => {
    setProfiles([]);
    setVisibleProfiles([]);
    setScores(new Map());
    setTotalProfiles(0);
    setCvCount(0);
    setSelectedProfile(null);
    setPipelineDone(false);
    setJobKey(null);
    pipelineStarted.current = false;
    searchQueryRef.current = "";
    setSearchQuery("");
    setInputValue("");
    cursorRef.current = 0;
    setMessages([chatMsg("agent", "Système prêt. Entrez votre recherche ci-dessus pour commencer.")]);
    setFeed([feedEvent("Initialisation", "Prêt pour une nouvelle recherche", "connect")]);
  }, []);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  /* ─── Fetch profiles (HrFlow base) ────── */

  const fetchBaseProfiles = useCallback(async () => {
    setProfilesLoading(true);
    try {
      const keywords = extractKeywords(searchQueryRef.current);
      const scoreMap = new Map<string, number>();
      let fetched: HrFlowProfile[] = [];

      // 1. Find matched job
      let matchedJobKey: string | null = null;
      try {
        const jobsRes = await fetch(`/api/hrflow/jobs?limit=100`);
        const jobsData = await jobsRes.json();
        const jobs: { key: string; name?: string }[] = jobsData?.data?.jobs ?? [];
        if (keywords && jobs.length > 0) {
          const kwList = keywords.split(",");
          let bestScore = 0;
          for (const j of jobs) {
            const name = (j.name ?? "").toLowerCase();
            const score = kwList.filter((kw: string) => name.includes(kw)).length;
            if (score > bestScore) {
              bestScore = score;
              matchedJobKey = j.key;
            }
          }
        }
        if (!matchedJobKey && jobs.length > 0) matchedJobKey = jobs[0].key;
      } catch {}

      if (matchedJobKey) setJobKey(matchedJobKey);

      // 2. Search HrFlow base
      const res = await fetch(`/api/hrflow/profiles?limit=10&keywords=${encodeURIComponent(keywords)}`);
      const data = await res.json();
      if (data.code === 200 && data.data?.profiles?.length > 0) {
        fetched = data.data.profiles;
        fetched.forEach((p, i) => {
          scoreMap.set(p.key, 75 - i * 3);
        });
      }

      if (fetched.length === 0) return;

      setProfiles((prev) => [...prev, ...fetched]);
      setScores((prev) => new Map([...prev, ...scoreMap]));
      setTotalProfiles((prev) => prev + fetched.length);
      
      // Reveal base profiles
      fetched.forEach((profile, i) => {
        setTimeout(() => {
          setVisibleProfiles((prev) => {
            if (prev.some((p) => p.key === profile.key)) return prev;
            return [...prev, profile];
          });
        }, i * 400);
      });
    } catch {
      addFeed(feedEvent("Erreur", "Impossible de charger la base HrFlow", "connect", "error"));
    } finally {
      setProfilesLoading(false);
    }
  }, [addFeed]);

  const sendTopSummary = useCallback(() => {
    const top = visibleProfiles.slice(0, 3);
    if (top.length === 0) return;
    const lines = top.map((p, i) => {
      const exp = p.experiences?.[0];
      const score = scores.get(p.key);
      const scoreTxt = score != null ? ` (${score}% match)` : "";
      return `${i + 1}. ${p.info.full_name}${scoreTxt}\n   ${exp?.title ?? "N/A"}`;
    });
    addMessage(chatMsg("agent", `Top 3 identifiés :\n\n${lines.join("\n\n")}`));
  }, [visibleProfiles, scores, addMessage]);

  /* ─── OpenClaw Polling ────────────────────────────────── */

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/openclaw/events?cursor=${cursorRef.current}`);
        const data = await res.json();
        cursorRef.current = data.cursor;

        for (const evt of data.events) {
          if (evt.channel === "chat" && evt.payload.text) {
            const isUser = evt.payload.type === "user";
            if (!isUser || evt.payload.text !== searchQueryRef.current) {
               addMessage(chatMsg(isUser ? "user" : "agent", evt.payload.text));
            }
          } else if (evt.channel === "feed" && evt.payload.action) {
            const status = evt.payload.status ?? "done";
            if (status === "done") {
              setFeed((prev) => {
                const idx = prev.findLastIndex((e) => e.action === evt.payload.action && e.status === "running");
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], status: "done", detail: evt.payload.detail ?? updated[idx].detail };
                  return updated;
                }
                return [...prev, feedEvent(evt.payload.action!, evt.payload.detail ?? "", evt.payload.feedType as FeedEvent["type"] ?? "connect", "done")];
              });
            } else {
              addFeed(feedEvent(evt.payload.action, evt.payload.detail ?? "", evt.payload.feedType as FeedEvent["type"] ?? "connect", status as FeedEvent["status"]));
            }
          } else if (evt.channel === "action") {
             if (evt.payload.command === "fetch_profiles") fetchBaseProfiles();
             else if (evt.payload.command === "send_summary") sendTopSummary();
             else if (evt.payload.command === "set_cv_count") setCvCount(Number(evt.payload.text) || 0);
             else if (evt.payload.command === "pipeline_done") setPipelineDone(true);
          } else if (evt.channel === "profiles" && evt.payload.profiles) {
            const newProfiles: HrFlowProfile[] = evt.payload.profiles.map((p: any) => ({
              key: p.url || Math.random().toString(),
              info: { full_name: p.name, location: { text: p.location }, email: "" },
              skills: (p.skills || []).map((s: string) => ({ name: s })),
              experiences: [{ title: p.title }],
              source: p.source,
              url: p.url,
              avatar: p.avatar
            }));
            setVisibleProfiles((prev) => [...newProfiles, ...prev]);
            setScores((prev) => {
              const next = new Map(prev);
              evt.payload.profiles.forEach((p: any) => { if (p.url) next.set(p.url, p.score || 80); });
              return next;
            });
            setTotalProfiles((prev) => prev + newProfiles.length);
          }
        }
      } catch {}
    };
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, [addMessage, addFeed, fetchBaseProfiles, sendTopSummary]);

  /* ─── Submission ───────────────────────────────────────── */

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || pipelineStarted.current) return;
    
    pipelineStarted.current = true;
    searchQueryRef.current = inputValue;
    setSearchQuery(inputValue);
    addMessage(chatMsg("user", inputValue));
    addMessage(chatMsg("agent", `Reçu ! Je lance le sourcing JIT (Just-in-Time) pour "${inputValue}"...`));

    // 1. Trigger the JIT Pipeline API
    fetch("/api/sourcing/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: inputValue })
    });

    // 2. Fetch base profiles immediately
    fetchBaseProfiles();
  };

  /* ─── Profile interactions ────────────────────────────── */

  const handleAskQuestion = useCallback(async (question: string) => {
    if (!selectedProfile || asking) return;
    const profileName = selectedProfile.info.full_name;
    const profileKey = selectedProfile.key;
    addMessage(chatMsg("user", question));
    addFeed(feedEvent("Q&A profil", `HrFlow AI — "${question.slice(0, 50)}..."`, "analyze", "running"));
    setAsking(true);
    try {
      const params = new URLSearchParams({ profile_key: profileKey, question, mode: "live" });
      const res = await fetch(`/api/hrflow/ask?${params}`);
      const data = await res.json();
      const answer = data.code === 200 ? `À propos de ${profileName} :\n\n${Array.isArray(data.data) ? data.data.join("\n") : data.data}` : `Erreur: ${data.message}`;
      addMessage(chatMsg("agent", answer));
      updateLastFeed("done", `Réponse reçue`);
    } catch {
      addMessage(chatMsg("agent", "Erreur réseau."));
      updateLastFeed("error", "Échec");
    } finally { setAsking(false); }
  }, [selectedProfile, asking, addFeed, updateLastFeed, addMessage]);

  const handleSelectProfile = useCallback((profile: HrFlowProfile) => {
    setSelectedProfile(profile);
    addMessage(chatMsg("agent", `Profil sélectionné : ${profile.info.full_name}`));
  }, [addMessage]);

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-deep)]">
      <TopBar totalProfiles={totalProfiles} cvCount={cvCount} pipelineDone={pipelineDone} onReset={handleReset} />

      <div className="flex flex-1 min-h-0">
        <div className="w-[320px] shrink-0 border-r border-white/[0.06] flex flex-col">
          <WhatsAppPanel messages={messages} onSend={handleAskQuestion} asking={asking} selectedProfileName={selectedProfile?.info.full_name ?? null} />
        </div>

        <div className="flex-1 border-r border-white/[0.06] flex flex-col min-w-0">
          <div className="p-6 bg-[var(--bg-base)] border-b border-white/[0.06]">
             <form onSubmit={handleSearchSubmit} className="relative group">
                <input 
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ex: Senior Python Developer in Paris..."
                  disabled={pipelineStarted.current}
                  className="w-full h-12 pl-12 pr-4 bg-[var(--bg-card)] border border-white/[0.1] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]/50 transition-all placeholder:text-[var(--text-muted)] disabled:opacity-50"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent-cyan)] transition-colors">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <button type="submit" disabled={pipelineStarted.current} className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-xs font-medium rounded-lg hover:bg-[var(--accent-cyan)]/20 transition-all">Search</button>
             </form>
          </div>

          <CandidatePanel profiles={visibleProfiles} loading={profilesLoading || (pipelineStarted.current && !pipelineDone && visibleProfiles.length === 0)} selectedKey={selectedProfile?.key ?? null} onSelect={handleSelectProfile} onAsk={handleSelectProfile} scores={scores} jobKey={jobKey} mode="live" />
        </div>

        <div className="w-[340px] shrink-0 flex flex-col">
          <AgentFeed events={feed} totalProfiles={totalProfiles} cvCount={cvCount} />
        </div>
      </div>
    </div>
  );
}
