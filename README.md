# Passive Talent Intelligence Agent

Agent IA de recrutement pour le hackathon HrFlow GenAI & RH (27-28 mars 2026).

Un recruteur decrit un poste via le chat du dashboard → l'agent orchestre le scoring IA des profils indexes via HrFlow, affiche les meilleurs candidats avec score de matching anime, competences cliquables et fiches detaillees. Le pipeline temps reel trace chaque etape (fetch job, scoring, classement).

## Setup

```bash
npm install
cp .env.example .env   # Remplir les cles
npm run dev             # http://localhost:3000
```

## Variables d'environnement

Copier `.env.example` et remplir :

| Variable | Description | Statut |
|---|---|---|
| `HRFLOW_API_KEY` | Cle API HrFlow (Read & Write, prefixe `ask_`) | OK |
| `HRFLOW_API_EMAIL` | Email du compte HrFlow | OK |
| `HRFLOW_SOURCE_KEY` | Source contenant les profils | OK (demo: 10k profils) |
| `HRFLOW_BOARD_KEY` | Board contenant les jobs | OK (demo: 1k jobs) |
| `HRFLOW_ALGORITHM_KEY` | Algorithme de scoring IA (AI Studio) | OK |
| `PROXYCURL_API_KEY` | Enrichissement LinkedIn | A configurer |
| `GITHUB_TOKEN` | Sourcing passif GitHub | A configurer |
| `OLLAMA_BASE_URL` | URL Ollama (Mac Mini) | A configurer |
| `OLLAMA_MODEL` | Modele LLM (qwen3:14b) | A configurer |

## Architecture

```
app/
  page.tsx                      Dashboard 3 colonnes
  layout.tsx                    Layout avec Geist font
  globals.css                   Theme dark "mission control" + animations
  components/
    TopBar.tsx                  Barre status connexions (OpenClaw, Indeed, HrFlow)
    Dashboard.tsx               Orchestrateur principal (state, fetch, layout)
    WhatsAppPanel.tsx           Chat recruteur (gauche)
    CandidatePanel.tsx          Fiches candidats avec scoring (centre)
    AgentFeed.tsx               Feed pipeline agent temps reel (droite)
  lib/
    hrflow.ts                   Client HrFlow centralise
    types.ts                    Types TypeScript (HrFlowProfile, FeedEvent, ChatMessage)
  api/hrflow/
    parse/route.ts              POST — Upload et parse un CV
    score/route.ts              GET  — Score profils vs job (scoring IA)
    ask/route.ts                GET  — Q&A sur un profil
    profiles/route.ts           GET  — Lister les profils indexes
    jobs/route.ts               GET  — Lister les jobs du board
```

## Dashboard — Layout 3 colonnes

| Gauche (320px) | Centre (flex) | Droite (340px) |
|---|---|---|
| Chat recruteur | Fiches candidats avec score | Pipeline Agent |
| Q&A sur profils selectionnes | Stats, skills cliquables, experiences, formations | Feed temps reel des operations |
| Interactions recruteur | Timeline pro, score matching anime | Progression, compteurs |

### Fiche candidat (panneau central)

Chaque profil affiche en mode compact :
- **Score de matching** (cercle anime colore : vert >= 70%, orange >= 40%, rouge < 40%)
- **Stats rapides** : experiences, formations, competences (cliquable), langues, annees
- **Apercu competences** : badge cliquable affichant les 12 premieres skills

En mode expanse :
- **Contact** : email
- **Competences techniques** (hard skills) vs **soft skills** — tags colores distincts
- **Langues** avec niveau
- **Parcours professionnel** : timeline avec duree calculee, entreprise, lieu, description
- **Formations** : ecole, diplome, dates
- **Resume** complet du profil
- **Actions** : poser une question (Q&A), selectionner pour le chat

### Pipeline de scoring

1. Fetch du job depuis le board HrFlow (par `board_key`)
2. Appel `/profiles/scoring` avec l'algorithme IA configure
3. Classement et affichage des candidats avec score normalise
4. Feed temps reel tracant chaque etape du pipeline

## Etat d'avancement (nuit du 27 mars)

### Fonctionnel
- Dashboard 3 colonnes complet avec theme dark "mission control"
- **Scoring IA reel** : fetch job → `/profiles/scoring` → scores affiches avec cercles animes
- **Q&A reel** : le recruteur pose une question sur un profil → reponse IA HrFlow
- **5 endpoints API** prets : parse, score, ask, profiles, jobs
- Pipeline demo scripte (storytelling anime + vrais appels HrFlow)
- Fiches candidats : stats, skills cliquables, experiences, formations, langues, resume

### A faire — Emile (OpenClaw)
- Brancher le webhook Telegram/WhatsApp pour recevoir les messages recruteur
- Scraping Indeed/HelloWork via OpenClaw
- Quand un message arrive → OpenClaw appelle nos endpoints :
  - `POST /api/hrflow/parse` — parser un CV (accepte un fichier)
  - `GET /api/hrflow/score?job_key=...&limit=20` — scorer les profils vs un job
  - `GET /api/hrflow/ask?profile_key=...&questions=...` — Q&A sur un profil
  - `GET /api/hrflow/profiles?limit=20` — lister les profils
  - `GET /api/hrflow/jobs?limit=10` — lister les jobs du board
- Upload CV via Telegram : le recruteur envoie un PDF → OpenClaw appelle `/api/hrflow/parse`

### A faire — Matki (frontend/backend)
- Integrer Ollama/Qwen3 pour generer les summaries dynamiquement (streaming)
- Recevoir les events OpenClaw en temps reel (remplacer le script demo)
- Sourcing passif GitHub/LinkedIn (nice-to-have)

## Stack

- **Frontend** : Next.js 16, React 19, Tailwind CSS v4
- **Backend** : Next.js API Routes
- **IA RH** : HrFlow.ai (parsing, scoring, asking, algorithme IA)
- **Orchestrateur** : OpenClaw
- **LLM** : Ollama + Qwen3 14B (Mac Mini M4 Pro via Tailscale)
- **Sourcing** : GitHub API, Proxycurl (LinkedIn)
- **Chat** : Telegram (via OpenClaw)
