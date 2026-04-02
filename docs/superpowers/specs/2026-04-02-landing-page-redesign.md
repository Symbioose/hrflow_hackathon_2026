# Claw4HR Landing Page Redesign

## Overview

Complete redesign of the landing page (`/app/landing/page.tsx`) to match the quality of folk.app and juicebox.ai. The goal is to communicate Claw4HR's value proposition — AI-powered passive talent sourcing from everywhere, instantly — through a clean, modern, production-ready page.

Design direction: **mix of folk.app (minimal, clean, whitespace) and juicebox.ai (tech-forward, data-heavy candidate cards)**.

## Architecture

### New Files
- `/components/ui/globe-hero.tsx` — Three.js wireframe globe (react-three-fiber)

### Modified Files
- `/app/landing/page.tsx` — Complete rewrite
- `/app/landing/layout.tsx` — Updated fonts (Inter via Google Fonts)
- `/app/globals.css` — Landing-specific utility classes and animations
- `/package.json` — New dependencies

### Dependencies to Install
- `three` — 3D rendering
- `@react-three/fiber` — React Three.js renderer
- `@react-three/drei` — Three.js helpers
- `framer-motion` — Smooth scroll animations

### Unchanged
- Dashboard (`/app/page.tsx`, `/app/components/*`) — untouched
- API routes — untouched
- `/components/ui/dithering-shader.tsx` — kept but no longer used by landing

## Design System

### Color Palette
Mix approach — clean neutral base with strategic accent color:
- **Background:** `#FFFFFF` (white) and `#FAFAFA` (off-white alternating)
- **Text primary:** `#0F172A` (slate-900)
- **Text secondary:** `#64748B` (slate-500)
- **Accent:** `#6366F1` (indigo-500) — bridges the gap between folk's minimal black and the dashboard's cyan
- **Accent light:** `#EEF2FF` (indigo-50) — for badges and subtle backgrounds
- **Dark sections:** `#0F172A` (slate-900) — for CTA and contrast sections

### Typography
- **Headings:** Inter (700/800 weight), large sizes, tight tracking
- **Body:** Inter (400/500 weight)
- **Mono accents:** Geist Mono (already in project) for technical labels

### Spacing
- Sections: `py-24` to `py-32` (generous whitespace like folk)
- Max content width: `max-w-6xl` centered
- Consistent `gap-16` between major blocks

## Sections (top to bottom)

### 1. Navigation
- Fixed, transparent -> white on scroll (backdrop-blur)
- Logo "Claw4HR" left, links center, CTA button right
- Links: Features, How it works, Integrations
- CTA: "Start Sourcing" (indigo filled button)

### 2. Hero
- Globe Three.js wireframe as background (subtle, low opacity)
- Badge: "AI-Powered Talent Sourcing" with pulse dot
- H1: **"Source talent from everywhere. Instantly."**
- Subtitle: "Claw4HR connects to GitHub, LinkedIn, Indeed and more — finding, scoring, and ranking passive candidates in real-time with AI."
- Dual CTA: "Start Sourcing" (filled) + "Watch Demo" (outline)
- Below: Trust metrics row — "800M+ Profiles", "6+ Sources", "Real-Time Scoring", "GDPR Compliant"

### 3. Problem Statement
- Clean white section
- H2: "Recruiters spend 80% of their time sourcing. We cut that to zero."
- 3 stat cards side by side:
  - "13h/week" — Average time recruiters spend sourcing
  - "80%" — Of qualified candidates are passive (not applying)
  - "<2min" — Claw4HR's average time to first ranked results

### 4. Features Grid
- 2x2 grid of feature cards with subtle border and hover elevation
- Each: icon (lucide) + title + description + small visual/illustration
  1. **Multi-Source Intelligence** — "Search GitHub, LinkedIn, Indeed, and more from a single query. Our AI aggregates profiles across platforms."
  2. **AI Scoring & Matching** — "Every candidate scored 0-100% with SWOT analysis. Not keywords — real semantic skill understanding."
  3. **Just-in-Time Pipeline** — "X-Ray, Enrich, Index, Score — our 4-step pipeline processes candidates in real-time."
  4. **Natural Language Search** — "Describe your ideal candidate in plain English. Our NLP engine understands context and intent."

### 5. How It Works (Pipeline)
- Dark background section (slate-900) for contrast
- H2: "From search to shortlist in 4 steps"
- Horizontal step cards with connecting lines:
  1. X-Ray — "Discover profiles across the web"
  2. Enrich — "Complete profiles with public data"
  3. Index — "Parse and structure with HrFlow AI"
  4. Score — "Rank by semantic skill match"
- Each step has a number, icon, and brief description

### 6. Integrations
- White section
- H2: "Connects to your entire stack"
- Grid of integration logos/cards: HrFlow, OpenClaw, GitHub, LinkedIn, Indeed, Ollama
- Each with name and one-line description

### 7. Final CTA
- Indigo gradient background with globe silhouette
- H2: "Start sourcing smarter today"
- Subtitle + email input + CTA button
- Or simple dual button CTA

### 8. Footer
- Clean, minimal
- Logo, links columns, legal text

## Animations
- **Scroll reveal:** Elements fade-in-up on intersection (CSS + IntersectionObserver, or framer-motion `whileInView`)
- **Globe:** Continuous slow rotation
- **Nav:** Background transition on scroll
- **Hover:** Cards lift with subtle shadow
- **Badge pulse:** Dot animation on hero badge
- All animations respect `prefers-reduced-motion`

## Globe Component
- Three.js wireframe sphere via @react-three/fiber
- Low polygon count for performance
- Subtle rotation (0.003-0.005 rad/frame)
- Uses CSS custom property colors for theme compatibility
- Positioned behind hero content with `pointer-events-none`
- Canvas is lazy-loaded (dynamic import) to avoid SSR issues

## Performance Considerations
- Globe canvas: dynamic import with `ssr: false`
- Images: Next.js `<Image>` with proper sizing
- Fonts: Inter loaded via `next/font/google`
- No external image dependencies (globe is procedural)
- Minimal JS bundle: framer-motion tree-shakes well

## Non-Goals
- No changes to dashboard
- No new API routes
- No authentication flow
- No actual form submission (CTA links to dashboard)
