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

/* ─── Pipeline demo script ────────────────────────────────── */

const DEMO_JOB = "Developpeur Full-Stack Python / React — CDI Paris";

const PIPELINE_SCRIPT: { delay: number; run: (ctx: PipelineContext) => void }[] = [
  // Recruiter sends request via Telegram
  {
    delay: 500,
    run: (ctx) => {
      ctx.addMessage(chatMsg("user", `Trouve-moi les meilleurs profils pour : ${DEMO_JOB}`));
    },
  },
  // Agent acknowledges via OpenClaw
  {
    delay: 2000,
    run: (ctx) => {
      ctx.addMessage(chatMsg("agent",
        `Compris ! Je lance l'analyse pour "${DEMO_JOB}".\n\nConnexion a Indeed via OpenClaw...`,
      ));
      ctx.addFeed(feedEvent("Connexion Indeed", "Authentification via OpenClaw — compte employeur", "connect", "running"));
    },
  },
  // Indeed connected
  {
    delay: 4000,
    run: (ctx) => {
      ctx.updateLastFeed("done", "Authentification reussie — acces candidatures");
      ctx.addFeed(feedEvent("Scan boite de reception", "Recherche des candidatures recentes...", "connect", "running"));
    },
  },
  // CVs detected
  {
    delay: 6000,
    run: (ctx) => {
      ctx.updateLastFeed("done", "47 candidatures detectees — dernieres 72h");
      ctx.addMessage(chatMsg("agent", "47 candidatures trouvees sur Indeed. Je lance le parsing HrFlow..."));
      ctx.addFeed(feedEvent("Parsing CV", "POST /profile/parsing/file — lot 1/5 (10 CVs)", "parse", "running"));
      ctx.setCvCount(10);
    },
  },
  // Batch 2
  {
    delay: 8000,
    run: (ctx) => {
      ctx.updateLastFeed("done");
      ctx.addFeed(feedEvent("Parsing CV", "POST /profile/parsing/file — lot 2/5 (10 CVs)", "parse", "running"));
      ctx.setCvCount(20);
    },
  },
  // Batch 3
  {
    delay: 9500,
    run: (ctx) => {
      ctx.updateLastFeed("done");
      ctx.addFeed(feedEvent("Parsing CV", "POST /profile/parsing/file — lot 3/5 (10 CVs)", "parse", "running"));
      ctx.setCvCount(30);
    },
  },
  // Batch 4
  {
    delay: 11000,
    run: (ctx) => {
      ctx.updateLastFeed("done");
      ctx.addFeed(feedEvent("Parsing CV", "POST /profile/parsing/file — lot 4/5 (10 CVs)", "parse", "running"));
      ctx.setCvCount(40);
    },
  },
  // Batch 5
  {
    delay: 12500,
    run: (ctx) => {
      ctx.updateLastFeed("done");
      ctx.addFeed(feedEvent("Parsing CV", "POST /profile/parsing/file — lot 5/5 (7 CVs)", "parse", "running"));
      ctx.setCvCount(47);
    },
  },
  // Indexation + scoring
  {
    delay: 14000,
    run: (ctx) => {
      ctx.updateLastFeed("done");
      ctx.addFeed(feedEvent("Indexation HrFlow", "47 profils indexes dans la source", "parse"));
      ctx.addFeed(feedEvent("Scoring IA", `GET /profiles/scoring — "${DEMO_JOB}"`, "score", "running"));
      ctx.addMessage(chatMsg("agent", "47 CVs parses. Scoring IA en cours — je classe les profils par pertinence..."));
    },
  },
  // Scoring done — fetch real profiles with scores
  {
    delay: 17000,
    run: (ctx) => {
      ctx.updateLastFeed("done", "Scoring termine — classement par pertinence");
      ctx.addFeed(feedEvent("Chargement profils", "GET /profiles/searching — top 20", "analyze", "running"));
      ctx.fetchAndRevealProfiles();
    },
  },
  // Analysis done
  {
    delay: 20000,
    run: (ctx) => {
      ctx.updateLastFeed("done", "Profils charges avec scores");
    },
  },
  // Summary
  {
    delay: 22000,
    run: (ctx) => {
      ctx.addFeed(feedEvent("Synthese Telegram", "Envoi du classement au recruteur", "notify"));
      ctx.sendTopSummary();
    },
  },
  // Pipeline done
  {
    delay: 26000,
    run: (ctx) => {
      ctx.addMessage(chatMsg("agent",
        "Analyse terminee ! Cliquez sur un profil pour voir le detail.\n\nJe peux aussi lancer un sourcing passif GitHub / LinkedIn si vous voulez elargir la recherche.",
      ));
      ctx.addFeed(feedEvent("Sourcing passif", "Disponible — en attente de validation recruteur", "source"));
      ctx.setPipelineDone(true);
    },
  },
];

/* ─── Pipeline context interface ──────────────────────────── */

interface PipelineContext {
  addFeed: (event: FeedEvent) => void;
  updateLastFeed: (status: FeedEvent["status"], detail?: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setCvCount: (n: number) => void;
  fetchAndRevealProfiles: () => void;
  sendTopSummary: () => void;
  setPipelineDone: (done: boolean) => void;
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
  const [jobKey, setJobKey] = useState<string | null>(null);
  const pipelineStarted = useRef(false);

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

  /* ─── Fetch profiles (with scoring when available) ────── */

  const fetchAndRevealProfiles = useCallback(async () => {
    try {
      // Try scoring first (needs a job from the board)
      const scoreMap = new Map<string, number>();
      let fetched: HrFlowProfile[] = [];
      let scored = false;

      try {
        const jobsRes = await fetch("/api/hrflow/jobs?limit=1");
        const jobsData = await jobsRes.json();
        const firstJob = jobsData?.data?.jobs?.[0];

        if (firstJob?.key) {
          setJobKey(firstJob.key);
          const scoreRes = await fetch(`/api/hrflow/score?job_key=${firstJob.key}&limit=20`);
          const scoreData = await scoreRes.json();

          if (scoreData.code === 200 && scoreData.data?.profiles?.length > 0) {
            fetched = scoreData.data.profiles;
            const predictions: [number, number][] = scoreData.data.predictions ?? [];
            fetched.forEach((p, i) => {
              const pred = predictions[i];
              if (pred) {
                scoreMap.set(p.key, Math.round(pred[1] * 100));
              }
            });
            scored = true;
          }
        }
      } catch {
        // Scoring unavailable — fall back to search
      }

      // Fallback: plain profile search
      if (!scored) {
        const res = await fetch("/api/hrflow/profiles?limit=20");
        const data = await res.json();
        if (data.code === 200) {
          fetched = data.data.profiles;
        }
      }

      if (fetched.length === 0) return;

      setProfiles(fetched);
      setScores(scoreMap);
      setTotalProfiles(fetched.length);

      // Reveal profiles progressively
      const toReveal = fetched.slice(0, 10);
      toReveal.forEach((profile, i) => {
        setTimeout(() => {
          setVisibleProfiles((prev) => [...prev, profile]);
        }, i * 600);
      });
    } catch {
      addFeed(feedEvent("Erreur", "Impossible de charger les profils", "connect", "error"));
    }
  }, [addFeed]);

  /* ─── WhatsApp/Telegram summary ───────────────────────── */

  const sendTopSummary = useCallback(() => {
    const top = profiles.slice(0, 3);
    if (top.length === 0) return;

    const lines = top.map((p, i) => {
      const exp = p.experiences?.[0];
      const skills = (p.skills ?? []).slice(0, 4).map((s) => s.name).join(", ");
      const score = scores.get(p.key);
      const scoreTxt = score != null ? ` (${score}% match)` : "";
      return `${i + 1}. ${p.info.full_name}${scoreTxt}\n   ${exp?.title ?? "N/A"} — ${p.info.location?.text ?? "?"}\n   ${skills || "N/A"}`;
    });

    addMessage(chatMsg("agent",
      `Voici le top 3 pour "${DEMO_JOB}" :\n\n${lines.join("\n\n")}\n\nCliquez sur un profil au centre pour voir le detail complet.`,
    ));
  }, [profiles, scores, addMessage]);

  /* ─── Pipeline orchestration ──────────────────────────── */

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

  /* ─── Q&A on selected profile ─────────────────────────── */

  const handleAskQuestion = useCallback(async (question: string) => {
    if (!selectedProfile || asking) return;

    const profileName = selectedProfile.info.full_name;
    const profileKey = selectedProfile.key;

    addMessage(chatMsg("user", question));
    addFeed(feedEvent("Q&A profil", `GET /profile/asking — "${question.slice(0, 50)}..."`, "analyze", "running"));

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

  /* ─── Profile selection ───────────────────────────────── */

  const handleSelectProfile = useCallback((profile: HrFlowProfile) => {
    setSelectedProfile(profile);
    const score = scores.get(profile.key);
    const scoreTxt = score != null ? `\nScore de matching : ${score}%` : "";
    addMessage(chatMsg("agent",
      `Profil selectionne : ${profile.info.full_name}\n${profile.experiences?.[0]?.title ?? "Pas de titre"} — ${profile.info.location?.text ?? "?"}${scoreTxt}\n\nPosez une question sur ce candidat.`,
    ));
  }, [scores, addMessage]);

  const handleAskFromCard = useCallback((profile: HrFlowProfile) => {
    setSelectedProfile(profile);
    addMessage(chatMsg("agent", `Profil selectionne : ${profile.info.full_name}\nPosez votre question dans le chat.`));
  }, [addMessage]);

  /* ─── Render ──────────────────────────────────────────── */

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-deep)]">
      <TopBar totalProfiles={totalProfiles} cvCount={cvCount} pipelineDone={pipelineDone} />

      <div className="flex flex-1 min-h-0">
        {/* LEFT — Chat Telegram / OpenClaw */}
        <div className="w-[320px] shrink-0 border-r border-white/[0.06] flex flex-col">
          <WhatsAppPanel
            messages={messages}
            onSend={handleAskQuestion}
            asking={asking}
            selectedProfileName={selectedProfile?.info.full_name ?? null}
          />
        </div>

        {/* CENTER — Candidates (detailed) */}
        <div className="flex-1 border-r border-white/[0.06] flex flex-col min-w-0">
          <CandidatePanel
            profiles={visibleProfiles}
            loading={!pipelineDone && visibleProfiles.length === 0}
            selectedKey={selectedProfile?.key ?? null}
            onSelect={handleSelectProfile}
            onAsk={handleAskFromCard}
            scores={scores}
            jobKey={jobKey}
          />
        </div>

        {/* RIGHT — Agent Pipeline Feed */}
        <div className="w-[340px] shrink-0 flex flex-col">
          <AgentFeed events={feed} totalProfiles={totalProfiles} cvCount={cvCount} />
        </div>
      </div>
    </div>
  );
}
