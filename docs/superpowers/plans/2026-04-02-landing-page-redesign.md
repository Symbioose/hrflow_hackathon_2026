# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Claw4HR landing page with a modern folk.app/juicebox.ai inspired design, featuring a Three.js wireframe globe hero, clean typography, and production-ready code.

**Architecture:** Complete rewrite of the landing page into focused component files. Globe component in `/components/ui/`, landing sections split into a dedicated components directory at `/app/landing/components/`. Layout updated for Inter font. No dashboard changes.

**Tech Stack:** Next.js 16, React 19, Three.js + @react-three/fiber + @react-three/drei, framer-motion, Tailwind CSS v4, lucide-react, TypeScript.

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install npm packages**

Run:
```bash
cd /Users/emilejouannet/Developer/hackathons/hrflow/hrflow_hackathon_2026 && npm install three @react-three/fiber @react-three/drei framer-motion lucide-react
```

- [ ] **Step 2: Install type definitions**

Run:
```bash
cd /Users/emilejouannet/Developer/hackathons/hrflow/hrflow_hackathon_2026 && npm install -D @types/three
```

- [ ] **Step 3: Verify installation**

Run:
```bash
cd /Users/emilejouannet/Developer/hackathons/hrflow/hrflow_hackathon_2026 && node -e "require('three'); require('@react-three/fiber'); console.log('OK')"
```
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install three.js, framer-motion, lucide-react for landing redesign"
```

---

### Task 2: Create Globe Component

**Files:**
- Create: `components/ui/globe.tsx`

The globe is a Three.js wireframe sphere rendered via @react-three/fiber. It must be a client component, dynamically imported with `ssr: false` to avoid Next.js SSR issues with Three.js.

- [ ] **Step 1: Create the Globe component**

Create `components/ui/globe.tsx`:

```tsx
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function WireframeSphere({ speed = 0.003 }: { speed?: number }) {
  const meshRef = useRef<Mesh>(null!);

  useFrame(() => {
    meshRef.current.rotation.y += speed;
    meshRef.current.rotation.x += speed * 0.3;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.8, 36, 36]} />
      <meshBasicMaterial
        color="#6366F1"
        transparent
        opacity={0.12}
        wireframe
      />
    </mesh>
  );
}

export default function Globe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      style={{ pointerEvents: "none" }}
      gl={{ alpha: true, antialias: true }}
    >
      <WireframeSphere />
    </Canvas>
  );
}
```

- [ ] **Step 2: Verify file exists and has no syntax errors**

Run:
```bash
cd /Users/emilejouannet/Developer/hackathons/hrflow/hrflow_hackathon_2026 && npx tsc --noEmit components/ui/globe.tsx 2>&1 | head -20
```

Note: This may show import resolution warnings since it's outside `app/` — that's fine, the real check is at build time.

- [ ] **Step 3: Commit**

```bash
git add components/ui/globe.tsx
git commit -m "feat: add Three.js wireframe globe component"
```

---

### Task 3: Update Landing Layout (Inter Font)

**Files:**
- Modify: `app/landing/layout.tsx`

Replace Instrument Serif with Inter for the redesigned landing page.

- [ ] **Step 1: Rewrite the landing layout**

Replace the entire content of `app/landing/layout.tsx` with:

```tsx
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Claw4HR — Source Talent From Everywhere. Instantly.",
  description:
    "AI-powered passive talent sourcing. Search GitHub, LinkedIn, Indeed and more — score and rank candidates in real-time.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} font-sans`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/landing/layout.tsx
git commit -m "feat: update landing layout with Inter font and metadata"
```

---

### Task 4: Add Landing-Specific CSS

**Files:**
- Modify: `app/globals.css`

Add landing-specific animations and utility classes. Append to the end of the file — do NOT modify existing dashboard styles.

- [ ] **Step 1: Append landing styles to globals.css**

Add the following at the end of `app/globals.css`:

```css
/* === LANDING PAGE === */

@keyframes landing-fade-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes landing-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes landing-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes landing-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.landing-fade-up {
  animation: landing-fade-up 0.6s ease-out both;
}

.landing-fade-in {
  animation: landing-fade-in 0.5s ease-out both;
}

.landing-pulse {
  animation: landing-pulse 2s ease-in-out infinite;
}

.landing-float {
  animation: landing-float 3s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .landing-fade-up,
  .landing-fade-in,
  .landing-pulse,
  .landing-float {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: add landing page animation utilities"
```

---

### Task 5: Rewrite Landing Page — Navigation + Hero

**Files:**
- Modify: `app/landing/page.tsx`

This is the main task. We rewrite the entire page. Due to size, we build it section by section, but it's all in one file. Start with Nav + Hero + Globe dynamic import.

- [ ] **Step 1: Write the complete landing page**

Replace the entire content of `app/landing/page.tsx` with the full redesigned page. The page is a single `"use client"` component containing:

1. **Dynamic Globe import** — `next/dynamic` with `ssr: false`
2. **Reveal component** — framer-motion `whileInView` wrapper
3. **Nav** — fixed, transparent→white on scroll, logo + links + CTA
4. **Hero** — Globe background, badge, headline, subtitle, dual CTA, trust metrics
5. **Problem section** — stats cards (13h/week, 80%, <2min)
6. **Features grid** — 2x2 cards with lucide icons
7. **Pipeline section** — dark bg, 4 horizontal steps with connectors
8. **Integrations** — logo grid
9. **Final CTA** — dark indigo gradient with CTA
10. **Footer** — minimal

Key design decisions in the code:
- All colors use Tailwind classes (slate-900, indigo-500, etc.) — no hardcoded hex constants
- framer-motion `motion.div` with `whileInView` for scroll reveals
- Globe loaded via `dynamic(() => import(...), { ssr: false })` to avoid SSR hydration issues
- Responsive: mobile-first with md/lg breakpoints
- lucide-react icons for feature cards
- Inter font via the `--font-inter` CSS variable from the layout

The full code should be ~600-700 lines, clean and well-structured with clear section comments.

- [ ] **Step 2: Verify build**

Run:
```bash
cd /Users/emilejouannet/Developer/hackathons/hrflow/hrflow_hackathon_2026 && npm run build 2>&1 | tail -30
```
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/landing/page.tsx
git commit -m "feat: complete landing page redesign with globe hero, modern design"
```

---

### Task 6: Visual QA and Polish

**Files:**
- Possibly modify: `app/landing/page.tsx`, `components/ui/globe.tsx`, `app/globals.css`

- [ ] **Step 1: Run dev server and verify**

Run:
```bash
cd /Users/emilejouannet/Developer/hackathons/hrflow/hrflow_hackathon_2026 && npm run dev
```

Check `/landing` in browser. Verify:
- Globe renders and rotates
- Nav transitions on scroll
- All sections visible and responsive
- Animations fire on scroll
- No console errors
- Mobile layout works

- [ ] **Step 2: Fix any issues found**

Address any visual or functional issues discovered during QA.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "fix: landing page polish and QA fixes"
```
