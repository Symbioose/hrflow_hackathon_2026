# Spec — UX Upgrade Hackathon Finale (4 features)

**Date :** 2026-04-06  
**Contexte :** Ajouts de dernière minute avant la démo finale. Jury = DRH + public non-tech. Vote public.  
**Objectif :** Rendre le produit plus impressionnant, mettre HrFlow en valeur, enrichir le pipeline.

---

## Feature 1 — SWOT HrFlow sur chaque profil

### Problème
Le scoring HrFlow est affiché (le chiffre %) mais la richesse de l'analyse (`/profile/upskilling`) n'est pas visible. Le jury ne comprend pas pourquoi ce score est meilleur que LinkedIn.

### Solution
Ajouter un bloc "Analyse HrFlow" dans le panneau gauche du `ProfileDetailView`, entre les compétences et les expériences.

**Appel API :** `GET /api/hrflow/upskill?profile_key=<hrflow_key>&job_key=<job_key>`  
- Uniquement si `profile.hrflow_key` est non-null  
- Si null → afficher un bloc "Analyse HrFlow non disponible pour ce profil"  

**Rendu visuel :**
- Titre section : `ANALYSE HRFLOW` (même style que "COMPÉTENCES")
- Badge indigo "Powered by HrFlow" en haut à droite
- Forces (upskilling positifs) : puces vertes `✓`
- Gaps (upskilling négatifs) : puces orange `△`
- Limiter à 3 forces + 3 gaps max pour la lisibilité

**Données :** L'endpoint `upskill` retourne un champ `data` contenant `strengths` et `improvements` (ou similaire selon la réponse réelle). Adapter en conséquence.

### Portée
- `app/components/ProfileDetailView.tsx` : ajouter le bloc SWOT dans le scroll gauche
- `app/api/hrflow/upskill/route.ts` : existant, aucun changement

---

## Feature 2 — Panneau droit : tabs "SWOT HrFlow" + "Chat IA"

### Problème
Le panneau droit (Chat IA) prend tout l'espace horizontal disponible — trop large, la conversation paraît vide.

### Solution
Remplacer le panneau droit fixe par **2 onglets** :
- Onglet 1 : `Analyse HrFlow` (SWOT — actif par défaut, met HrFlow en avant)
- Onglet 2 : `Chat IA` (Q&A existant)

**Largeur fixe** du panneau droit : `420px` au lieu de `flex-1`.

**Onglet "Analyse HrFlow" :**  
- Contient le même SWOT que Feature 1 (éviter la duplication : créer un composant `HrFlowSWOT.tsx`)  
- Si `hrflow_key` null : illustration "Analyse disponible après scoring HrFlow"  

**Onglet "Chat IA" :**  
- Reprend le `QAPanel` existant sans modification  

### Portée
- `app/components/ProfileDetailView.tsx` : refactor du panneau droit en tabs
- Nouveau composant `app/components/HrFlowSWOT.tsx`

---

## Feature 3 — Section "Équipe" dans la sidebar (front-only)

### Objectif
Montrer que Claw4HR est un outil collaboratif d'équipe RH, pas un outil solo.

### Nouvelle nav
Ajout d'une troisième section dans la sidebar : **"Équipe"**, sous "Insights".  
Nouvel item : `team` dans `NavSection`.

### TeamView
Composant `app/components/TeamView.tsx` — **100% front, aucun appel API**.

**Contenu :**

1. **Header :** "Votre équipe · Acme Corp" (nom d'entreprise depuis userProfile)

2. **Membres fictifs pré-remplis (3 membres) :**
   - Sophie Martin — Responsable RH — `Actif`
   - Lucas Bernard — Chargé de recrutement — `Actif`  
   - Émilie Rousseau — Talent Acquisition — `Hors ligne`
   - + l'utilisateur connecté (depuis userProfile.name) — `Vous`

3. **Générer un token d'invitation :**
   - Bouton "Générer un lien d'invitation"
   - Génère `crypto.randomUUID().slice(0, 8).toUpperCase()` côté client
   - Affiche : `claw4hr.io/invite/XXXXXXXX` avec bouton "Copier"
   - Toast de confirmation : "Lien copié dans le presse-papier"

4. **Rôles disponibles :** Radio button "Recruteur" / "Admin" (décoratif)

### Portée
- `app/components/Sidebar.tsx` : ajouter section "Équipe" + item `team`
- `app/components/TeamView.tsx` : nouveau composant
- `app/components/Dashboard.tsx` : gérer le state `team` dans `DashboardView`

---

## Feature 4 — Pipeline enrichi (colonnes + drag & drop + suppression)

### Nouvelles colonnes
Supprimer `sourced`. Nouvelles colonnes dans l'ordre :

| id | label | sous-titre | couleur |
|---|---|---|---|
| `shortlisted` | Shortlistés | Sélectionnés par l'IA | indigo `#4f46e5` |
| `contacted` | Contactés | Message outreach envoyé | ambre `#f59e0b` |
| `waiting` | En attente | En attente de réponse | bleu `#3b82f6` |
| `discussing` | En discussion | Échanges en cours | vert `#10b981` |
| `archived` | Archivés | Candidatures closes | gris `#6b7280` |

5 colonnes → layout `grid-cols-5` avec gap réduit.

### Persistance du stage
Ajouter colonne `pipeline_stage text DEFAULT 'shortlisted'` à la table `shortlist` via migration Supabase.

Migration SQL :
```sql
ALTER TABLE shortlist ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'shortlisted';
```

API : ajouter `PATCH /api/account/shortlist` pour mettre à jour le `pipeline_stage` d'une entrée.

### Drag & Drop natif (HTML5 DnD)
- `draggable="true"` sur chaque carte
- `onDragStart` : stocker `profile_key` dans `dataTransfer`
- `onDragOver` / `onDrop` sur chaque colonne : appel `PATCH /api/account/shortlist` puis update state local
- Feedback visuel : la colonne survolée change légèrement de background

### Suppression
- Bouton X discret sur chaque carte (visible au hover)  
- Appel `DELETE /api/account/shortlist` existant  
- Confirmation : simple `window.confirm` ou suppression directe avec undo toast (préférer undo toast pour l'UX)

### Amélioration visuelle des cartes
- Indicateur de stage en badge coloré sur la carte (cohérent avec la couleur de colonne)
- Score HrFlow toujours visible
- Bouton "Contacter" au hover sur les cartes non-contactées

### Portée
- `app/components/PipelineView.tsx` : refactor complet (nouvelles colonnes, DnD, delete)
- `app/api/account/shortlist/route.ts` : ajouter `PATCH` pour update `pipeline_stage`
- Migration SQL Supabase : `ALTER TABLE shortlist ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'shortlisted'`

---

## Ordre d'implémentation recommandé

1. Migration SQL Supabase (bloquant pour Feature 4)
2. Feature 4 — Pipeline (impact visuel maximal, le plus long)
3. Feature 1+2 — SWOT + tabs profil (créer `HrFlowSWOT.tsx` puis intégrer dans tabs)
4. Feature 3 — Team (plus simple, 100% front)

---

## Non-scope
- Pas de vraie gestion d'équipe en base (Supabase)
- Pas de vraie validation des tokens d'invitation
- Pas de notifications temps réel sur les changements de stage pipeline
