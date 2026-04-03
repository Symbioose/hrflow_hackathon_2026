# Pricing Page + Brand Logos — Design Spec
**Date:** 2026-04-03

---

## Changes Overview

1. Nav — add "Tarifs" link
2. New `/pricing` page — 3 tier cards
3. SourcesVisual — remove HrFlow, real logos for 3 sources
4. Stack section — pill-style logos for all integrations

---

## 1. Nav

Add "Tarifs" link in the nav between "Démo" and the CTA buttons:
```tsx
<a href="/pricing">Tarifs</a>
```
Same style as existing nav links (font-mono, uppercase, tracking-widest, MUTED color, hover INK).

---

## 2. New `/pricing` page — `app/pricing/page.tsx`

### Layout
Reuse `Nav` and `Footer` components from `app/landing/page.tsx` by extracting them to `app/components/Nav.tsx` and `app/components/Footer.tsx`, OR inline them in the pricing page (simpler — inline).

**Simpler approach: inline Nav + Footer** in the pricing page directly (copy the JSX, no extraction). YAGNI.

### Page structure
```
Nav (same as landing) → Hero section → 3 Tier cards → CTA Final → Footer (same as landing)
```

### Hero section
- Label: "Tarifs" (coral mono)
- Headline: "Simple. Transparent. *Sur mesure.*"
- Subheadline: "Contactez-nous pour un devis personnalisé adapté à votre équipe."
- Background: WHITE

### Tier cards
3 cards side by side (`grid-cols-1 md:grid-cols-3`), background CREAM:

**Starter**
- Subtitle: "Pour les équipes qui démarrent"
- Features: Jusqu'à 3 utilisateurs / 500 profils indexés/mois / Sourcing GitHub + LinkedIn + Indeed / Scoring IA / Support email
- CTA: "Contacter l'équipe" (outline pixel button)
- Price display: "Sur devis"

**Pro** (highlighted — coral border, pixel shadow)
- Badge: "Recommandé"
- Subtitle: "Pour les équipes en croissance"
- Features: Jusqu'à 10 utilisateurs / 5 000 profils indexés/mois / Toutes les sources / Scoring IA + SWOT / Pipeline JIT / Support prioritaire
- CTA: "Contacter l'équipe" (coral pixel button)
- Price display: "Sur devis"

**Enterprise**
- Subtitle: "Pour les grandes organisations"
- Features: Utilisateurs illimités / Profils illimités / Sources personnalisées / API access / SLA garanti / Account manager dédié
- CTA: "Contacter l'équipe" (dark pixel button)
- Price display: "Sur devis"

### CTA Final
Dark navy section: "Prêt à transformer votre sourcing ?" + "Demander une démo →"

### Identity
Same design tokens as landing page: CORAL, NAVY, CREAM, WHITE, INK, MUTED, serif font, PixelBtn, Reveal animations.

The pricing page is a new file — it must re-declare all color constants and helper components (PixelBtn, Reveal, Grain) since they are not exported from the landing page.

---

## 3. SourcesVisual — `app/landing/page.tsx`

**Remove** HrFlow card (was: "CVs indexés", "10k+ profils" — inaccurate).

**New sources (3 cards):** GitHub, LinkedIn, Indeed

**Logo style: Option C — pills with SVG inline + name**

Replace the current square icon badges with pill-style badges:
```tsx
// GitHub pill
<div style={{ height: 40, borderRadius: 100, backgroundColor: "#24292e", display: "flex", alignItems: "center", gap: 8, padding: "0 14px" }}>
  <svg width="16" height="16" viewBox="0 0 98 96" fill="white">
    <path d="M48.854 0C21.839 0 0 22 0 49.217..." />
  </svg>
  <span style={{ color: WHITE, fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>GitHub</span>
</div>

// LinkedIn pill
<div style={{ height: 40, borderRadius: 100, backgroundColor: "#0A66C2", ... }}>
  <svg ...LinkedIn SVG...</svg>
  <span>LinkedIn</span>
</div>

// Indeed pill (no SVG — text only)
<div style={{ height: 40, borderRadius: 100, backgroundColor: "#2164F3", ... }}>
  <span>Indeed</span>
</div>
```

The `count` and `sub` fields in the source data update:
- GitHub: sub "Activité développeur & repos"
- LinkedIn: sub "Profils professionnels"
- Indeed: sub "Offres & candidatures"

Grid: `grid-cols-1 sm:grid-cols-3` (was grid-cols-2 for 4 cards, now 3 cards).

The bottom "converging indicator" row: update the stacked circles to show only 3 sources (GitHub, LinkedIn, Indeed colors).

---

## 4. Stack section logos — `app/landing/page.tsx`

Replace the current square letter badges with pill-style (same Option C style).

Each item in `StackSection` gets its icon pill:
- HrFlow.ai: coral pill, text "HrFlow.ai"
- OpenClaw: purple (#7C3AED) pill, text "OpenClaw"
- GitHub: #24292e pill, GitHub SVG + "GitHub"
- LinkedIn: #0A66C2 pill, LinkedIn SVG + "LinkedIn"
- Indeed: #2164F3 pill, text "Indeed"
- Ollama: #10b981 pill, text "Ollama"

The card layout changes: pill at top, then name + description below (same structure, just badge style changes).

---

## Out of Scope
- Real contact form or Calendly integration on pricing page
- Authentication / gating of pricing page
- English version of pricing page
