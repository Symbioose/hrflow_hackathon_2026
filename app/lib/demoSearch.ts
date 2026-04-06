import type { AgentSource, AgentState } from "@/app/components/PixelAgent";
import { DEMO_PROFILES } from "./demoProfiles";

export interface DemoLog {
  id: string;
  source: AgentSource;
  message: string;
  type: "info" | "found" | "score" | "done";
}

interface DemoSearchCallbacks {
  onLog: (log: DemoLog) => void;
  onAgentStatus: (source: AgentSource, status: AgentState) => void;
  onProfile: (profile: (typeof DEMO_PROFILES)[number]) => void;
  onDone: () => void;
}

type DemoEvent =
  | { t: number; type: "log"; source: AgentSource; message: string; logType: DemoLog["type"] }
  | { t: number; type: "agent"; source: AgentSource; status: AgentState }
  | { t: number; type: "profile"; index: number };

// ─── Timeline des events ────────────────────────────────────────────────────
// Chaque event a un timestamp en ms depuis le démarrage.
// Les logs sont volontairement précis et techniques pour impressionner le jury.

const EVENTS: DemoEvent[] = [
  // ── T=0 : démarrage simultané des 4 agents ──
  { t: 0,    type: "agent",  source: "github",   status: "running" },
  { t: 50,   type: "agent",  source: "linkedin",  status: "running" },
  { t: 100,  type: "agent",  source: "reddit",    status: "running" },
  { t: 150,  type: "agent",  source: "internet",  status: "running" },

  // ── GitHub ──────────────────────────────────────────────────────────────
  { t: 300,  type: "log", source: "github",  message: "Connexion API GitHub v3 — token authentifié", logType: "info" },
  { t: 900,  type: "log", source: "github",  message: "Requête : location:Paris language:Python followers:>50", logType: "info" },
  { t: 1600, type: "log", source: "github",  message: "2 847 profils candidats détectés", logType: "info" },
  { t: 2200, type: "log", source: "github",  message: "Filtrage activité récente (commits < 90j) — 341 retenus", logType: "info" },
  { t: 2900, type: "log", source: "github",  message: "Analyse sémantique des READMEs et descriptions de repos...", logType: "info" },
  { t: 3600, type: "log", source: "github",  message: "Profil prioritaire : ogrisel — 4 912 followers, 127 repos publics", logType: "found" },
  { t: 4100, type: "log", source: "github",  message: "Extraction : scikit-learn core contributor, PyTorch, CUDA, NLP", logType: "info" },
  { t: 4600, type: "log", source: "github",  message: "Score pertinence calculé par HrFlow : 79/100 ✓", logType: "score" },
  { t: 5100, type: "log", source: "github",  message: "Profil Olivier Grisel → pipeline de qualification", logType: "done" },

  // ── LinkedIn ─────────────────────────────────────────────────────────────
  { t: 500,  type: "log", source: "linkedin", message: "Initialisation Agent-Reach — réseau LinkedIn FR", logType: "info" },
  { t: 1200, type: "log", source: "linkedin", message: "Requête sémantique : 'Lead Data Scientist Machine Learning Paris'", logType: "info" },
  { t: 2000, type: "log", source: "linkedin", message: "1 240 profils détectés — application filtres HrFlow (exp ≥ 5 ans)...", logType: "info" },
  { t: 2700, type: "log", source: "linkedin", message: "Scoring sémantique des 50 profils prioritaires...", logType: "info" },
  { t: 3400, type: "log", source: "linkedin", message: "TOP MATCH : Lina Faik — École des Ponts, ex-Dataiku, missions L'Oréal", logType: "found" },
  { t: 3900, type: "log", source: "linkedin", message: "Extraction compétences : Python, LLMs, Graph Neural Networks, MLflow", logType: "info" },
  { t: 4500, type: "log", source: "linkedin", message: "Analyse expériences en production — 6 ans confirmés", logType: "info" },
  { t: 5000, type: "log", source: "linkedin", message: "Score HrFlow semantic engine : 94/100 ✓✓", logType: "score" },
  { t: 5500, type: "log", source: "linkedin", message: "Profil Lina Faik → pipeline de qualification", logType: "done" },
  { t: 6200, type: "log", source: "linkedin", message: "Profil #2 : Thomas Leroy — Senior ML Engineer @ Doctolib (88/100)", logType: "found" },
  { t: 6800, type: "log", source: "linkedin", message: "Profil #3 : Marie Duplessis — Lead DS @ BlaBlaCar (83/100)", logType: "found" },
  { t: 7300, type: "log", source: "linkedin", message: "3 profils LinkedIn qualifiés — sourcing terminé", logType: "done" },

  // ── Reddit ───────────────────────────────────────────────────────────────
  { t: 700,  type: "log", source: "reddit",   message: "Scan : r/MachineLearning, r/datascience, r/learnmachinelearning", logType: "info" },
  { t: 1800, type: "log", source: "reddit",   message: "Filtrage contributeurs actifs basés en Île-de-France...", logType: "info" },
  { t: 3100, type: "log", source: "reddit",   message: "847 posts techniques analysés — extraction des experts", logType: "info" },
  { t: 4300, type: "log", source: "reddit",   message: "5 profils identifiés via karma technique élevé (>2k)", logType: "found" },
  { t: 5800, type: "log", source: "reddit",   message: "Cross-référencement GitHub/LinkedIn — 2 matches confirmés", logType: "info" },
  { t: 6500, type: "log", source: "reddit",   message: "Scan Reddit terminé — données enrichies", logType: "done" },

  // ── Internet / Web ───────────────────────────────────────────────────────
  { t: 800,  type: "log", source: "internet", message: "Indexation blogs techniques, portfolios, conférences...", logType: "info" },
  { t: 1900, type: "log", source: "internet", message: "PyData Paris 2024/2025 — extraction liste speakers...", logType: "info" },
  { t: 3200, type: "log", source: "internet", message: "ICLR, NeurIPS, ICML — vérification affiliations Paris...", logType: "info" },
  { t: 4800, type: "log", source: "internet", message: "Portfolio détecté : emmabernard.dev — semantic search, NLP e-commerce", logType: "found" },
  { t: 5600, type: "log", source: "internet", message: "Blog Towards Data Science — 3 auteurs basés Paris identifiés", logType: "info" },
  { t: 6900, type: "log", source: "internet", message: "Enrichissement terminé — données web consolidées", logType: "done" },

  // ── Fin des agents ───────────────────────────────────────────────────────
  { t: 7500, type: "agent", source: "reddit",   status: "done" },
  { t: 7700, type: "agent", source: "internet", status: "done" },
  { t: 8000, type: "agent", source: "github",   status: "done" },
  { t: 8200, type: "agent", source: "linkedin",  status: "done" },

  // ── Apparition des profils (un par un, après les logs) ──────────────────
  { t: 5200, type: "profile", index: 0 },  // Lina Faik        94%
  { t: 6400, type: "profile", index: 1 },  // Thomas Leroy     88%
  { t: 7100, type: "profile", index: 2 },  // Marie Duplessis  83%
  { t: 7800, type: "profile", index: 5 },  // Olivier Grisel   79% (GitHub)
  { t: 8500, type: "profile", index: 3 },  // Antoine Marchand 76%
  { t: 9200, type: "profile", index: 6 },  // Rémi Gautier     73%
  { t: 9900, type: "profile", index: 4 },  // Sarah Cohen      70%
  { t: 10600,type: "profile", index: 7 },  // Emma Bernard     65%
];

// ─── Runner ─────────────────────────────────────────────────────────────────

export function runDemoSearch(callbacks: DemoSearchCallbacks): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;

  EVENTS.forEach((event) => {
    const timer = setTimeout(() => {
      if (cancelled) return;
      if (event.type === "log") {
        callbacks.onLog({
          id: `${event.source}-${event.t}`,
          source: event.source,
          message: event.message,
          type: event.logType,
        });
      } else if (event.type === "agent") {
        callbacks.onAgentStatus(event.source, event.status);
      } else if (event.type === "profile") {
        const profile = DEMO_PROFILES[event.index];
        if (profile) callbacks.onProfile(profile);
      }
    }, event.t);
    timers.push(timer);
  });

  // Done callback after last event
  const lastT = Math.max(...EVENTS.map((e) => e.t)) + 1200;
  const doneTimer = setTimeout(() => {
    if (!cancelled) callbacks.onDone();
  }, lastT);
  timers.push(doneTimer);

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}
