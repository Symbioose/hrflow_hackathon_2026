# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old 3-column dark dashboard with a clean editorial SPA (Search → Pixel Agents Loading → Results Grid → Profile Detail) using the landing page design system.

**Architecture:** 4-state React state machine in `Dashboard.tsx`. OpenClaw pushes sourced profiles via webhook → SSE stream (200ms latency) → cards appear progressively. HrFlow scores each profile. Demo fallback ensures the app always looks great even without OpenClaw.

**Tech Stack:** Next.js 15 App Router, React, TypeScript strict, Tailwind CSS v4, CSS box-shadow pixel art, native EventSource (SSE), HrFlow API.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| MODIFY | `app/lib/types.ts` | Add `SourcedProfile`, `ProfileSource`, `ReconstructedExperience`, `ReconstructedEducation` |
| MODIFY | `app/lib/eventStore.ts` | Add `profile` channel, add `subscribe/unsubscribe` for SSE push |
| MODIFY | `app/globals.css` | Add landing design tokens (CORAL, CREAM, INK, NAVY) to `:root` |
| MODIFY | `app/api/openclaw/webhook/route.ts` | Accept `profile` channel |
| CREATE | `app/api/openclaw/stream/route.ts` | SSE endpoint — streams events to client in <200ms |
| CREATE | `app/api/openclaw/trigger/route.ts` | POST — forwards query to OpenClaw |
| CREATE | `app/lib/demoProfiles.ts` | 3 hardcoded `SourcedProfile` objects for demo fallback |
| CREATE | `app/components/ScoreRing.tsx` | SVG ring, coloured by score %, animated stroke |
| CREATE | `app/components/PixelAgent.tsx` | Pixel art character + terminal typewriter text |
| CREATE | `app/components/SearchView.tsx` | State 1: search bar, suggestions, connector badges |
| CREATE | `app/components/LoadingView.tsx` | State 2: pixel agents on canvas, progress |
| CREATE | `app/components/CandidateCard.tsx` | Single candidate card (score ring, sources, skills) |
| CREATE | `app/components/ResultsView.tsx` | State 3: cards grid, sort controls, header |
| CREATE | `app/components/QAPanel.tsx` | Chat panel for Q&A (replaces WhatsAppPanel) |
| CREATE | `app/components/ProfileDetailView.tsx` | State 4: full profile + QAPanel |
| REPLACE | `app/components/Dashboard.tsx` | 4-state machine, SSE hook, orchestration |
| DELETE | `app/components/WhatsAppPanel.tsx` | Replaced by QAPanel |
| DELETE | `app/components/AgentFeed.tsx` | Replaced by LoadingView |
| DELETE | `app/components/CandidatePanel.tsx` | Replaced by ResultsView + CandidateCard + ProfileDetailView |
| DELETE | `app/components/TopBar.tsx` | Replaced by per-state headers |

---

## Task 1: Foundation — Types + CSS Tokens

**Files:**
- Modify: `app/lib/types.ts`
- Modify: `app/globals.css`

- [ ] **Step 1.1: Add SourcedProfile types to `app/lib/types.ts`**

Replace the entire file with:

```typescript
// HrFlow profile (kept for backward compat with existing API routes)
export interface HrFlowProfile {
  key: string;
  reference: string | null;
  source_key: string;
  info: {
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    location: { text: string | null } | null;
    summary: string | null;
    picture: string | null;
  };
  experiences: HrFlowExperience[];
  educations: HrFlowEducation[];
  skills: HrFlowEntityItem[];
  languages: HrFlowEntityItem[];
  tags: { name: string; value: string }[];
  created_at: string;
  updated_at: string;
}

export interface HrFlowExperience {
  title: string | null;
  company: string | null;
  location: { text: string | null } | null;
  date_start: { iso8601: string | null } | null;
  date_end: { iso8601: string | null } | null;
  description: string | null;
}

export interface HrFlowEducation {
  title: string | null;
  school: string | null;
  location: { text: string | null } | null;
  date_start: { iso8601: string | null } | null;
  date_end: { iso8601: string | null } | null;
  description: string | null;
}

export interface HrFlowEntityItem {
  name: string;
  type: string | null;
  value: string | null;
}

// ─── New: Web-sourced profiles ─────────────────────────────────

export type SourceType = "github" | "linkedin" | "reddit" | "internet" | "indeed" | "hellowork";

export interface ProfileSource {
  type: SourceType;
  url: string;
  label: string; // e.g. "github.com/username"
}

export interface ReconstructedExperience {
  title: string;
  company: string;
  location: string;
  period: string; // e.g. "2020 - 2023"
  description: string;
}

export interface ReconstructedEducation {
  degree: string;
  school: string;
  period: string;
}

export interface SourcedProfile {
  key: string;                         // uuid
  name: string;
  title: string;
  location: string;
  experience_years: number;
  summary: string;                     // AI-generated by OpenClaw
  sources: ProfileSource[];
  skills: string[];
  experiences: ReconstructedExperience[];
  educations: ReconstructedEducation[];
  hrflow_score: number;                // 0-100, -1 = not yet scored
  hrflow_key: string | null;           // null until indexed by HrFlow
  avatar_color: string;                // hex, pre-computed by OpenClaw
}

// ─── Feed + Chat (unchanged) ────────────────────────────────────

export interface FeedEvent {
  id: string;
  time: string;
  action: string;
  detail: string;
  status: "done" | "running" | "error";
  type: "connect" | "parse" | "score" | "source" | "analyze" | "notify";
}

export interface ChatMessage {
  id: string;
  type: "user" | "agent";
  text: string;
  time: string;
}
```

- [ ] **Step 1.2: Add landing design tokens to `app/globals.css`**

Add after the existing `:root` block (after line 26, before `@theme inline`):

```css
/* Landing design system — also used by dashboard */
:root {
  --coral: #FF6B6B;
  --coral-dark: #E85555;
  --coral-deep: #CC4444;
  --coral-glow: rgba(255, 107, 107, 0.15);
  --cream: #FFF5F0;
  --cream-mid: #F5EDE6;
  --ink: #1a1a2e;
  --navy: #0B1226;
  --muted-text: #6b7280;
  --success: #10b981;
  --amber: #f59e0b;
  --rose: #f43f5e;
}
```

Also add these animation keyframes at the end of the file:

```css
/* Pixel agent walk cycle */
@keyframes pixel-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* Pixel agent run across screen */
@keyframes agent-run {
  from { transform: translateX(0); }
  to { transform: translateX(var(--run-distance, 200px)); }
}

/* Score ring fill */
@keyframes ring-fill {
  from { stroke-dashoffset: var(--ring-total); }
  to { stroke-dashoffset: var(--ring-offset); }
}

/* Card stagger reveal */
@keyframes card-reveal {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-pixel-bounce {
  animation: pixel-bounce 0.4s ease-in-out infinite;
}

.animate-card-reveal {
  animation: card-reveal 0.4s ease-out both;
}
```

- [ ] **Step 1.3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to the new types.

- [ ] **Step 1.4: Commit**

```bash
git add app/lib/types.ts app/globals.css
git commit -m "feat: add SourcedProfile types and landing design tokens"
```

---

## Task 2: EventStore SSE Support + Stream Endpoint

**Files:**
- Modify: `app/lib/eventStore.ts`
- Create: `app/api/openclaw/stream/route.ts`
- Modify: `app/api/openclaw/webhook/route.ts`

- [ ] **Step 2.1: Add `profile` channel + subscriber pattern to `app/lib/eventStore.ts`**

Replace the entire file:

```typescript
/**
 * In-memory event store for OpenClaw → dashboard communication.
 * Supports both polling (getEventsSince) and push (subscribe) for SSE.
 */

import type { SourcedProfile } from "@/app/lib/types";

export interface OpenClawEvent {
  id: number;
  timestamp: string;
  channel: "chat" | "feed" | "action" | "profile";
  payload: {
    // chat
    type?: string;
    text?: string;
    // feed
    action?: string;
    detail?: string;
    status?: "done" | "running" | "error";
    feedType?: "connect" | "parse" | "score" | "source" | "analyze" | "notify";
    source?: string; // which connector: "github" | "linkedin" | "reddit" | "internet"
    // action
    command?: string;
    // profile (new)
    profile?: SourcedProfile;
  };
}

const MAX_EVENTS = 500;
const TTL_MS = 10 * 60 * 1000;

let events: OpenClawEvent[] = [];
let nextId = 1;

// SSE subscribers: Set of controller.enqueue functions
type Subscriber = (event: OpenClawEvent) => void;
const subscribers = new Set<Subscriber>();

export function subscribe(fn: Subscriber): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function pushEvent(
  channel: OpenClawEvent["channel"],
  payload: OpenClawEvent["payload"],
): OpenClawEvent {
  cleanup();
  const event: OpenClawEvent = {
    id: nextId++,
    timestamp: new Date().toISOString(),
    channel,
    payload,
  };
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events = events.slice(-MAX_EVENTS);
  }
  // Notify SSE subscribers immediately
  subscribers.forEach((fn) => fn(event));
  return event;
}

export function getEventsSince(cursor: number): { events: OpenClawEvent[]; cursor: number } {
  cleanup();
  const newEvents = events.filter((e) => e.id > cursor);
  const newCursor = events.length > 0 ? events[events.length - 1].id : cursor;
  return { events: newEvents, cursor: newCursor };
}

function cleanup() {
  const cutoff = Date.now() - TTL_MS;
  events = events.filter((e) => new Date(e.timestamp).getTime() > cutoff);
}
```

- [ ] **Step 2.2: Create SSE endpoint `app/api/openclaw/stream/route.ts`**

```typescript
import { subscribe, getEventsSince } from "@/app/lib/eventStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/openclaw/stream
 * Server-Sent Events stream — pushes events to the dashboard in <200ms.
 * Replaces client-side polling.
 *
 * Query params:
 *   cursor (optional): last event id seen (to catch up on missed events)
 *
 * Event format:
 *   data: {"id":1,"timestamp":"...","channel":"profile","payload":{...}}\n\n
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const cursor = parseInt(url.searchParams.get("cursor") ?? "0", 10);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send any events missed since cursor immediately
      const { events: missed } = getEventsSince(cursor);
      for (const event of missed) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      // Subscribe to new events
      const unsubscribe = subscribe((event) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Client disconnected
          unsubscribe();
        }
      });

      // Heartbeat every 15s to keep connection alive through proxies
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 15_000);

      // Cleanup on client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx buffering
    },
  });
}
```

- [ ] **Step 2.3: Update `app/api/openclaw/webhook/route.ts` to accept profile channel**

Replace the file:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { pushEvent, type OpenClawEvent } from "@/app/lib/eventStore";

/**
 * POST /api/openclaw/webhook — Receive events from OpenClaw
 *
 * Supported channels: "chat" | "feed" | "action" | "profile"
 *
 * Profile example (new):
 * {"channel":"profile","payload":{"profile":{...SourcedProfile...}}}
 *
 * Batch profiles (optimisation):
 * {"profiles":[{...SourcedProfile...}, ...]}
 *
 * All other formats unchanged from previous version.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Batch profiles shorthand: {"profiles": [...]}
    if (Array.isArray(body.profiles)) {
      const created = body.profiles.map((profile: unknown) =>
        pushEvent("profile", { profile: profile as OpenClawEvent["payload"]["profile"] }),
      );
      return NextResponse.json({ code: 200, message: "OK", count: created.length });
    }

    // Standard single or batch events
    const items: { channel: OpenClawEvent["channel"]; payload: OpenClawEvent["payload"] }[] =
      body.events ?? [body];

    const created = items.map((item) => pushEvent(item.channel, item.payload));
    return NextResponse.json({ code: 200, message: "OK", count: created.length });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
```

- [ ] **Step 2.4: Test SSE manually**

Start the dev server: `npm run dev`

In one terminal, open the SSE stream:
```bash
curl -N http://localhost:3000/api/openclaw/stream
```

In another terminal, send a test profile event:
```bash
curl -X POST http://localhost:3000/api/openclaw/webhook \
  -H "Content-Type: application/json" \
  -d '{"channel":"profile","payload":{"profile":{"key":"test-001","name":"Test User","title":"Engineer","location":"Paris","experience_years":5,"summary":"Test","sources":[],"skills":["Python"],"experiences":[],"educations":[],"hrflow_score":-1,"hrflow_key":null,"avatar_color":"#FF6B6B"}}}'
```

Expected: the SSE terminal prints the event within 200ms.

- [ ] **Step 2.5: Commit**

```bash
git add app/lib/eventStore.ts app/api/openclaw/stream/route.ts app/api/openclaw/webhook/route.ts
git commit -m "feat: add SSE stream endpoint and profile channel to eventStore"
```

---

## Task 3: Trigger Endpoint + Demo Fallback Profiles

**Files:**
- Create: `app/api/openclaw/trigger/route.ts`
- Create: `app/lib/demoProfiles.ts`

- [ ] **Step 3.1: Create trigger endpoint `app/api/openclaw/trigger/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

const OPENCLAW_WEBHOOK_URL = process.env.OPENCLAW_WEBHOOK_URL;

/**
 * POST /api/openclaw/trigger
 * Sends the recruiter's search query to OpenClaw.
 *
 * Body: { "query": "Data Scientist Paris 5 ans" }
 * Response: { "ok": true } or { "ok": false, "error": "..." }
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ ok: false, error: "Missing query" }, { status: 400 });
    }

    if (!OPENCLAW_WEBHOOK_URL) {
      // No OpenClaw configured — dashboard will use demo fallback
      return NextResponse.json({ ok: false, error: "OPENCLAW_WEBHOOK_URL not set" }, { status: 503 });
    }

    const res = await fetch(OPENCLAW_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `OpenClaw returned ${res.status}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
```

- [ ] **Step 3.2: Create demo fallback profiles `app/lib/demoProfiles.ts`**

```typescript
import type { SourcedProfile } from "@/app/lib/types";

/**
 * Hardcoded demo profiles — used when OpenClaw is not available.
 * These must look realistic and impressive for the hackathon demo.
 */
export const DEMO_PROFILES: SourcedProfile[] = [
  {
    key: "demo-001",
    name: "Sophie Marchand",
    title: "Senior Data Scientist",
    location: "Paris, France",
    experience_years: 6,
    summary:
      "Data Scientist spécialisée en NLP et Computer Vision. Contributrice active open-source avec 12 repos GitHub cumulant +200 stars. Expériences chez Criteo et BNP Paribas. Forte culture produit.",
    sources: [
      { type: "github", url: "https://github.com", label: "github.com/s.marchand" },
      { type: "linkedin", url: "https://linkedin.com", label: "linkedin.com/in/s.marchand" },
    ],
    skills: ["Python", "PyTorch", "NLP", "scikit-learn", "SQL", "Docker", "Spark", "MLflow"],
    experiences: [
      {
        title: "Senior Data Scientist",
        company: "Criteo",
        location: "Paris",
        period: "2021 — 2024",
        description: "Modèles de recommandation publicitaire, A/B testing à grande échelle, pipeline ML en production (100M+ prédictions/jour).",
      },
      {
        title: "Data Scientist",
        company: "BNP Paribas",
        location: "Paris",
        period: "2018 — 2021",
        description: "Détection de fraude temps réel, scoring crédit, NLP sur données clients (traitement de 500k emails/mois).",
      },
    ],
    educations: [
      { degree: "Master Data Science & IA", school: "École Polytechnique", period: "2016 — 2018" },
      { degree: "Licence Mathématiques", school: "Université Paris-Saclay", period: "2013 — 2016" },
    ],
    hrflow_score: 92,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-002",
    name: "Karim Belhadj",
    title: "Lead DevOps Engineer",
    location: "Lyon, France",
    experience_years: 8,
    summary:
      "Expert Kubernetes et Terraform, contributeur actif sur r/devops (+3k karma). A migré l'infrastructure de 3 scale-ups françaises vers GCP. Passionné d'automation et de GitOps.",
    sources: [
      { type: "github", url: "https://github.com", label: "github.com/k.belhadj" },
      { type: "reddit", url: "https://reddit.com", label: "reddit.com/u/karim_devops" },
    ],
    skills: ["Kubernetes", "Terraform", "GCP", "ArgoCD", "CI/CD", "Python", "Prometheus", "Helm"],
    experiences: [
      {
        title: "Lead DevOps Engineer",
        company: "Doctolib",
        location: "Lyon",
        period: "2022 — 2024",
        description: "Migration infra vers GCP (zero downtime), mise en place GitOps avec ArgoCD, réduction des coûts cloud de 35%.",
      },
      {
        title: "DevOps Engineer",
        company: "OVHcloud",
        location: "Roubaix",
        period: "2018 — 2022",
        description: "Gestion de 200+ clusters Kubernetes, automatisation Terraform, monitoring Prometheus/Grafana pour 500 clients enterprise.",
      },
    ],
    educations: [
      { degree: "Ingénieur Informatique et Réseaux", school: "INSA Lyon", period: "2012 — 2016" },
    ],
    hrflow_score: 78,
    hrflow_key: null,
    avatar_color: "#7C3AED",
  },
  {
    key: "demo-003",
    name: "Emma Dupont",
    title: "Full-Stack Engineer",
    location: "Bordeaux, France",
    experience_years: 4,
    summary:
      "Dev full-stack React/Node.js, 8 projets open-source sur GitHub, active sur r/reactjs. Side project SaaS avec +1 200 utilisateurs actifs. Forte sensibilité UX.",
    sources: [
      { type: "github", url: "https://github.com", label: "github.com/emma.dupont" },
      { type: "linkedin", url: "https://linkedin.com", label: "linkedin.com/in/emma.dupont" },
      { type: "reddit", url: "https://reddit.com", label: "reddit.com/u/emma_codes" },
    ],
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Next.js", "Docker", "Tailwind CSS"],
    experiences: [
      {
        title: "Full-Stack Engineer",
        company: "Malt",
        location: "Remote",
        period: "2022 — 2024",
        description: "Développement de la marketplace freelance, optimisations performance (LCP -40%), composants design system.",
      },
      {
        title: "Développeuse Frontend",
        company: "Sencrop (IoT SaaS)",
        location: "Bordeaux",
        period: "2020 — 2022",
        description: "Dashboard analytics météo temps réel, cartographie Leaflet, design system interne.",
      },
    ],
    educations: [
      { degree: "Licence Pro Développement Web", school: "Université de Bordeaux", period: "2017 — 2020" },
    ],
    hrflow_score: 65,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
];

/** Staggered reveal: returns profiles one by one with a delay */
export function streamDemoProfiles(
  onProfile: (p: SourcedProfile) => void,
  delayMs = 1200,
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  DEMO_PROFILES.forEach((p, i) => {
    timers.push(setTimeout(() => onProfile(p), i * delayMs));
  });
  return () => timers.forEach(clearTimeout);
}
```

- [ ] **Step 3.3: Add `OPENCLAW_WEBHOOK_URL` to `.env.local`**

Open `.env.local` and add:
```
OPENCLAW_WEBHOOK_URL=http://<mac-mini-ip>:<port>/search
```

(Leave blank for demo mode — trigger will return 503 and dashboard falls back to demo profiles.)

- [ ] **Step 3.4: Commit**

```bash
git add app/api/openclaw/trigger/route.ts app/lib/demoProfiles.ts
git commit -m "feat: add trigger endpoint and demo fallback profiles"
```

---

## Task 4: ScoreRing Component

**Files:**
- Create: `app/components/ScoreRing.tsx`

- [ ] **Step 4.1: Create `app/components/ScoreRing.tsx`**

```tsx
"use client";

interface ScoreRingProps {
  score: number;       // 0-100, -1 = loading
  size?: number;       // diameter in px, default 56
  strokeWidth?: number;
}

function scoreColor(score: number): string {
  if (score < 0) return "#6b7280";
  if (score >= 70) return "#10b981"; // success green
  if (score >= 40) return "#f59e0b"; // amber
  return "#f43f5e";                  // rose
}

export default function ScoreRing({ score, size = 56, strokeWidth = 4 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = score < 0 ? circumference : circumference - (score / 100) * circumference;
  const color = scoreColor(score);
  const cx = size / 2;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cx}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-black/10"
        />
        {/* Fill */}
        <circle
          cx={cx}
          cy={cx}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={score < 0 ? circumference * 0.75 : offset}
          style={{
            transition: "stroke-dashoffset 1s ease-out, stroke 0.3s",
            ...(score < 0 && { animation: "spin-slow 1.5s linear infinite" }),
          }}
        />
      </svg>
      {/* Score text */}
      <span
        className="absolute font-mono font-bold"
        style={{
          fontSize: size * 0.22,
          color: score < 0 ? "#6b7280" : color,
        }}
      >
        {score < 0 ? "…" : `${score}%`}
      </span>
    </div>
  );
}
```

- [ ] **Step 4.2: Verify in browser**

In `app/page.tsx`, temporarily replace Dashboard with:
```tsx
import ScoreRing from "./components/ScoreRing";
export default function Home() {
  return (
    <div className="flex gap-4 p-8" style={{ background: "#FFF5F0" }}>
      <ScoreRing score={92} />
      <ScoreRing score={65} />
      <ScoreRing score={32} />
      <ScoreRing score={-1} />
    </div>
  );
}
```

Run `npm run dev`, open `localhost:3000`. Expected: 4 rings — green 92%, amber 65%, red 32%, spinning grey.

Restore `app/page.tsx` to `import Dashboard from "./components/Dashboard"; export default function Home() { return <Dashboard />; }`

- [ ] **Step 4.3: Commit**

```bash
git add app/components/ScoreRing.tsx app/page.tsx
git commit -m "feat: add ScoreRing component"
```

---

## Task 5: PixelAgent Component

**Files:**
- Create: `app/components/PixelAgent.tsx`

- [ ] **Step 5.1: Create `app/components/PixelAgent.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";

export type AgentSource = "github" | "linkedin" | "reddit" | "internet";
export type AgentState = "idle" | "running" | "done" | "error";

interface PixelAgentProps {
  source: AgentSource;
  state: AgentState;
}

const SOURCE_CONFIG: Record<AgentSource, { label: string; color: string; messages: string[] }> = {
  github: {
    label: "GitHub",
    color: "#1a1a2e",
    messages: [
      "> Connexion...",
      "> Scan des repos...",
      "> Lecture des commits...",
      "> Analyse des contributions...",
      "> Extraction des skills...",
    ],
  },
  linkedin: {
    label: "LinkedIn",
    color: "#0077b5",
    messages: [
      "> Connexion...",
      "> Scan des profils...",
      "> Extraction expériences...",
      "> Analyse des skills...",
      "> Vérification formations...",
    ],
  },
  reddit: {
    label: "Reddit",
    color: "#ff4500",
    messages: [
      "> Connexion subreddit...",
      "> Parsing des posts...",
      "> Identification auteurs...",
      "> Analyse technique...",
      "> Score calculé...",
    ],
  },
  internet: {
    label: "Internet",
    color: "#6b7280",
    messages: [
      "> Crawling web...",
      "> Indexation résultats...",
      "> Détection profils...",
      "> Analyse contenu...",
      "> Consolidation...",
    ],
  },
};

/** Simple pixel art character drawn as a grid of colored divs */
function PixelSprite({ color, walking }: { color: string; walking: boolean }) {
  // 8x8 pixel art — 1 = ink (head/body), 2 = accent (shirt), 0 = transparent
  // Two walk frames alternate via `walking` boolean
  const FRAME_A = [
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [0, 2, 2, 0],
    [1, 2, 2, 1],
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 0],
  ];
  const FRAME_B = [
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [0, 2, 2, 0],
    [1, 2, 2, 1],
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [0, 0, 0, 1],
  ];
  const frame = walking ? FRAME_B : FRAME_A;
  const PS = 4; // pixel size in px

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(4, ${PS}px)`, gap: 0, imageRendering: "pixelated" }}>
      {frame.flatMap((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              width: PS,
              height: PS,
              backgroundColor:
                cell === 0 ? "transparent"
                : cell === 1 ? "#1a1a2e"
                : color,
            }}
          />
        )),
      )}
    </div>
  );
}

export default function PixelAgent({ source, state }: PixelAgentProps) {
  const config = SOURCE_CONFIG[source];
  const [msgIndex, setMsgIndex] = useState(0);
  const [walking, setWalking] = useState(false);

  // Cycle terminal messages every 1.2s when running
  useEffect(() => {
    if (state !== "running") return;
    const t = setInterval(() => {
      setMsgIndex((i) => (i + 1) % config.messages.length);
    }, 1200);
    return () => clearInterval(t);
  }, [state, config.messages.length]);

  // Walk animation frame toggle
  useEffect(() => {
    if (state !== "running") return;
    const t = setInterval(() => setWalking((w) => !w), 200);
    return () => clearInterval(t);
  }, [state]);

  const terminalText =
    state === "done" ? "> Terminé ✓"
    : state === "error" ? "> Erreur ✗"
    : state === "idle" ? "> En attente..."
    : config.messages[msgIndex];

  const terminalColor =
    state === "done" ? "#FF6B6B"
    : state === "error" ? "#f43f5e"
    : "#1a1a2e99";

  return (
    <div className="flex flex-col items-center gap-2" style={{ width: 96 }}>
      {/* Agent sprite */}
      <div
        className={state === "running" ? "animate-pixel-bounce" : ""}
        style={{ opacity: state === "error" ? 0.4 : 1 }}
      >
        <PixelSprite color={config.color} walking={walking} />
      </div>

      {/* Source label */}
      <span
        className="font-mono font-bold text-[10px] uppercase tracking-widest"
        style={{ color: config.color }}
      >
        {config.label}
      </span>

      {/* Terminal text */}
      <span
        className="font-mono text-[9px] text-center leading-tight"
        style={{ color: terminalColor, minHeight: 24 }}
      >
        {terminalText}
      </span>

      {/* Done checkmark */}
      {state === "done" && (
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#FF6B6B" }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5.2: Commit**

```bash
git add app/components/PixelAgent.tsx
git commit -m "feat: add PixelAgent component with walk animation and terminal text"
```

---

## Task 6: SearchView + LoadingView

**Files:**
- Create: `app/components/SearchView.tsx`
- Create: `app/components/LoadingView.tsx`

- [ ] **Step 6.1: Create `app/components/SearchView.tsx`**

```tsx
"use client";

import { useState, useRef } from "react";
import type { SourceType } from "@/app/lib/types";

interface SearchViewProps {
  onSearch: (query: string) => void;
}

const SUGGESTIONS = [
  "Data Scientist NLP — Paris",
  "Lead DevOps AWS/GCP — Remote",
  "Full-Stack React/Node — Lyon",
];

const CONNECTORS: { type: SourceType; label: string; color: string; active: boolean }[] = [
  { type: "github", label: "GitHub", color: "#1a1a2e", active: true },
  { type: "linkedin", label: "LinkedIn", color: "#0077b5", active: true },
  { type: "reddit", label: "Reddit", color: "#ff4500", active: true },
  { type: "internet", label: "Internet", color: "#6b7280", active: true },
  { type: "indeed", label: "Indeed", color: "#2164f3", active: false },
  { type: "hellowork", label: "HelloWork", color: "#e05c2a", active: false },
];

export default function SearchView({ onSearch }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const q = query.trim();
    if (!q) return;
    onSearch(q);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--cream)" }}
    >
      {/* Logo */}
      <div className="mb-12 text-center animate-card-reveal">
        <div className="inline-flex items-center gap-3 mb-4">
          <span style={{ fontSize: 40 }}>🦞</span>
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display, Georgia, serif)", color: "var(--ink)" }}
          >
            Claw<span style={{ color: "var(--coral)" }}>4HR</span>
          </h1>
        </div>
        <p className="text-lg" style={{ color: "var(--muted-text)", fontFamily: "Georgia, serif" }}>
          Trouvez les talents passifs que vos concurrents ne voient pas.
        </p>
      </div>

      {/* Search bar */}
      <div
        className="w-full max-w-2xl flex items-center gap-3 px-5 py-4 rounded-2xl animate-card-reveal"
        style={{
          background: "#fff",
          boxShadow: "6px 6px 0 0 var(--ink)",
          border: "2px solid var(--ink)",
          animationDelay: "100ms",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Dev Python senior à Paris avec 5 ans d'XP..."
          className="flex-1 bg-transparent outline-none text-base"
          style={{ color: "var(--ink)", fontFamily: "Georgia, serif" }}
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!query.trim()}
          className="px-6 py-2 font-mono font-bold text-sm uppercase tracking-wider transition-all duration-100 active:translate-x-1 active:translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: query.trim() ? "var(--coral)" : "#e5e7eb",
            color: query.trim() ? "#fff" : "var(--muted-text)",
            boxShadow: query.trim() ? "3px 3px 0 0 var(--coral-deep)" : "none",
          }}
        >
          Chercher
        </button>
      </div>

      {/* Suggestions */}
      <div
        className="flex flex-wrap gap-2 mt-4 justify-center animate-card-reveal"
        style={{ animationDelay: "200ms" }}
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setQuery(s); inputRef.current?.focus(); }}
            className="px-4 py-2 rounded-full text-sm font-mono transition-all duration-150 hover:border-[var(--coral)] hover:text-[var(--coral)]"
            style={{ border: "1px solid var(--ink)", color: "var(--ink)", background: "transparent" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Connectors */}
      <div
        className="mt-16 flex flex-wrap gap-3 justify-center animate-card-reveal"
        style={{ animationDelay: "350ms" }}
      >
        {CONNECTORS.map((c) => (
          <div
            key={c.type}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              border: `1px solid ${c.active ? c.color : "#e5e7eb"}`,
              background: c.active ? `${c.color}10` : "transparent",
              opacity: c.active ? 1 : 0.5,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: c.active ? c.color : "#d1d5db" }}
            />
            <span className="text-xs font-mono" style={{ color: c.active ? c.color : "#9ca3af" }}>
              {c.label}
              {!c.active && " (bientôt)"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6.2: Create `app/components/LoadingView.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import PixelAgent, { type AgentSource, type AgentState } from "./PixelAgent";

interface AgentStatus {
  source: AgentSource;
  state: AgentState;
}

interface LoadingViewProps {
  query: string;
  profileCount: number;
  agentStatuses: Record<AgentSource, AgentState>;
}

export default function LoadingView({ query, profileCount, agentStatuses }: LoadingViewProps) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")));
    return () => clearInterval(t);
  }, []);

  const agents: AgentStatus[] = (
    ["github", "linkedin", "reddit", "internet"] as AgentSource[]
  ).map((source) => ({
    source,
    state: agentStatuses[source] ?? "idle",
  }));

  const doneCount = agents.filter((a) => a.state === "done").length;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--cream)" }}
    >
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-2">
          <span style={{ fontSize: 28 }}>🦞</span>
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
          >
            Claw<span style={{ color: "var(--coral)" }}>4HR</span>
          </span>
        </div>
        <h2
          className="text-3xl font-bold mt-4 mb-2"
          style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
        >
          Recherche en cours{dots}
        </h2>
        <p className="font-mono text-sm" style={{ color: "var(--muted-text)" }}>
          &ldquo;{query}&rdquo;
        </p>
      </div>

      {/* Pixel agents */}
      <div className="flex gap-8 md:gap-12 flex-wrap justify-center mb-12">
        {agents.map((a) => (
          <PixelAgent key={a.source} source={a.source} state={a.state} />
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="w-full max-w-md h-2 rounded-full overflow-hidden mb-4"
        style={{ background: "var(--ink)", opacity: 0.1 }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${(doneCount / agents.length) * 100}%`,
            background: "var(--coral)",
            opacity: 1,
          }}
        />
      </div>

      {/* Profile counter */}
      {profileCount > 0 && (
        <p
          className="font-mono text-sm font-bold animate-card-reveal"
          style={{ color: "var(--coral)" }}
        >
          +{profileCount} profil{profileCount > 1 ? "s" : ""} trouvé{profileCount > 1 ? "s" : ""}
        </p>
      )}

      {/* Step indicator */}
      <p className="mt-2 text-xs font-mono" style={{ color: "var(--muted-text)" }}>
        {doneCount}/{agents.length} agents terminés
      </p>
    </div>
  );
}
```

- [ ] **Step 6.3: Commit**

```bash
git add app/components/SearchView.tsx app/components/LoadingView.tsx
git commit -m "feat: add SearchView and LoadingView with pixel agents"
```

---

## Task 7: CandidateCard + ResultsView

**Files:**
- Create: `app/components/CandidateCard.tsx`
- Create: `app/components/ResultsView.tsx`

- [ ] **Step 7.1: Create `app/components/CandidateCard.tsx`**

```tsx
"use client";

import type { SourcedProfile, SourceType } from "@/app/lib/types";
import ScoreRing from "./ScoreRing";

interface CandidateCardProps {
  profile: SourcedProfile;
  index: number; // for stagger delay
  onSelect: (profile: SourcedProfile) => void;
}

const SOURCE_ICONS: Record<SourceType, string> = {
  github: "⬛",
  linkedin: "🔵",
  reddit: "🟠",
  internet: "🌐",
  indeed: "🟦",
  hellowork: "🟧",
};

const SOURCE_COLORS: Record<SourceType, string> = {
  github: "#1a1a2e",
  linkedin: "#0077b5",
  reddit: "#ff4500",
  internet: "#6b7280",
  indeed: "#2164f3",
  hellowork: "#e05c2a",
};

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-white text-base flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}

export default function CandidateCard({ profile, index, onSelect }: CandidateCardProps) {
  const MAX_SKILLS = 4;
  const extra = profile.skills.length - MAX_SKILLS;

  return (
    <div
      className="animate-card-reveal cursor-pointer group"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => onSelect(profile)}
    >
      <div
        className="flex flex-col gap-4 p-5 rounded-2xl transition-all duration-200 group-hover:shadow-lg"
        style={{
          background: "var(--cream-mid)",
          border: "1.5px solid rgba(26,26,46,0.08)",
          boxShadow: "3px 3px 0 0 rgba(26,26,46,0.06)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "4px 4px 0 0 var(--coral)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--coral)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "3px 3px 0 0 rgba(26,26,46,0.06)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,26,46,0.08)";
        }}
      >
        {/* Top row: avatar + info + score ring */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={profile.name} color={profile.avatar_color} />
            <div>
              <p className="font-bold text-[15px]" style={{ color: "var(--ink)" }}>
                {profile.name}
              </p>
              <p className="text-sm" style={{ color: "var(--muted-text)" }}>
                {profile.title}
              </p>
              <p className="text-xs font-mono mt-0.5" style={{ color: "var(--muted-text)" }}>
                📍 {profile.location} · {profile.experience_years} ans XP
              </p>
            </div>
          </div>
          <ScoreRing score={profile.hrflow_score} size={52} />
        </div>

        {/* Source badges */}
        <div className="flex gap-1.5 flex-wrap">
          {profile.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-medium transition-opacity hover:opacity-70"
              style={{
                background: `${SOURCE_COLORS[s.type]}18`,
                color: SOURCE_COLORS[s.type],
                border: `1px solid ${SOURCE_COLORS[s.type]}30`,
              }}
            >
              {SOURCE_ICONS[s.type]} {s.label}
            </a>
          ))}
        </div>

        {/* Skills */}
        <div className="flex gap-1.5 flex-wrap">
          {profile.skills.slice(0, MAX_SKILLS).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-lg text-xs font-mono"
              style={{ background: "rgba(26,26,46,0.06)", color: "var(--ink)" }}
            >
              {skill}
            </span>
          ))}
          {extra > 0 && (
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-mono"
              style={{ background: "var(--coral-glow)", color: "var(--coral)" }}
            >
              +{extra}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          className="w-full py-2.5 font-mono font-bold text-xs uppercase tracking-wider transition-all duration-100 active:translate-x-0.5 active:translate-y-0.5"
          style={{
            background: "var(--coral)",
            color: "#fff",
            boxShadow: "3px 3px 0 0 var(--coral-deep)",
          }}
        >
          Voir le profil →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7.2: Create `app/components/ResultsView.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { SourcedProfile } from "@/app/lib/types";
import CandidateCard from "./CandidateCard";

type SortMode = "score-desc" | "score-asc" | "high-only" | "arrival";

interface ResultsViewProps {
  profiles: SourcedProfile[];
  query: string;
  isStreaming: boolean; // still receiving profiles from SSE
  onSelect: (profile: SourcedProfile) => void;
  onNewSearch: () => void;
}

function sortProfiles(profiles: SourcedProfile[], mode: SortMode): SourcedProfile[] {
  const copy = [...profiles];
  switch (mode) {
    case "score-desc": return copy.sort((a, b) => b.hrflow_score - a.hrflow_score);
    case "score-asc": return copy.sort((a, b) => a.hrflow_score - b.hrflow_score);
    case "high-only": return copy.filter((p) => p.hrflow_score >= 70).sort((a, b) => b.hrflow_score - a.hrflow_score);
    case "arrival": return copy; // insertion order
  }
}

export default function ResultsView({ profiles, query, isStreaming, onSelect, onNewSearch }: ResultsViewProps) {
  const [sort, setSort] = useState<SortMode>("score-desc");
  const sorted = sortProfiles(profiles, sort);

  const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
    { mode: "score-desc", label: "Score ↓" },
    { mode: "score-asc", label: "Score ↑" },
    { mode: "high-only", label: "≥ 70%" },
    { mode: "arrival", label: "Ordre" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(255,245,240,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(26,26,46,0.06)",
        }}
      >
        {/* Logo + query */}
        <div className="flex items-center gap-4">
          <button
            onClick={onNewSearch}
            className="flex items-center gap-2 font-bold text-lg"
            style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
          >
            🦞 Claw<span style={{ color: "var(--coral)" }}>4HR</span>
          </button>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono"
            style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.1)", color: "var(--ink)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            {query}
          </div>
        </div>

        {/* Count + streaming indicator */}
        <div className="flex items-center gap-3">
          {isStreaming && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono" style={{ background: "var(--coral-glow)", color: "var(--coral)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--coral)] animate-pulse" />
              Recherche en cours...
            </div>
          )}
          <span className="text-sm font-mono" style={{ color: "var(--muted-text)" }}>
            {profiles.length} profil{profiles.length > 1 ? "s" : ""}
          </span>
        </div>
      </header>

      {/* Sort controls */}
      <div className="flex gap-2 px-6 py-4">
        {SORT_OPTIONS.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setSort(mode)}
            className="px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all"
            style={{
              background: sort === mode ? "var(--ink)" : "transparent",
              color: sort === mode ? "var(--cream)" : "var(--ink)",
              border: `1px solid ${sort === mode ? "var(--ink)" : "rgba(26,26,46,0.2)"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-lg font-mono" style={{ color: "var(--muted-text)" }}>
            {sort === "high-only" ? "Aucun profil ≥ 70% pour l'instant." : "Recherche en cours..."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-6 pb-12">
          {sorted.map((p, i) => (
            <CandidateCard key={p.key} profile={p} index={i} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7.3: Commit**

```bash
git add app/components/CandidateCard.tsx app/components/ResultsView.tsx
git commit -m "feat: add CandidateCard and ResultsView"
```

---

## Task 8: QAPanel + ProfileDetailView

**Files:**
- Create: `app/components/QAPanel.tsx`
- Create: `app/components/ProfileDetailView.tsx`

- [ ] **Step 8.1: Create `app/components/QAPanel.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, SourcedProfile } from "@/app/lib/types";

interface QAPanelProps {
  profile: SourcedProfile;
  messages: ChatMessage[];
  asking: boolean;
  onSend: (question: string) => void;
}

export default function QAPanel({ profile, messages, asking, onSend }: QAPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, asking]);

  function handleSend() {
    const text = input.trim();
    if (!text || asking) return;
    setInput("");
    onSend(text);
  }

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{ border: "1.5px solid rgba(26,26,46,0.1)", background: "#fff" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(26,26,46,0.06)", background: "var(--cream-mid)" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
          style={{ background: "var(--coral)" }}
        >
          IA
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--ink)" }}>Assistant IA</p>
          <p className="text-[10px] font-mono" style={{ color: "var(--coral)" }}>
            {profile.name}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "var(--cream)" }}>
        {messages.length === 0 && (
          <p className="text-xs text-center py-8 font-mono" style={{ color: "var(--muted-text)" }}>
            Posez une question sur le profil de {profile.name.split(" ")[0]}.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={{
                background: msg.type === "user" ? "var(--ink)" : "#fff",
                color: msg.type === "user" ? "var(--cream)" : "var(--ink)",
                border: msg.type === "agent" ? "1px solid rgba(26,26,46,0.08)" : "none",
                borderRadius: msg.type === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {asking && (
          <div className="flex justify-start">
            <div
              className="px-4 py-2.5 rounded-2xl text-sm"
              style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.08)" }}
            >
              <div className="flex gap-1">
                <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--coral)" }} />
                <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--coral)" }} />
                <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--coral)" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-3 py-3"
        style={{ borderTop: "1px solid rgba(26,26,46,0.06)", background: "#fff" }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ex: Parle-moi de son expérience en NLP..."
          className="flex-1 text-sm px-3 py-2 rounded-xl outline-none"
          style={{
            background: "var(--cream)",
            border: "1px solid rgba(26,26,46,0.1)",
            color: "var(--ink)",
          }}
          disabled={asking}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || asking}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
          style={{ background: "var(--coral)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" />
          </svg>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 8.2: Create `app/components/ProfileDetailView.tsx`**

```tsx
"use client";

import type { SourcedProfile, ChatMessage, SourceType } from "@/app/lib/types";
import ScoreRing from "./ScoreRing";
import QAPanel from "./QAPanel";

const SOURCE_COLORS: Record<SourceType, string> = {
  github: "#1a1a2e",
  linkedin: "#0077b5",
  reddit: "#ff4500",
  internet: "#6b7280",
  indeed: "#2164f3",
  hellowork: "#e05c2a",
};

interface ProfileDetailViewProps {
  profile: SourcedProfile;
  messages: ChatMessage[];
  asking: boolean;
  onBack: () => void;
  onSend: (question: string) => void;
}

export default function ProfileDetailView({
  profile,
  messages,
  asking,
  onBack,
  onSend,
}: ProfileDetailViewProps) {
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      {/* Back button */}
      <div className="px-6 pt-5 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-sm font-bold uppercase tracking-wider transition-all duration-100 active:translate-x-0.5 active:translate-y-0.5 px-4 py-2"
          style={{
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            boxShadow: "3px 3px 0 0 rgba(26,26,46,0.15)",
            background: "transparent",
          }}
        >
          ← Retour aux résultats
        </button>
      </div>

      {/* Hero header */}
      <div className="px-6 pb-8 pt-2">
        <div
          className="rounded-2xl p-8 flex items-center justify-between gap-6"
          style={{ background: "var(--navy)", color: "#fff" }}
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center font-mono font-bold text-white text-2xl flex-shrink-0"
              style={{ backgroundColor: profile.avatar_color }}
            >
              {initials}
            </div>
            {/* Info */}
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "Georgia, serif" }}>
                {profile.name}
              </h1>
              <p className="text-lg mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>
                {profile.title}
              </p>
              <p className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>
                📍 {profile.location} · {profile.experience_years} ans d&apos;expérience
              </p>
              {/* Source links */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {profile.sources.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-full text-xs font-mono transition-opacity hover:opacity-70"
                    style={{
                      background: `${SOURCE_COLORS[s.type]}30`,
                      color: "#fff",
                      border: `1px solid ${SOURCE_COLORS[s.type]}60`,
                    }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <ScoreRing score={profile.hrflow_score} size={80} strokeWidth={5} />
        </div>
      </div>

      {/* 2-column body */}
      <div className="px-6 pb-16 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: profile content (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary */}
          <section
            className="p-6 rounded-2xl"
            style={{ background: "var(--cream-mid)", border: "1.5px solid rgba(26,26,46,0.08)" }}
          >
            <h2
              className="text-lg font-bold mb-3"
              style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
            >
              Résumé
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-text)" }}>
              {profile.summary}
            </p>
          </section>

          {/* Skills */}
          <section
            className="p-6 rounded-2xl"
            style={{ background: "var(--cream-mid)", border: "1.5px solid rgba(26,26,46,0.08)" }}
          >
            <h2
              className="text-lg font-bold mb-3"
              style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
            >
              Compétences
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg text-sm font-mono"
                  style={{ background: "rgba(26,26,46,0.07)", color: "var(--ink)" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Experiences */}
          {profile.experiences.length > 0 && (
            <section
              className="p-6 rounded-2xl"
              style={{ background: "var(--cream-mid)", border: "1.5px solid rgba(26,26,46,0.08)" }}
            >
              <h2
                className="text-lg font-bold mb-4"
                style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
              >
                Expériences
              </h2>
              <div className="space-y-5">
                {profile.experiences.map((exp, i) => (
                  <div key={i} className="flex gap-4">
                    <div
                      className="w-1 flex-shrink-0 rounded-full mt-1.5"
                      style={{ background: i === 0 ? "var(--coral)" : "rgba(26,26,46,0.15)", minHeight: 40 }}
                    />
                    <div>
                      <p className="font-bold text-sm" style={{ color: "var(--ink)" }}>{exp.title}</p>
                      <p className="text-sm font-mono" style={{ color: "var(--coral)" }}>{exp.company}</p>
                      <p className="text-xs font-mono mb-1" style={{ color: "var(--muted-text)" }}>
                        {exp.location} · {exp.period}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--muted-text)" }}>
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Educations */}
          {profile.educations.length > 0 && (
            <section
              className="p-6 rounded-2xl"
              style={{ background: "var(--cream-mid)", border: "1.5px solid rgba(26,26,46,0.08)" }}
            >
              <h2
                className="text-lg font-bold mb-4"
                style={{ fontFamily: "Georgia, serif", color: "var(--ink)" }}
              >
                Formation
              </h2>
              <div className="space-y-3">
                {profile.educations.map((edu, i) => (
                  <div key={i}>
                    <p className="font-bold text-sm" style={{ color: "var(--ink)" }}>{edu.degree}</p>
                    <p className="text-sm font-mono" style={{ color: "var(--coral)" }}>{edu.school}</p>
                    <p className="text-xs font-mono" style={{ color: "var(--muted-text)" }}>{edu.period}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: Q&A panel (2/5) */}
        <div className="lg:col-span-2" style={{ height: "fit-content", position: "sticky", top: 80 }}>
          <QAPanel profile={profile} messages={messages} asking={asking} onSend={onSend} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8.3: Commit**

```bash
git add app/components/QAPanel.tsx app/components/ProfileDetailView.tsx
git commit -m "feat: add QAPanel and ProfileDetailView"
```

---

## Task 9: Dashboard State Machine (Orchestration)

**Files:**
- Replace: `app/components/Dashboard.tsx`

- [ ] **Step 9.1: Replace `app/components/Dashboard.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SourcedProfile, ChatMessage } from "@/app/lib/types";
import type { AgentSource, AgentState } from "./PixelAgent";
import SearchView from "./SearchView";
import LoadingView from "./LoadingView";
import ResultsView from "./ResultsView";
import ProfileDetailView from "./ProfileDetailView";
import { streamDemoProfiles } from "@/app/lib/demoProfiles";

// ─── Types ────────────────────────────────────────────────────

type DashboardState = "search" | "loading" | "results" | "profile";

function chatMsg(type: "user" | "agent", text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    type,
    text,
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── Dashboard ────────────────────────────────────────────────

export default function Dashboard() {
  const [view, setView] = useState<DashboardState>("search");
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<SourcedProfile[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentSource, AgentState>>({
    github: "idle",
    linkedin: "idle",
    reddit: "idle",
    internet: "idle",
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SourcedProfile | null>(null);
  const [qaMessages, setQaMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);

  const esRef = useRef<EventSource | null>(null);
  const demoCleanupRef = useRef<(() => void) | null>(null);

  // ─── SSE connection ────────────────────────────────────────

  const connectSSE = useCallback((cursor = 0) => {
    if (esRef.current) esRef.current.close();
    const es = new EventSource(`/api/openclaw/stream?cursor=${cursor}`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);

        // Profile received
        if (event.channel === "profile" && event.payload?.profile) {
          const p = event.payload.profile as SourcedProfile;
          setProfiles((prev) => {
            if (prev.some((x) => x.key === p.key)) return prev;
            return [...prev, p];
          });
          // Auto-transition to results when first profile arrives
          setView((v) => (v === "loading" ? "results" : v));
        }

        // Agent status update
        if (event.channel === "feed" && event.payload?.source) {
          const source = event.payload.source as AgentSource;
          const status = event.payload.status as "running" | "done" | "error";
          setAgentStatuses((prev) => ({ ...prev, [source]: status }));
        }
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      // SSE error — close and don't reconnect (demo fallback handles it)
      es.close();
    };
  }, []);

  useEffect(() => {
    return () => {
      esRef.current?.close();
      demoCleanupRef.current?.();
    };
  }, []);

  // ─── Search handler ────────────────────────────────────────

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    setProfiles([]);
    setAgentStatuses({ github: "idle", linkedin: "idle", reddit: "idle", internet: "idle" });
    setView("loading");
    setIsStreaming(true);

    // Start SSE listener
    connectSSE(0);

    // Trigger OpenClaw
    const res = await fetch("/api/openclaw/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    });

    if (!res.ok) {
      // OpenClaw not available → demo fallback
      setAgentStatuses({ github: "running", linkedin: "running", reddit: "running", internet: "running" });

      // Simulate agent completion
      (["github", "linkedin", "reddit", "internet"] as AgentSource[]).forEach((src, i) => {
        setTimeout(() => {
          setAgentStatuses((prev) => ({ ...prev, [src]: "done" }));
        }, 2000 + i * 1500);
      });

      // Stream demo profiles
      demoCleanupRef.current?.();
      demoCleanupRef.current = streamDemoProfiles((p) => {
        setProfiles((prev) => {
          if (prev.some((x) => x.key === p.key)) return prev;
          return [...prev, p];
        });
        setView("results");
      }, 1400);
    }

    // Stop streaming indicator after 30s max
    setTimeout(() => setIsStreaming(false), 30_000);
  }, [connectSSE]);

  // ─── Profile Q&A ──────────────────────────────────────────

  const handleSelectProfile = useCallback((profile: SourcedProfile) => {
    setSelectedProfile(profile);
    setQaMessages([]);
    setView("profile");

    // Auto-generate summary
    if (profile.hrflow_key) {
      setAsking(true);
      fetch(`/api/hrflow/ask?profile_key=${profile.hrflow_key}&question=${encodeURIComponent("Donne-moi une synthèse de ce profil en 3 points clés pour un recruteur.")}`)
        .then((r) => r.json())
        .then((data) => {
          const answer = data?.data?.response ?? "Profil analysé avec succès.";
          setQaMessages([chatMsg("agent", answer)]);
        })
        .catch(() => {
          setQaMessages([chatMsg("agent", `${profile.name} — ${profile.title} à ${profile.location}. ${profile.summary}`)]);
        })
        .finally(() => setAsking(false));
    } else {
      // No hrflow_key — use summary directly
      setQaMessages([chatMsg("agent", profile.summary)]);
    }
  }, []);

  const handleAsk = useCallback(async (question: string) => {
    if (!selectedProfile || asking) return;
    setQaMessages((prev) => [...prev, chatMsg("user", question)]);
    setAsking(true);

    try {
      const profileKey = selectedProfile.hrflow_key ?? selectedProfile.key;
      const res = await fetch(`/api/hrflow/ask?profile_key=${encodeURIComponent(profileKey)}&question=${encodeURIComponent(question)}`);
      const data = await res.json();
      const answer = data?.data?.response ?? "Je n'ai pas pu obtenir de réponse.";
      setQaMessages((prev) => [...prev, chatMsg("agent", answer)]);
    } catch {
      setQaMessages((prev) => [...prev, chatMsg("agent", "Erreur lors de la question. Veuillez réessayer.")]);
    } finally {
      setAsking(false);
    }
  }, [selectedProfile, asking]);

  const handleBack = useCallback(() => {
    setView("results");
    setSelectedProfile(null);
    setQaMessages([]);
  }, []);

  const handleNewSearch = useCallback(() => {
    esRef.current?.close();
    demoCleanupRef.current?.();
    setView("search");
    setProfiles([]);
    setQuery("");
    setIsStreaming(false);
    setSelectedProfile(null);
    setQaMessages([]);
  }, []);

  // ─── Render ────────────────────────────────────────────────

  if (view === "search") {
    return <SearchView onSearch={handleSearch} />;
  }

  if (view === "loading") {
    return <LoadingView query={query} profileCount={profiles.length} agentStatuses={agentStatuses} />;
  }

  if (view === "results") {
    return (
      <ResultsView
        profiles={profiles}
        query={query}
        isStreaming={isStreaming}
        onSelect={handleSelectProfile}
        onNewSearch={handleNewSearch}
      />
    );
  }

  if (view === "profile" && selectedProfile) {
    return (
      <ProfileDetailView
        profile={selectedProfile}
        messages={qaMessages}
        asking={asking}
        onBack={handleBack}
        onSend={handleAsk}
      />
    );
  }

  return null;
}
```

- [ ] **Step 9.2: Delete old components**

```bash
rm app/components/WhatsAppPanel.tsx
rm app/components/AgentFeed.tsx
rm app/components/CandidatePanel.tsx
rm app/components/TopBar.tsx
```

- [ ] **Step 9.3: Verify build**

```bash
npx tsc --noEmit
npm run build
```

Expected: zero TypeScript errors, build completes.

- [ ] **Step 9.4: Commit**

```bash
git add app/components/
git commit -m "feat: replace dashboard with 4-state machine (Search→Loading→Results→Profile)"
```

---

## Task 10: Smoke Test + Deploy

**Files:** None (verification only)

- [ ] **Step 10.1: Dev smoke test**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
1. Search page loads with cream background, coral accent, logo ✓
2. Type "Data Scientist Paris" → Enter → Loading screen with pixel agents ✓
3. Within ~5s, demo profiles appear as cards with score rings ✓
4. Click a card → Profile detail with back button ✓
5. Click "← Retour aux résultats" → back to cards ✓

- [ ] **Step 10.2: Test SSE with OpenClaw mock**

```bash
# In terminal 1 — watch SSE stream
curl -N http://localhost:3000/api/openclaw/stream

# In terminal 2 — simulate OpenClaw sending a profile
curl -X POST http://localhost:3000/api/openclaw/webhook \
  -H "Content-Type: application/json" \
  -d '{"profiles":[{"key":"live-001","name":"Jean Martin","title":"Backend Engineer","location":"Paris","experience_years":4,"summary":"Backend Go/Python, passionné de perf.","sources":[{"type":"github","url":"https://github.com","label":"github.com/jmartin"}],"skills":["Go","Python","PostgreSQL","Docker"],"experiences":[{"title":"Backend Engineer","company":"Alan","location":"Paris","period":"2022 — 2024","description":"API REST haute perf, migration vers Go."}],"educations":[{"degree":"Master Info","school":"EPITA","period":"2018 — 2020"}],"hrflow_score":81,"hrflow_key":null,"avatar_color":"#10b981"}]}'
```

Expected: terminal 1 prints the event within 200ms. If browser is open on Loading screen, card appears.

- [ ] **Step 10.3: Deploy to Vercel**

```bash
git push origin feat/brain
```

Open Vercel dashboard, verify deployment passes. Test on `hrflowhackathon2026.vercel.app`.

- [ ] **Step 10.4: Final commit**

```bash
git add -A
git commit -m "chore: final smoke test and deploy verification"
git push origin feat/brain
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] State 1 Search → `SearchView.tsx`
- [x] State 2 Loading (pixel agents + terminal text) → `LoadingView.tsx` + `PixelAgent.tsx`
- [x] State 3 Results (grid, sort, badges) → `ResultsView.tsx` + `CandidateCard.tsx`
- [x] State 4 Profile Detail + Q&A → `ProfileDetailView.tsx` + `QAPanel.tsx`
- [x] SSE real-time streaming → `stream/route.ts` + eventStore subscriber
- [x] Trigger endpoint → `trigger/route.ts`
- [x] Demo fallback → `demoProfiles.ts` + fallback in `Dashboard.tsx`
- [x] Landing design system (coral, cream, ink, pixel buttons) → applied throughout
- [x] Score ring animated → `ScoreRing.tsx`
- [x] Source badges with links → `CandidateCard.tsx`
- [x] Auto-summary on profile open → `handleSelectProfile` in Dashboard
- [x] `SourcedProfile` type replaces HrFlow demo profiles

**No placeholders** — all code is complete.

**Type consistency** — `SourcedProfile`, `ProfileSource`, `AgentSource`, `AgentState` used consistently across all tasks.
