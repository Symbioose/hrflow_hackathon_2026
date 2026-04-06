# Spec — Header + Mon Compte + Outreach Generation

**Date :** 2026-04-05  
**Scope :** Header persistant, dropdown "Mon compte", Supabase backend, génération de message outreach IA

---

## 1. Objectif

Transformer Claw4HR d'une démo en produit crédible pour le hackathon en ajoutant :
- Un header SaaS (style Juicebox/Linear) sur toutes les vues
- Un espace "Mon compte" avec recherches récentes, shortlist, et historique outreach
- La génération IA de messages d'approche personnalisés (killer feature démo)
- Un backend Supabase léger (pas d'auth, session_id localStorage)

---

## 2. Header

**Design :** Barre fixe 56px, fond `var(--cream)`, bordure bottom `2px solid var(--ink)`. Présente sur **toutes les vues** (Search, Loading, Results, ProfileDetail).

**Gauche :** Icône SVG pince stylisée (20px, coral) + texte `Claw4HR` en bold — remplace le 🦞 partout.

**Droite :** Bouton "Mon compte" — avatar rond avec initiales de la session, ouvre un dropdown.

**SearchView :** Le 🦞 dans le logo centré est remplacé par le même icône SVG pince (40px). Le header flotte au-dessus, la search reste centrée dans l'espace restant.

---

## 3. Dropdown "Mon compte"

Dropdown aligné à droite, 3 sections séparées par des dividers :

```
┌─────────────────────────────┐
│ 🔍 Recherches récentes      │
│   Data Scientist NLP Paris  │  ← relance la query en 1 clic
│   Lead DevOps AWS Remote    │
├─────────────────────────────┤
│ ★ Ma Shortlist  (3)         │
│   Sophie Marchand           │  ← ouvre la fiche ProfileDetail
│   Adrien Hairault           │
├─────────────────────────────┤
│ ✉ Outreach  (1)             │
│   Message → Sophie M.       │  ← affiche le message généré
└─────────────────────────────┘
```

- Les counts (Shortlist, Outreach) sont affichés en badge sur le bouton header
- Max 5 items par section dans le dropdown (le reste est tronqué)
- Chargement des données au montage du composant (fetch Supabase par session_id)

---

## 4. Supabase Backend

**Pas d'auth.** Un `session_id` UUID est généré à la première visite et stocké en localStorage. Toutes les données sont filtrées par `session_id`.

### Tables

**`searches`**
```sql
id          uuid primary key default gen_random_uuid()
session_id  text not null
query       text not null
created_at  timestamptz default now()
profile_count int default 0
```

**`shortlist`**
```sql
id           uuid primary key default gen_random_uuid()
session_id   text not null
profile_key  text not null
profile_data jsonb not null
saved_at     timestamptz default now()
```
Contrainte : `unique(session_id, profile_key)` — pas de doublons.

**`outreach`**
```sql
id           uuid primary key default gen_random_uuid()
session_id   text not null
profile_key  text not null
profile_name text not null
message      text not null
created_at   timestamptz default now()
```

### API Routes Next.js

| Route | Méthode | Description |
|---|---|---|
| `/api/account/searches` | GET / POST | Lire / sauvegarder une recherche |
| `/api/account/shortlist` | GET / POST / DELETE | Lire / sauvegarder / retirer un profil |
| `/api/account/outreach` | GET | Lire l'historique outreach |
| `/api/outreach/generate` | POST | Générer un message IA + sauvegarder |

---

## 5. Outreach Generation (killer feature)

**Déclencheur :** Bouton "Contacter" dans `ProfileDetailView`.

**Flow :**
1. Clic → appel `POST /api/outreach/generate` avec le `SourcedProfile` complet
2. L'API appelle Claude Haiku 4.5 avec un prompt qui extrait les détails concrets (repo GitHub notable, ancienne boîte, skill rare)
3. Réponse en streaming — le message s'affiche dans une modale au fur et à mesure
4. Bouton "Copier" en 1 clic
5. Sauvegarde automatique dans la table `outreach` Supabase

**Prompt système :**
```
Tu es un recruteur expert. Génère un message d'approche personnalisé 
en français (5-7 lignes) pour ce candidat passif. 
Cite 1-2 détails CONCRETS et SPÉCIFIQUES de son profil 
(projet GitHub, ancienne boîte, technologie rare). 
Ton : professionnel mais humain, pas de bullshit corporate.
Termine par une question ouverte simple.
```

**Exemple de sortie :**
```
Bonjour Sophie,

J'ai remarqué votre travail sur pytorch-nlp-toolkit (+200 stars) 
et vos pipelines ML en production chez Criteo (100M+ prédictions/jour). 
Votre profil correspond exactement à ce que nous recherchons 
pour un poste de Lead Data Scientist à Paris.

Seriez-vous ouverte à en discuter 15 minutes cette semaine ?
```

---

## 6. Bouton "Sauvegarder"

**Sur `CandidateCard` :** Icône étoile (☆/★) en haut à droite de la carte. Toggle : sauvegarde / retire de la shortlist. État optimiste — mise à jour UI immédiate, sync Supabase en arrière-plan.

**Sur `ProfileDetailView` :** Bouton "Sauvegarder" (★) à côté de "Contacter". Même comportement.

**Badge header :** Le count shortlist dans le dropdown se met à jour en temps réel.

---

## 7. Composants à créer / modifier

| Fichier | Action |
|---|---|
| `app/components/Header.tsx` | Créer — header persistant + dropdown Mon compte |
| `app/components/AccountDropdown.tsx` | Créer — dropdown avec 3 sections |
| `app/components/OutreachModal.tsx` | Créer — modale génération message streaming |
| `app/components/SearchView.tsx` | Modifier — supprimer 🦞, SVG icon |
| `app/components/CandidateCard.tsx` | Modifier — ajouter bouton sauvegarder (étoile) |
| `app/components/ProfileDetailView.tsx` | Modifier — ajouter boutons Sauvegarder + Contacter |
| `app/components/Dashboard.tsx` | Modifier — wrapper avec Header, passer session_id |
| `app/lib/session.ts` | Créer — génération/lecture session_id localStorage |
| `app/lib/supabase.ts` | Créer — client Supabase |
| `app/api/account/searches/route.ts` | Créer |
| `app/api/account/shortlist/route.ts` | Créer |
| `app/api/account/outreach/route.ts` | Créer |
| `app/api/outreach/generate/route.ts` | Créer — génération IA streaming |

---

## 8. Ce qui est hors scope (post-hackathon)

- Auth réelle (email/password, OAuth)
- Templates outreach personnalisables
- Séquences multi-messages / relances
- Partage de shortlist entre recruteurs
- Export CSV des profils
