# Landing Page Refactor — Design Spec
**Date:** 2026-04-03  
**Product:** Claw4HR  
**Market:** France (primary), English version planned later

---

## Context

The current landing page (`app/landing/page.tsx`) has 13 sections with significant redundancy: two pipeline sections, two demo sections, fake testimonials, and a FAQ that mixes French/English and references the wrong product name ("PTI"). The goal is to strip it to a minimal, premium B2B SaaS feel — inspired by Juicebox.ai's clarity but retaining Claw4HR's pixel/coral identity.

---

## Target Audience

B2B premium buyers (HR directors, talent acquisition leads). No free trial. The primary CTA throughout is "Demander une démo." The page should feel like a real product, not a hackathon project.

---

## New Section Structure (8 sections)

```
Nav → Hero → Métriques → Features (3) → Démo Vidéo → Stack → FAQ → CTA → Footer
```

### Sections removed
- `ProblemSection` — problem is implicit in the Hero headline
- Standalone `PipelineSection` — merged into Feature 03
- `TestimonialsSection` — removed (fake, no credibility)
- `LiveSearchDemo` — removed (duplicate demo section)

---

## Section-by-Section Spec

### 1. Nav
- Links: Fonctionnalités, Démo (remove Pipeline and Stack links)
- Replace "Accès Dashboard" button → **"Demander une démo"** (coral pixel button)
- No other changes

### 2. Hero
- **Headline:** "Arrêtez de chercher. Commencez à *trouver.*" (keep as-is)
- **Subheadline:** "Un agent IA qui découvre, enrichit et évalue les meilleurs talents passifs sur GitHub, LinkedIn et Indeed — en quelques secondes."
- **CTAs:** Primary "Demander une démo →" (coral), Secondary "Voir la Démo" (outline, anchors to video section)
- **Remove:** "Propulsé par HrFlow.ai · OpenClaw · Ollama" badges (moved to Stack section)
- **Product visual:** Replace the busy 3-column dashboard mockup with a single clean candidate card showing name, role, match score (94%), and SWOT quadrant. More minimal, more premium.

### 3. Métriques
- Keep as-is: 10 000+ profils, 3+ sources, <5s réponse, 94% précision
- No copy changes

### 4. Features (3 blocks)

**Feature 01 — Multi-Source**
- Tag: "Multi-Source"
- Title: "Cherchez partout. Trouvez n'importe qui."
- Description: unchanged
- Visual: `SourcesVisual` (unchanged)
- Background: CREAM

**Feature 02 — AI Scoring**
- Tag: "AI Scoring"
- Title: "Chaque candidat. Classé & expliqué."
- Description: unchanged
- Visual: `ScoreVisual` (unchanged)
- Background: WHITE

**Feature 03 — Pipeline JIT** (replaces old Feature 03 + standalone PipelineSection)
- Tag: "Pipeline JIT"
- Title: "Quatre étapes. *Zéro travail manuel.*"
- Description: "De la découverte au contact — X-Ray, Enrich, Index, Score. Chaque étape s'exécute en temps réel dès qu'un talent est détecté."
- Visual: `PipelineFlowVisual` (unchanged)
- Background: CREAM (no longer a full coral-flood section)

### 5. Démo Vidéo
- Keep the dark navy section and dithering shader background
- Keep the fake play button placeholder for now
- `// TODO: remplacer par la vraie vidéo`
- Remove the "4.2s / 4 étapes / Zéro" stats row below the player (already covered in MetricsBar)
- Section intro copy unchanged

### 6. Stack / Integrations
- Keep as-is: HrFlow.ai, OpenClaw, GitHub, LinkedIn, Indeed, Ollama
- Move the "Propulsé par" badges from Hero to here (or simply remove them from Hero — Stack section makes the point)

### 7. FAQ
- **Language:** All French, no exceptions
- **Product name:** Replace all "PTI" → "Claw4HR"
- **Trim to 4 questions:**
  1. Comment Claw4HR trouve-t-il les talents passifs ?
  2. Qu'est-ce que l'analyse SWOT par candidat ?
  3. Quelle est la rapidité des résultats ?
  4. Puis-je rechercher en langage naturel ?
- Remove: scoring algorithm question (redundant with SWOT), data security question

### 8. CTA Final
- Keep dark navy section + globe canvas
- **Remove:** "Gratuit à essayer · Sans carte bancaire" (wrong for B2B premium)
- **Replace with:** "Sur invitation · Démo personnalisée disponible"
- Primary CTA: "Demander une démo →" (coral)
- Secondary CTA: "Contacter l'équipe" (white outline)

### 9. Footer
- No changes

---

## CTA Consistency Rule

Every CTA across the page that previously said "Lancer le Dashboard →" must be replaced with "Demander une démo →". This applies to Nav, Hero, and CTA Final section.

---

## Identity Preserved

- Coral (#FF6B6B) accent, pixel buttons with box-shadow offset
- Deep navy (#0B1226) for dark sections
- Cream (#FFF5F0) / White alternating section backgrounds
- Serif display font for headlines, mono for labels/CTAs
- Dithering shader backgrounds in Hero and Demo sections
- Grain overlay, scroll reveal animations — all kept

---

## Out of Scope

- English version (planned for later)
- Real video integration (placeholder kept, TODO comment added)
- Interactive demo or free trial flow
