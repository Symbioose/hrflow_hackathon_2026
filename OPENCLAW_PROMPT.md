# OpenClaw Skill Update — Claw4HR Dashboard Integration

**URGENT:** Ton skill actuel envoie un format complètement incompatible avec le nouveau dashboard. Voici EXACTEMENT ce qui doit changer.

## 🔴 PROBLÈMES CRITIQUES

### 1. Le webhook reçoit le MAUVAIS format
**CE QUE TU FAIS:**
```bash
curl -X POST .../webhook -d '{"channel":"profiles","payload":{"profiles":[...]}}'
```

**CE QUI EST ATTENDU:**
```bash
curl -X POST .../webhook -d '{"profiles":[...]}'
```

La clé est `"profiles"` (array direct), pas `"channel":"profiles"` dans le payload.

### 2. La structure du profil est COMPLÈTEMENT DIFFÉRENTE

**CE QUE TU ENVOIES:**
```json
{
  "name": "Nom",
  "title": "Titre",
  "location": "Ville",
  "skills": ["Python"],
  "source": "github",
  "url": "https://github.com/...",
  "avatar": "https://avatars...",
  "score": 85
}
```

**CE QUI EST ATTENDU** (structure SourcedProfile exacte):
```json
{
  "key": "unique-uuid-ou-hash",
  "name": "Nom Complet",
  "title": "Job Title",
  "location": "City, Country",
  "experience_years": 5,
  "summary": "Résumé IA de leur background et forces clés (2-3 phrases)",
  "sources": [
    {
      "type": "github",
      "url": "https://github.com/username",
      "label": "github.com/username"
    }
  ],
  "skills": ["Python", "React", "TypeScript", "PostgreSQL", "Docker"],
  "experiences": [
    {
      "title": "Senior Engineer",
      "company": "Company Name",
      "location": "City",
      "period": "2022 — 2024",
      "description": "Ce qu'ils ont fait et achievements"
    }
  ],
  "educations": [
    {
      "degree": "Master Computer Science",
      "school": "University Name",
      "period": "2018 — 2020"
    }
  ],
  "hrflow_score": -1,
  "hrflow_key": null,
  "avatar_color": "#FF6B6B"
}
```

### 3. Champs MANQUANTS

Tu dois ajouter:
- ✅ `key`: Unique identifier (UUID ou hash du profil)
- ✅ `experience_years`: Nombre estimé d'années d'expérience
- ✅ `summary`: **CRITIQUE** — Résumé IA 2-3 phrases expliquant leur background et pertinence
- ✅ `sources`: Array d'objets avec `{type, url, label}`, pas un string source
- ✅ `experiences`: Array avec `{title, company, location, period, description}`
- ✅ `educations`: Array avec `{degree, school, period}`
- ✅ `hrflow_score`: Toujours `-1` initialement (frontend appellera HrFlow après)
- ✅ `hrflow_key`: Toujours `null` (c'est pour les profils internes HrFlow uniquement)
- ✅ `avatar_color`: Couleur hex basée sur la source dominante, pas URL

### 4. Format sources — IMPORTANT

**TOI:**
```json
"source": "github"
```

**CORRECT:**
```json
"sources": [
  {
    "type": "github",
    "url": "https://github.com/username",
    "label": "github.com/username"
  },
  {
    "type": "linkedin",
    "url": "https://linkedin.com/in/username",
    "label": "linkedin.com/in/username"
  }
]
```

Types valides: `"github"`, `"linkedin"`, `"reddit"`, `"internet"`

### 5. Avatar — CHANGE

**TOI:**
```json
"avatar": "https://avatars.githubusercontent.com/u/ID"
```

**CORRECT:**
```json
"avatar_color": "#FF6B6B"
```

Choisir la couleur selon la source:
- GitHub: `#FF6B6B` (coral)
- LinkedIn: `#0077b5` (bleu)
- Reddit: `#ff4500` (orange)
- Internet/autre: `#7C3AED` (purple)

### 6. Feed events — FORMAT CHANGE

**TOI:**
```bash
{"channel":"feed","payload":{"action":"Sourcing GitHub","detail":"X profils","status":"done","feedType":"source"}}
```

**CORRECT:**
```bash
{"channel":"feed","payload":{"source":"github","status":"done"}}
```

Les valeurs de `source`: `"github"`, `"linkedin"`, `"reddit"`, `"internet"`
Les valeurs de `status`: `"running"`, `"done"`, `"error"`

### 7. Channels invalides à SUPPRIMER

Ces channels n'existent pas et doivent être supprimés:
- ❌ `"channel":"profiles"` → Utilise directement `{"profiles":[...]}`
- ❌ `"channel":"action"` avec `fetch_profiles` ou `send_summary`
- ❌ `"feedType":"source"` ou `"feedType":"parse"` ou `"feedType":"score"`

Les seuls channels valides sont:
- ✅ `"profile"` pour un seul profil: `{"channel":"profile","payload":{"profile":{...}}}`
- ✅ Batch via body direct: `{"profiles":[...]}`
- ✅ `"feed"` pour les mises à jour agent: `{"channel":"feed","payload":{"source":"...","status":"..."}}`

### 8. Trigger du skill — MANQUE COMPLÈTEMENT

Tu dois ajouter comment le skill reçoit la requête du dashboard.

**À AJOUTER:**
Le dashboard POST à `/api/openclaw/trigger` avec:
```json
{"query": "Data Scientist Paris 5 ans React"}
```

Ton skill doit:
1. Reçevoir cette requête (via webhook ou API)
2. Parser la query
3. Lancer le sourcing
4. Envoyer les profils AU FUR ET A MESURE (pas à la fin)

## ✅ CE QUI DOIT RESTER

- ✅ Sourcing GitHub (API GitHub)
- ✅ Sourcing LinkedIn (web_search uniquement, pas web_fetch)
- ✅ Sourcing CV-thèques (web_search + HrFlow API)
- ✅ Parsing des profils trouvés
- ✅ HrFlow scoring (optionnel — frontend le fait après)

## 📋 CHECKLIST DE VALIDATION

Avant de soumettre le skill modifié, **VÉRIFY:**

- [ ] Chaque profil a les 13 champs requis: `key`, `name`, `title`, `location`, `experience_years`, `summary`, `sources` (array), `skills`, `experiences`, `educations`, `hrflow_score`, `hrflow_key`, `avatar_color`
- [ ] `sources` est un array d'objets avec `{type, url, label}`
- [ ] `hrflow_score` est toujours `-1` (pas `score`)
- [ ] `avatar_color` est un string hex (pas URL)
- [ ] `summary` est présent et 2-3 phrases
- [ ] `experience_years` est un nombre
- [ ] Les feed events utilisent seulement: `{"channel":"feed","payload":{"source":"...","status":"..."}}`
- [ ] Pas de `"channel":"profiles"`, `"channel":"action"`, ou `"feedType"`
- [ ] Les profils sont envoyés AU FUR ET A MESURE (pas tous à la fin)
- [ ] Format webhook correct: curl avec `-d '{"profiles":[...]}'` (pas nested dans payload)

## 📊 EXEMPLE DE PROFIL COMPLET VALIDE

```json
{
  "key": "gh-sophie-marchand-001",
  "name": "Sophie Marchand",
  "title": "Senior Data Scientist",
  "location": "Paris, France",
  "experience_years": 6,
  "summary": "Data Scientist spécialisée en NLP et Computer Vision avec 6 ans d'expérience. Contributrice GitHub active avec +200 stars. Expertise MLOps et big data.",
  "sources": [
    {
      "type": "github",
      "url": "https://github.com/s-marchand",
      "label": "github.com/s-marchand"
    },
    {
      "type": "linkedin",
      "url": "https://linkedin.com/in/s-marchand",
      "label": "linkedin.com/in/s-marchand"
    }
  ],
  "skills": ["Python", "PyTorch", "NLP", "scikit-learn", "SQL", "Docker", "Spark"],
  "experiences": [
    {
      "title": "Senior Data Scientist",
      "company": "Criteo",
      "location": "Paris",
      "period": "2021 — 2024",
      "description": "Modèles de recommandation publicitaire, A/B testing à grande échelle. Pipeline ML en production (100M+ prédictions/jour)."
    },
    {
      "title": "Data Scientist",
      "company": "BNP Paribas",
      "location": "Paris",
      "period": "2018 — 2021",
      "description": "Détection de fraude temps réel, scoring crédit, NLP sur données clients."
    }
  ],
  "educations": [
    {
      "degree": "Master Data Science & IA",
      "school": "École Polytechnique",
      "period": "2016 — 2018"
    }
  ],
  "hrflow_score": -1,
  "hrflow_key": null,
  "avatar_color": "#FF6B6B"
}
```

## 🚀 COMMANDES curl À UTILISER

**Envoyer un batch de profils:**
```bash
curl -s -X POST https://hrflow-hackathon-2026.vercel.app/api/openclaw/webhook \
  -H "Content-Type: application/json" \
  -d '{"profiles":[{...profil1...},{...profil2...}]}'
```

**Notifier la progression d'un agent:**
```bash
curl -s -X POST https://hrflow-hackathon-2026.vercel.app/api/openclaw/webhook \
  -H "Content-Type: application/json" \
  -d '{"channel":"feed","payload":{"source":"github","status":"done"}}'
```

## ⚠️ POINTS CRITIQUES

1. **Envoie les profils IMMÉDIATEMENT** au fur et à mesure, pas tous à la fin
2. **`summary` est IA-généré** — c'est ce que le recruiter voit d'abord
3. **`hrflow_score: -1` au départ** — le frontend appellera HrFlow API après
4. **Pas de `channel:"action"`** — supprime complètement ces appels
5. **Format webhook direct**: `{"profiles":[...]}`, pas de channel wrapper

## 📍 CODE À CONSULTER

- Dashboard logic: `app/components/Dashboard.tsx:98-122` (trigger, demo fallback, SSE)
- Webhook handler: `app/api/openclaw/webhook/route.ts` (accepte `{"profiles":[...]}` ou `{"channel":"..."}`)
- Types exactes: `app/lib/types.ts` (SourcedProfile structure)

---

**ACTION:** Modifie ton skill avec ces changements, puis réponds avec:
1. Confirmation que tu as changé le format des profils
2. Confirmation que tu envoies les feed events en format correct
3. Confirmation que tu supprimes tous les `"channel":"action"` et `"channel":"profiles"`
4. Un exemple de curl que tu vas exécuter pour envoyer un profil

Une fois confirmé, le dashboard recevra les profils en real-time et les affichera correctement.
