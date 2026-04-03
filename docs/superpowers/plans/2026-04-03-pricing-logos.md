# Pricing Page + Brand Logos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Pricing page with 3 tier cards, a "Tarifs" nav link, pill-style brand logos in SourcesVisual and StackSection.

**Architecture:** All landing page edits in `app/landing/page.tsx`. New pricing page at `app/pricing/page.tsx` with its own `layout.tsx` for the display font. No shared component extraction — YAGNI.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, inline SVG for GitHub/LinkedIn logos

---

## File Map

| File | Change |
|------|--------|
| `app/landing/page.tsx` | Modify Nav (add Tarifs), rewrite SourcesVisual, update StackSection badges |
| `app/pricing/layout.tsx` | Create — loads Instrument_Serif font (same as landing) |
| `app/pricing/page.tsx` | Create — full pricing page |

---

### Task 1: Add "Tarifs" nav link

**Files:**
- Modify: `app/landing/page.tsx` — `Nav` function

- [ ] **Step 1: Add Tarifs link in Nav**

Find the nav links inside `Nav`:
```tsx
<a href="#features" className="hover:text-[#1a1a2e] transition-colors">Fonctionnalités</a>
<a href="#demo" className="hover:text-[#1a1a2e] transition-colors">Démo</a>
```

Replace with:
```tsx
<a href="#features" className="hover:text-[#1a1a2e] transition-colors">Fonctionnalités</a>
<a href="#demo" className="hover:text-[#1a1a2e] transition-colors">Démo</a>
<a href="/pricing" className="hover:text-[#1a1a2e] transition-colors">Tarifs</a>
```

- [ ] **Step 2: TypeScript check**
```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**
```bash
git add app/landing/page.tsx
git commit -m "feat(landing): add Tarifs nav link to /pricing"
```

---

### Task 2: Rewrite SourcesVisual with pill logos

**Files:**
- Modify: `app/landing/page.tsx` — `SourcesVisual` function

Replace the entire `SourcesVisual` function with:

- [ ] **Step 1: Replace SourcesVisual**

Find and replace the entire `SourcesVisual` function (starts with `function SourcesVisual()`, ends before `function ScoreVisual()`):

```tsx
const GH_PATH = "M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
const LI_PATH = "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"

function BrandPill({ label, bg, svgPath, svgViewBox = "0 0 24 24" }: { label: string; bg: string; svgPath?: string; svgViewBox?: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2" style={{ backgroundColor: bg, borderRadius: "100px" }}>
      {svgPath && (
        <svg width="14" height="14" viewBox={svgViewBox} fill="white" style={{ flexShrink: 0 }}>
          <path d={svgPath} />
        </svg>
      )}
      <span className="font-mono font-semibold text-xs" style={{ color: WHITE }}>{label}</span>
    </div>
  )
}

function SourcesVisual() {
  const sources = [
    { name: "GitHub", sub: "Activité développeur & repos", bg: "#24292e", svgPath: GH_PATH, svgViewBox: "0 0 98 96", count: "2.4k profils" },
    { name: "LinkedIn", sub: "Profils professionnels", bg: "#0A66C2", svgPath: LI_PATH, svgViewBox: "0 0 24 24", count: "5.1k profils" },
    { name: "Indeed", sub: "Offres & candidatures", bg: "#2164F3", count: "1.8k profils" },
  ]
  return (
    <div className="w-full" style={{ backgroundColor: CREAM, borderRadius: "16px", border: `1px solid ${INK}06`, overflow: "hidden" }}>
      <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${INK}06` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center font-mono font-bold text-xs text-white" style={{ backgroundColor: CORAL, borderRadius: "8px" }}>AI</div>
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: MUTED }}>Agrégation multi-sources</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2" style={{ backgroundColor: SUCCESS, borderRadius: "50%" }} />
          <span className="text-xs font-mono" style={{ color: SUCCESS }}>Live</span>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sources.map((s) => (
          <div key={s.name} className="p-5 transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: WHITE, borderRadius: "12px", border: `1px solid ${INK}06` }}>
            <div className="flex items-center justify-between mb-4">
              <BrandPill label={s.name} bg={s.bg} svgPath={s.svgPath} svgViewBox={s.svgViewBox} />
              <span className="text-[10px] font-mono" style={{ color: MUTED }}>{s.count}</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="px-8 py-4 flex items-center gap-3" style={{ backgroundColor: `${CORAL}06`, borderTop: `1px solid ${INK}06` }}>
        <div className="flex -space-x-2">
          {["#24292e", "#0A66C2", "#2164F3"].map((c, i) => (
            <div key={i} className="w-6 h-6 flex items-center justify-center text-white text-[8px] font-bold border-2 border-white" style={{ backgroundColor: c, borderRadius: "50%" }}>
              {["GH", "in", "IN"][i]}
            </div>
          ))}
        </div>
        <span className="text-xs" style={{ color: MUTED }}>Toutes les sources convergent en un seul pipeline classé</span>
      </div>
    </div>
  )
}
```

Note: Place `GH_PATH`, `LI_PATH`, and `BrandPill` **before** `SourcesVisual`. Place them after the `Avatar` function definition (around line 227) so they are defined before use.

- [ ] **Step 2: TypeScript check**
```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**
```bash
git add app/landing/page.tsx
git commit -m "feat(landing): rewrite SourcesVisual — pill logos, remove HrFlow source, 3 sources"
```

---

### Task 3: Update StackSection with pill logos

**Files:**
- Modify: `app/landing/page.tsx` — `StackSection` function

- [ ] **Step 1: Replace the StackSection items array and card markup**

Find the `items` array inside `StackSection`:
```tsx
const items = [
  { name: "HrFlow.ai", desc: "Parsing CV, indexation & moteur de scoring IA", letter: "H", bg: CORAL },
  { name: "OpenClaw", desc: "Orchestration multi-agents & bot Telegram", letter: "O", bg: "#7C3AED" },
  { name: "GitHub", desc: "Activité développeur & analyse de repos", letter: "GH", bg: "#24292e" },
  { name: "LinkedIn", desc: "Enrichissement de profils professionnels", letter: "in", bg: "#0A66C2" },
  { name: "Indeed", desc: "Scraping job boards & découverte de candidats", letter: "IN", bg: "#2164F3" },
  { name: "Ollama", desc: "Inférence LLM locale — Qwen3 14B", letter: "Q", bg: "#10b981" },
]
```

Replace with:
```tsx
const items = [
  { name: "HrFlow.ai", desc: "Parsing CV, indexation & moteur de scoring IA", bg: CORAL },
  { name: "OpenClaw", desc: "Orchestration multi-agents & bot Telegram", bg: "#7C3AED" },
  { name: "GitHub", desc: "Activité développeur & analyse de repos", bg: "#24292e", svgPath: GH_PATH, svgViewBox: "0 0 98 96" },
  { name: "LinkedIn", desc: "Enrichissement de profils professionnels", bg: "#0A66C2", svgPath: LI_PATH, svgViewBox: "0 0 24 24" },
  { name: "Indeed", desc: "Scraping job boards & découverte de candidats", bg: "#2164F3" },
  { name: "Ollama", desc: "Inférence LLM locale — Qwen3 14B", bg: "#10b981" },
]
```

Find the card rendering inside the `.map()`:
```tsx
<div className="w-13 h-13 flex items-center justify-center text-white font-mono font-bold text-sm mb-5" style={{ backgroundColor: x.bg, borderRadius: "12px", width: 52, height: 52 }}>{x.letter}</div>
<p className="font-semibold text-lg" style={{ color: INK }}>{x.name}</p>
<p className="text-sm mt-1.5 leading-relaxed" style={{ color: MUTED }}>{x.desc}</p>
```

Replace with:
```tsx
<div className="mb-5">
  <BrandPill label={x.name} bg={x.bg} svgPath={(x as { svgPath?: string }).svgPath} svgViewBox={(x as { svgViewBox?: string }).svgViewBox} />
</div>
<p className="font-semibold text-lg" style={{ color: INK }}>{x.name}</p>
<p className="text-sm mt-1.5 leading-relaxed" style={{ color: MUTED }}>{x.desc}</p>
```

- [ ] **Step 2: TypeScript check**
```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**
```bash
git add app/landing/page.tsx
git commit -m "feat(landing): update StackSection — pill-style brand logos"
```

---

### Task 4: Create pricing layout

**Files:**
- Create: `app/pricing/layout.tsx`

- [ ] **Step 1: Create `app/pricing/layout.tsx`**

```tsx
import { Instrument_Serif } from "next/font/google"

const displayFont = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
})

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className={displayFont.variable}>{children}</div>
}
```

- [ ] **Step 2: TypeScript check**
```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**
```bash
git add app/pricing/layout.tsx
git commit -m "feat(pricing): add layout with display font"
```

---

### Task 5: Create pricing page

**Files:**
- Create: `app/pricing/page.tsx`

- [ ] **Step 1: Create `app/pricing/page.tsx`**

```tsx
"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

const CORAL = "#FF6B6B"
const CORAL_DEEP = "#CC4444"
const CREAM = "#FFF5F0"
const INK = "#1a1a2e"
const NAVY = "#0B1226"
const MUTED = "#6b7280"
const WHITE = "#FFFFFF"
const SUCCESS = "#10b981"
const serif = "var(--font-display), 'Georgia', serif"

function PixelBtn({ href, children, variant = "coral", size = "md" }: { href: string; children: ReactNode; variant?: "coral" | "dark" | "white" | "outline"; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "px-5 py-2.5 text-xs", md: "px-8 py-4 text-sm", lg: "px-10 py-5 text-base" }
  const bg = variant === "coral" ? CORAL : variant === "dark" ? INK : variant === "outline" ? "transparent" : WHITE
  const fg = variant === "white" ? INK : variant === "outline" ? INK : CREAM
  const shadow = variant === "coral" ? CORAL_DEEP : variant === "outline" ? `${INK}20` : variant === "dark" ? "#000" : `${INK}15`
  return (
    <a href={href} className={`inline-block font-mono font-bold uppercase tracking-wider transition-all duration-100 select-none cursor-pointer active:shadow-none active:translate-x-[4px] active:translate-y-[4px] ${sizes[size]}`}
      style={{ backgroundColor: bg, color: fg, boxShadow: `4px 4px 0 0 ${shadow}`, border: variant === "outline" ? `2px solid ${INK}` : "none" }}>
      {children}
    </a>
  )
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    let t: ReturnType<typeof setTimeout>
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { if (delay) t = setTimeout(() => setVis(true), delay); else setVis(true); obs.unobserve(el) } }, { threshold: 0.08 })
    obs.observe(el)
    return () => { obs.disconnect(); clearTimeout(t) }
  }, [delay])
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  )
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", h, { passive: true })
    return () => window.removeEventListener("scroll", h)
  }, [])
  return (
    <nav className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-8 py-5 transition-all duration-300"
        style={{ backgroundColor: scrolled ? `${WHITE}ee` : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? `1px solid ${INK}08` : "1px solid transparent" }}>
        <a href="/landing" className="font-mono font-bold text-2xl tracking-tight" style={{ color: CORAL }}>Claw4HR</a>
        <div className="hidden md:flex items-center gap-10 text-sm font-mono uppercase tracking-widest" style={{ color: MUTED, fontSize: "11px" }}>
          <a href="/landing#features" className="hover:text-[#1a1a2e] transition-colors">Fonctionnalités</a>
          <a href="/landing#demo" className="hover:text-[#1a1a2e] transition-colors">Démo</a>
          <a href="/pricing" className="transition-colors" style={{ color: CORAL }}>Tarifs</a>
        </div>
        <div className="flex items-center gap-3">
          <PixelBtn href="/landing#demo" variant="outline" size="sm">Voir la Démo</PixelBtn>
          <PixelBtn href="/landing#demo" variant="coral" size="sm">Demander une démo &rarr;</PixelBtn>
        </div>
      </div>
    </nav>
  )
}

function PricingHero() {
  return (
    <section className="pt-40 pb-20 text-center" style={{ backgroundColor: WHITE }}>
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: CORAL }}>Tarifs</p>
        <h1 className="leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: serif, fontSize: "clamp(2.5rem, 5vw, 4rem)", color: INK }}>
          Simple. Transparent. <span style={{ fontStyle: "italic", color: CORAL }}>Sur mesure.</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed max-w-xl mx-auto" style={{ color: MUTED }}>
          Contactez-nous pour un devis personnalisé adapté à la taille et aux besoins de votre équipe.
        </p>
      </Reveal>
    </section>
  )
}

const tiers = [
  {
    name: "Starter",
    subtitle: "Pour les équipes qui démarrent",
    features: [
      "Jusqu'à 3 utilisateurs",
      "500 profils indexés / mois",
      "Sourcing GitHub + LinkedIn + Indeed",
      "Scoring IA 0–100%",
      "Support email",
    ],
    cta: "Contacter l'équipe",
    highlighted: false,
    variant: "outline" as const,
  },
  {
    name: "Pro",
    subtitle: "Pour les équipes en croissance",
    badge: "Recommandé",
    features: [
      "Jusqu'à 10 utilisateurs",
      "5 000 profils indexés / mois",
      "Toutes les sources",
      "Scoring IA + analyse SWOT",
      "Pipeline JIT temps réel",
      "Support prioritaire",
    ],
    cta: "Contacter l'équipe",
    highlighted: true,
    variant: "coral" as const,
  },
  {
    name: "Enterprise",
    subtitle: "Pour les grandes organisations",
    features: [
      "Utilisateurs illimités",
      "Profils illimités",
      "Sources personnalisées",
      "Accès API",
      "SLA garanti",
      "Account manager dédié",
    ],
    cta: "Contacter l'équipe",
    highlighted: false,
    variant: "dark" as const,
  },
]

function TiersSection() {
  return (
    <section className="py-20" style={{ backgroundColor: CREAM }}>
      <div className="mx-auto max-w-6xl px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 100}>
              <div className="p-8 h-full flex flex-col relative" style={{
                backgroundColor: WHITE,
                borderRadius: "16px",
                border: tier.highlighted ? `2px solid ${CORAL}` : `1px solid ${INK}06`,
                boxShadow: tier.highlighted ? `8px 8px 0 0 ${CORAL}20` : `4px 4px 0 0 ${INK}06`,
              }}>
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 font-mono text-xs font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: CORAL, borderRadius: "100px" }}>
                    {tier.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-mono font-bold text-xl" style={{ color: INK }}>{tier.name}</h3>
                  <p className="text-sm mt-1" style={{ color: MUTED }}>{tier.subtitle}</p>
                  <div className="mt-5 font-mono font-bold text-3xl" style={{ color: tier.highlighted ? CORAL : INK }}>
                    Sur devis
                  </div>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: INK }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                        <path d="M5 13l4 4L19 7" stroke={tier.highlighted ? CORAL : SUCCESS} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <PixelBtn href="mailto:contact@claw4hr.ai" variant={tier.variant} size="md">
                  {tier.cta} &rarr;
                </PixelBtn>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingCTA() {
  return (
    <section className="py-28 text-center" style={{ backgroundColor: NAVY }}>
      <div className="max-w-2xl mx-auto px-8">
        <Reveal>
          <h2 className="leading-[1.05] tracking-[-0.02em] text-white" style={{ fontFamily: serif, fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Une question sur nos <span style={{ fontStyle: "italic", color: CORAL }}>offres ?</span>
          </h2>
          <p className="mt-5 text-lg" style={{ color: `${WHITE}60` }}>Notre équipe vous répond sous 24h.</p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <PixelBtn href="mailto:contact@claw4hr.ai" variant="coral" size="lg">Nous contacter &rarr;</PixelBtn>
            <PixelBtn href="/landing#demo" variant="white" size="lg">Voir la démo</PixelBtn>
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-wider" style={{ color: `${WHITE}25` }}>
            Sur invitation &middot; Démo personnalisée disponible
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="py-10" style={{ backgroundColor: CREAM, borderTop: `1px solid ${INK}06` }}>
      <div className="mx-auto max-w-7xl px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-mono font-bold text-xl tracking-tight" style={{ color: CORAL }}>Claw4HR</span>
        <p className="text-sm" style={{ color: `${MUTED}80` }}>Conçu pour le Hackathon HrFlow.ai 2026</p>
      </div>
    </footer>
  )
}

export default function PricingPage() {
  return (
    <div style={{ backgroundColor: WHITE, color: INK }}>
      <Nav />
      <PricingHero />
      <TiersSection />
      <PricingCTA />
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**
```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**
```bash
git add app/pricing/page.tsx
git commit -m "feat(pricing): add pricing page — 3 tier cards, B2B premium, coral identity"
```

---

## Self-Review

**Spec coverage:**
- ✅ Nav "Tarifs" link → Task 1
- ✅ `/pricing` page with 3 tiers → Task 5
- ✅ SourcesVisual: HrFlow removed, 3 sources, pill logos → Task 2
- ✅ StackSection: pill logos → Task 3
- ✅ BrandPill component with GitHub/LinkedIn SVG inline → Task 2 (defined once, reused in Task 3)
- ✅ Pricing layout with display font → Task 4
- ✅ "Sur devis" pricing (no public price) → Task 5
- ✅ Coral identity preserved throughout → Task 5

**No placeholders, no contradictions, no type mismatches.**
**`BrandPill` defined in Task 2 and referenced in Task 3 — consistent.**
