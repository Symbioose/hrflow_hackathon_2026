# Hackathon HrFlow — Contexte Implementation

> Sujet officiel : OpenClaw AI Recruiter Agent (Advanced)
> Etat : démo 4 minutes à préparer. Architecture en transition vers Trigger.dev.

---

## Le projet : Passive Talent Intelligence Agent (Claw4HR)

**Probleme resolu :** Les meilleurs candidats (talents passifs) ne postulent jamais. Un recruteur perd 80% de son temps sur du sourcing manuel et des requêtes booléennes.

**Solution :** Un agent IA qui source des profils passifs sur GitHub, LinkedIn, Reddit, web — les score via HrFlow — et permet d'interagir avec chaque candidat en langage naturel.

---

## Architecture actuelle (5 avril 2026)

### Dashboard (Next.js 16, App Router)

Le dashboard n'est plus en 3 colonnes. Il suit un flow en 4 vues :

```
SearchView       →  LoadingView      →  ResultsView      →  ProfileDetailView
(barre de         (agents animés     (grille de profils  (fiche candidat +
recherche)         PixelSprite qui    avec scores,        Q&A HrFlow)
                   sourcent)          tri, analytics)
```

**Composants clés :**
- `app/components/Dashboard.tsx` — orchestrateur principal (state, SSE, search handler)
- `app/components/SearchView.tsx` — page d'accueil avec barre de recherche
- `app/components/LoadingView.tsx` — vue avec agents PixelSprite animés
- `app/components/ResultsView.tsx` — grille de profils avec strip agents live
- `app/components/CandidateCard.tsx` — carte candidat (score, skills, sources)
- `app/components/ProfileDetailView.tsx` — fiche complète + Q&A
- `app/components/PixelAgent.tsx` — sprites pixel art pour chaque source (github, linkedin, reddit, internet)

### Flow de données

```
[Recherche recruteur]
        ↓
POST /api/openclaw/trigger  →  (OpenClaw ou Trigger.dev)
        ↓                             ↓
GET /api/openclaw/stream    ←  POST /api/openclaw/webhook
(SSE — Dashboard écoute)      (profils + feed events)
        ↓
Dashboard.tsx reçoit les events et met à jour les vues
```

**Si le trigger échoue (OpenClaw down) → fallback démo automatique** (`app/lib/demoProfiles.ts`)

### Webhook format (ce que tout agent doit envoyer)

```bash
# Un profil
POST /api/openclaw/webhook
{"channel":"profile","payload":{"profile":{...SourcedProfile...}}}

# Batch de profils (plus simple)
POST /api/openclaw/webhook
{"profiles":[{...}, {...}]}

# Status agent
POST /api/openclaw/webhook
{"channel":"feed","payload":{"source":"github","status":"running"}}
# source: "github" | "linkedin" | "reddit" | "internet"
# status: "running" | "done" | "error"
```

**Channels valides :** `"profile"`, `"feed"`, `"chat"`, `"action"`
**NE PAS utiliser :** `"channel":"profiles"`, `"feedType"`, `"channel":"action"` avec fetch_profiles

### Structure SourcedProfile (type exact)

```typescript
interface SourcedProfile {
  key: string;               // uuid unique
  name: string;
  title: string;
  location: string;
  experience_years: number;
  summary: string;           // 2-3 phrases IA sur le profil
  sources: {
    type: "github" | "linkedin" | "reddit" | "internet";
    url: string;
    label: string;           // "github.com/username"
  }[];
  skills: string[];
  experiences: {
    title: string;
    company: string;
    location: string;
    period: string;          // "2021 — 2024"
    description: string;
  }[];
  educations: {
    degree: string;
    school: string;
    period: string;
  }[];
  hrflow_score: number;      // -1 au départ, 0-100 après scoring
  hrflow_key: string | null; // null pour profils web-sourcés
  avatar_color: string;      // "#FF6B6B" github, "#0077b5" linkedin, "#ff4500" reddit, "#7C3AED" internet
}
```

---

## Etat des composants (5 avril 2026)

### CE QUI FONCTIONNE

- [x] Dashboard complet (SearchView → LoadingView → ResultsView → ProfileDetailView)
- [x] Agents PixelSprite animés (github, linkedin, reddit, internet)
- [x] SSE stream (`GET /api/openclaw/stream`) — push temps réel au dashboard
- [x] Webhook (`POST /api/openclaw/webhook`) — reçoit profils et feed events
- [x] Fallback démo automatique si OpenClaw down (3 profils hardcodés dans `demoProfiles.ts`)
- [x] Scoring IA HrFlow (`/profiles/scoring` avec `algorithm_key`)
- [x] Q&A profil (`/profile/asking`)
- [x] Upskilling SWOT (`/profile/upskilling`)
- [x] Tri profils (score desc/asc, >= 70%, ordre d'arrivée)
- [x] Deploy Vercel : https://hrflowhackathon2026.vercel.app
- [x] HrFlow connecté (10k profils démo, 1k jobs démo, scoring fonctionnel)

### OPENCLAW — SITUATION ACTUELLE

OpenClaw tourne sur le Mac Mini M4 Pro via un tunnel Cloudflare (URL change à chaque restart).

**Problèmes rencontrés :**
- URL tunnel dans `.env.local` à mettre à jour à chaque restart OpenClaw
- Endpoint correct : `OPENCLAW_GATEWAY_URL/v1/chat/completions` (format OpenAI)
- Token : `OPENCLAW_GATEWAY_TOKEN` dans `.env.local`
- Gemini Flash (LLM d'OpenClaw) sujet à des 503 en pic de charge
- OpenClaw ne triggait pas son skill de sourcing (répondait comme assistant généraliste)

**Décision :** OpenClaw sera utilisé uniquement comme **bridge Telegram → webhook** pour la démo.
Le sourcing lourd passe sur **Trigger.dev**.

### A FAIRE POUR LA DEMO

- [ ] **Bot Telegram simple** (~30 lignes) : reçoit message → POST webhook (chat event) + POST trigger
- [ ] **Profils réels pour la démo** : OpenClaw via Agent-Reach cherche 10 profils LinkedIn + 10 GitHub "Data Scientist NLP Paris" → JSON → `demoProfiles.ts`
- [ ] **Scoring HrFlow** des profils réels (pré-calculé, pas en live pendant la démo)

### AFTER HACKATHON — Roadmap produit

- Trigger.dev pour le sourcing cloud (jobs async, pas de timeout, parallèle GitHub + LinkedIn)
- GitHub API : recherche users par langage/localisation (gratuit, fiable)
- Proxycurl : enrichissement LinkedIn (clé à configurer, ~$0.01/profil)
- Bot Telegram natif (Telegraf.js) remplace OpenClaw complètement
- Session isolation par `session_id` dans le trigger payload

---

## Stack technique

```
Frontend / Backend
├── Next.js 16 (App Router, Turbopack)
├── React 19
├── Tailwind CSS v4
└── TypeScript

IA RH
└── HrFlow.ai
    ├── /profiles/searching    (10k profils démo)
    ├── /profiles/scoring      (scoring IA avec algorithm_key)
    ├── /profile/asking        (Q&A sur profil)
    └── /profile/upskilling    (analyse SWOT forces/gaps)

Orchestration agent
├── OpenClaw (Mac Mini M4 Pro, Ollama + Qwen3 14B) — bridge Telegram uniquement
└── Trigger.dev — sourcing background jobs (à intégrer)

Sourcing
├── GitHub API (gratuit, public)
├── Agent-Reach (toolkit LinkedIn/GitHub pour OpenClaw)
└── Proxycurl (LinkedIn enrichissement — clé à configurer)

Messaging
└── Telegram (via bot simple ou OpenClaw)
```

---

## HrFlow — Resources configurées

| Ressource | Nom | Key |
|---|---|---|
| Source (demo) | hackathon demo profiles | `c1039b004a836e42427b9c89309ad99cf9b6a73c` |
| Source (live) | hackathon-indeed-cvs | `44b74e662d34aedf07b04df10bf2f79225ec31d3` |
| Board (demo) | hackathon demo jobs | `c99d70c3a062c2f99ca78fce23b89fb4f53119ef` |
| Board (custom) | hackathon-jobs | `dbe92e653fa4f9c89ff335c29e91f49a1f7d448f` |
| Job | Dev Python Senior Paris | `90fd6858b1de21274af231c9ad93fda3000dddac` |

Base URL HrFlow : `https://api.hrflow.ai/v1`
Auth : `X-API-KEY` + `X-USER-EMAIL` sur toutes les requêtes

---

## Endpoints API disponibles pour un agent externe

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/openclaw/webhook` | POST | Envoyer profils + feed events au dashboard |
| `/api/openclaw/trigger` | POST | Déclencher une recherche `{"query":"..."}` |
| `/api/openclaw/stream` | GET (SSE) | Stream d'events temps réel |
| `/api/hrflow/parse` | POST | Parser un CV (fichier) |
| `/api/hrflow/score?job_key=...&limit=20` | GET | Scorer profils vs job |
| `/api/hrflow/upskill?profile_key=...&job_key=...` | GET | SWOT forces/gaps |
| `/api/hrflow/ask?profile_key=...&question=...` | GET | Q&A sur un profil |
| `/api/hrflow/profiles?limit=20` | GET | Lister les profils HrFlow |
| `/api/hrflow/jobs?limit=10` | GET | Lister les jobs du board |
| `/api/sourcing/pipeline` | POST | Pipeline de sourcing JIT (simulé) |

Webhook URL production : `https://hrflowhackathon2026.vercel.app/api/openclaw/webhook`

---

## Règles d'implémentation

1. **Demo demoable à tout instant** — jamais de "ça marche pas mais ça va marcher"
2. **Fallback démo toujours actif** — si le trigger échoue, les profils démo s'affichent
3. **Pas d'auth/login** — perte de temps
4. **Pas de base de données custom** — HrFlow est le backend
5. **Streaming partout** — les profils arrivent au fur et à mesure, pas tous à la fin
