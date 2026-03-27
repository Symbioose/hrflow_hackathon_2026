# Passive Talent Intelligence Agent

Agent IA de recrutement pour le hackathon HrFlow GenAI & RH (27-28 mars 2026).

Un recruteur envoie une requete via WhatsApp ou le dashboard → l'agent analyse les candidatures Indeed, score les profils via HrFlow, source des talents passifs (GitHub, LinkedIn), et renvoie le top 3 avec explications en francais.

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
| `PROXYCURL_API_KEY` | Enrichissement LinkedIn | A configurer |
| `GITHUB_TOKEN` | Sourcing passif GitHub | A configurer |
| `OLLAMA_BASE_URL` | URL Ollama (Mac Mini) | A configurer |
| `OLLAMA_MODEL` | Modele LLM (qwen3:14b) | A configurer |

## Architecture

```
app/
  page.tsx                      Dashboard 3 colonnes
  layout.tsx                    Layout avec Geist font
  globals.css                   Theme dark + animations
  components/
    TopBar.tsx                  Barre status connexions
    WhatsAppPanel.tsx           Chat recruteur (mock)
    AgentFeed.tsx               Feed pipeline temps reel (mock)
    CandidatePanel.tsx          Cartes candidats avec scores (mock)
  lib/
    hrflow.ts                   Client HrFlow centralise + types TS
  api/hrflow/
    parse/route.ts              POST — Upload et parse un CV
    score/route.ts              GET  — Score profils vs job
    ask/route.ts                GET  — Q&A sur un profil
    profiles/route.ts           GET  — Lister les profils indexes
```

## Stack

- **Frontend** : Next.js 16, React 19, Tailwind CSS v4
- **Backend** : Next.js API Routes
- **IA RH** : HrFlow.ai (parsing, scoring, asking)
- **LLM** : Ollama + Qwen3 14B (Mac Mini M4 Pro via OpenClaw)
- **Sourcing** : GitHub API, Proxycurl (LinkedIn)
