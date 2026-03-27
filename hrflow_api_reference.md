# HrFlow.ai — Documentation API Complète v2 (Référence Agent IA)

> **Usage :** Ce document est la référence exhaustive et à jour de l'API HrFlow.ai, conçue pour être utilisée par un agent IA lors du hackathon GenAI & RH (27-28 mars 2026). Il couvre l'intégralité des endpoints, structures de données, exemples et bonnes pratiques.
>
> **Source :** Scrapé depuis https://developers.hrflow.ai/reference (mars 2026) + doc existante enrichie.

---

## Table des matières

1. [Concepts clés & Architecture](#1-concepts-clés--architecture)
2. [Authentification](#2-authentification)
3. [Objets de données (Schemas)](#3-objets-de-données-schemas)
4. [Sources & Boards](#4-sources--boards)
5. [Profile API — Stockage](#5-profile-api--stockage)
6. [Profile API — Intelligence IA](#6-profile-api--intelligence-ia)
7. [Job API — Stockage](#7-job-api--stockage)
8. [Job API — Intelligence IA](#8-job-api--intelligence-ia)
9. [Text API](#9-text-api)
10. [Signal API](#10-signal-api)
11. [Workflows](#11-workflows)
12. [Codes de statut HTTP](#12-codes-de-statut-http)
13. [SDK — Installation & initialisation](#13-sdk--installation--initialisation)
14. [Patterns d'usage & Hackathon tips](#14-patterns-dusage--hackathon-tips)

---

## 1. Concepts clés & Architecture

**HrFlow.ai** est une plateforme API-first d'IA pour les RH. Elle combine Vision par ordinateur et NLP pour extraire, structurer, indexer et matcher des données RH.

### Concepts fondamentaux

| Concept | Description |
|---|---|
| **Source** | Conteneur de profils (CV). Identifié par `source_key`. |
| **Board** | Conteneur de jobs (offres d'emploi). Identifié par `board_key`. |
| **Profile** | Représentation structurée d'un candidat. Identifié par `key`. |
| **Job** | Représentation structurée d'une offre d'emploi. Identifié par `key`. |
| **Parsing** | Extraction d'entités structurées depuis un document brut. |
| **Indexing** | Stockage d'un objet pour le rendre searchable/scorable. |
| **Embedding** | Représentation vectorielle (vecteurs cross-lingues HR-natifs). |
| **Searching** | Recherche par filtres (sans scoring IA). |
| **Scoring** | Matching IA profil↔job (score 0-1). |
| **Matching** | Matching IA profil↔profil ou job↔job (similarité). |
| **Grading** | Évaluation détaillée d'un profil pour un job. |
| **Asking** | Questions en langage naturel sur un profil ou job. |
| **Unfolding** | Prédiction de la trajectoire de carrière future. |
| **Upskilling/Explain** | Explication IA d'une recommandation profil↔job. |
| **Tagging** | Prédiction de tags pour un texte (classification IA). |
| **Tags** | Métadonnées `{name, value}` attachées à un profil/job. |
| **Labels** | Décisions RH : stage (yes/no/later/new), rating. |
| **Signal API** | Ratings et trackings pour le feedback utilisateur. |

### Base URL

```
https://api.hrflow.ai/v1
```

### Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        HrFlow.ai API v1                          │
│                                                                  │
│  ┌──────────────┐              ┌──────────────┐                 │
│  │   SOURCES     │              │    BOARDS     │                │
│  │  (Profiles)   │              │    (Jobs)     │                │
│  └──────┬───────┘              └──────┬───────┘                 │
│         │                             │                          │
│    ┌────▼─────┐                  ┌────▼─────┐                   │
│    │ PROFILES  │                  │   JOBS    │                   │
│    │ index/edit│                  │ index/edit│                   │
│    │ parse     │                  │ archive   │                   │
│    │ archive   │                  │ list/get  │                   │
│    │ list/get  │                  └────┬──────┘                   │
│    └────┬──────┘                       │                          │
│         │                              │                          │
│         └──────────────┬───────────────┘                          │
│                        │                                          │
│           ┌────────────▼────────────────┐                        │
│           │      AI ENGINE (🧠)          │                        │
│           │  searching / scoring         │                        │
│           │  matching / grading          │                        │
│           │  asking / unfolding          │                        │
│           │  explain (upskilling)        │                        │
│           │  vectorize (embedding)       │                        │
│           └─────────────────────────────┘                        │
│                                                                  │
│  ┌──────────────────────┐  ┌────────────────────┐               │
│  │    TEXT API (🧠)       │  │   SIGNAL API (⭐)   │               │
│  │  parse / tag          │  │  rate / track        │               │
│  │  vectorize / geocode  │  │  get ratings/tracks  │               │
│  │  OCR / imaging        │  └────────────────────┘               │
│  │  synonyms / linking   │                                       │
│  └──────────────────────┘                                        │
└──────────────────────────────────────────────────────────────────┘
```

### Flux typique

1. **Ingestion CV** → `POST /profile/parsing/file` → obtenir `profile.key`
2. **Indexation offre** → `POST /job/indexing` → obtenir `job.key`
3. **Scoring** → `GET /profiles/scoring` (profils pour un job) ou `GET /jobs/scoring` (jobs pour un profil)
4. **Explication** → `GET /profile/upskilling` pour comprendre le score
5. **Questions** → `GET /profile/asking` pour interroger un profil en langage naturel

---

## 2. Authentification

### Endpoint de test

```
GET https://api.hrflow.ai/v1/auth
```

### Headers requis (TOUTES les requêtes)

```http
X-API-KEY: <votre_clé_secrète>
X-USER-EMAIL: <votre_email_utilisateur>
```

### Niveaux de permissions

| Permission | Usage | Côté |
|---|---|---|
| `WRITE` | Envoyer des données (parsing, indexing) | Front-end possible |
| `READ` | Lire des données (searching, scoring) | Serveur uniquement |
| `READ & WRITE` (`all`) | Toutes permissions | Serveur uniquement |

### Réponse auth réussie

```json
{
  "code": 200,
  "message": "API Access Success",
  "data": {
    "team_name": "teslamotors",
    "team_subdomain": "teslamotors",
    "request_origin": "https://developers.hrflow.ai",
    "api_secret_permission": "all"
  }
}
```

### Réponse auth échouée

```json
{
  "code": 401,
  "message": "Unauthorized. Invalid secret key: [key] for permission: all"
}
```

### Exemple cURL

```bash
curl https://api.hrflow.ai/v1/auth \
  -H "X-API-KEY: YOUR_API_KEY" \
  -H "X-USER-EMAIL: your@email.com"
```

---

## 3. Objets de données (Schemas)

### 3.1 Objet Location

```json
{
  "text": "Paris, France",
  "lat": 48.8566,
  "lng": 2.3522
}
```

| Champ | Type | Requis | Description |
|---|---|---|---|
| `text` | string | oui | Adresse textuelle |
| `lat` | float | oui | Latitude (-90 à 90) |
| `lng` | float | oui | Longitude (-180 à 180) |

### 3.2 Objet Skill

```json
{"name": "python", "type": "hard", "value": null}
```

| Champ | Type | Description |
|---|---|---|
| `name` | string | Nom de la compétence |
| `type` | string | `"hard"` ou `"soft"` |
| `value` | string/null | Niveau ou score optionnel |

### 3.3 Objets génériques (name/value)

Utilisé pour : **Languages, Certifications, Courses, Tasks, Interests, Tags, Metadatas**

```json
{"name": "english", "value": "fluent"}
{"name": "active", "value": true}
```

### 3.4 Objet Source

| Champ | Type | Description |
|---|---|---|
| `key` | string | Identifiant unique |
| `name` | string | Nom personnalisé |
| `description` | string | Description |
| `type` | string | Type (ex: `"api"`) |
| `subtype` | string | Sous-type (ex: `"http_api"`) |
| `environment` | string | `"production"`, `"staging"`, `"test"` |
| `private` | boolean | `1` = accès restreint (défaut: `0`) |
| `disable` | boolean | `1` = n'accepte plus de profils (défaut: `0`) |
| `status` | boolean | Monitoring uptime |
| `sync_parsing` | int | Parsing temps réel activé ou non |
| `members` | array[string] | Emails des membres |
| `user` | object | Créateur |
| `archived_at` | datetime | Null si actif |
| `updated_at` | datetime | Dernière modification |
| `created_at` | datetime | Date de création |

### 3.5 Objet Board

| Champ | Type | Description |
|---|---|---|
| `key` | string | Identifiant unique |
| `name` | string | Nom personnalisé |
| `description` | string | Description |
| `type` | string | Type (ex: `"api"`) |
| `subtype` | string | Sous-type |
| `environment` | string | Environnement |
| `private` | boolean | Accès restreint (défaut: `0`) |
| `disable` | boolean | N'accepte plus de jobs (défaut: `0`) |
| `status` | boolean | Monitoring uptime |
| `members` | array[string] | Emails des membres |
| `user` | object | Créateur |
| `archived_at` | datetime | Null si actif |
| `updated_at` | datetime | Dernière modification |
| `created_at` | datetime | Date de création |

### 3.6 Objet Profile (complet)

```json
{
  "key": "profile_unique_key",
  "reference": "ref_interne_unique_par_source",
  "text_language": "fr",
  "text": "texte complet du profil",
  "consent_algorithmic": {
    "owner": {
      "parsing": true,
      "revealing": true,
      "embedding": true,
      "searching": true,
      "scoring": true,
      "upskilling": true
    },
    "controller": {
      "parsing": true,
      "revealing": true,
      "embedding": true,
      "searching": true,
      "scoring": true,
      "upskilling": true
    }
  },
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-06-01T12:00:00",
  "archived_at": null,
  "experiences_duration": 4.3,
  "educations_duration": 2.0,
  "info": {
    "full_name": "Harry Potter",
    "first_name": "Harry",
    "last_name": "Potter",
    "email": "harry.potter@hogwarts.com",
    "phone": "+33600000000",
    "driving_license": null,
    "date_birth": "1980-07-31T00:00:00",
    "gender": null,
    "picture": null,
    "summary": "Experienced wizard and Python developer.",
    "location": {
      "text": "London, UK",
      "lat": 51.5074,
      "lng": -0.1278
    },
    "urls": {
      "linkedin": "https://linkedin.com/in/harry-potter",
      "github": "https://github.com/harrypotter",
      "twitter": null,
      "facebook": null,
      "from_resume": []
    }
  },
  "experiences": [
    {
      "key": "exp_key",
      "company": "Ministry of Magic",
      "logo": null,
      "title": "Senior Python Engineer",
      "description": "Built scalable spell-casting systems.",
      "location": {"text": "London", "lat": 51.5074, "lng": -0.1278},
      "date_start": "2018-09-01T00:00:00",
      "date_end": "2023-01-01T00:00:00",
      "skills": [{"name": "Python", "type": "hard", "value": null}],
      "certifications": [],
      "courses": [],
      "tasks": [],
      "languages": [],
      "interests": []
    }
  ],
  "educations": [
    {
      "key": "edu_key",
      "school": "Hogwarts School",
      "logo": null,
      "title": "Master in Applied Magic & Data Science",
      "description": "Specialization in predictive spells.",
      "location": {"text": "Scotland", "lat": 57.0, "lng": -4.0},
      "date_start": "2014-09-01T00:00:00",
      "date_end": "2016-06-01T00:00:00",
      "skills": [],
      "certifications": [],
      "courses": [],
      "tasks": [],
      "languages": [],
      "interests": []
    }
  ],
  "attachments": [
    {
      "type": "resume",
      "alt": "CV",
      "file_size": "125000",
      "file_name": "cv_harry.pdf",
      "original_file_name": "Harry_Potter_CV.pdf",
      "extension": ".pdf",
      "public_url": "https://...",
      "updated_at": "2024-01-01T00:00:00",
      "created_at": "2024-01-01T00:00:00"
    }
  ],
  "skills": [
    {"name": "Python", "type": "hard", "value": null},
    {"name": "Machine Learning", "type": "hard", "value": "0.9"},
    {"name": "Leadership", "type": "soft", "value": null}
  ],
  "languages": [{"name": "english", "value": "fluent"}, {"name": "french", "value": "intermediate"}],
  "certifications": [{"name": "AWS Certified Developer", "value": null}],
  "courses": [],
  "tasks": [],
  "interests": [{"name": "Quidditch Analytics", "value": null}],
  "tags": [{"name": "blacklist", "value": false}, {"name": "source_channel", "value": "linkedin"}],
  "metadatas": [{"name": "internal_id", "value": "EMP-42"}],
  "labels": [
    {
      "board_key": "board_abc",
      "job_key": "job_abc123",
      "job_reference": "JOB-2024-001",
      "stage": "yes",
      "rating": 0.85,
      "date_rating": "2024-01-15T14:51:07",
      "date_stage": "2024-01-15T14:51:07"
    }
  ]
}
```

**Valeurs `stage` :** `"new"`, `"yes"`, `"later"`, `"no"`

### 3.7 Objet Job (complet)

```json
{
  "key": "job_unique_key",
  "reference": "JOB-2024-001",
  "name": "Senior Data Engineer",
  "url": "https://company.com/jobs/data-engineer",
  "summary": "Description du poste...",
  "created_at": "2024-01-15T09:00:00",
  "updated_at": "2024-02-01T10:00:00",
  "archived_at": null,
  "location": {"text": "Paris, France", "lat": 48.8566, "lng": 2.3522},
  "sections": [
    {"name": "missions", "title": "Vos missions", "description": "..."},
    {"name": "profile", "title": "Profil recherché", "description": "..."}
  ],
  "culture": "Décrit les valeurs, l'environnement de travail...",
  "benefits": "Avantages offerts aux employés...",
  "responsibilities": "Devoirs et tâches attendus...",
  "requirements": "Qualifications et compétences nécessaires...",
  "interviews": "Processus et étapes d'entretien...",
  "skills": [
    {"name": "python", "type": "hard", "value": null},
    {"name": "spark", "type": "hard", "value": "0.9"}
  ],
  "languages": [{"name": "french", "value": "1"}, {"name": "english", "value": "0.7"}],
  "certifications": [{"name": "AWS Certified Data Analytics", "value": null}],
  "courses": [{"name": "Statistics", "value": null}],
  "tasks": [{"name": "Design data pipelines", "value": null}],
  "interests": [],
  "tags": [{"name": "contract_type", "value": "CDI"}, {"name": "remote", "value": true}],
  "metadatas": [{"name": "department", "value": "Engineering"}],
  "ranges_float": [{"name": "salary", "value_min": 55000, "value_max": 75000, "unit": "eur"}],
  "ranges_date": [{"name": "availability", "value_min": "2024-02-01T00:00", "value_max": "2024-06-01T00:00"}]
}
```

> **Note :** `sections` est **déprécié**. Utiliser `culture`, `benefits`, `responsibilities`, `requirements`, `interviews` à la place.

### 3.8 Objet Ranges Float

```json
{"name": "salary", "value_min": 55000, "value_max": 75000, "unit": "eur"}
```

### 3.9 Objet Ranges Date

```json
{"name": "availability", "value_min": "2024-02-01T00:00", "value_max": "2024-06-01T00:00"}
```

### 3.10 Structure de réponse standard

```json
{
  "code": 200,
  "message": "Description",
  "meta": {
    "page": 1,
    "maxPage": 5,
    "count": 30,
    "total": 147
  },
  "data": { ... }
}
```

---

## 4. Sources & Boards

### GET /sources — Lister les sources

```
GET https://api.hrflow.ai/v1/sources
```

**Headers :** `X-API-KEY`, `X-USER-EMAIL`

**Réponse 200 :**
```json
{
  "code": 200,
  "message": "Source list",
  "data": [
    {
      "key": "source_key_abc",
      "name": "Candidats LinkedIn",
      "type": "api",
      "subtype": "http_api",
      "environment": "production",
      "sync_parsing": 1,
      "created_at": "2020-01-01T00:00:00"
    }
  ]
}
```

### GET /source — Détail d'une source

```
GET https://api.hrflow.ai/v1/source
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `key` | string | oui | Source key |
| `stats` | int32 | non | Retourner le nombre de profils |
| `details` | int32 | non | Retourner les infos avancées |

### GET /boards — Lister les boards

```
GET https://api.hrflow.ai/v1/boards
```

### GET /board — Détail d'un board

```
GET https://api.hrflow.ai/v1/board
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `key` | string | oui | Board key |

> **Hackathon tip :** Récupérez d'abord vos `source_key` et `board_key` — ils sont nécessaires pour tous les autres appels.

---

## 5. Profile API — Stockage

### 5.1 POST /profile/parsing/file — Parser un CV

```
POST https://api.hrflow.ai/v1/profile/parsing/file
Content-Type: multipart/form-data
```

**Formats supportés :** `.pdf`, `.png`, `.jpg`, `.jpeg`, `.bmp`, `.doc`, `.docx`, `.odt`, `.rtf`, `.ppt`, `.pptx`

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `source_key` | string | **oui** | Clé de la source cible |
| `file` | binary | **oui** | Fichier CV en binaire |
| `content_type` | string | non | MIME type (ex: `application/pdf`) |
| `key` | string | non | Overrider un objet existant |
| `reference` | string | non | Référence unique par source |
| `tags` | array | non | `[{"name":"tag","value":"val"}]` |
| `metadatas` | array | non | `[{"name":"key","value":"val"}]` |
| `labels` | array | non | Labels pré-attachés |
| `created_at` | string | non | Date ISO 8601 |
| `debugger` | boolean | non | Retourner l'objet parsing brut |

**Réponse 201 (parsing terminé) :**
```json
{
  "code": 201,
  "message": "Profile parsed successfully. Profile extraction finished : 2.5s.",
  "data": {
    "parsing": {
      "emails": ["harry@example.com"],
      "educations": [...],
      "experiences": [...],
      "skills": [...],
      "languages": [...],
      "certifications": [...],
      "courses": [...],
      "interests": [],
      "date_birth": {"iso8601": "...", "text": "...", "timestamp": 0}
    }
  }
}
```

**Exemple Python :**
```python
from hrflow import Hrflow

client = Hrflow(api_secret="Your API Key", api_user="user@example.com")

with open('cv.pdf', 'rb') as file:
    profile_file = file.read()

response = client.profile.parsing.add_file(
    source_key="source_key_abc",
    profile_file=profile_file,
    profile_content_type='application/pdf',
    reference='candidate-001',
    tags=[{"name": "source_channel", "value": "linkedin"}],
    created_at="2024-01-01T00:00:00"
)

profile_key = response['data']['profile']['key']
```

**Exemple cURL :**
```bash
curl -X POST "https://api.hrflow.ai/v1/profile/parsing/file" \
  -H "X-API-KEY: YOUR_KEY" \
  -H "X-USER-EMAIL: your@email.com" \
  -F "source_key=source_key_abc" \
  -F "file=@cv.pdf" \
  -F "content_type=application/pdf"
```

### 5.2 GET /profile/parsing — Récupérer un parsing

```
GET https://api.hrflow.ai/v1/profile/parsing
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `source_key` | string | oui | Clé de la source |
| `key` | string | non* | Clé unique du profil |
| `reference` | string | non* | Référence du profil |

*Au moins `key` ou `reference` requis.

**Réponse 200 :** Objet parsing complet (educations, experiences, skills, emails, etc.)

### 5.3 POST /profile/indexing — Indexer un profil

```
POST https://api.hrflow.ai/v1/profile/indexing
Content-Type: application/json
```

**Body :**

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `source_key` | string | **oui** | Clé de la source |
| `profile` | object | **oui** | Objet Profile JSON complet |

L'objet `profile` contient :
- `info` (requis) : `full_name`, `first_name`, `last_name`, `email` (requis), + phone, date_birth, location, urls, picture, gender, summary
- `key`, `reference`, `text_language`, `text`, `consent_algorithmic`, `created_at`
- `experiences_duration`, `educations_duration`
- `experiences[]`, `educations[]`, `skills[]`, `languages[]`, `certifications[]`, `courses[]`, `tasks[]`, `interests[]`
- `tags[]`, `metadatas[]`, `labels[]`, `attachments[]`

**Réponse 201 :**
```json
{
  "code": 201,
  "message": "Profile created",
  "data": {
    "key": "profile_key_xyz",
    "reference": "candidate-001",
    "source_key": "...",
    "info": {...},
    "experiences": [...],
    "skills": [...]
  }
}
```

**Exemple Python :**
```python
profile_json = {
    "info": {
        "full_name": "Alice Dupont",
        "first_name": "Alice",
        "last_name": "Dupont",
        "email": "alice@example.com",
        "phone": "+33612345678",
        "location": {"text": "Lyon, France", "lat": 45.764, "lng": 4.835},
        "summary": "Data Scientist avec 5 ans d'expérience."
    },
    "experiences": [{
        "company": "TechCorp",
        "title": "Data Scientist",
        "description": "Modèles ML pour la recommandation.",
        "date_start": "2019-03-01T00:00:00",
        "date_end": "2024-01-01T00:00:00",
        "location": {"text": "Lyon"},
        "skills": [{"name": "Python", "type": "hard", "value": None}]
    }],
    "skills": [
        {"name": "Python", "type": "hard", "value": None},
        {"name": "Machine Learning", "type": "hard", "value": "0.95"}
    ],
    "languages": [{"name": "french", "value": "native"}, {"name": "english", "value": "fluent"}],
    "tags": [{"name": "open_to_work", "value": True}]
}

response = client.profile.indexing.add(
    source_key="source_key_abc",
    profile_json=profile_json
)
```

### 5.4 PUT /profile/indexing — Modifier un profil

```
PUT https://api.hrflow.ai/v1/profile/indexing
Content-Type: application/json
```

**Body :** `source_key` (requis) + `profile` (objet avec `key` ou `reference` pour identifier le profil)

**Réponse 200 :** Profil mis à jour.

**Exemple Python :**
```python
response = client.profile.indexing.edit(
    source_key="source_key_abc",
    profile_key="profile_key_xyz",
    profile_json={
        "info": {
            "full_name": "Elon Musk",
            "first_name": "Elon",
            "last_name": "Musk",
            "email": "elon@tesla.com"
        },
        "experiences": [{"company": "Tesla", "title": "CEO", "description": "Leading EV manufacturing"}]
    }
)
```

### 5.5 GET /profile/indexing — Récupérer un profil

```
GET https://api.hrflow.ai/v1/profile/indexing
```

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `source_key` | string | oui | Clé de la source |
| `key` | string | non* | Clé unique du profil |
| `reference` | string | non* | Référence du profil |

**Réponse 200 :** Profil HR JSON complet (info, experiences, educations, skills, attachments, tags, metadatas, labels, consent_algorithmic).

**Exemple cURL :**
```bash
curl "https://api.hrflow.ai/v1/profile/indexing?source_key=YOUR_SOURCE_KEY&key=PROFILE_KEY" \
  -H "X-API-KEY: YOUR_API_KEY" \
  -H "X-USER-EMAIL: YOUR_EMAIL"
```

### 5.6 GET /storing/profiles — Lister les profils d'une source

```
GET https://api.hrflow.ai/v1/storing/profiles
```

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `source_keys` | string (JSON array) | **requis** | `["key1", "key2"]` |
| `name` | string | — | Filtrer par nom |
| `key` | string | — | Filtrer par identifiant |
| `reference` | string | — | Filtrer par référence |
| `location_lat` | string | — | Latitude du geopoint |
| `location_lon` | string | — | Longitude du geopoint |
| `location_distance` | string | — | Rayon en km |
| `return_profile` | boolean | `false` | `true` = retourner le JSON complet |
| `page` | string | `1` | Numéro de page |
| `limit` | string | `30` | Résultats par page |
| `order_by` | string | `desc` | `asc` ou `desc` |
| `sort_by` | string | `created_at` | `created_at` ou `updated_at` |
| `created_at_min` | date | — | Date minimale |
| `created_at_max` | date | — | Date maximale |

**Réponse 200 :**
```json
{
  "code": 200,
  "message": "Profiles list",
  "meta": {"page": 1, "maxPage": 5, "count": 30, "total": 147},
  "data": [...]
}
```

### 5.7 PATCH /profile/indexing/archive — Archiver un profil

```
PATCH https://api.hrflow.ai/v1/profile/indexing/archive
Content-Type: application/json
```

**Body :**
```json
{
  "source_key": "source_key_abc",
  "key": "profile_key_xyz"
}
```

---

## 6. Profile API — Intelligence IA

### 6.1 GET /profiles/searching — Recherche de profils

```
GET https://api.hrflow.ai/v1/profiles/searching
```

Recherche par critères filtrés (sans scoring IA).

| Paramètre | Type | Défaut | Description |
|---|---|---|---|
| `source_keys` | array (JSON) | **requis** | Sources à interroger |
| `stage` | string | `"new"` | `"new"`, `"yes"`, `"later"`, `"no"` |
| `limit` | integer | `30` | Max 30 par page |
| `page` | integer | `1` | Numéro de page |
| `order_by` | string | `"desc"` | `"asc"` ou `"desc"` |
| `sort_by` | string | — | `"created_at"`, `"updated_at"`, `"location"`, `"searching"`, `"scoring"` |
| `created_at_min` | string | — | Date min ISO 8601 |
| `created_at_max` | string | — | Date max ISO 8601 |
| `name` | string | — | Filtre par nom |
| `email` | string | — | Filtre par email |
| `location_geopoint` | object (JSON) | — | `{"lat": 48.85, "lng": 2.35}` |
| `location_distance` | integer | — | Rayon en km |
| `summary_keywords` | array (JSON) | — | Mots-clés dans le résumé |
| `text_keywords` | array (JSON) | — | Mots-clés dans le texte complet |
| `experience_keywords` | array (JSON) | — | Mots-clés dans les expériences |
| `experience_location_geopoint` | object | — | Localisation des expériences |
| `experience_location_distance` | integer | — | Rayon pour les expériences |
| `experiences_duration_min` | integer | — | Ancienneté min (années) |
| `experiences_duration_max` | integer | — | Ancienneté max |
| `education_keywords` | array (JSON) | — | Mots-clés dans les formations |
| `education_location_geopoint` | object | — | Localisation des formations |
| `education_location_distance` | integer | — | Rayon pour les formations |
| `educations_duration_min` | integer | — | Durée min d'études |
| `educations_duration_max` | integer | — | Durée max d'études |
| `skills` | array (JSON) | — | `[{"name": "python", "value": null}]` |
| `languages` | array (JSON) | — | `[{"name": "english", "value": "fluent"}]` |
| `interests` | array (JSON) | — | Centres d'intérêt |
| `tags_included` | array (JSON) | — | Tags à inclure |
| `tags_excluded` | array (JSON) | — | Tags à exclure |

**Exemple Python :**
```python
response = client.profile.searching.list(
    source_keys=["source_key_abc"],
    limit=20,
    page=1,
    sort_by='created_at',
    order_by='desc',
    location_geopoint={"lat": 48.8566, "lng": 2.3522},
    location_distance=50,
    experiences_duration_min=3,
    skills=[{"name": "python", "value": None}],
    tags_excluded=[{"name": "blacklist", "value": True}]
)
```

### 6.2 GET /profiles/scoring — Scorer des profils pour un job

```
GET https://api.hrflow.ai/v1/profiles/scoring
```

**C'est l'endpoint le plus puissant pour le matching candidat→offre.**

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `board_key` | string | **oui** | Board contenant le job |
| `job_key` | string | **oui** | Job cible |
| `source_keys` | array (JSON) | **oui** | Sources de profils |
| `use_agent` | integer | non | `1` pour activer le scoring IA |
| `stage` | string | non | Filtre par stage |
| `limit` | integer | non | Profils par page (défaut: 30) |
| `page` | integer | non | Numéro de page |
| `sort_by` | string | non | `"scoring"` pour trier par score |
| `order_by` | string | non | `"desc"` pour les meilleurs d'abord |
| *(+ tous les filtres de searching)* | | non | |

**Réponse 200 :**
```json
{
  "code": 200,
  "message": "Profiles list",
  "meta": {"page": 1, "maxPage": 3, "count": 30, "total": 89},
  "data": {
    "profiles": [{ /* Profil HR JSON */ }],
    "predictions": [
      [0.12, 0.88],
      [0.35, 0.65]
    ]
  }
}
```

> **Important :** `predictions[i]` correspond à `profiles[i]`. Le score = `predictions[i][1]` (0 à 1).

**Exemple Python :**
```python
response = client.profile.scoring.list(
    source_keys=["source_key_abc"],
    board_key="board_key_xyz",
    job_key="job_key_123",
    use_agent=1,
    limit=10,
    sort_by="scoring",
    order_by="desc"
)

for profile, prediction in zip(response['data']['profiles'], response['data']['predictions']):
    score = prediction[1]
    print(f"{profile['info']['full_name']}: {score:.1%}")
```

### 6.3 GET /profiles/matching — Matcher des profils similaires

```
GET https://api.hrflow.ai/v1/profiles/matching
```

Trouve les profils les plus similaires à un profil donné (profil→profil).

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `source_keys` | array | oui | Sources cibles |
| `profile_key` | string | oui | Profil de référence |
| `limit` | integer | non | Résultats par page |
| `page` | integer | non | Numéro de page |

### 6.4 GET /profile/grading — Évaluer un profil pour un job

```
GET https://api.hrflow.ai/v1/profile/grading
```

Évaluation détaillée (grade) d'un profil par rapport à un job.

### 6.5 GET /profile/asking — Poser des questions à un profil

```
GET https://api.hrflow.ai/v1/profile/asking
```

Interroger un profil indexé en langage naturel via l'IA.

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `source_key` | string | oui | Source du profil |
| `key` / `reference` | string | oui | Identifiant du profil |
| `question` | string | oui | Question en langage naturel |

### 6.6 GET /profile/unfolding — Prédire la trajectoire de carrière

```
GET https://api.hrflow.ai/v1/profile/unfolding
```

Prédit les futures expériences et formations d'un profil.

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `source_key` | string | oui | Source du profil |
| `key` | string | oui | Identifiant du profil |

### 6.7 POST /profile/embedding — Vectoriser un profil

```
POST https://api.hrflow.ai/v1/profile/embedding
Content-Type: application/json
```

Génère des vecteurs HR-natifs cross-lingues pour le ML.

**Body :**
```json
{
  "source_key": "source_key_abc",
  "profile_key": "profile_key_xyz"
}
```

**Réponse :**
```json
{
  "code": 201,
  "message": "Profile vectorized",
  "data": {
    "embedding": [0.023, -0.145, 0.678, ...]
  }
}
```

### 6.8 GET /profile/upskilling — Expliquer une recommandation profil→job

```
GET https://api.hrflow.ai/v1/profile/upskilling
```

Explication IA du matching entre un profil et un job.

---

## 7. Job API — Stockage

### 7.1 POST /job/indexing — Indexer un job

```
POST https://api.hrflow.ai/v1/job/indexing
Content-Type: application/json
```

**Body :**

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `board_key` | string | **oui** | Board cible |
| `job` | object | **oui** | Objet Job JSON |

L'objet `job` contient :
- `name` (requis) : Titre du poste
- `reference` : Référence unique
- `url` : URL de l'offre
- `summary` : Description/résumé
- `location` : `{text, lat, lng}`
- `sections[]` : (déprécié) → utiliser `culture`, `benefits`, `responsibilities`, `requirements`, `interviews`
- `culture`, `benefits`, `responsibilities`, `requirements`, `interviews` : strings descriptives
- `skills[]`, `languages[]`, `certifications[]`, `courses[]`, `tasks[]`, `interests[]`
- `tags[]`, `metadatas[]`
- `ranges_float[]` : `{name, value_min, value_max, unit}`
- `ranges_date[]` : `{name, value_min, value_max}`
- `created_at` : ISO 8601

**Réponse 201 :**
```json
{
  "code": 201,
  "message": "Job created",
  "data": {"key": "job_key_abc", "name": "Senior Data Engineer", ...}
}
```

**Exemple Python :**
```python
job_json = {
    "name": "Senior Data Engineer",
    "reference": "JOB-2024-001",
    "summary": "Rejoignez notre équipe Data...",
    "location": {"text": "Paris, France", "lat": 48.8566, "lng": 2.3522},
    "responsibilities": "Concevoir et maintenir les pipelines de données.",
    "requirements": "Bac+5 en informatique. Maîtrise de Python et SQL.",
    "skills": [
        {"name": "Python", "type": "hard", "value": None},
        {"name": "SQL", "type": "hard", "value": None},
        {"name": "Apache Spark", "type": "hard", "value": "0.8"}
    ],
    "languages": [{"name": "french", "value": "1"}, {"name": "english", "value": "0.7"}],
    "tags": [{"name": "contract_type", "value": "CDI"}, {"name": "remote", "value": "hybrid"}],
    "ranges_float": [{"name": "salary", "value_min": 65000, "value_max": 85000, "unit": "eur"}]
}

response = client.job.indexing.add_json(board_key="board_key_xyz", job_json=job_json)
job_key = response['data']['key']
```

### 7.2 PUT /job/indexing — Modifier un job

```
PUT https://api.hrflow.ai/v1/job/indexing
```

Même structure que POST avec `key` ou `reference` pour identifier le job.

### 7.3 GET /job/indexing — Récupérer un job

```
GET https://api.hrflow.ai/v1/job/indexing
```

| Paramètre | Type | Requis |
|---|---|---|
| `board_key` | string | oui |
| `key` | string | non* |
| `reference` | string | non* |

### 7.4 GET /storing/jobs — Lister les jobs d'un board

```
GET https://api.hrflow.ai/v1/storing/jobs
```

Mêmes paramètres de pagination/filtrage que `/storing/profiles`.

### 7.5 PATCH /job/indexing/archive — Archiver un job

```
PATCH https://api.hrflow.ai/v1/job/indexing/archive
```

**Body :** `{"board_key": "...", "key": "..."}`

---

## 8. Job API — Intelligence IA

### 8.1 GET /jobs/searching — Recherche de jobs

```
GET https://api.hrflow.ai/v1/jobs/searching
```

| Paramètre | Type | Description |
|---|---|---|
| `board_keys` | array (JSON) | **requis** — Boards à interroger |
| `limit` | integer | Résultats par page (défaut: 30) |
| `page` | integer | Numéro de page |
| `order_by` | string | `"asc"` ou `"desc"` |
| `sort_by` | string | `"created_at"`, `"updated_at"`, `"searching"` |
| `name` | string | Filtre par titre |
| `location_geopoint` | object | `{"lat": ..., "lng": ...}` |
| `location_distance` | integer | Rayon en km |
| `skills` | array | Compétences requises |
| `languages` | array | Langues requises |
| `tags_included` | array | Tags à inclure |
| `tags_excluded` | array | Tags à exclure |

### 8.2 GET /jobs/scoring — Scorer des jobs pour un profil

```
GET https://api.hrflow.ai/v1/jobs/scoring
```

Recommande les meilleurs jobs pour un candidat donné.

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `source_key` | string | oui | Source contenant le profil |
| `profile_key` | string | oui | Profil cible |
| `board_keys` | array (JSON) | oui | Boards d'offres à scorer |
| `use_agent` | integer | non | `1` pour activer l'IA |
| `limit` | integer | non | Résultats par page |
| `sort_by` | string | non | `"scoring"` pour trier par score |

**Réponse 200 :**
```json
{
  "code": 200,
  "data": {
    "jobs": [...],
    "predictions": [[0.15, 0.85], ...]
  }
}
```

**Exemple Python :**
```python
response = client.job.scoring.list(
    source_key="source_key_abc",
    profile_key="profile_key_xyz",
    board_keys=["board_key_xyz"],
    use_agent=1,
    limit=10,
    sort_by="scoring",
    order_by="desc"
)

for job, pred in zip(response['data']['jobs'], response['data']['predictions']):
    print(f"{job['name']}: {pred[1]:.1%}")
```

### 8.3 GET /jobs/matching — Matcher des jobs similaires

```
GET https://api.hrflow.ai/v1/jobs/matching
```

Trouve les jobs les plus similaires à un job donné (job→job).

### 8.4 GET /job/grading — Évaluer des jobs pour un profil

```
GET https://api.hrflow.ai/v1/job/grading
```

### 8.5 GET /job/asking — Poser des questions à un job

```
GET https://api.hrflow.ai/v1/job/asking
```

Interroger un job indexé en langage naturel via l'IA.

### 8.6 POST /job/embedding — Vectoriser un job

```
POST https://api.hrflow.ai/v1/job/embedding
```

### 8.7 GET /job/upskilling — Expliquer une recommandation job→profil

```
GET https://api.hrflow.ai/v1/job/upskilling
```

---

## 9. Text API

Endpoints opérant sur du **texte brut** sans nécessiter de source ou board.

### 9.1 POST /text/parsing — Parser un texte brut

```
POST https://api.hrflow.ai/v1/text/parsing
Content-Type: application/json
```

Extrait 50+ data points depuis n'importe quel texte brut.

**Body :**

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `text` | string | oui | Texte à analyser |
| `language` | string | non | Code langue |

**Réponse 201 :**
```json
{
  "code": 201,
  "message": "Text parsed successfully",
  "data": {
    "parsing": {
      "emails": ["alice@example.com"],
      "phones": ["+33612345678"],
      "date_birth": {"iso8601": "...", "text": "...", "timestamp": 0},
      "gender": null,
      "driving_license": null,
      "location": {"text": "Paris", "lat": 48.85, "lng": 2.35},
      "experiences": [...],
      "experiences_duration": 5.0,
      "educations": [...],
      "educations_duration": 2.0,
      "skills": [{"name": "Python", "type": "hard", "value": null}],
      "languages": [...],
      "certifications": [...],
      "courses": [...],
      "tasks": [...],
      "interests": []
    }
  }
}
```

**Exemple Python :**
```python
response = client.document.parsing.post(
    text="Alice Dupont, Data Scientist avec 5 ans d'expérience en ML. Diplômée Polytechnique 2018."
)
```

### 9.2 POST /text/tagging — Tagger un texte

```
POST https://api.hrflow.ai/v1/text/tagging
Content-Type: application/json
```

Prédit les tags les plus probables pour un texte via des algorithmes IA.

**Body :** `{"text": "..."}`

### 9.3 POST /text/embedding — Vectoriser un texte

```
POST https://api.hrflow.ai/v1/text/embedding
Content-Type: application/json
```

Génère des vecteurs HR-natifs cross-lingues pour des textes arbitraires.

**Body :**

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `text` | string | oui | Texte à vectoriser |

**Réponse 200 :**
```json
{
  "code": 200,
  "data": {
    "embedding": [0.023, -0.145, 0.678, ...],
    "text": "..."
  }
}
```

**Exemple — Similarité cosinus entre CV et offre :**
```python
import numpy as np

emb_job = client.document.embedding.post(text=job_description)['data']['embedding']
emb_cv = client.document.embedding.post(text=cv_summary)['data']['embedding']

v1, v2 = np.array(emb_job), np.array(emb_cv)
similarity = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
print(f"Similarité: {similarity:.3f}")
```

### 9.4 POST /text/imaging — Générer une illustration de job

```
POST https://api.hrflow.ai/v1/text/imaging
Content-Type: application/json
```

Génère une illustration visuelle décrivant une scène de job.

### 9.5 POST /text/linking — Trouver des synonymes

```
POST https://api.hrflow.ai/v1/text/linking
Content-Type: application/json
```

Trouve les N mots les plus similaires/synonymes d'un mot donné.

### 9.6 POST /text/geocoding — Géocoder une localisation

```
POST https://api.hrflow.ai/v1/text/geocoding
Content-Type: application/json
```

Convertit un texte de localisation en coordonnées GeoJSON.

**Réponse :**
```json
{
  "code": 200,
  "data": {
    "geojson": {"city": "...", "country": "...", "postcode": "...", "state": "..."},
    "lat": 48.8566,
    "lng": 2.3522,
    "text": "Paris, France"
  }
}
```

### 9.7 POST /text/ocr — OCR un document

```
POST https://api.hrflow.ai/v1/text/ocr
Content-Type: application/json
```

Extrait le texte d'un document (PDF, DOCX, PNG, etc.).

---

## 10. Signal API

Nouvelle API pour le feedback utilisateur (ratings et trackings).

### 10.1 POST /rating — Noter un profil ou un job

```
POST https://api.hrflow.ai/v1/rating
Content-Type: application/json
```

Permet à un recruteur/candidat de noter une entité (score 0-1).

### 10.2 GET /ratings — Récupérer les notes

```
GET https://api.hrflow.ai/v1/ratings
```

**Réponse 200 :**
```json
{
  "code": 200,
  "meta": {"page": 1, "maxPage": 1, "count": 10, "total": 10},
  "data": [...]
}
```

### 10.3 POST /tracking — Tracker un profil ou un job

```
POST https://api.hrflow.ai/v1/tracking
Content-Type: application/json
```

Enregistre une action de suivi (vue, clic, candidature, etc.).

| Paramètre | Type | Description |
|---|---|---|
| `source_key` / `board_key` | string | Source ou Board |
| `profile_key` / `job_key` | string | Entité trackée |
| `action` | string | Action enregistrée |

### 10.4 GET /trackings — Récupérer les trackings

```
GET https://api.hrflow.ai/v1/trackings
```

---

## 11. Workflows

### GET /workflows — Lister les workflows

```
GET https://api.hrflow.ai/v1/workflows
```

| Paramètre | Type | Défaut |
|---|---|---|
| `name` | string | — |
| `environment` | string | — |
| `page` | int32 | 1 |
| `limit` | int32 | 30 |
| `order_by` | string | desc |

---

## 12. Codes de statut HTTP

| Code | Titre | Signification |
|---|---|---|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée avec succès |
| `202` | Async created | Traitement asynchrone accepté |
| `400` | Bad Request | Paramètres invalides ou manquants |
| `401` | Unauthorized | Clé API invalide |
| `402` | Over quota | Quota du plan dépassé sur cet endpoint |
| `404` | Not Found | Ressource introuvable |
| `422` | Validation Error | Erreur de validation |
| `50X` | Server Error | Erreur serveur HrFlow |

**Structure d'erreur :**
```json
{"code": 400, "message": "Bad Request. Invalid source_key: abc123"}
```

---

## 13. SDK — Installation & initialisation

### Python SDK

```bash
pip install hrflow
```

```python
from hrflow import Hrflow

client = Hrflow(
    api_secret="Your_API_Secret_Key",
    api_user="your@email.com"
)
```

**Arbre des méthodes du SDK Python :**

```
client
├── profile
│   ├── parsing
│   │   ├── add_file(source_key, profile_file, ...)  → POST /profile/parsing/file
│   │   └── get(source_key, key)                     → GET /profile/parsing
│   ├── indexing
│   │   ├── add(source_key, profile_json)            → POST /profile/indexing
│   │   ├── edit(source_key, profile_key, ...)       → PUT /profile/indexing
│   │   └── get(source_key, key)                     → GET /profile/indexing
│   ├── embedding
│   │   └── get(source_key, profile_key)             → POST /profile/embedding
│   ├── revealing
│   │   └── get(source_key, profile_key)             → GET /profile/revealing
│   ├── searching
│   │   └── list(source_keys, **filters)             → GET /profiles/searching
│   ├── scoring
│   │   └── list(source_keys, board_key, job_key)    → GET /profiles/scoring
│   └── asking
│       └── get(source_key, key, question)           → GET /profile/asking
├── job
│   ├── indexing
│   │   ├── add_json(board_key, job_json)            → POST /job/indexing
│   │   ├── edit(board_key, job_key, ...)            → PUT /job/indexing
│   │   └── get(board_key, key)                      → GET /job/indexing
│   ├── embedding
│   │   └── get(board_key, job_key)                  → POST /job/embedding
│   ├── revealing
│   │   └── get(board_key, job_key)                  → GET /job/revealing
│   ├── searching
│   │   └── list(board_keys, **filters)              → GET /jobs/searching
│   ├── scoring
│   │   └── list(source_key, profile_key, board_keys)→ GET /jobs/scoring
│   └── asking
│       └── get(board_key, key, question)             → GET /job/asking
├── document (alias: text)
│   ├── parsing
│   │   └── post(text)                               → POST /text/parsing
│   ├── revealing / tagging
│   │   └── post(text)                               → POST /text/tagging
│   ├── embedding
│   │   └── post(text)                               → POST /text/embedding
│   └── linking
│       └── post(text)                               → POST /text/linking
└── source / board
    ├── list()                                       → GET /sources ou /boards
    └── get(key)                                     → GET /source ou /board
```

### JavaScript SDK

```bash
npm install hrflow
```

```javascript
import Hrflow from 'hrflow';

const client = new Hrflow({
  api_secret: 'Your_API_Secret_Key',
  api_user: 'your@email.com',
});
```

### cURL (sans SDK)

```bash
# Auth test
curl "https://api.hrflow.ai/v1/auth" \
  -H "X-API-KEY: YOUR_KEY" \
  -H "X-USER-EMAIL: your@email.com"

# Lister les sources
curl "https://api.hrflow.ai/v1/sources" \
  -H "X-API-KEY: YOUR_KEY" \
  -H "X-USER-EMAIL: your@email.com"

# Parser un CV
curl -X POST "https://api.hrflow.ai/v1/profile/parsing/file" \
  -H "X-API-KEY: YOUR_KEY" \
  -H "X-USER-EMAIL: your@email.com" \
  -F "source_key=src_key" \
  -F "file=@cv.pdf" \
  -F "content_type=application/pdf"

# Indexer un job
curl -X POST "https://api.hrflow.ai/v1/job/indexing" \
  -H "X-API-KEY: YOUR_KEY" \
  -H "X-USER-EMAIL: your@email.com" \
  -H "Content-Type: application/json" \
  -d '{"board_key":"brd_key","job":{"name":"Data Engineer","summary":"..."}}'
```

---

## 14. Patterns d'usage & Hackathon tips

### Pattern 1 — Pipeline complet CV → Matching

```python
from hrflow import Hrflow

client = Hrflow(api_secret="API_KEY", api_user="user@example.com")
SOURCE_KEY = "your_source_key"
BOARD_KEY = "your_board_key"

# 1. Parser un CV
with open('cv.pdf', 'rb') as f:
    response = client.profile.parsing.add_file(
        source_key=SOURCE_KEY,
        profile_file=f.read(),
        profile_content_type='application/pdf',
    )
profile_key = response['data']['profile']['key']

# 2. Indexer une offre
job_response = client.job.indexing.add_json(
    board_key=BOARD_KEY,
    job_json={
        "name": "Data Scientist",
        "summary": "Python and ML expertise required.",
        "skills": [{"name": "Python", "type": "hard"}, {"name": "ML", "type": "hard"}]
    }
)
job_key = job_response['data']['key']

# 3. Scorer
scoring = client.profile.scoring.list(
    source_keys=[SOURCE_KEY],
    board_key=BOARD_KEY,
    job_key=job_key,
    use_agent=1,
    limit=10,
    sort_by="scoring",
    order_by="desc"
)

for profile, pred in zip(scoring['data']['profiles'], scoring['data']['predictions']):
    print(f"{profile['info']['full_name']}: {pred[1]:.1%}")
```

### Pattern 2 — Système de recommandation bidirectionnel

```python
def recommend_jobs_for_candidate(client, profile_key, source_key, board_keys, top_n=5):
    """Top N jobs pour un candidat."""
    response = client.job.scoring.list(
        source_key=source_key,
        profile_key=profile_key,
        board_keys=board_keys,
        use_agent=1,
        limit=top_n,
        sort_by="scoring",
        order_by="desc"
    )
    return [
        {"job": job, "score": pred[1]}
        for job, pred in zip(response['data']['jobs'], response['data']['predictions'])
    ]

def recommend_candidates_for_job(client, job_key, board_key, source_keys, top_n=10):
    """Top N candidats pour un job."""
    response = client.profile.scoring.list(
        source_keys=source_keys,
        board_key=board_key,
        job_key=job_key,
        use_agent=1,
        limit=top_n,
        sort_by="scoring",
        order_by="desc"
    )
    return [
        {"profile": profile, "score": pred[1]}
        for profile, pred in zip(response['data']['profiles'], response['data']['predictions'])
    ]
```

### Pattern 3 — Analyse de texte brut (sans source)

```python
job_text = "Développeur Python senior, ML, Big Data. 5 ans min. Paris ou Remote. 70-90k€."

# Extraction d'entités
parsing = client.document.parsing.post(text=job_text)

# Enrichissement skills implicites
revealing = client.document.revealing.post(text=job_text)

# Vectorisation pour similarité
embedding = client.document.embedding.post(text=job_text)
```

### Pattern 4 — Pagination complète

```python
def get_all_profiles(client, source_keys, **filters):
    all_profiles = []
    page = 1
    while True:
        response = client.profile.searching.list(
            source_keys=source_keys, page=page, limit=30, **filters
        )
        all_profiles.extend(response['data']['profiles'])
        if page >= response['meta']['maxPage']:
            break
        page += 1
    return all_profiles
```

### Pattern 5 — Questions IA sur un profil

```python
# Interroger un profil en langage naturel
response = client.profile.asking.get(
    source_key="source_key_abc",
    key="profile_key_xyz",
    question="Quelles sont les compétences cloud de ce candidat ?"
)
```

### Pattern 6 — Prédiction de carrière

```python
# Prédire les prochaines étapes de carrière
response = client.profile.unfolding.get(
    source_key="source_key_abc",
    key="profile_key_xyz"
)
```

### Erreurs courantes et solutions

| Erreur | Cause | Solution |
|---|---|---|
| `401 Unauthorized` | Mauvaise clé API | Vérifier `X-API-KEY` et `X-USER-EMAIL` |
| `400 Invalid source fields` | `source_key` inexistant | Vérifier via `GET /sources` |
| `400 Invalid board fields` | `board_key` inexistant | Vérifier via `GET /boards` |
| `402 Over quota` | Quota dépassé | Vérifier le plan, contacter HRFlow |
| `422 Validation error` | Champ manquant/invalide | Vérifier les champs requis |
| Score toujours ~0.5 | `use_agent=0` | Passer `use_agent=1` |

### Retry avec backoff exponentiel

```python
import time

def api_call_with_retry(func, max_retries=3, base_delay=1):
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            if "429" in str(e) or "402" in str(e):
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    time.sleep(delay)
                    continue
            raise
```

### Endpoints les plus utiles pour un hackathon

| Priorité | Endpoint | Usage |
|---|---|---|
| **P0** | `POST /profile/parsing/file` | Uploader et parser des CVs |
| **P0** | `POST /job/indexing` | Indexer des offres d'emploi |
| **P0** | `GET /profiles/scoring` | Matcher candidats→job |
| **P0** | `GET /jobs/scoring` | Matcher job→candidat |
| **P1** | `GET /profile/asking` | Questions IA sur un profil |
| **P1** | `GET /job/asking` | Questions IA sur un job |
| **P1** | `POST /text/parsing` | Analyse de texte sans source |
| **P1** | `GET /profile/upskilling` | Explication du matching |
| **P2** | `GET /profiles/matching` | Profils similaires |
| **P2** | `GET /profile/unfolding` | Prédiction carrière |
| **P2** | `POST /text/embedding` | Vectorisation pour ML custom |
| **P2** | `POST /text/geocoding` | Géocodage de localisation |

---

## Annexe — Liens utiles

| Ressource | URL |
|---|---|
| Documentation officielle | https://developers.hrflow.ai |
| Référence API | https://developers.hrflow.ai/reference/authentication |
| SDK Python | https://github.com/Riminder/python-hrflow-api |
| SDK JavaScript | https://github.com/Riminder/node-hrflow-api |
| Status API | https://status.hrflow.ai |

---

*Documentation API HrFlow.ai v2 — Scrapée et compilée le 26 mars 2026 pour le hackathon GenAI & RH.*
*Endpoints : 40+ | Objets : Profile, Job, Source, Board, Text | APIs : Profile, Job, Text, Signal*
