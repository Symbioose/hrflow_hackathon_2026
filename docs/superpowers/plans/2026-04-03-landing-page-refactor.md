# Landing Page Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `app/landing/page.tsx` from 13 sections to 8 — stripping redundancy, fixing language inconsistencies, and aligning CTA language with a B2B premium audience.

**Architecture:** Single file edit. No new files or components. Each task targets one section or concern, with a TypeScript check and commit after each.

**Tech Stack:** Next.js (app router), React, TypeScript, Tailwind CSS, inline styles

---

## File Map

| File | Change |
|------|--------|
| `app/landing/page.tsx` | All changes — section removals, copy fixes, structural edits |

No other files touched.

---

### Task 1: Remove dead sections from main export and delete their function bodies

**Files:**
- Modify: `app/landing/page.tsx`

Remove the following function bodies entirely from the file:
- `ProblemSection` (lines ~497–544)
- `TestimonialsSection` (lines ~952–1018)
- `LiveSearchDemo` (lines ~1108–1216)
- `PipelineSection` (lines ~902–946)
- `ChatVisual` (lines ~695–753) — only used by Feature 04 which is also being removed

Also remove Feature 04 from the `features` array (the entry with `num: "04"`, `tag: "Natural Language"`, `visual: <ChatVisual />`).

Update `LandingPage` export to new section order:

- [ ] **Step 1: Delete `ProblemSection`, `TestimonialsSection`, `LiveSearchDemo`, `PipelineSection`, `ChatVisual` function bodies**

Remove the five function bodies from the file. Each is clearly delimited by its comment header (e.g. `/* ═══ Problem ═══ */`).

- [ ] **Step 2: Remove Feature 04 from the features array**

In the `features` array (around line 759), delete the entry:
```tsx
{
  num: "04",
  tag: "Natural Language",
  title: "Décrivez simplement\nqui vous cherchez.",
  desc: "Tapez une description de poste ou demandez en langage naturel. L'agent comprend votre intention et livre des résultats classés.",
  visual: <ChatVisual />,
  bg: WHITE,
},
```

- [ ] **Step 3: Update `LandingPage` export**

Replace the body of `LandingPage`:
```tsx
export default function LandingPage() {
  return (
    <div style={{ backgroundColor: WHITE, color: INK }}>
      <Grain />
      <Nav />
      <Hero />
      <MetricsBar />
      <FeaturesSection />
      <DemoSection />
      <StackSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  )
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add app/landing/page.tsx
git commit -m "refactor(landing): remove dead sections — problem, testimonials, pipeline, live demo, chat feature"
```

---

### Task 2: Update Nav

**Files:**
- Modify: `app/landing/page.tsx` — `Nav` function (~line 233)

- [ ] **Step 1: Update nav links and CTA button**

Find the nav links array inside `Nav`:
```tsx
<a href="#features" className="hover:text-[#1a1a2e] transition-colors">Fonctionnalités</a>
<a href="#demo" className="hover:text-[#1a1a2e] transition-colors">Démo</a>
<a href="#pipeline" className="hover:text-[#1a1a2e] transition-colors">Pipeline</a>
<a href="#stack" className="hover:text-[#1a1a2e] transition-colors">Stack</a>
```

Replace with:
```tsx
<a href="#features" className="hover:text-[#1a1a2e] transition-colors">Fonctionnalités</a>
<a href="#demo" className="hover:text-[#1a1a2e] transition-colors">Démo</a>
```

Find the nav CTA buttons:
```tsx
<PixelBtn href="#demo" variant="outline" size="sm">Voir la Démo</PixelBtn>
<PixelBtn href="/" variant="coral" size="sm">Accès Dashboard &rarr;</PixelBtn>
```

Replace with:
```tsx
<PixelBtn href="#demo" variant="outline" size="sm">Voir la Démo</PixelBtn>
<PixelBtn href="#demo" variant="coral" size="sm">Demander une démo &rarr;</PixelBtn>
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/landing/page.tsx
git commit -m "refactor(landing): update nav — remove pipeline/stack links, change CTA to 'Demander une démo'"
```

---

### Task 3: Update Hero

**Files:**
- Modify: `app/landing/page.tsx` — `Hero` function (~line 277)

Three changes: (1) remove "Propulsé par" badges, (2) fix CTAs, (3) replace the busy dashboard mockup with a single candidate card.

- [ ] **Step 1: Remove "Propulsé par" badges**

Find and delete this block inside `Hero`:
```tsx
{/* Social proof */}
<div className="mt-14 flex items-center justify-center gap-8 flex-wrap animate-fade-in-up" style={{ animationDelay: "0.9s", animationFillMode: "both" }}>
  <span className="font-mono text-xs uppercase tracking-wider" style={{ color: `${MUTED}90` }}>Propulsé par</span>
  {["HrFlow.ai", "OpenClaw", "Ollama"].map((name) => (
    <span key={name} className="font-mono font-bold text-sm tracking-tight" style={{ color: `${INK}60` }}>{name}</span>
  ))}
</div>
```

- [ ] **Step 2: Fix Hero CTAs**

Find:
```tsx
<PixelBtn href="/" variant="coral" size="lg">Lancer le Dashboard &rarr;</PixelBtn>
<PixelBtn href="#demo" variant="outline" size="lg">Voir la Démo</PixelBtn>
```

Replace with:
```tsx
<PixelBtn href="#demo" variant="coral" size="lg">Demander une démo &rarr;</PixelBtn>
<PixelBtn href="#demo" variant="outline" size="lg">Voir la Démo</PixelBtn>
```

- [ ] **Step 3: Replace dashboard mockup with single candidate card**

Find the entire product screenshot block starting with:
```tsx
{/* Product Screenshot — large, immersive */}
<div className="mt-20 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "1s", animationFillMode: "both" }}>
```
...and ending with:
```tsx
          <div className="mx-auto w-3/4 h-16 -mt-4" style={{ background: `radial-gradient(ellipse at center, ${CORAL}15, transparent 70%)` }} />
        </div>
```

Replace the entire block with:
```tsx
{/* Product visual — single candidate card */}
<div className="mt-20 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "1s", animationFillMode: "both" }}>
  <div className="relative overflow-hidden" style={{ borderRadius: "16px", backgroundColor: NAVY, boxShadow: `0 40px 80px -20px ${INK}40, 0 0 0 1px ${WHITE}10` }}>
    {/* Browser chrome */}
    <div className="flex items-center gap-2 px-5 py-3.5" style={{ backgroundColor: NAVY, borderBottom: `1px solid ${WHITE}08` }}>
      <div className="flex gap-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
      </div>
      <div className="ml-4 flex-1 h-7 flex items-center px-4 font-mono text-xs" style={{ backgroundColor: `${WHITE}06`, color: `${WHITE}35`, borderRadius: "6px" }}>
        app.claw4hr.ai/dashboard
      </div>
    </div>
    {/* Candidate card */}
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Avatar name="Sophie Martin" size={52} bg={CORAL} />
        <div className="flex-1">
          <div className="font-semibold text-lg" style={{ color: WHITE }}>Sophie Martin</div>
          <div className="text-sm" style={{ color: `${WHITE}50` }}>Ingénieure ML Senior &middot; Paris &middot; 7 ans</div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden" style={{ backgroundColor: `${WHITE}08`, borderRadius: "4px" }}>
              <div className="h-full" style={{ width: "94%", backgroundColor: CORAL, borderRadius: "4px" }} />
            </div>
            <span className="font-mono font-bold text-xl" style={{ color: CORAL }}>94%</span>
          </div>
        </div>
      </div>
      {/* SWOT grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Forces", color: SUCCESS, items: ["Expert Python — 8 ans", "ML / Deep Learning"] },
          { label: "Faiblesses", color: CORAL, items: ["Pas d'exp. frontend"] },
          { label: "Opportunités", color: "#3b82f6", items: ["Ouvert au CDI", "Paris"] },
          { label: "Menaces", color: "#f59e0b", items: ["Forte demande marché"] },
        ].map(s => (
          <div key={s.label} className="p-3" style={{ backgroundColor: `${WHITE}04`, borderRadius: "10px", border: `1px solid ${WHITE}06` }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2" style={{ backgroundColor: s.color, borderRadius: "50%" }} />
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: s.color }}>{s.label}</span>
            </div>
            {s.items.map(item => (
              <div key={item} className="text-xs leading-relaxed" style={{ color: `${WHITE}50` }}>{item}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
  {/* Glow */}
  <div className="mx-auto w-3/4 h-12 -mt-3" style={{ background: `radial-gradient(ellipse at center, ${CORAL}15, transparent 70%)` }} />
</div>
```

- [ ] **Step 4: TypeScript check**

```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add app/landing/page.tsx
git commit -m "refactor(landing): update hero — minimal candidate card, remove badges, fix CTAs"
```

---

### Task 4: Update Feature 03 — Pipeline JIT

**Files:**
- Modify: `app/landing/page.tsx` — `features` array (~line 759)

- [ ] **Step 1: Update Feature 03 entry**

Find the Feature 03 entry in the `features` array:
```tsx
{
  num: "03",
  tag: "JIT Pipeline",
  title: "Temps réel.\nPas les données d'hier.",
  desc: "X-Ray découvre. Enrich révèle le contexte. Index structure les données. Score classe les candidats. Chaque étape en temps réel.",
  visual: <PipelineFlowVisual />,
  bg: CREAM,
},
```

Replace with:
```tsx
{
  num: "03",
  tag: "Pipeline JIT",
  title: "Quatre étapes.\nZéro travail manuel.",
  desc: "De la découverte au contact — X-Ray, Enrich, Index, Score. Chaque étape s'exécute en temps réel dès qu'un talent est détecté.",
  visual: <PipelineFlowVisual />,
  bg: CREAM,
},
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/landing/page.tsx
git commit -m "refactor(landing): update feature 03 copy — pipeline JIT consolidated"
```

---

### Task 5: Update DemoSection

**Files:**
- Modify: `app/landing/page.tsx` — `DemoSection` function (~line 825)

- [ ] **Step 1: Add TODO comment to video placeholder**

Find the play button div inside `DemoSection`:
```tsx
{/* Play button */}
<div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
```

Add a comment directly above it:
```tsx
{/* TODO: remplacer par la vraie vidéo (tag <video> ou embed YouTube/Vimeo) */}
{/* Play button */}
<div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
```

- [ ] **Step 2: Remove stats row below the video player**

Find and delete the entire `{/* Stats row */}` block:
```tsx
{/* Stats row */}
<Reveal delay={400}>
  <div className="mt-14 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
    {[
      { val: "4.2s", desc: "Temps moyen de requête" },
      { val: "4 étapes", desc: "Pipeline automatisé" },
      { val: "Zéro", desc: "Sourcing manuel" },
    ].map(s => (
      <div key={s.desc}>
        <div className="font-mono font-bold text-xl" style={{ color: CORAL }}>{s.val}</div>
        <div className="mt-1 text-xs font-mono uppercase tracking-wider" style={{ color: `${WHITE}35` }}>{s.desc}</div>
      </div>
    ))}
  </div>
</Reveal>
```

- [ ] **Step 3: TypeScript check**

```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/landing/page.tsx
git commit -m "refactor(landing): update demo section — add video TODO, remove redundant stats row"
```

---

### Task 6: Fix FAQ — all French, correct product name, trim to 4 questions

**Files:**
- Modify: `app/landing/page.tsx` — `FAQSection` function (~line 1251)

- [ ] **Step 1: Replace the `faqs` array**

Find the `faqs` array inside `FAQSection`:
```tsx
const faqs = [
  { q: "How does PTI find passive candidates?", a: "PTI uses AI agents to search across GitHub repositories, LinkedIn profiles, Indeed listings, and our 10,000+ indexed CV database simultaneously. It discovers talent that never applies to job boards." },
  { q: "What is SWOT analysis for candidates?", a: "Each candidate receives a Strengths, Weaknesses, Opportunities, and Threats analysis generated by AI. This gives recruiters transparent reasoning behind every match score, not just a number." },
  { q: "How fast are the results?", a: "Most searches return ranked candidates in under 5 seconds. The JIT pipeline processes each candidate in real time — no stale databases or overnight batch jobs." },
  { q: "Can I search in natural language?", a: "Yes! Just describe who you need in plain language — 'Senior Python dev in Paris with ML experience' — and the AI agent parses your intent and searches intelligently across all sources." },
  { q: "What scoring algorithm is used?", a: "PTI uses HrFlow.ai's proprietary matching algorithm that scores candidates 0–100% based on skills, experience, location, availability, and job fit. Every score is explainable." },
  { q: "Is my data secure?", a: "All data is processed securely. CV parsing and indexing happens through HrFlow.ai's enterprise-grade infrastructure. We do not store raw profiles — only structured, anonymizable data." },
]
```

Replace with:
```tsx
const faqs = [
  { q: "Comment Claw4HR trouve-t-il les talents passifs ?", a: "Claw4HR utilise des agents IA pour rechercher simultanément sur GitHub, LinkedIn, Indeed et notre base de plus de 10 000 CVs indexés. Il découvre les talents qui ne postulent jamais sur les job boards." },
  { q: "Qu'est-ce que l'analyse SWOT par candidat ?", a: "Chaque candidat reçoit une analyse Forces, Faiblesses, Opportunités et Menaces générée par l'IA. Cela donne aux recruteurs un raisonnement transparent derrière chaque score de matching — pas juste un chiffre." },
  { q: "Quelle est la rapidité des résultats ?", a: "La plupart des recherches retournent des candidats classés en moins de 5 secondes. Le pipeline JIT traite chaque candidat en temps réel — aucune base de données obsolète, aucun traitement différé." },
  { q: "Puis-je rechercher en langage naturel ?", a: "Oui. Décrivez simplement le profil dont vous avez besoin — 'Développeur Python senior à Paris avec de l'expérience en ML' — et l'agent IA analyse votre intention et recherche intelligemment sur toutes les sources." },
]
```

- [ ] **Step 2: Fix FAQ section headline**

Find:
```tsx
<h2 className="leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: serif, fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", color: INK }}>
  Your questions, <span style={{ color: CORAL, fontStyle: "italic" }}>answered.</span>
</h2>
```

Replace with:
```tsx
<h2 className="leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: serif, fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", color: INK }}>
  Vos questions, <span style={{ color: CORAL, fontStyle: "italic" }}>nos réponses.</span>
</h2>
```

- [ ] **Step 3: TypeScript check**

```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add app/landing/page.tsx
git commit -m "refactor(landing): fix FAQ — all French, PTI→Claw4HR, trim to 4 questions"
```

---

### Task 7: Fix CTASection — B2B premium language

**Files:**
- Modify: `app/landing/page.tsx` — `CTASection` function (~line 1069)

- [ ] **Step 1: Replace the "Gratuit à essayer" line and fix CTAs**

Find:
```tsx
<div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
  <PixelBtn href="/" variant="coral" size="lg">Lancer le Dashboard &rarr;</PixelBtn>
  <PixelBtn href="#demo" variant="white" size="lg">Voir la Démo</PixelBtn>
</div>
```
Replace with:
```tsx
<div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
  <PixelBtn href="#demo" variant="coral" size="lg">Demander une démo &rarr;</PixelBtn>
  <PixelBtn href="mailto:contact@claw4hr.ai" variant="white" size="lg">Contacter l'équipe</PixelBtn>
</div>
```

Find:
```tsx
<p className="mt-8 font-mono text-xs uppercase tracking-wider" style={{ color: `${WHITE}25` }}>
  Gratuit à essayer &middot; Sans carte bancaire
</p>
```
Replace with:
```tsx
<p className="mt-8 font-mono text-xs uppercase tracking-wider" style={{ color: `${WHITE}25` }}>
  Sur invitation &middot; Démo personnalisée disponible
</p>
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/landing/page.tsx
git commit -m "refactor(landing): fix CTA section — B2B premium language, remove free trial copy"
```

---

### Task 8: Fix Footer nav links

**Files:**
- Modify: `app/landing/page.tsx` — `Footer` function (~line 1288)

The Footer still lists "Pipeline" as a nav link which no longer exists as a section.

- [ ] **Step 1: Update Footer product links**

Find inside `Footer`:
```tsx
{[{label: "Fonctionnalités", href: "features"}, {label: "Pipeline", href: "pipeline"}, {label: "Démo", href: "demo"}, {label: "Stack", href: "stack"}].map(link => (
```

Replace with:
```tsx
{[{label: "Fonctionnalités", href: "features"}, {label: "Démo", href: "demo"}, {label: "Stack", href: "stack"}].map(link => (
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/matki/git/hrflow_hackathon_2026 && npx tsc --noEmit
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/landing/page.tsx
git commit -m "refactor(landing): fix footer nav — remove pipeline link"
```

---

## Self-Review

**Spec coverage:**
- ✅ Nav: links and CTA updated (Task 2)
- ✅ Hero: mockup replaced, badges removed, CTAs fixed (Task 3)
- ✅ MetricsBar: no changes needed — spec says keep as-is
- ✅ Features: Feature 04 removed, Feature 03 copy updated (Tasks 1 + 4)
- ✅ Demo section: TODO comment + stats row removed (Task 5)
- ✅ Stack section: no changes needed — spec says keep as-is
- ✅ FAQ: all French, PTI→Claw4HR, 4 questions, headline fixed (Task 6)
- ✅ CTA Final: premium language, new secondary CTA (Task 7)
- ✅ Footer: Pipeline link removed (Task 8)
- ✅ Dead sections removed: ProblemSection, TestimonialsSection, LiveSearchDemo, PipelineSection, ChatVisual (Task 1)
- ✅ Main export updated to new 8-section order (Task 1)

**No placeholders, no contradictions, no type mismatches.**
