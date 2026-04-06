# Landing Page — Refonte Narrative (Arc Émotionnel RH)

**Date:** 2026-04-04  
**Contexte:** La landing page actuelle est redondante (Stack section = Feature 01, 2 sections navy identiques, "Demander une démo" apparaît 5 fois), rien ne ressort visuellement, et le message ne parle pas aux RH. Cette refonte introduit un arc émotionnel centré sur la douleur des talents passifs.

---

## Diagnostic de l'existant

| Section | Problème |
|---|---|
| Nav | 2 CTAs identiques ("Voir la Démo" + "Demander une démo") |
| Hero visual | Card navy vide, aucun contenu produit visible |
| MetricsBar | Placée avant les features — introduit des chiffres sans contexte |
| Feature 03 (Pipeline) | Redondant avec Feature 01 (Sources) — l'une explique d'où viennent les données, l'autre comment elles sont traitées, mais le RH n'a pas besoin de cette distinction |
| Stack section | Liste les mêmes intégrations que Feature 01 SourcesVisual |
| 2 sections navy (Demo + CTA) | Même palette, même shader — aucune différenciation |
| CTA "Demander une démo" | Répété 5× sans escalade narrative |

---

## Principe directeur

**Pain point cible :** Les talents passifs — les meilleurs candidats ne postulent jamais sur les job boards. C'est le problème numéro un des recruteurs.

**Arc narratif :** Douleur → Solution → Preuve → Action. Chaque section fait avancer une étape du raisonnement du RH.

---

## Nouvelle structure de page

```
① Nav
② Hero
③ Pain Block (nouveau)
④ Feature 01 — Multi-Source
⑤ Feature 02 — AI Scoring (fond navy)
⑥ Demo
⑦ Metrics Bar (déplacée)
⑧ CTA
⑨ FAQ
⑩ Footer
```

**Supprimé :** Feature 03 (Pipeline JIT), Stack section.

---

## Spécifications par section

### ① Nav

**Changement :** Supprimer le bouton "Voir la Démo" (doublon avec le lien "Démo" dans le menu). Conserver uniquement le bouton coral "Demander une démo →".

Résultat : 1 seul CTA dans la nav, pas 2.

---

### ② Hero

**Headline (remplace l'actuel) :**
> "Les talents que vous cherchez ne postulent jamais."

**Sous-titre :**
> "Claw4HR trouve les meilleurs profils passifs sur GitHub, LinkedIn et Indeed — scorés, enrichis, prêts à contacter. En moins de 5 secondes."

**CTA :** Un seul bouton coral "Voir en action ↓" (ancre `#demo`). Supprimer le bouton outline "Voir la Démo" qui doublonne.

**Visuel produit (remplace la card navy vide) :**
Un composant `SearchResultsVisual` — mock d'interface de résultats :
- Barre de recherche en langage naturel : `« Développeur Python senior à Paris, exp. ML »`
- 3 cartes de résultats avec avatar, nom, titre, source (GitHub/LinkedIn), score de match en coral (94%, 87%, 81%)
- Footer du composant : `"12 profils trouvés · ⚡ 3.2s"`
- Fond navy, style cohérent avec le design system existant

---

### ③ Pain Block (nouvelle section)

**Position :** Juste après le hero.  
**Fond :** Navy (`#0B1226`) — crée une rupture visuelle forte avec le hero blanc.

**Headline :**
> "Le problème de tous les recruteurs. Enfin résolu."

**Format :** Deux colonnes côte à côte (split card) :

**Colonne gauche — "Sans Claw4HR" (fond gris clair) :**
- 📋 300 CVs reçus
- 🔍 Tri manuel — 2 jours
- 📞 10 entretiens téléphoniques
- 😞 3 profils pertinents
- ⏰ Poste ouvert depuis 6 semaines
- Badge rouge : "Les meilleurs ? Jamais vus."

**Colonne droite — "Avec Claw4HR" (fond encre sombre) :**
- 🤖 Recherche GitHub + LinkedIn
- ⚡ Résultats en <5 secondes
- 📊 Score + analyse SWOT
- 🎯 12 profils pertinents
- 📅 Contact sous 24h
- Badge vert : "Talents passifs inclus."

---

### ④ Feature 01 — Multi-Source

**Fond :** Blanc (`#FFFFFF`).  
**Changement de copy uniquement :**
- Tag : "Multi-Source"
- Titre : `"Cherchez là où les talents passifs vivent vraiment."`
- Desc : `"GitHub, LinkedIn, Indeed — Claw4HR interroge simultanément toutes les plateformes où les meilleurs profils sont actifs sans chercher d'emploi."`

**Visuel :** `SourcesVisual` existant, inchangé.

---

### ⑤ Feature 02 — AI Scoring

**Fond : Cream (`#FFF5F0`)** — identique à l'actuel.

Rationale : Feature 02 navy + Demo navy auraient été deux sections sombres consécutives. Le contraste sombre est fourni par le Pain Block (entre Hero et features) et la Demo section. L'alternance est : navy (Pain) → blanc (F01) → cream (F02) → navy (Demo) → cream (Metrics) → navy (CTA).

**Copy :**
- Tag : "AI Scoring"
- Titre : `"Chaque candidat expliqué. Pas juste noté."`
- Desc : `"L'analyse SWOT rend chaque match transparent — forces, lacunes et raisonnement. Pas un chiffre opaque : une décision argumentée."`

**Visuel :** `ScoreVisual` existant, inchangé.

---

### ⑥ Demo

**Fond :** Navy — identique à l'existant.  
**Changement copy uniquement :**
- Texte sous le bouton play : `"3 minutes. De la fiche de poste aux candidats classés."` (remplace "Regarder la démo de 2 min")

**Visuel :** Placeholder vidéo existant conservé (TODO vidéo reste).

---

### ⑦ Metrics Bar (déplacée)

**Déplacée depuis sa position actuelle (entre Hero et Features) vers ici (après Demo).**

Fond : Cream. Contenu inchangé — 4 compteurs animés. Le positionnement après la démo en fait une **validation** ("voilà les résultats") plutôt qu'une **introduction** hors contexte.

---

### ⑧ CTA

**Fond :** Navy — existant.  
**Headline :**
> "Vos prochains recrutements. Sans job board."

**Sous-titre :**
> "Rejoignez les recruteurs qui sourcent, scorent et engagent les meilleurs talents passifs — en temps réel, propulsé par l'IA."

**CTAs :** "Demander une démo →" (coral) + "Contacter l'équipe" (blanc). Inchangé structurellement.

---

### ⑨ FAQ — Inchangée

---

### ⑩ Footer — Inchangé

---

## Résumé des changements techniques

| Type | Détail |
|---|---|
| **Suppression** | `StackSection` — composant et appel dans le render |
| **Suppression** | Feature 03 (`PipelineFlowVisual`) — entrée dans le tableau `features` |
| **Déplacement** | `MetricsBar` — après `DemoSection` |
| **Nouveau composant** | `SearchResultsVisual` — remplace le hero card navy vide |
| **Nouveau composant** | `PainBlock` — section avant/après sur fond navy |
| **Modification** | `FeaturesSection` — Feature 02 reste cream, copy mise à jour |
| **Modification** | Copy de tous les titres/sous-titres listés ci-dessus |
| **Modification** | Nav — supprimer 1 bouton CTA |
| **Modification** | Hero — supprimer 1 bouton CTA outline |

---

## Ce qui ne change pas

- Style pixel coral (PixelBtn, PixelAgent, etc.)
- DitheringShader dans Hero et Demo
- GlobeCanvas dans CTA
- AnimatedNumber (MetricsBar)
- ScoreVisual, SourcesVisual (visuels features)
- FAQ accordion
- Footer
- Palette de couleurs (CORAL, NAVY, INK, CREAM)
