# Claw4HR — Passive Talent Intelligence Agent

Agent IA de sourcing de talents passifs. Hackathon HrFlow GenAI & RH (mars 2026).

Le recruteur décrit un poste en langage naturel → des agents IA sourcent des profils sur GitHub, LinkedIn, Reddit, web → HrFlow score chaque candidat → le recruteur interagit avec les profils via Q&A.

**Deploy :** https://hrflowhackathon2026.vercel.app

---

## Setup

```bash
npm install
cp .env.example .env.local   # Remplir les clés (voir tableau ci-dessous)
npm run dev                   # http://localhost:3000
```

## Variables d'environnement

| Variable | Description | Statut |
|---|---|---|
| `HRFLOW_API_KEY` | Clé API HrFlow (`ask_...`) | ✅ Configuré |
| `HRFLOW_API_EMAIL` | Email compte HrFlow | ✅ Configuré |
| `HRFLOW_SOURCE_KEY` | Source profils démo (10k profils) | ✅ Configuré |
| `HRFLOW_LIVE_SOURCE_KEY` | Source profils live (Indeed CVs) | ✅ Configuré |
| `HRFLOW_BOARD_KEY` | Board jobs démo (1k jobs) | ✅ Configuré |
| `HRFLOW_ALGORITHM_KEY` | Algorithme scoring IA | ✅ Configuré |
| `OPENCLAW_GATEWAY_URL` | URL tunnel Cloudflare OpenClaw | ⚠️ Change à chaque restart |
| `OPENCLAW_GATEWAY_TOKEN` | Token Gateway OpenClaw | ✅ Configuré |
| `OPENCLAW_WEBHOOK_SECRET` | Secret webhook (optionnel) | — |
| `PROXYCURL_API_KEY` | Enrichissement LinkedIn | ❌ À configurer |
| `GITHUB_TOKEN` | Sourcing GitHub | ❌ À configurer |
| `OLLAMA_BASE_URL` | URL Ollama Mac Mini | `http://localhost:11434` |
| `OLLAMA_MODEL` | Modèle LLM | `qwen3:14b` |

---

## Architecture

### Flow utilisateur

```
SearchView → LoadingView → ResultsView → ProfileDetailView
```

1. **SearchView** — barre de recherche en langage naturel
2. **LoadingView** — agents PixelSprite animés (github / linkedin / reddit / internet)
3. **ResultsView** — grille de profils avec scores, tri, analytics
4. **ProfileDetailView** — fiche complète + Q&A HrFlow en temps réel

### Flow de données

```
Recruteur tape une query
        ↓
POST /api/openclaw/trigger
        ↓                          ↓ (si trigger OK)
Demo fallback                  OpenClaw ou Trigger.dev
(demoProfiles.ts)              sourcent les candidats
        ↓                          ↓
        →  POST /api/openclaw/webhook (profils + feed events)
                    ↓
        GET /api/openclaw/stream (SSE → Dashboard)
                    ↓
        Dashboard met à jour les vues en temps réel
```

### Structure des fichiers

```
app/
  page.tsx                         Entrée — render Dashboard
  layout.tsx
  components/
    Dashboard.tsx                  Orchestrateur (state, SSE, handlers)
    SearchView.tsx                 Page d'accueil — barre de recherche
    LoadingView.tsx                Agents animés pendant le sourcing
    ResultsView.tsx                Grille profils + strip agents live
    CandidateCard.tsx              Carte candidat (score, skills, sources)
    ProfileDetailView.tsx          Fiche complète + Q&A
    PixelAgent.tsx                 Sprites pixel art par source + config
    ScoreRing.tsx                  Anneau de score animé
    QAPanel.tsx                    Panel Q&A recruteur
  lib/
    types.ts                       Types TypeScript (SourcedProfile, etc.)
    hrflow.ts                      Client HrFlow centralisé
    demoProfiles.ts                Profils démo hardcodés (fallback)
    eventStore.ts                  Store in-memory SSE (webhook → dashboard)
    sourcing.ts                    Pipeline JIT (simulé pour l'instant)
  api/
    openclaw/
      trigger/route.ts             POST — Déclencher une recherche
      webhook/route.ts             POST — Recevoir profils + events
      stream/route.ts              GET  — SSE stream vers dashboard
      events/route.ts              GET  — Polling cursor-based
    hrflow/
      parse/route.ts               POST — Parser un CV
      score/route.ts               GET  — Scorer profils vs job
      ask/route.ts                 GET  — Q&A sur un profil
      upskill/route.ts             GET  — Analyse SWOT forces/gaps
      profiles/route.ts            GET  — Lister les profils
      jobs/route.ts                GET  — Lister les jobs
    sourcing/
      pipeline/route.ts            POST — Pipeline de sourcing JIT
```

---

## Intégration agent externe (OpenClaw / Trigger.dev / bot Telegram)

### Envoyer des profils au dashboard

```bash
curl -X POST https://hrflowhackathon2026.vercel.app/api/openclaw/webhook \
  -H "Content-Type: application/json" \
  -d '{"profiles": [{
    "key": "uuid-unique",
    "name": "Prénom Nom",
    "title": "Data Scientist NLP",
    "location": "Paris, France",
    "experience_years": 5,
    "summary": "2-3 phrases sur le profil",
    "sources": [{"type":"github","url":"https://github.com/...","label":"github.com/..."}],
    "skills": ["Python","NLP","PyTorch"],
    "experiences": [{"title":"...","company":"...","location":"Paris","period":"2021 — 2024","description":"..."}],
    "educations": [{"degree":"...","school":"...","period":"..."}],
    "hrflow_score": -1,
    "hrflow_key": null,
    "avatar_color": "#FF6B6B"
  }]}'
```

### Notifier le statut d'un agent

```bash
curl -X POST https://hrflowhackathon2026.vercel.app/api/openclaw/webhook \
  -H "Content-Type: application/json" \
  -d '{"channel":"feed","payload":{"source":"github","status":"done"}}'
# source: "github" | "linkedin" | "reddit" | "internet"
# status: "running" | "done" | "error"
```

### avatar_color par source

| Source | Couleur |
|---|---|
| github | `#FF6B6B` |
| linkedin | `#0077b5` |
| reddit | `#ff4500` |
| internet | `#7C3AED` |

---

## Stack

- **Frontend/Backend** : Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **IA RH** : HrFlow.ai (parsing, scoring, asking, upskilling)
- **Orchestration** : OpenClaw (Mac Mini M4 Pro, Qwen3 14B via Ollama) + Trigger.dev (en cours)
- **Sourcing** : GitHub API, Agent-Reach (LinkedIn via OpenClaw), Proxycurl
- **Messaging** : Telegram
- **Deploy** : Vercel

---

## Documentation

- `CONTEXT.md` — état d'avancement détaillé, décisions d'architecture, TODO
- `CLAW4HR_VISION.md` — business vision, pitch, modèle économique
- `OPENCLAW_PROMPT.md` — format exact attendu par le dashboard (pour configurer OpenClaw)
- `hrflow_api_reference.md` — doc complète API HrFlow
