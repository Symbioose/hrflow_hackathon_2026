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

// ─── Timeline ~20s ──────────────────────────────────────────────────────────

const EVENTS: DemoEvent[] = [
  // ── T=0 : démarrage simultané des 4 agents ──
  { t: 0,    type: "agent", source: "github",   status: "running" },
  { t: 50,   type: "agent", source: "linkedin", status: "running" },
  { t: 100,  type: "agent", source: "reddit",   status: "running" },
  { t: 150,  type: "agent", source: "internet", status: "running" },

  // ── GitHub ──────────────────────────────────────────────────────────────
  { t: 400,  type: "log", source: "github", message: "Connexion API GitHub v3 — token authentifié", logType: "info" },
  { t: 1100, type: "log", source: "github", message: "Requête : location:Paris language:Python followers:>50", logType: "info" },
  { t: 1900, type: "log", source: "github", message: "2 847 profils candidats détectés", logType: "info" },
  { t: 2700, type: "log", source: "github", message: "Filtrage activité récente (commits < 90j) — 341 retenus", logType: "info" },
  { t: 3500, type: "log", source: "github", message: "Analyse sémantique des READMEs et descriptions de repos...", logType: "info" },
  { t: 4400, type: "log", source: "github", message: "Profil prioritaire : ogrisel — 4 912 followers, 127 repos publics", logType: "found" },
  { t: 5000, type: "log", source: "github", message: "Extraction : scikit-learn core contributor, PyTorch, CUDA, NLP", logType: "info" },
  { t: 5700, type: "log", source: "github", message: "Score HrFlow semantic engine : 79/100 ✓", logType: "score" },
  { t: 6300, type: "log", source: "github", message: "Profil Olivier Grisel → pipeline de qualification", logType: "done" },
  { t: 9500, type: "log", source: "github", message: "Scan étendu — repos ML embarqué, quantification de modèles...", logType: "info" },
  { t: 10800,type: "log", source: "github", message: "Nouveau profil : cmorel-ml — ONNX, TensorRT, edge computing", logType: "found" },
  { t: 11800,type: "log", source: "github", message: "Score HrFlow calculé : 70/100 — spécialiste ML embarqué", logType: "score" },
  { t: 12600,type: "log", source: "github", message: "Profil Camille Morel → pipeline de qualification", logType: "done" },

  // ── LinkedIn ─────────────────────────────────────────────────────────────
  { t: 600,  type: "log", source: "linkedin", message: "Initialisation Agent-Reach — réseau LinkedIn France", logType: "info" },
  { t: 1400, type: "log", source: "linkedin", message: "Requête sémantique : 'Lead Data Scientist Machine Learning Paris'", logType: "info" },
  { t: 2300, type: "log", source: "linkedin", message: "1 240 profils détectés — filtres HrFlow (exp ≥ 5 ans, Paris)", logType: "info" },
  { t: 3200, type: "log", source: "linkedin", message: "Scoring sémantique des 50 profils prioritaires en cours...", logType: "info" },
  { t: 4100, type: "log", source: "linkedin", message: "TOP MATCH : Lina Faik — École des Ponts, ex-Dataiku, L'Oréal & Décathlon", logType: "found" },
  { t: 4800, type: "log", source: "linkedin", message: "Extraction compétences : Python, LLMs, Graph Neural Networks, MLflow", logType: "info" },
  { t: 5500, type: "log", source: "linkedin", message: "Analyse expériences en production — 6 ans confirmés, 2 grands comptes", logType: "info" },
  { t: 6200, type: "log", source: "linkedin", message: "Score HrFlow semantic engine : 94/100 ✓✓ — meilleur profil détecté", logType: "score" },
  { t: 6900, type: "log", source: "linkedin", message: "Profil Lina Faik → pipeline de qualification", logType: "done" },
  { t: 7700, type: "log", source: "linkedin", message: "Profil #2 : Thomas Leroy — Senior ML Engineer @ Doctolib (88/100)", logType: "found" },
  { t: 8500, type: "log", source: "linkedin", message: "Profil #3 : Marie Duplessis — Lead Data Scientist @ BlaBlaCar (83/100)", logType: "found" },
  { t: 9200, type: "log", source: "linkedin", message: "3 profils LinkedIn tier-1 qualifiés — extension du scan...", logType: "done" },
  { t: 10200,type: "log", source: "linkedin", message: "Analyse couche secondaire — profils 'passifs' non déclarés ouverts...", logType: "info" },
  { t: 11200,type: "log", source: "linkedin", message: "Profil #4 : Antoine Marchand — Senior DS @ Leboncoin (76/100)", logType: "found" },
  { t: 12000,type: "log", source: "linkedin", message: "Profil #5 : Sarah Cohen — ML Engineer @ Contentsquare (71/100)", logType: "found" },
  { t: 13000,type: "log", source: "linkedin", message: "Profil #6 : Julien Renard — Senior DS @ Criteo (70/100)", logType: "found" },
  { t: 14000,type: "log", source: "linkedin", message: "6 profils LinkedIn qualifiés — sourcing terminé ✓", logType: "done" },

  // ── Reddit ───────────────────────────────────────────────────────────────
  { t: 800,  type: "log", source: "reddit", message: "Scan : r/MachineLearning, r/datascience, r/learnmachinelearning", logType: "info" },
  { t: 2100, type: "log", source: "reddit", message: "Filtrage contributeurs actifs basés en Île-de-France...", logType: "info" },
  { t: 3800, type: "log", source: "reddit", message: "847 posts techniques analysés — extraction des experts ML", logType: "info" },
  { t: 5200, type: "log", source: "reddit", message: "5 profils identifiés via karma technique élevé (> 2k karma)", logType: "found" },
  { t: 7000, type: "log", source: "reddit", message: "Cross-référencement GitHub/LinkedIn — 2 matches confirmés", logType: "info" },
  { t: 8200, type: "log", source: "reddit", message: "Scan r/france_tech — 3 experts ML supplémentaires identifiés", logType: "info" },
  { t: 9800, type: "log", source: "reddit", message: "Données Reddit consolidées — enrichissement terminé ✓", logType: "done" },

  // ── Internet / Web ───────────────────────────────────────────────────────
  { t: 900,  type: "log", source: "internet", message: "Indexation blogs techniques, portfolios personnels, conférences...", logType: "info" },
  { t: 2400, type: "log", source: "internet", message: "PyData Paris 2024/2025 — extraction liste speakers...", logType: "info" },
  { t: 4000, type: "log", source: "internet", message: "ICLR, NeurIPS, ICML 2025 — vérification affiliations Paris...", logType: "info" },
  { t: 5800, type: "log", source: "internet", message: "Portfolio détecté : emmabernard.dev — semantic search, NLP e-commerce", logType: "found" },
  { t: 7400, type: "log", source: "internet", message: "Blog Towards Data Science — 3 auteurs basés Paris identifiés", logType: "info" },
  { t: 9000, type: "log", source: "internet", message: "IEEE publications — profils ML embarqué (Thales, CEA List)", logType: "info" },
  { t: 10400,type: "log", source: "internet", message: "ECML-PKDD 2025 — 2 speakers parisiens localisés", logType: "found" },
  { t: 12200,type: "log", source: "internet", message: "Scan web étendu — données consolidées ✓", logType: "done" },

  // ── Phase enrichissement HrFlow ──────────────────────────────────────────
  { t: 9000, type: "log", source: "linkedin", message: "Moteur sémantique HrFlow — enrichissement croisé des profils...", logType: "info" },
  { t: 10000,type: "log", source: "github",   message: "Cross-référencement multi-sources — vérification profils...", logType: "info" },
  { t: 14800,type: "log", source: "linkedin", message: "Scoring final HrFlow — classement par compatibilité sémantique...", logType: "info" },
  { t: 15600,type: "log", source: "linkedin", message: "Pipeline complet : 10 profils triés, scores 70-94/100 ✓", logType: "score" },

  // ── Fin des agents ───────────────────────────────────────────────────────
  { t: 10000, type: "agent", source: "reddit",   status: "done" },
  { t: 12500, type: "agent", source: "internet", status: "done" },
  { t: 13500, type: "agent", source: "github",   status: "done" },
  { t: 15000, type: "agent", source: "linkedin", status: "done" },

  // ── Apparition des profils ───────────────────────────────────────────────
  { t: 7000,  type: "profile", index: 0 },  // Lina Faik        94%
  { t: 8200,  type: "profile", index: 1 },  // Thomas Leroy     88%
  { t: 9100,  type: "profile", index: 2 },  // Marie Duplessis  83%
  { t: 10000, type: "profile", index: 5 },  // Olivier Grisel   79% (GitHub)
  { t: 10900, type: "profile", index: 3 },  // Antoine Marchand 76%
  { t: 11800, type: "profile", index: 6 },  // Rémi Gautier     73%
  { t: 12700, type: "profile", index: 4 },  // Emma Bernard     72%
  { t: 13500, type: "profile", index: 7 },  // Sarah Cohen      71%  (index 7 in array)
  { t: 14300, type: "profile", index: 8 },  // Julien Renard    70%
  { t: 16000, type: "profile", index: 9 },  // Camille Morel    70%
];

// ─── Runner ─────────────────────────────────────────────────────────────────

export function runDemoSearch(
  callbacks: DemoSearchCallbacks,
  profileCount: number = 10,
): () => void {
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
        if (event.index >= profileCount) return;
        const profile = DEMO_PROFILES[event.index];
        if (profile) callbacks.onProfile(profile);
      }
    }, event.t);
    timers.push(timer);
  });

  // Done fires 1200ms after the last relevant profile event
  const profileEvents = EVENTS.filter(
    (e): e is Extract<typeof e, { type: "profile" }> => e.type === "profile" && e.index < profileCount,
  );
  const lastProfileT = profileEvents.length > 0
    ? Math.max(...profileEvents.map((e) => e.t))
    : Math.max(...EVENTS.map((e) => e.t));
  const doneTimer = setTimeout(() => {
    if (!cancelled) callbacks.onDone();
  }, lastProfileT + 1200);
  timers.push(doneTimer);

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}
