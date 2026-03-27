"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HrFlowProfile, FeedEvent, ChatMessage } from "@/app/lib/types";
import TopBar from "./TopBar";
import WhatsAppPanel from "./WhatsAppPanel";
import AgentFeed from "./AgentFeed";
import CandidatePanel from "./CandidatePanel";

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

// Orchestrated pipeline steps with delays (ms from start)
const PIPELINE_SCRIPT: { delay: number; run: (ctx: PipelineContext) => void }[] = [
  // WhatsApp: recruiter sends request
  {
    delay: 500,
    run: (ctx) => {
      ctx.addMessage(chatMsg("user", "Analyse mes candidats Indeed pour Dev Python Senior a Paris"));
    },
  },
  // Agent acknowledges
  {
    delay: 2000,
    run: (ctx) => {
      ctx.addMessage(chatMsg("agent", "Bien recu ! Je me connecte a votre compte Indeed pour analyser les candidatures pour le poste Dev Python Senior."));
      ctx.addFeed(feedEvent("Connexion Indeed", "Authentification via OpenClaw...", "connect", "running"));
    },
  },
  // Connected to Indeed
  {
    delay: 4000,
    run: (ctx) => {
      ctx.updateLastFeed("done", "Authentification reussie — compte employeur detecte");
      ctx.addFeed(feedEvent("Scan candidatures", "Analyse de la boite de reception Indeed...", "connect", "running"));
    },
  },
  // CVs detected
  {
    delay: 6000,
    run: (ctx) => {
      ctx.updateLastFeed("done", "47 nouvelles candidatures detectees");
      ctx.addMessage(chatMsg("agent", "47 CVs detectes sur votre compte Indeed. Lancement du parsing..."));
      ctx.addFeed(feedEvent("Parsing CV #1-10", "POST /profile/parsing/file — batch 1/5", "parse", "running"));
      ctx.setCvCount(10);
    },
  },
  // Batch 2
  {
    delay: 8000,
    run: (ctx) => {
      ctx.updateLastFeed("done");
      ctx.addFeed(feedEvent("Parsing CV #11-20", "POST /profile/parsing/file — batch 2/5", "parse", "running"));
      ctx.setCvCount(20);
    },
  },
  // Batch 3
  {
    delay: 9500,
    run: (ctx) => {
      ctx.updateLastFeed("done");
      ctx.addFeed(feedEvent("Parsing CV #21-30", "POST /profile/parsing/file — batch 3/5", "parse", "running"));
      ctx.setCvCount(30);
    },
  },
  // Batch 4
  {
    delay: 11000,
    run: (ctx) => {
      ctx.updateLastFeed("done");
      ctx.addFeed(feedEvent("Parsing CV #31-40", "POST /profile/parsing/file — batch 4/5", "parse", "running"));
      ctx.setCvCount(40);
    },
  },
  // Batch 5
  {
    delay: 12500,
    run: (ctx) => {
      ctx.updateLastFeed("done");
      ctx.addFeed(feedEvent("Parsing CV #41-47", "POST /profile/parsing/file — batch 5/5", "parse", "running"));
      ctx.setCvCount(47);
    },
  },
  // Indexation
  {
    delay: 14000,
    run: (ctx) => {
      ctx.updateLastFeed("done");
      ctx.addFeed(feedEvent("Indexation profils", "47 profils indexes dans HrFlow Source", "parse"));
      ctx.addFeed(feedEvent("Scoring IA", "GET /profiles/scoring — Dev Python Senior Paris", "score", "running"));
      ctx.addMessage(chatMsg("agent", "47 CVs parses et indexes. Scoring IA en cours..."));
    },
  },
  // Scoring done — fetch real profiles & reveal one by one
  {
    delay: 17000,
    run: (ctx) => {
      ctx.updateLastFeed("done", "Scoring termine — top 5 identifies");
      ctx.addFeed(feedEvent("Analyse top 5", "GET /profile/upskilling — generation des explications", "analyze", "running"));
      ctx.fetchAndRevealProfiles();
    },
  },
  // Analysis done
  {
    delay: 20000,
    run: (ctx) => {
      ctx.updateLastFeed("done", "Explications generees en francais");
    },
  },
  // WhatsApp summary
  {
    delay: 22000,
    run: (ctx) => {
      ctx.addFeed(feedEvent("Resume WhatsApp", "Envoi du top 3 au recruteur", "notify"));
      ctx.sendTopSummary();
    },
  },
  // Passive sourcing tease
  {
    delay: 26000,
    run: (ctx) => {
      ctx.addMessage(chatMsg("agent", "Vivier de 47 candidats analyse. Voulez-vous que je lance un sourcing passif sur GitHub et LinkedIn pour elargir la recherche ?"));
      ctx.addFeed(feedEvent("Suggestion", "Sourcing passif disponible — en attente de validation", "source"));
      ctx.setPipelineDone(true);
    },
  },
];

interface PipelineContext {
  addFeed: (event: FeedEvent) => void;
  updateLastFeed: (status: FeedEvent["status"], detail?: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setCvCount: (n: number) => void;
  fetchAndRevealProfiles: () => void;
  sendTopSummary: () => void;
  setPipelineDone: (done: boolean) => void;
}

export default function Dashboard() {
  const [profiles, setProfiles] = useState<HrFlowProfile[]>([]);
  const [visibleProfiles, setVisibleProfiles] = useState<HrFlowProfile[]>([]);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [cvCount, setCvCount] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<HrFlowProfile | null>(null);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);
  const [pipelineDone, setPipelineDone] = useState(false);
  const pipelineStarted = useRef(false);

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

  // Fetch profiles from HrFlow, then reveal one by one
  const fetchAndRevealProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/hrflow/profiles?limit=20");
      const data = await res.json();
      if (data.code === 200) {
        const fetched: HrFlowProfile[] = data.data.profiles;
        setProfiles(fetched);
        setTotalProfiles(data.meta.total);

        // Reveal profiles one by one with stagger
        fetched.slice(0, 10).forEach((profile, i) => {
          setTimeout(() => {
            setVisibleProfiles((prev) => [...prev, profile]);
          }, i * 600);
        });
      }
    } catch {
      addFeed(feedEvent("Erreur", "Impossible de charger les profils", "connect", "error"));
    }
  }, [addFeed]);

  // Send WhatsApp summary of top 3
  const sendTopSummary = useCallback(() => {
    const top = profiles.slice(0, 3);
    if (top.length === 0) return;

    const lines = top.map((p, i) => {
      const exp = p.experiences?.[0];
      const skills = (p.skills ?? []).slice(0, 3).map((s) => s.name).join(", ");
      return `${i + 1}. ${p.info.full_name}\n   ${exp?.title ?? "N/A"} — ${p.info.location?.text ?? "?"}\n   Competences : ${skills || "N/A"}`;
    });

    addMessage(chatMsg("agent",
      `Analyse terminee ! Voici le top 3 :\n\n${lines.join("\n\n")}\n\nCliquez sur un profil dans le dashboard pour plus de details, ou posez-moi une question.`,
    ));
  }, [profiles, addMessage]);

  // Run the pipeline sequence on mount
  useEffect(() => {
    if (pipelineStarted.current) return;
    pipelineStarted.current = true;

    const ctx: PipelineContext = {
      addFeed,
      updateLastFeed,
      addMessage,
      setCvCount,
      fetchAndRevealProfiles,
      sendTopSummary,
      setPipelineDone,
    };

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (const step of PIPELINE_SCRIPT) {
      timeouts.push(setTimeout(() => step.run(ctx), step.delay));
    }

    return () => timeouts.forEach(clearTimeout);
  }, [addFeed, updateLastFeed, addMessage, fetchAndRevealProfiles, sendTopSummary]);

  // Ask a question about the selected profile (real HrFlow API)
  const handleAskQuestion = useCallback(async (question: string) => {
    if (!selectedProfile || asking) return;

    const profileName = selectedProfile.info.full_name;
    const profileKey = selectedProfile.key;

    addMessage(chatMsg("user", question));

    addFeed(feedEvent(
      "Q&A profil",
      `GET /profile/asking — "${question.slice(0, 50)}..."`,
      "analyze",
      "running",
    ));

    setAsking(true);
    try {
      const params = new URLSearchParams({ profile_key: profileKey, question });
      const res = await fetch(`/api/hrflow/ask?${params}`);
      const data = await res.json();

      const answer = data.code === 200
        ? `A propos de ${profileName} :\n\n${Array.isArray(data.data) ? data.data.join("\n") : data.data}`
        : `Erreur HrFlow: ${data.message}`;

      addMessage(chatMsg("agent", answer));
      updateLastFeed("done", `Reponse recue pour ${profileName}`);
    } catch {
      addMessage(chatMsg("agent", "Erreur : impossible de contacter HrFlow. Reessayez."));
      updateLastFeed("error", "Echec de la requete");
    } finally {
      setAsking(false);
    }
  }, [selectedProfile, asking, addFeed, updateLastFeed, addMessage]);

  // Select a profile from the candidate panel
  const handleSelectProfile = useCallback((profile: HrFlowProfile) => {
    setSelectedProfile(profile);
    addMessage(chatMsg("agent",
      `Profil selectionne : ${profile.info.full_name}\n${profile.experiences?.[0]?.title ?? "Pas de titre"} — ${profile.info.location?.text ?? "?"}\n\nPosez une question sur ce candidat.`,
    ));
  }, [addMessage]);

  // "Poser une question" from card → select + focus chat
  const handleAskFromCard = useCallback((profile: HrFlowProfile) => {
    setSelectedProfile(profile);
    addMessage(chatMsg("agent",
      `Profil selectionne : ${profile.info.full_name}\nPosez votre question dans le chat.`,
    ));
  }, [addMessage]);

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-deep)]">
      <TopBar totalProfiles={totalProfiles} cvCount={cvCount} pipelineDone={pipelineDone} />

      <div className="flex flex-1 min-h-0">
        {/* LEFT — WhatsApp */}
        <div className="w-[320px] shrink-0 border-r border-white/[0.06] flex flex-col">
          <WhatsAppPanel
            messages={messages}
            onSend={handleAskQuestion}
            asking={asking}
            selectedProfileName={selectedProfile?.info.full_name ?? null}
          />
        </div>

        {/* CENTER — Agent Feed */}
        <div className="flex-1 border-r border-white/[0.06] flex flex-col min-w-0">
          <AgentFeed events={feed} totalProfiles={totalProfiles} cvCount={cvCount} />
        </div>

        {/* RIGHT — Candidates */}
        <div className="w-[400px] shrink-0 flex flex-col">
          <CandidatePanel
            profiles={visibleProfiles}
            loading={!pipelineDone && visibleProfiles.length === 0}
            selectedKey={selectedProfile?.key ?? null}
            onSelect={handleSelectProfile}
            onAsk={handleAskFromCard}
          />
        </div>
      </div>
    </div>
  );
}
