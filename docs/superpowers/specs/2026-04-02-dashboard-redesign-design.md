# Claw4HR Dashboard Redesign — Design Spec
**Date:** 2026-04-02  
**Status:** Approved  
**Audience:** Hackathon HrFlow 2026 — jury RH

---

## 1. Contexte & Objectif

Remplacer le dashboard "mission control" sombre (3 colonnes fixes) par une interface légère, épurée et impressionnante pour un jury RH. Le dashboard doit fonctionner en démo live en 4 minutes devant des non-techniciens.

**Demo-first :** chaque état doit être démo-able à tout instant, avec des fallbacks gracieux si un connecteur échoue.

---

## 2. Design System

Reprend exactement la landing page — aucune divergence.

| Token | Valeur | Usage |
|---|---|---|
| `CORAL` | `#FF6B6B` | Accent principal, CTAs, score élevé |
| `CORAL_DARK` | `#E85555` | Hover states |
| `CREAM` | `#FFF5F0` | Background principal |
| `CREAM_MID` | `#F5EDE6` | Cards, surfaces |
| `INK` | `#1a1a2e` | Texte principal |
| `NAVY` | `#0B1226` | Sections dark, header profile |
| `MUTED` | `#6b7280` | Texte secondaire |
| `SUCCESS` | `#10b981` | Score élevé (>70%) |
| `AMBER` | `#f59e0b` | Score moyen (40-70%) |
| `ROSE` | `#f43f5e` | Score bas (<40%) |

**Typographie :**
- Display / Titres : `var(--font-display), 'Georgia', serif` (comme landing)
- Corps : `system-ui, sans-serif`
- Données techniques (scores, keys, timestamps) : `font-mono`

**Composants UI récurrents :**
- `PixelBtn` : pixel button avec shadow 4px offset, repris tel quel de la landing
- `Reveal` : fade-up on scroll/mount (200ms delay stagger)
- Cards : `background: CREAM_MID`, `border: 1px solid INK/08`, `border-radius: 12px`, hover → shadow coral léger

---

## 3. Architecture des États

Le dashboard est une **SPA à 4 états** gérés par un state machine dans `Dashboard.tsx`.

```
SEARCH → LOADING → RESULTS → PROFILE_DETAIL
           ↑___________________________|
           (back button retourne RESULTS)
```

Pas de routing Next.js — tout est géré dans un seul composant racine avec un `dashboardState` enum.

---

## 4. État 1 — SEARCH

**But :** Premier contact avec le recruteur. Simple, élégant, inspire confiance.

**Layout :**
- Fond `CREAM`, centré verticalement
- Logo Claw4HR + tagline serif en haut
- Barre de recherche pill centrée (grande, `max-width: 640px`) avec icône loupe coral, placeholder *"Dev Python senior à Paris..."*
- 3 chips de suggestions cliquables sous la barre (`ex: Data Scientist ML • Lead Dev React • DevOps AWS`)
- Connecteurs actifs affichés en bas : badges LinkedIn / GitHub / Reddit / Indeed* / HelloWork* avec point vert/gris

**Interactions :**
- `Enter` ou clic loupe → transition vers LOADING
- Clic sur un chip → remplit la barre + déclenche la recherche

---

## 5. État 2 — LOADING (Pixel Agents)

**But :** Moment "wow" — l'agent est visiblement en train de travailler. Impressionnant pour le jury.

**Layout :**
- Barre de recherche compacte remonte en header (navbar)
- Zone centrale : canvas 100% width avec les agents pixel art animés
- Titre : *"Recherche en cours..."* en serif INK

**Animation Pixel Agents :**

Chaque connecteur actif = 1 agent pixel art 16×16 animé en CSS (`steps()`).

| Agent | Icône pixel | Label | Couleur accent |
|---|---|---|---|
| GitHub | Octocat stylisé | "Scanning repos..." | `#24292e` |
| LinkedIn | Bonhomme avec valise | "Sourcing profiles..." | `#0077b5` |
| Reddit | Alien pixel | "Mining threads..." | `#ff4500` |
| Internet | Planète pixel | "Crawling web..." | `#6b7280` |
| Indeed* | Bonhomme avec CV | "Parsing jobs..." | `#2164f3` |

Chaque agent :
1. Apparaît depuis le bas-gauche avec une animation `bounce-in`
2. Court vers un "serveur" (rectangle pixel art) labelisé avec le nom du connecteur
3. Une fois arrivé : animation "working" (agent saute sur place ou tape sur clavier)
4. Quand les données arrivent via webhook : check vert ✓ + agent disparaît avec `pop-out`
5. Un compteur "+N profils trouvés" s'incrémente à chaque batch reçu

**Implémentation technique :**
- Pas de librairie externe — CSS pur avec sprite sheets SVG inline + `animation: steps(4)`
- Les agents sont des composants React (`<PixelAgent source="github" state="working" />`)
- L'état de chaque agent (`idle | running | done | error`) est mis à jour via les events du webhook

**Transition → RESULTS :**
- Automatique quand le premier batch de profils arrive (minimum 3 profils)
- Les agents restants continuent en arrière-plan (barre de progression discrète dans le header)

---

## 6. État 3 — RESULTS

**But :** Le recruteur voit les candidats, compare, sélectionne.

**Layout :**
- Header : logo compact + barre de recherche active + `X profils trouvés` + spinner si encore en cours
- Grille responsive : `3 col desktop / 2 col tablet / 1 col mobile`
- Cards en stagger reveal (150ms entre chaque)

**CandidateCard :**

```
┌─────────────────────────────────┐
│ [Avatar initiales coral]  Score │  ← ring SVG coloré (vert/orange/rouge)
│ Nom Prénom                 85%  │
│ Titre du poste                  │
│ 📍 Paris  •  5 ans XP           │
│                                 │
│ [GitHub] [LinkedIn] [Reddit]    │  ← badges sources où il a été trouvé
│                                 │
│ Python  React  AWS  +3          │  ← skills chips
│                                 │
│        [Voir le profil →]       │  ← PixelBtn coral
└─────────────────────────────────┘
```

**Tri :** Boutons en header — `Score ↓` (défaut) | `Score ↑` | `≥70%` | `Ordre d'arrivée`

---

## 7. État 4 — PROFILE_DETAIL

**But :** Le recruteur explore un candidat en profondeur et peut poser des questions.

**Layout :**
- `← Retour aux résultats` en haut à gauche (PixelBtn outline)
- Header dark (NAVY) : avatar grand, nom, titre, score ring, badges sources
- Contenu en 2 colonnes :
  - **Gauche (60%)** : profil reconstruit — expériences, formations, compétences, langues, summary
  - **Droite (40%)** : panneau Q&A

**Profil reconstruit :**
Le profil est construit à partir des données web collectées. Structure déterministe :
```typescript
interface SourcedProfile {
  key: string
  name: string
  title: string
  location: string
  experience_years: number
  summary: string          // généré par OpenClaw LLM depuis les données web
  sources: ProfileSource[] // [{type: "github"|"linkedin"|"reddit", url: string}]
  skills: string[]
  experiences: ReconstructedExperience[]
  educations: ReconstructedEducation[]
  hrflow_score: number     // 0-100, retourné par HrFlow scoring
  hrflow_key: string       // pour Q&A et upskilling
}
```

**Panneau Q&A (droite) :**
- Titre : *"Assistant IA"* avec avatar coral
- Message initial auto-généré au chargement : synthèse du candidat en 3 bullets
- Input message en bas
- Streaming des réponses (pas de loader statique)
- Appelle `GET /api/hrflow/ask?profile_key=...&question=...`

---

## 8. Flux de Données

```
[Recruteur tape query]
  → Dashboard envoie query à OpenClaw via POST /api/openclaw/trigger
  → OpenClaw lance les sub-agents (GitHub, LinkedIn, Reddit, Internet)
  → OpenClaw poste les profils trouvés via POST /api/openclaw/webhook
     {"channel": "profile", "payload": SourcedProfile}
  → Dashboard reçoit les profils (polling /api/openclaw/events)
  → Pour chaque profil : POST /api/hrflow/parse (si pas de hrflow_key)
  → GET /api/hrflow/score → hrflow_score mis à jour
  → Card apparaît dans la grille avec score
```

**Nouveaux channels webhook OpenClaw :**
```json
// Profil trouvé (nouveau)
{"channel": "profile", "payload": {SourcedProfile}}

// Statut agent (existant, enrichi)
{"channel": "feed", "payload": {"action": "GitHub scan", "source": "github", "status": "running"}}

// Batch de profils (optimisation)
{"profiles": [SourcedProfile, ...]}
```

---

## 9. Composants à créer / modifier

### Nouveaux composants
| Fichier | Rôle |
|---|---|
| `app/components/SearchView.tsx` | État SEARCH — barre + suggestions + connecteurs |
| `app/components/LoadingView.tsx` | État LOADING — pixel agents canvas animation |
| `app/components/ResultsView.tsx` | État RESULTS — grille de cartes |
| `app/components/ProfileDetailView.tsx` | État PROFILE_DETAIL — fiche + Q&A |
| `app/components/CandidateCard.tsx` | Card individuelle extraite de CandidatePanel |
| `app/components/PixelAgent.tsx` | Agent pixel art animé (SVG + CSS steps) |
| `app/components/QAPanel.tsx` | Chat Q&A extrait de WhatsAppPanel |
| `app/components/ScoreRing.tsx` | Ring SVG animé (extrait de CandidatePanel) |

### Composants supprimés / remplacés
- `WhatsAppPanel.tsx` → remplacé par `QAPanel.tsx` (même logique, design landing)
- `AgentFeed.tsx` → remplacé par l'animation pixel dans `LoadingView.tsx` + barre discrète dans header
- `CandidatePanel.tsx` → décomposé en `ResultsView.tsx` + `CandidateCard.tsx` + `ProfileDetailView.tsx`
- `TopBar.tsx` → remplacé par un header contextuel (différent par état)

### Modifié
| Fichier | Changement |
|---|---|
| `Dashboard.tsx` | State machine 4 états, logique webhook inchangée |
| `app/lib/types.ts` | Ajout `SourcedProfile`, `ProfileSource`, `ReconstructedExperience` |
| `app/globals.css` | Ajout tokens CSS landing (CORAL, CREAM, INK, NAVY) dans `:root` |

---

## 10. API Routes à ajouter

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/openclaw/trigger` | POST | Envoie la query à OpenClaw pour lancer la recherche |

L'endpoint webhook + events existants (`/api/openclaw/webhook`, `/api/openclaw/events`) restent inchangés, enrichis avec le channel `"profile"`.

---

## 11. Contraintes & Règles

1. **Demo-first** : si OpenClaw ne répond pas → fallback sur 3-5 profils mockés hardcodés de qualité (pas d'écran vide)
2. **Streaming partout** : Q&A streamé, cartes apparaissent progressivement (jamais de loader statique plein écran)
3. **Déterministe** : la structure `SourcedProfile` est toujours complète, jamais de champs `undefined` visibles
4. **Pas d'auth** : aucune page de login
5. **Pas de base HrFlow demo** : les 10 000 profils de démo ne sont plus utilisés
6. **Production-ready** : pas de `console.log`, pas de `TODO` visible, TypeScript strict

---

## 12. Tâches futures (hors scope hackathon)

- **#2** Intégration Supabase/Convex pour persistance
- **#3** Historique des recherches sauvegardé
- **#4** Onglet Profils Favoris
- Connecteurs supplémentaires : Stack Overflow, HackerNews, YouTube talks
