# Hackathon HrFlow — Contexte Implementation

> On est en phase d'implementation. Sujet choisi, architecture decidee. Tu codes.

---

## Le projet : Passive Talent Intelligence Agent

**Probleme resolu :** Un recruteur recoit 150 CVs sur Indeed, n'a pas le temps de tous les lire. Et le vivier est souvent insuffisant — les meilleurs candidats ne postulent jamais.

**Solution :** Un agent IA qui :
1. Se connecte au compte Indeed/HelloWork du recruteur via OpenClaw → traite toutes les candidatures automatiquement
2. Si vivier insuffisant → source des talents passifs sur GitHub + LinkedIn (Proxycurl) + Stack Overflow
3. Analyse tout avec HrFlow (parse → score → explique en francais)
4. Interface dual : dashboard web live + WhatsApp via OpenClaw

**Sujet officiel :** OpenClaw AI Recruiter Agent (Advanced)

---

## Etat d'avancement (28 mars 2026 — apres-midi)

### FAIT
- [x] Dashboard frontend 3 colonnes (Chat | Candidats | Agent Feed)
- [x] Theme dark "mission control", animations CSS (score rings, staggered reveals, typing dots)
- [x] Client HrFlow centralise (`app/lib/hrflow.ts`) avec types TypeScript
- [x] API routes Next.js : parse, score, ask, profiles, jobs, **upskill**
- [x] Connexion HrFlow verifiee (`GET /auth` → 200, team: hackathon-202603, permission: all)
- [x] Source demo configuree : `hackathon demo profiles` (10 000 profils) — searching OK
- [x] Board demo configure : `hackathon demo jobs` (1 000 jobs) — searching OK
- [x] Job "Dev Python Senior Paris" indexe dans board custom (`hackathon-jobs`)
- [x] Endpoint `profile/asking` teste et fonctionnel (Q&A IA sur profils)
- [x] `.env` avec toutes les cles HrFlow
- [x] **Scoring IA fonctionnel** — `algorithm_key` obtenue, `/profiles/scoring` OK
- [x] **Pipeline demo scripte** — scenario anime (chat + feed) qui appelle les vrais endpoints HrFlow
- [x] **Pipeline live fonctionnel** — Telegram audio → extraction criteres → matching job → scoring IA → affichage profils
- [x] **Matching intelligent** — la query recruteur est analysee (NLP), le job le plus pertinent du board (parmi 100) est selectionne par matching mots-cles, les profils sont scores contre ce job
- [x] **Score de matching anime** — cercle colore par candidat (vert >= 70%, orange >= 40%, rouge < 40%)
- [x] **Competences cliquables** — badge compact + apercu 12 skills sans expand
- [x] **Fiches candidats completes** — stats, skills hard/soft, langues, experiences, formations, resume, score
- [x] **Q&A bout en bout** — le recruteur peut poser une question sur un profil via le chat, reponse reelle HrFlow
- [x] **Summary auto** — le top 3 avec scores est envoye dans le chat apres le scoring
- [x] **Upskilling SWOT** — bouton "Analyser le matching IA" sur chaque fiche candidat → appel `GET /profile/upskilling` → affiche forces (vert) et gaps (amber) avec reveal anime
- [x] **Tri/filtre par score** — 4 boutons dans le header candidats : Ordre, Score ↓, Score ↑, >= 70%
- [x] **Deploy Vercel** — https://hrflowhackathon2026.vercel.app
- [x] **Webhook OpenClaw** — `POST /api/openclaw/webhook` recoit les events (chat, feed, actions) + `GET /api/openclaw/events?cursor=N` pour le polling dashboard (2s). Teste et fonctionnel.
- [x] **Mode Demo / Live** — toggle dans la TopBar. Demo = pipeline scripte. Live = dashboard ecoute les events OpenClaw en temps reel.
- [x] **Sources externes graceful** — GitHub/LinkedIn signales comme non configures (erreur dans le feed) au lieu de faux resultats
- [x] **Scroll-to-view** — quand on expand un profil, la carte scroll automatiquement en vue

### CE QUI MARCHE AUJOURD'HUI

#### Mode Demo
Le dashboard se lance, un scenario scripte simule la conversation recruteur/agent :
1. Le recruteur demande des profils pour "Dev Full-Stack Python/React — CDI Paris"
2. Le feed affiche chaque etape (connexion, parsing, scoring...)
3. Le scoring reel HrFlow est appele (fetch job → `/profiles/scoring`)
4. Les candidats apparaissent progressivement avec leurs vrais scores
5. Le recruteur peut trier/filtrer par score (boutons dans le header)
6. Le recruteur expand un profil → clic "Analyser le matching IA" → analyse SWOT (forces + gaps)
7. Le recruteur peut poser des questions sur un profil (Q&A reel)

#### Mode Live (Telegram → Dashboard)
1. Le recruteur envoie un audio/texte sur Telegram (ex: "je cherche un software engineer sur Paris")
2. OpenClaw transcrit et envoie au dashboard via webhook
3. Extraction NLP des criteres (competences, localisation, seniorite)
4. Tentative GitHub/LinkedIn → echec gracieux (tokens non configures, affiche en rouge dans le feed)
5. Recherche du job le plus pertinent dans le board HrFlow (matching mots-cles parmi 100 jobs)
6. Scoring IA des 10k profils contre ce job → top 20 classes par pertinence
7. Affichage progressif des profils avec scores animes
8. Analyse SWOT disponible sur chaque profil (vs le job matche)
9. Q&A disponible sur chaque profil

### A FAIRE — Emile (OpenClaw / orchestration)
- [ ] **OpenClaw → Indeed/HelloWork** : scraping des candidatures via le compte employeur
- [x] **OpenClaw → Telegram** : bot Telegram branche, audio transcrit et envoye au dashboard
- [x] **OpenClaw → Dashboard** : webhook pret et fonctionnel
- [ ] **Upload CV via chat** : le recruteur envoie un PDF via Telegram → OpenClaw appelle `POST /api/hrflow/parse` → le profil est indexe et score

#### Format du webhook OpenClaw → Dashboard

URL : `POST https://hrflowhackathon2026.vercel.app/api/openclaw/webhook`

```json
// Message chat (recruteur ou agent)
{"channel": "chat", "payload": {"type": "user", "text": "Trouve-moi des devs Python"}}
{"channel": "chat", "payload": {"type": "agent", "text": "Je lance l analyse..."}}

// Event dans le feed pipeline
{"channel": "feed", "payload": {"action": "Parsing CV", "detail": "10 CVs traites", "status": "done", "feedType": "parse"}}
// feedType: "connect" | "parse" | "score" | "source" | "analyze" | "notify"
// status: "done" | "running" | "error"

// Declencher une action dashboard
{"channel": "action", "payload": {"command": "fetch_profiles"}}  // lance le scoring + affichage
{"channel": "action", "payload": {"command": "send_summary"}}    // envoie le top 3 dans le chat

// Batch (plusieurs events en un appel)
{"events": [{"channel": "chat", "payload": {...}}, {"channel": "feed", "payload": {...}}]}
```

#### Endpoints HrFlow disponibles pour OpenClaw

| Endpoint | Methode | Description |
|---|---|---|
| `/api/hrflow/parse` | POST | Parser un CV (fichier) |
| `/api/hrflow/score?job_key=...&limit=20` | GET | Scorer les profils vs un job |
| `/api/hrflow/upskill?profile_key=...&job_key=...` | GET | Analyse SWOT forces/gaps |
| `/api/hrflow/ask?profile_key=...&question=...` | GET | Q&A sur un profil |
| `/api/hrflow/profiles?limit=20` | GET | Lister les profils |
| `/api/hrflow/jobs?limit=10` | GET | Lister les jobs du board |

### A FAIRE — Matki (frontend / backend)
- [x] ~~Recevoir les events OpenClaw~~ — webhook + polling en place
- [x] ~~Mode Demo/Live~~ — toggle fonctionnel
- [x] ~~Pipeline live~~ — matching job + scoring IA + SWOT fonctionnel
- [ ] **Sourcing passif** (nice-to-have) : GitHub API + Proxycurl (LinkedIn) — tokens a configurer

---

## Stack technique

```
OpenClaw (Mac Mini M4 Pro)
├── Ollama + Qwen3 14B    LLM local (pas d'API externe)
├── Indeed/HelloWork      Connexion compte employeur (OpenClaw browse)
├── GitHub API            Sourcing passif tech (gratuit, public)
├── Proxycurl API         Enrichissement LinkedIn (trial)
└── Stack Overflow API    Donnees complementaires (gratuit)

Backend / Agent
├── Next.js 16 App Router + API Routes
└── Tailwind CSS v4

Frontend
├── Tailwind CSS v4 (dark theme custom)
└── Dashboard 3 colonnes : WhatsApp | Agent en action | Candidats

WhatsApp
└── OpenClaw natif        Recruteur envoie requete → recoit top 3
```

---

## Ressources HrFlow

**`hrflow_api_reference.md` a la racine du repo** — toute la doc API HrFlow complete et a jour.

Base URL : `https://api.hrflow.ai/v1`
Auth headers (toutes les requetes) : `X-API-KEY` + `X-USER-EMAIL`

### Sources et Boards configures

| Ressource | Nom | Key | Contenu |
|---|---|---|---|
| Source (demo) | hackathon demo profiles | `c1039b004a836e42427b9c89309ad99cf9b6a73c` | 10 000 profils |
| Source (custom) | hackathon-indeed-cvs | `44b74e662d34aedf07b04df10bf2f79225ec31d3` | Vide (pour vrais CVs Indeed) |
| Board (demo) | hackathon demo jobs | `c99d70c3a062c2f99ca78fce23b89fb4f53119ef` | 1 000 jobs |
| Board (custom) | hackathon-jobs | `dbe92e653fa4f9c89ff335c29e91f49a1f7d448f` | 1 job (Dev Python Senior) |
| Job | Dev Python Senior Paris | `90fd6858b1de21274af231c9ad93fda3000dddac` | Dans board custom |

### Endpoints testes

| Endpoint | Statut | Notes |
|---|---|---|
| `GET /auth` | OK | Permission: all |
| `GET /profiles/searching` | OK | 10k profils accessibles |
| `GET /jobs/searching` | OK | 1k jobs accessibles |
| `POST /job/indexing` | OK | Job cree avec succes |
| `GET /profile/asking` | OK | Q&A IA fonctionnel (param: `questions` array) |
| `GET /profiles/scoring` | OK | `algorithm_key` configuree, scoring fonctionnel |
| `GET /profile/upskilling` | OK | Analyse SWOT (strengths/weaknesses) — params: `source_key`, `profile_key`, `board_key`, `job_key`, `algorithm_key` |
| `GET /profile/grading` | Non teste | Disponible si besoin |

---

## Pipeline complet (cible)

```
[INBOUND — via OpenClaw]           STATUS
OpenClaw recoit message Telegram   → A FAIRE (Emile)
→ extrait les CVs candidatures     → A FAIRE (Emile — Indeed scraping)
→ POST /api/hrflow/parse           → PRET (endpoint existe)
→ GET  /api/hrflow/score           → OK (scoring IA fonctionnel)
→ Dashboard affiche top N scores   → OK (score rings animes)

[UPSKILLING — fonctionnel]
Recruteur expand un profil → clic "Analyser le matching IA"
→ GET /api/hrflow/upskill?profile_key=...&job_key=... → analyse SWOT (forces + gaps)

[Q&A — fonctionnel]
Recruteur clique "Poser une question" sur un profil
→ GET /api/hrflow/ask → reponse IA depuis le CV reel → affichee dans le chat

[DEMO]
Script anime dans Dashboard.tsx (PIPELINE_SCRIPT) :
→ Messages chat + events feed scriptes sur timers
→ Vrais appels HrFlow (jobs → scoring → profils)
→ Summary top 3 avec scores dans le chat
→ Le recruteur peut ensuite interagir (Q&A reel, SWOT)

[LIVE — FONCTIONNEL]
Telegram audio → OpenClaw webhook → Dashboard :
→ Extraction NLP criteres depuis la query recruteur
→ GitHub/LinkedIn : echec gracieux (tokens non configures)
→ Matching job intelligent (mots-cles vs 100 jobs du board)
→ Scoring IA profils vs job matche → top 20
→ SWOT + Q&A disponibles sur chaque profil

[OUTBOUND — nice-to-have]
Sourcing passif GitHub / LinkedIn → non implemente
```

---

## Regles d'implementation

1. **Le moment wow d'abord** — pipeline inbound fonctionnel avant toute autre feature
2. **Demo demoable a tout instant** — jamais de "ca marche pas mais ca va marcher"
3. **Streaming partout** — chaque reponse LLM est streamee, jamais de loader statique
4. **Pas d'auth/login** — perte de temps
5. **Pas de base de donnees custom** — HrFlow est le backend
6. **Donnees realistes** — 10k profils demo + 1k jobs demo deja charges

---

## Repos

- Code : https://github.com/Symbioose/hrflow_hackathon_2026
- Doc HrFlow scrappee : https://github.com/Symbioose/hrflow_docs
- Labs HrFlow : https://labs.hrflow.ai
- Doc dev HrFlow : https://developers.hrflow.ai
