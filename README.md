# Passive Talent Intelligence Agent

Agent IA de recrutement pour le hackathon HrFlow GenAI & RH (27-28 mars 2026).

Un recruteur envoie une requete via Telegram ou le dashboard → l'agent orchestre via OpenClaw l'analyse des candidatures Indeed, score les profils via HrFlow, source des talents passifs (GitHub, LinkedIn), et renvoie le top candidats avec explications en francais.

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
    WhatsAppPanel.tsx           Chat recruteur via Telegram / OpenClaw
    CandidatePanel.tsx          Fiches candidats detaillees (centre)
    AgentFeed.tsx               Feed pipeline agent temps reel (droite)
  lib/
    hrflow.ts                   Client HrFlow centralise
    types.ts                    Types TypeScript (HrFlowProfile, FeedEvent, ChatMessage)
  api/hrflow/
    parse/route.ts              POST — Upload et parse un CV
    score/route.ts              GET  — Score profils vs job (scoring IA)
    ask/route.ts                GET  — Q&A sur un profil
    profiles/route.ts           GET  — Lister les profils indexes
```

## Dashboard — Layout 3 colonnes

| Gauche (320px) | Centre (flex) | Droite (340px) |
|---|---|---|
| Chat Telegram / OpenClaw | Fiches candidats detaillees | Pipeline Agent |
| Q&A sur profils selectionnes | Stats, skills, experiences, formations, langues | Feed temps reel des operations |
| Interactions recruteur | Timeline professionnelle, score matching | Progression, compteurs |

### Fiche candidat (panneau central)

Chaque profil affiche en mode expanse :
- **Stats rapides** : experiences, formations, competences, langues, annees totales
- **Contact** : email
- **Competences techniques** (hard skills) vs **soft skills** — tags colores distincts
- **Langues** avec niveau
- **Parcours professionnel** : timeline avec duree calculee, entreprise, lieu, description
- **Formations** : ecole, diplome, dates
- **Resume** complet du profil
- **Score de matching** (cercle anime) via scoring IA HrFlow
- **Actions** : poser une question (Q&A), selectionner pour le chat

## Stack

- **Frontend** : Next.js 16, React 19, Tailwind CSS v4
- **Backend** : Next.js API Routes
- **IA RH** : HrFlow.ai (parsing, scoring, asking, algorithme IA)
- **Orchestrateur** : OpenClaw
- **LLM** : Ollama + Qwen3 14B (Mac Mini M4 Pro via Tailscale)
- **Sourcing** : GitHub API, Proxycurl (LinkedIn)
- **Chat** : Telegram (via OpenClaw)
