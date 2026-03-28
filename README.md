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
    upskill/route.ts            GET  — Analyse SWOT profil↔job (forces + gaps)
    profiles/route.ts           GET  — Lister les profils indexes
    jobs/route.ts               GET  — Lister les jobs du board
  api/openclaw/
    webhook/route.ts            POST — Recevoir les events OpenClaw (chat, feed, actions)
    events/route.ts             GET  — Polling des events par le dashboard (cursor-based)
  lib/
    eventStore.ts               Store in-memory pour le bridge webhook → dashboard
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
- **Analyse SWOT** : bouton "Analyser le matching IA" → forces (vert) + gaps (amber) avec reveal anime via `GET /profile/upskilling`
- **Actions** : poser une question (Q&A), selectionner pour le chat

### Tri et filtre

4 boutons dans le header candidats (visibles quand le scoring est actif) :
- **Ordre** — ordre d'arrivee par defaut
- **Score ↓** — meilleur score en premier
- **Score ↑** — pire score en premier
- **>= 70%** — filtre uniquement les bons matchs (avec compteur X/total)

### Pipeline de scoring

1. Fetch du job depuis le board HrFlow (par `board_key`)
2. Appel `/profiles/scoring` avec l'algorithme IA configure
3. Classement et affichage des candidats avec score normalise
4. Feed temps reel tracant chaque etape du pipeline

## Etat d'avancement (28 mars — apres-midi)

### Fonctionnel
- Dashboard 3 colonnes complet avec theme dark "mission control"
- **Scoring IA reel** : fetch job → `/profiles/scoring` → scores affiches avec cercles animes
- **Matching intelligent** : la query recruteur est analysee (NLP), le job le plus pertinent du board est selectionne automatiquement, et les profils sont scores par l'IA contre ce job
- **Upskilling SWOT reel** : analyse forces/gaps par candidat via `GET /profile/upskilling` → affichage vert/amber anime
- **Q&A reel** : le recruteur pose une question sur un profil → reponse IA HrFlow
- **Tri/filtre par score** : 4 modes (ordre, score desc/asc, >= 70%)
- **6 endpoints API** prets : parse, score, ask, upskill, profiles, jobs
- Pipeline demo scripte (storytelling anime + vrais appels HrFlow)
- Fiches candidats : stats, skills cliquables, experiences, formations, langues, resume, SWOT
- **Deploy Vercel** : https://hrflowhackathon2026.vercel.app
- **Webhook OpenClaw** : bridge temps reel OpenClaw → dashboard (teste et fonctionnel)
- **Mode Demo / Live** : toggle dans la TopBar — Demo (pipeline scripte) ou Live (events OpenClaw temps reel)
- **Mode Live fonctionnel** : message Telegram → transcription audio → extraction criteres → recherche job matching → scoring IA → affichage profils + SWOT + Q&A
- **Sources externes graceful** : GitHub/LinkedIn signales comme non configures (erreur dans le feed) au lieu de faux resultats — fallback sur la base HrFlow (10k profils)

### Pipeline Live (bout en bout)
1. Recruteur envoie un audio/texte sur Telegram (ex: "je cherche un software engineer sur Paris")
2. OpenClaw transcrit et envoie au dashboard via webhook
3. Extraction NLP des criteres (competences, localisation, seniorite)
4. Tentative GitHub/LinkedIn → echec gracieux (tokens non configures)
5. Recherche du job le plus pertinent dans le board HrFlow (matching par mots-cles)
6. Scoring IA des profils contre ce job → top 20 classes par pertinence
7. Affichage progressif des profils avec scores animes
8. Analyse SWOT disponible sur chaque profil (forces/gaps vs le job matche)
9. Q&A disponible sur chaque profil

### A faire — Emile (OpenClaw)
- Scraping Indeed/HelloWork via OpenClaw
- Upload CV via Telegram → `POST /api/hrflow/parse`

### A faire — Matki (frontend/backend)
- Sourcing passif GitHub/LinkedIn (nice-to-have — tokens a configurer)

## Stack

- **Frontend** : Next.js 16, React 19, Tailwind CSS v4
- **Backend** : Next.js API Routes
- **IA RH** : HrFlow.ai (parsing, scoring, asking, algorithme IA)
- **Orchestrateur** : OpenClaw
- **LLM** : Ollama + Qwen3 14B (Mac Mini M4 Pro via Tailscale)
- **Sourcing** : GitHub API, Proxycurl (LinkedIn)
- **Chat** : Telegram (via OpenClaw)
