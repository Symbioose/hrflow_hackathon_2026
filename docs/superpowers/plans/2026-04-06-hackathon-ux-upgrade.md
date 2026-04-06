# Hackathon UX Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SWOT HrFlow, profile tabs, team management, and enriched pipeline (5 cols + DnD + delete) to Claw4HR before the demo finale.

**Architecture:** 4 independent features implemented in order of dependency: SQL migration first (unblocks pipeline), then SWOT component (shared by profile tabs), then Pipeline refactor, then Team. No external DnD library — HTML5 native drag & drop.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript, Supabase (PostgreSQL), Mistral AI (demo SWOT fallback), HrFlow API

---

## File Map

**Create:**
- `app/components/HrFlowSWOT.tsx` — Standalone SWOT component, fetches upskill data, handles demo fallback
- `app/components/TeamView.tsx` — Front-only team management view
- `app/api/demo/swot/route.ts` — Generate mock SWOT via Mistral for demo profiles (no hrflow_key)

**Modify:**
- `app/api/account/shortlist/route.ts` — Add `PATCH` handler to update `pipeline_stage`
- `app/components/ProfileDetailView.tsx` — Replace split layout with 2-tab right panel (SWOT / Chat IA), fix right panel width to 420px
- `app/components/PipelineView.tsx` — Full refactor: 5 columns, HTML5 DnD, delete with undo toast
- `app/components/Sidebar.tsx` — Add "Équipe" nav section + `team` NavSection type
- `app/components/Dashboard.tsx` — Handle `team` view, wire PATCH for pipeline stage

---

## Task 1: Supabase SQL migration — add `pipeline_stage` column

**Files:**
- No file to create — run SQL via Supabase MCP or dashboard

- [ ] **Step 1: Run the migration**

```sql
ALTER TABLE shortlist ADD COLUMN IF NOT EXISTS pipeline_stage text DEFAULT 'shortlisted';
```

Run via MCP tool `mcp__supabase__execute_sql` or paste in Supabase SQL editor.

- [ ] **Step 2: Verify the column exists**

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'shortlist' AND column_name = 'pipeline_stage';
```

Expected output: one row with `pipeline_stage | text | 'shortlisted'`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add pipeline_stage column to shortlist"
```

---

## Task 2: PATCH /api/account/shortlist — update pipeline stage

**Files:**
- Modify: `app/api/account/shortlist/route.ts`

- [ ] **Step 1: Add PATCH handler**

Open `app/api/account/shortlist/route.ts`. After the `DELETE` export, add:

```typescript
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { session_id, profile_key, pipeline_stage } = body;
  if (!session_id || !profile_key || !pipeline_stage) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const { data, error } = await db()
    .from("shortlist")
    .update({ pipeline_stage })
    .eq("session_id", session_id)
    .eq("profile_key", profile_key)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

- [ ] **Step 2: Verify it builds**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors on this file.

- [ ] **Step 3: Commit**

```bash
git add app/api/account/shortlist/route.ts
git commit -m "feat: add PATCH endpoint to update pipeline_stage"
```

---

## Task 3: POST /api/demo/swot — mock SWOT for demo profiles

This provides SWOT bullets for profiles without a `hrflow_key`, using Mistral (same pattern as `/api/demo/ask`).

**Files:**
- Create: `app/api/demo/swot/route.ts`

- [ ] **Step 1: Create the file**

```typescript
import { NextRequest, NextResponse } from "next/server";
import type { SourcedProfile } from "@/app/lib/types";

/**
 * POST /api/demo/swot
 * Generate SWOT analysis for demo profiles (no HrFlow key) via Mistral.
 * Body: { profile: SourcedProfile, job_title?: string }
 */
export async function POST(req: NextRequest) {
  const { profile, job_title } = (await req.json()) as {
    profile: SourcedProfile;
    job_title?: string;
  };

  if (!profile) {
    return NextResponse.json({ error: "Missing profile" }, { status: 400 });
  }

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ data: buildFallback(profile) });
  }

  const jobContext = job_title ?? "Lead Data Scientist Python Paris";

  const prompt = `Tu es un expert RH. Analyse ce profil candidat pour le poste "${jobContext}".

Profil:
- Nom: ${profile.name}
- Titre: ${profile.title}
- Expérience: ${profile.experience_years} ans
- Compétences: ${profile.skills.join(", ")}
- Poste actuel: ${profile.experiences[0]?.title ?? profile.title} chez ${profile.experiences[0]?.company ?? "N/A"}
- Résumé: ${profile.summary}

Réponds en JSON strict avec ce format exact:
{
  "strengths": ["force 1", "force 2", "force 3"],
  "improvements": ["point d'attention 1", "point d'attention 2"]
}

3 forces maximum, 2 points d'attention maximum. Chaque item = 1 phrase courte et factuelle. JSON pur, sans markdown.`;

  try {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return NextResponse.json({ data: buildFallback(profile) });

    const completion = await res.json();
    const text = completion.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);

    return NextResponse.json({
      data: {
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 2) : [],
      },
    });
  } catch {
    return NextResponse.json({ data: buildFallback(profile) });
  }
}

function buildFallback(profile: SourcedProfile) {
  const topSkills = profile.skills.slice(0, 3).join(", ");
  return {
    strengths: [
      `${profile.experience_years} ans d'expérience dans le domaine`,
      topSkills ? `Maîtrise de ${topSkills}` : "Profil technique confirmé",
      profile.experiences[0]?.company ? `Expérience en entreprise : ${profile.experiences[0].company}` : "Parcours solide",
    ],
    improvements: [
      "Informations complémentaires à vérifier en entretien",
      "Motivations pour une opportunité passive à confirmer",
    ],
  };
}
```

- [ ] **Step 2: Verify it builds**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/api/demo/swot/route.ts
git commit -m "feat: add demo SWOT endpoint via Mistral"
```

---

## Task 4: HrFlowSWOT component

Standalone component used in both the right panel tabs and as a standalone section. Fetches from `/api/hrflow/upskill` (real HrFlow key) or `/api/demo/swot` (demo profile).

**Files:**
- Create: `app/components/HrFlowSWOT.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

import { useEffect, useState } from "react";
import type { SourcedProfile } from "@/app/lib/types";

interface SWOTData {
  strengths: string[];
  improvements: string[];
}

interface HrFlowSWOTProps {
  profile: SourcedProfile;
  jobKey?: string;   // if undefined, uses default job from env
}

export default function HrFlowSWOT({ profile, jobKey }: HrFlowSWOTProps) {
  const [data, setData] = useState<SWOTData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setData(null);

    const defaultJobKey = process.env.NEXT_PUBLIC_HRFLOW_DEFAULT_JOB_KEY ?? "";
    const effectiveJobKey = jobKey ?? defaultJobKey;

    const fetchSwot = profile.hrflow_key && effectiveJobKey
      ? fetch(`/api/hrflow/upskill?profile_key=${encodeURIComponent(profile.hrflow_key)}&job_key=${encodeURIComponent(effectiveJobKey)}`)
          .then((r) => r.json())
          .then((res) => {
            // HrFlow upskilling response: extract strengths/improvements from data
            const raw = res?.data ?? {};
            // HrFlow may return arrays directly or nested under predictions
            const strengths: string[] = extractBullets(raw, "positive") ?? [];
            const improvements: string[] = extractBullets(raw, "negative") ?? [];
            return { strengths, improvements };
          })
      : fetch("/api/demo/swot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile }),
        })
          .then((r) => r.json())
          .then((res) => res?.data ?? { strengths: [], improvements: [] });

    fetchSwot
      .then((swot) => setData(swot))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [profile.key, profile.hrflow_key, jobKey]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#4f46e5", borderTopColor: "transparent" }} />
          <span className="text-xs font-mono" style={{ color: "#9ca3af" }}>Analyse HrFlow en cours…</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-7 rounded-lg animate-pulse" style={{ background: "#f3f4f6", width: `${60 + i * 10}%` }} />
        ))}
      </div>
    );
  }

  if (error || !data || (data.strengths.length === 0 && data.improvements.length === 0)) {
    return (
      <div className="p-4 rounded-xl text-center" style={{ background: "#f9fafb", border: "1px dashed #e5e7eb" }}>
        <p className="text-xs font-mono" style={{ color: "#9ca3af" }}>Analyse HrFlow non disponible pour ce profil</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Powered by HrFlow badge */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#9ca3af" }}>
          Analyse HrFlow
        </p>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide"
          style={{ background: "rgba(79,70,229,0.1)", color: "#4f46e5" }}
        >
          Powered by HrFlow
        </span>
      </div>

      {/* Strengths */}
      {data.strengths.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {data.strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-lg" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
              <span className="text-sm leading-none mt-0.5 flex-shrink-0" style={{ color: "#10b981" }}>✓</span>
              <p className="text-xs leading-relaxed" style={{ color: "#374151" }}>{s}</p>
            </div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {data.improvements.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {data.improvements.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-lg" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
              <span className="text-sm leading-none mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }}>△</span>
              <p className="text-xs leading-relaxed" style={{ color: "#374151" }}>{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Parse HrFlow upskilling response — handles multiple possible shapes
function extractBullets(raw: Record<string, unknown>, polarity: "positive" | "negative"): string[] | null {
  // Shape 1: { strengths: string[], improvements: string[] }
  if (polarity === "positive" && Array.isArray(raw.strengths)) return raw.strengths as string[];
  if (polarity === "negative" && Array.isArray(raw.improvements)) return raw.improvements as string[];

  // Shape 2: { predictions: [{ name, value, type }] } — value > 0 = positive
  if (Array.isArray(raw.predictions)) {
    const predictions = raw.predictions as Array<{ name?: string; value?: number; type?: string }>;
    return predictions
      .filter((p) => polarity === "positive" ? (p.value ?? 0) > 0 : (p.value ?? 0) < 0)
      .slice(0, 3)
      .map((p) => p.name ?? "")
      .filter(Boolean);
  }

  // Shape 3: { explanation: string } — split into bullets
  if (typeof raw.explanation === "string") {
    const lines = raw.explanation.split("\n").filter((l) => l.trim().length > 0);
    return polarity === "positive" ? lines.slice(0, 3) : lines.slice(3, 5);
  }

  return null;
}
```

- [ ] **Step 2: Add `NEXT_PUBLIC_HRFLOW_DEFAULT_JOB_KEY` to `.env.local`**

Open `.env.local` and add:
```
NEXT_PUBLIC_HRFLOW_DEFAULT_JOB_KEY=90fd6858b1de21274af231c9ad93fda3000dddac
```

(The `Dev Python Senior Paris` job key from CONTEXT.md)

- [ ] **Step 3: Verify it builds**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add app/components/HrFlowSWOT.tsx .env.local
git commit -m "feat: add HrFlowSWOT component with demo fallback"
```

---

## Task 5: ProfileDetailView — tabs right panel (SWOT + Chat IA)

Replace the current fixed right panel (always showing Chat IA) with a 2-tab panel. Fix right panel width to 420px.

**Files:**
- Modify: `app/components/ProfileDetailView.tsx`

- [ ] **Step 1: Replace ProfileDetailView with the tabbed version**

Replace the entire content of `app/components/ProfileDetailView.tsx` with:

```typescript
"use client";

import { useState } from "react";
import type { SourcedProfile, ChatMessage, SourceType } from "@/app/lib/types";
import ScoreRing from "./ScoreRing";
import QAPanel from "./QAPanel";
import HrFlowSWOT from "./HrFlowSWOT";

const SOURCE_COLORS: Record<SourceType, string> = {
  github: "#1a1a2e",
  linkedin: "#0077b5",
  reddit: "#ff4500",
  internet: "#6b7280",
  indeed: "#2164f3",
  hellowork: "#e05c2a",
};

const SOURCE_LABELS: Record<SourceType, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  reddit: "Reddit",
  internet: "Web",
  indeed: "Indeed",
  hellowork: "HelloWork",
};

type RightTab = "swot" | "chat";

interface ProfileDetailViewProps {
  profile: SourcedProfile;
  messages: ChatMessage[];
  asking: boolean;
  isSaved: boolean;
  onBack: () => void;
  onSend: (question: string) => void;
  onSave: (profile: SourcedProfile) => void;
  onContact: (profile: SourcedProfile) => void;
}

export default function ProfileDetailView({
  profile,
  messages,
  asking,
  isSaved,
  onBack,
  onSend,
  onSave,
  onContact,
}: ProfileDetailViewProps) {
  const [activeTab, setActiveTab] = useState<RightTab>("swot");

  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden" }}>
      {/* ─── Left panel: Profile info ─────────────────────────── */}
      <div
        className="flex flex-col overflow-hidden flex-shrink-0"
        style={{ width: 440, borderRight: "1px solid #e5e7eb", background: "#fff" }}
      >
        {/* Action bar */}
        <div
          className="flex items-center gap-2 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #f3f4f6" }}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
            style={{ color: "#6b7280", background: "#f9fafb", border: "1px solid #e5e7eb" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#1a1a2e")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#6b7280")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Retour
          </button>
          <button
            onClick={() => onSave(profile)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
            style={{
              color: isSaved ? "#f59e0b" : "#6b7280",
              background: isSaved ? "#fff8e7" : "#f9fafb",
              border: `1px solid ${isSaved ? "#fcd34d" : "#e5e7eb"}`,
            }}
          >
            {isSaved ? "★ Sauvegardé" : "☆ Sauvegarder"}
          </button>
          <button
            onClick={() => onContact(profile)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all ml-auto"
            style={{ background: "#FF6B6B", color: "#fff", boxShadow: "0 2px 8px rgba(255,107,107,0.3)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#CC4444")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#FF6B6B")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Contacter
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <div className="px-6 py-6" style={{ borderBottom: "1px solid #f3f4f6" }}>
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                style={{ background: profile.avatar_color }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold mb-0.5 leading-tight" style={{ color: "#1a1a2e" }}>
                  {profile.name}
                </h1>
                <p className="text-sm mb-1" style={{ color: "#6b7280" }}>{profile.title}</p>
                <p className="text-xs font-mono" style={{ color: "#9ca3af" }}>
                  {profile.location} · {profile.experience_years} ans d&apos;expérience
                </p>
              </div>
              <ScoreRing score={profile.hrflow_score} size={56} strokeWidth={4} />
            </div>

            {/* Sources */}
            <div className="flex gap-2 flex-wrap mt-4">
              {profile.sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors"
                  style={{
                    background: `${SOURCE_COLORS[s.type]}0d`,
                    color: SOURCE_COLORS[s.type],
                    border: `1px solid ${SOURCE_COLORS[s.type]}20`,
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = `${SOURCE_COLORS[s.type]}1a`)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = `${SOURCE_COLORS[s.type]}0d`)}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: SOURCE_COLORS[s.type] }} />
                  {SOURCE_LABELS[s.type]}
                </a>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #f3f4f6" }}>
            <p className="text-[11px] font-mono uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>Résumé</p>
            <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{profile.summary}</p>
          </div>

          {/* Skills */}
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #f3f4f6" }}>
            <p className="text-[11px] font-mono uppercase tracking-widest mb-3" style={{ color: "#9ca3af" }}>Compétences</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md text-xs font-mono"
                  style={{ background: "#f3f4f6", color: "#374151" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experiences */}
          {profile.experiences.length > 0 && (
            <div className="px-6 py-5" style={{ borderBottom: "1px solid #f3f4f6" }}>
              <p className="text-[11px] font-mono uppercase tracking-widest mb-4" style={{ color: "#9ca3af" }}>Expériences</p>
              <div className="space-y-5">
                {profile.experiences.map((exp, i) => (
                  <div key={i} className="flex gap-3">
                    <div
                      className="w-0.5 flex-shrink-0 rounded-full mt-1"
                      style={{ background: i === 0 ? "#FF6B6B" : "#e5e7eb", minHeight: 40 }}
                    />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#1a1a2e" }}>{exp.title}</p>
                      <p className="text-xs font-mono" style={{ color: "#FF6B6B" }}>{exp.company}</p>
                      <p className="text-xs font-mono mb-1.5" style={{ color: "#9ca3af" }}>
                        {exp.location} · {exp.period}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Educations */}
          {profile.educations.length > 0 && (
            <div className="px-6 py-5">
              <p className="text-[11px] font-mono uppercase tracking-widest mb-4" style={{ color: "#9ca3af" }}>Formation</p>
              <div className="space-y-3">
                {profile.educations.map((edu, i) => (
                  <div key={i}>
                    <p className="font-semibold text-sm" style={{ color: "#1a1a2e" }}>{edu.degree}</p>
                    <p className="text-xs font-mono" style={{ color: "#FF6B6B" }}>{edu.school}</p>
                    <p className="text-xs font-mono" style={{ color: "#9ca3af" }}>{edu.period}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Right panel: tabs ────────────────────────────────── */}
      <div className="flex flex-col overflow-hidden flex-shrink-0" style={{ width: 420, background: "#f8f9fa" }}>
        {/* Tab bar */}
        <div
          className="flex flex-shrink-0"
          style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}
        >
          <TabButton
            label="Analyse HrFlow"
            icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            }
            isActive={activeTab === "swot"}
            onClick={() => setActiveTab("swot")}
          />
          <TabButton
            label="Chat IA"
            icon={
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            }
            isActive={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
            badge={messages.length > 0 ? messages.length : undefined}
          />
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "swot" && (
            <div className="h-full overflow-y-auto p-5">
              <HrFlowSWOT profile={profile} />
            </div>
          )}
          {activeTab === "chat" && (
            <div className="h-full p-4 flex flex-col">
              <QAPanel profile={profile} messages={messages} asking={asking} onSend={onSend} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  label,
  icon,
  isActive,
  onClick,
  badge,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}) {
  const ACCENT = "#4f46e5";
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all relative flex-1 justify-center"
      style={{
        color: isActive ? ACCENT : "#6b7280",
        background: "transparent",
        borderBottom: isActive ? `2px solid ${ACCENT}` : "2px solid transparent",
      }}
    >
      <span style={{ color: isActive ? ACCENT : "#9ca3af" }}>{icon}</span>
      {label}
      {badge != null && badge > 0 && (
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: `${ACCENT}20`, color: ACCENT }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Verify it builds**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Visual check**

```bash
npm run dev
```

Open a profile in the dashboard. Verify:
- Left panel: name, score ring, sources, skills, experiences, education
- Right panel: 2 tabs — "Analyse HrFlow" (active by default) and "Chat IA"
- Switching tabs works
- SWOT shows loading state then bullets (or fallback if no API key)

- [ ] **Step 4: Commit**

```bash
git add app/components/ProfileDetailView.tsx app/components/HrFlowSWOT.tsx
git commit -m "feat: profile detail view with tabs - SWOT HrFlow + Chat IA"
```

---

## Task 6: PipelineView — 5 columns, HTML5 DnD, delete with undo toast

Full refactor of `app/components/PipelineView.tsx`.

**Files:**
- Modify: `app/components/PipelineView.tsx`

- [ ] **Step 1: Replace PipelineView with the full refactor**

Replace the entire content of `app/components/PipelineView.tsx` with:

```typescript
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ShortlistEntry, OutreachEntry, SourcedProfile } from "@/app/lib/types";

interface PipelineViewProps {
  sessionId: string;
  onOpenProfile: (profile: SourcedProfile) => void;
  onContact: (profile: SourcedProfile) => void;
}

type StageId = "shortlisted" | "contacted" | "waiting" | "discussing" | "archived";

const COLUMNS: {
  id: StageId;
  label: string;
  sub: string;
  color: string;
  bg: string;
}[] = [
  { id: "shortlisted", label: "Shortlistés",       sub: "Sélectionnés",          color: "#4f46e5", bg: "rgba(79,70,229,0.05)" },
  { id: "contacted",  label: "Contactés",          sub: "Outreach envoyé",       color: "#f59e0b", bg: "rgba(245,158,11,0.05)" },
  { id: "waiting",    label: "En attente",         sub: "En attente de réponse", color: "#3b82f6", bg: "rgba(59,130,246,0.05)" },
  { id: "discussing", label: "En discussion",      sub: "Échanges en cours",     color: "#10b981", bg: "rgba(16,185,129,0.05)" },
  { id: "archived",   label: "Archivés",           sub: "Candidatures closes",   color: "#6b7280", bg: "rgba(107,114,128,0.05)" },
];

interface PipelineCard {
  key: string;
  profile: SourcedProfile;
  stage: StageId;
  outreach?: OutreachEntry;
}

interface UndoToast {
  id: string;
  profileName: string;
  profileKey: string;
  stage: StageId;
  profile: SourcedProfile;
  outreach?: OutreachEntry;
  timer: ReturnType<typeof setTimeout>;
}

const SOURCE_COLORS: Record<string, string> = {
  github: "#1f2937", linkedin: "#0077b5", reddit: "#ff4500", internet: "#7c3aed",
};

export default function PipelineView({ sessionId, onOpenProfile, onContact }: PipelineViewProps) {
  const [cards, setCards] = useState<PipelineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [undoToast, setUndoToast] = useState<UndoToast | null>(null);
  const [dragOverCol, setDragOverCol] = useState<StageId | null>(null);
  const dragKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId || sessionId === "ssr") return;
    Promise.all([
      fetch(`/api/account/shortlist?session_id=${sessionId}`).then((r) => r.json()),
      fetch(`/api/account/outreach?session_id=${sessionId}`).then((r) => r.json()),
    ]).then(([sl, o]) => {
      const shortlist: ShortlistEntry[] = sl.data ?? [];
      const outreach: OutreachEntry[] = o.data ?? [];
      const outreachMap = new Map(outreach.map((o) => [o.profile_key, o]));

      const initial: PipelineCard[] = shortlist.map((e) => ({
        key: e.profile_key,
        profile: e.profile_data,
        stage: (e.pipeline_stage as StageId) ?? (outreachMap.has(e.profile_key) ? "contacted" : "shortlisted"),
        outreach: outreachMap.get(e.profile_key),
      }));

      setCards(initial);
      setLoading(false);
    });
  }, [sessionId]);

  const moveCard = useCallback((profileKey: string, newStage: StageId) => {
    setCards((prev) => prev.map((c) => c.key === profileKey ? { ...c, stage: newStage } : c));
    fetch("/api/account/shortlist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, profile_key: profileKey, pipeline_stage: newStage }),
    }).catch(() => {});
  }, [sessionId]);

  const deleteCard = useCallback((card: PipelineCard) => {
    setCards((prev) => prev.filter((c) => c.key !== card.key));

    const timer = setTimeout(() => {
      fetch("/api/account/shortlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, profile_key: card.key }),
      }).catch(() => {});
      setUndoToast(null);
    }, 4000);

    setUndoToast((prev) => {
      if (prev) clearTimeout(prev.timer);
      return { id: card.key, profileName: card.profile.name, profileKey: card.key, stage: card.stage, profile: card.profile, outreach: card.outreach, timer };
    });
  }, [sessionId]);

  const undoDelete = useCallback(() => {
    if (!undoToast) return;
    clearTimeout(undoToast.timer);
    setCards((prev) => {
      if (prev.some((c) => c.key === undoToast.profileKey)) return prev;
      return [...prev, { key: undoToast.profileKey, profile: undoToast.profile, stage: undoToast.stage, outreach: undoToast.outreach }];
    });
    setUndoToast(null);
  }, [undoToast]);

  // ── Drag handlers ──────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, profileKey: string) => {
    dragKeyRef.current = profileKey;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", profileKey);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, colId: StageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, colId: StageId) => {
    e.preventDefault();
    const key = e.dataTransfer.getData("text/plain") || dragKeyRef.current;
    setDragOverCol(null);
    if (key) moveCard(key, colId);
    dragKeyRef.current = null;
  }, [moveCard]);

  const handleDragEnd = useCallback(() => {
    setDragOverCol(null);
    dragKeyRef.current = null;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f8f9fa" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#4f46e5", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "#9ca3af" }}>Chargement du pipeline…</p>
        </div>
      </div>
    );
  }

  const total = cards.length;

  return (
    <div className="min-h-screen overflow-auto" style={{ background: "#f8f9fa" }}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pipeline</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            {total} candidat{total !== 1 ? "s" : ""} · Glissez-déposez pour changer de statut
          </p>
        </div>

        {/* Kanban — horizontal scroll on small screens */}
        <div className="flex gap-4 pb-4" style={{ minWidth: "max-content" }}>
          {COLUMNS.map((col) => {
            const colCards = cards.filter((c) => c.stage === col.id);
            const isDragTarget = dragOverCol === col.id;
            return (
              <div
                key={col.id}
                className="flex flex-col gap-3 transition-all duration-150"
                style={{ width: 240 }}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column header */}
                <div
                  className="flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-150"
                  style={{
                    background: isDragTarget ? `${col.color}12` : col.bg,
                    border: `1px solid ${isDragTarget ? col.color + "60" : col.color + "22"}`,
                    boxShadow: isDragTarget ? `0 0 0 2px ${col.color}30` : "none",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                    <span className="text-sm font-semibold" style={{ color: "#111827" }}>{col.label}</span>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${col.color}20`, color: col.color }}
                  >
                    {colCards.length}
                  </span>
                </div>

                {/* Cards */}
                <div
                  className="flex flex-col gap-2.5 min-h-[80px] rounded-xl transition-all duration-150 p-1"
                  style={{
                    background: isDragTarget ? `${col.color}06` : "transparent",
                    border: isDragTarget ? `2px dashed ${col.color}40` : "2px dashed transparent",
                  }}
                >
                  {colCards.length === 0 ? (
                    <div
                      className="rounded-xl p-4 text-center"
                      style={{ borderColor: "#d1d5db", border: "1px dashed #d1d5db" }}
                    >
                      <p className="text-xs" style={{ color: "#9ca3af" }}>
                        {isDragTarget ? "Déposer ici" : "Aucun candidat"}
                      </p>
                    </div>
                  ) : (
                    colCards.map((card) => (
                      <PipelineCardItem
                        key={card.key}
                        card={card}
                        accentColor={col.color}
                        onOpenProfile={onOpenProfile}
                        onContact={onContact}
                        onDelete={deleteCard}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Undo toast */}
      {undoToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg z-50"
          style={{ background: "#1a1a2e", color: "#fff", minWidth: 280 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#f87171", flexShrink: 0 }}>
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          </svg>
          <p className="text-xs flex-1">{undoToast.profileName} supprimé</p>
          <button
            onClick={undoDelete}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-all"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.25)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)")}
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}

function PipelineCardItem({
  card,
  accentColor,
  onOpenProfile,
  onContact,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  card: PipelineCard;
  accentColor: string;
  onOpenProfile: (p: SourcedProfile) => void;
  onContact: (p: SourcedProfile) => void;
  onDelete: (card: PipelineCard) => void;
  onDragStart: (e: React.DragEvent, key: string) => void;
  onDragEnd: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const { profile, outreach } = card;
  const initials = profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const primarySource = profile.sources?.[0];
  const sourceColor = primarySource ? (SOURCE_COLORS[primarySource.type] ?? "#6b7280") : profile.avatar_color ?? "#6b7280";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.key)}
      onDragEnd={onDragEnd}
      className="bg-white rounded-xl p-3.5 flex flex-col gap-2.5 cursor-grab active:cursor-grabbing transition-all duration-150 relative group"
      style={{
        border: `1px solid ${hovered ? accentColor + "44" : "#e5e7eb"}`,
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        userSelect: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(card); }}
        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        style={{ background: "#fee2e2", color: "#ef4444" }}
        title="Supprimer"
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Top row — click opens profile */}
      <div className="flex items-center gap-2.5 cursor-pointer pr-4" onClick={() => onOpenProfile(profile)}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: profile.avatar_color ?? sourceColor }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{profile.name}</p>
          <p className="text-[11px] truncate" style={{ color: "#6b7280" }}>{profile.title || "—"}</p>
        </div>
        {profile.hrflow_score > 0 && (
          <div
            className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: profile.hrflow_score >= 70 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              color: profile.hrflow_score >= 70 ? "#10b981" : "#f59e0b",
            }}
          >
            {profile.hrflow_score}%
          </div>
        )}
      </div>

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {profile.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "#f3f4f6", color: "#374151" }}>
              {skill}
            </span>
          ))}
          {profile.skills.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#f3f4f6", color: "#9ca3af" }}>
              +{profile.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: source + action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {primarySource && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${sourceColor}18`, color: sourceColor }}>
              {primarySource.type}
            </span>
          )}
          {profile.location && (
            <span className="text-[10px]" style={{ color: "#9ca3af" }}>{profile.location}</span>
          )}
        </div>
        {card.stage !== "contacted" && card.stage !== "discussing" && card.stage !== "archived" ? (
          <button
            onClick={(e) => { e.stopPropagation(); onContact(profile); }}
            className="text-[10px] font-semibold px-2 py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30` }}
          >
            Contacter
          </button>
        ) : outreach ? (
          <span className="text-[10px] font-medium" style={{ color: "#10b981" }}>✓ Envoyé</span>
        ) : null}
      </div>

      {/* Outreach preview */}
      {outreach && (
        <div
          className="text-[11px] px-2.5 py-1.5 rounded-lg line-clamp-2 leading-relaxed"
          style={{ background: "rgba(245,158,11,0.06)", color: "#78716c", borderLeft: "2px solid #f59e0b" }}
        >
          {outreach.message.slice(0, 90)}…
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update the `ShortlistEntry` type to include `pipeline_stage`**

Open `app/lib/types.ts`. Find the `ShortlistEntry` interface and add the field:

```typescript
export interface ShortlistEntry {
  id: string;
  session_id: string;
  profile_key: string;
  profile_data: SourcedProfile;
  pipeline_stage?: string;   // ← add this line
  saved_at: string;
}
```

- [ ] **Step 3: Verify it builds**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Visual check**

```bash
npm run dev
```

Open Pipeline in the dashboard. Verify:
- 5 columns visible with correct colors
- Cards are draggable (cursor changes to grab)
- Dropping a card in another column updates it and persists on refresh
- X button appears on hover, clicking shows undo toast for 4 seconds
- Clicking "Annuler" restores the card

- [ ] **Step 5: Commit**

```bash
git add app/components/PipelineView.tsx app/lib/types.ts
git commit -m "feat: pipeline kanban - 5 cols, drag & drop, delete with undo"
```

---

## Task 7: TeamView — front-only team management

**Files:**
- Create: `app/components/TeamView.tsx`

- [ ] **Step 1: Create TeamView**

```typescript
"use client";

import { useState } from "react";

interface TeamViewProps {
  companyName: string;
}

const ACCENT = "#4f46e5";

const DEMO_MEMBERS = [
  { name: "Sophie Martin",   role: "Responsable RH",        status: "active"  as const },
  { name: "Lucas Bernard",   role: "Chargé de recrutement", status: "active"  as const },
  { name: "Émilie Rousseau", role: "Talent Acquisition",    status: "offline" as const },
];

type MemberStatus = "active" | "offline" | "you";

interface Member {
  name: string;
  role: string;
  status: MemberStatus;
}

export default function TeamView({ companyName }: TeamViewProps) {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState<"recruiter" | "admin">("recruiter");

  function generateToken() {
    const newToken = crypto.randomUUID().slice(0, 8).toUpperCase();
    setToken(newToken);
    setCopied(false);
  }

  function copyLink() {
    if (!token) return;
    navigator.clipboard.writeText(`https://claw4hr.io/invite/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const members: Member[] = [
    ...DEMO_MEMBERS,
    { name: "Vous", role: "Admin", status: "you" },
  ];

  return (
    <div className="min-h-screen p-8 overflow-y-auto" style={{ background: "#f8f9fa" }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#111827" }}>Équipe</h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            {companyName || "Votre entreprise"} · {members.length} membre{members.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Members */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #e5e7eb" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #f3f4f6" }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9ca3af" }}>Membres</p>
          </div>
          <div className="flex flex-col divide-y divide-gray-50">
            {members.map((m) => (
              <MemberRow key={m.name} member={m} />
            ))}
          </div>
        </div>

        {/* Invite section */}
        <div
          className="rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: "#fff", border: "1px solid #e5e7eb" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: "#111827" }}>Inviter un recruteur</p>
              <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                Générez un lien sécurisé à envoyer par email.
              </p>
            </div>
          </div>

          {/* Role selector */}
          <div className="flex gap-2">
            {(["recruiter", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: role === r ? ACCENT : "#f3f4f6",
                  color: role === r ? "#fff" : "#374151",
                  border: `1px solid ${role === r ? ACCENT : "#e5e7eb"}`,
                }}
              >
                {r === "recruiter" ? "Recruteur" : "Admin"}
              </button>
            ))}
          </div>

          {/* Token display */}
          {token ? (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(79,70,229,0.06)", border: "1px solid rgba(79,70,229,0.15)" }}
            >
              <code className="text-xs font-mono flex-1" style={{ color: ACCENT }}>
                claw4hr.io/invite/{token}
              </code>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: copied ? "rgba(16,185,129,0.1)" : `${ACCENT}20`,
                  color: copied ? "#10b981" : ACCENT,
                  border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : `${ACCENT}30`}`,
                }}
              >
                {copied ? (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Copié
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copier
                  </>
                )}
              </button>
              <button
                onClick={() => setToken(null)}
                className="text-xs font-medium px-2 py-1.5 rounded-lg transition-all"
                style={{ color: "#9ca3af" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#374151")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#9ca3af")}
              >
                Nouveau
              </button>
            </div>
          ) : (
            <button
              onClick={generateToken}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: ACCENT, color: "#fff", boxShadow: "0 2px 8px rgba(79,70,229,0.25)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#4338ca")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = ACCENT)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Générer un lien d&apos;invitation
            </button>
          )}

          <p className="text-[11px]" style={{ color: "#d1d5db" }}>
            Ce lien expire dans 48h · Valable pour 1 inscription · Rôle : {role === "recruiter" ? "Recruteur" : "Admin"}
          </p>
        </div>
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: Member }) {
  const initials = member.name === "Vous" ? "V" : member.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const statusColors: Record<MemberStatus, { dot: string; label: string; text: string }> = {
    active:  { dot: "#10b981", label: "Actif",     text: "#10b981" },
    offline: { dot: "#d1d5db", label: "Hors ligne", text: "#9ca3af" },
    you:     { dot: "#4f46e5", label: "Vous",       text: "#4f46e5" },
  };
  const st = statusColors[member.status];
  const avatarBg = member.status === "you" ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : member.status === "active" ? "#374151" : "#d1d5db";

  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: avatarBg }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "#111827" }}>{member.name}</p>
        <p className="text-xs truncate" style={{ color: "#9ca3af" }}>{member.role}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
        <span className="text-[11px] font-medium" style={{ color: st.text }}>{st.label}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it builds**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/components/TeamView.tsx
git commit -m "feat: add TeamView component (front-only)"
```

---

## Task 8: Sidebar + Dashboard — wire Team nav

**Files:**
- Modify: `app/components/Sidebar.tsx`
- Modify: `app/components/Dashboard.tsx`

- [ ] **Step 1: Add `team` to NavSection type and Sidebar**

In `app/components/Sidebar.tsx`:

1. Change line 7:
```typescript
type NavSection = "search" | "shortlist" | "outreach" | "history" | "analyse" | "pipeline" | "team";
```

2. After `INSIGHTS_ITEMS`, add a new array:
```typescript
const TEAM_ITEMS: { section: NavSection; label: string; icon: React.ReactNode }[] = [
  {
    section: "team",
    label: "Équipe",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];
```

3. In the `<nav>` JSX, after the `INSIGHTS_ITEMS` block, add:
```typescript
<div>
  <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#9ca3af" }}>
    Équipe
  </p>
  <div className="flex flex-col gap-0.5">
    {TEAM_ITEMS.map((item) => (
      <NavItem
        key={item.section}
        item={item}
        isActive={activeSection === item.section}
        onNavigate={onNavigate}
      />
    ))}
  </div>
</div>
```

- [ ] **Step 2: Update Dashboard.tsx**

In `app/components/Dashboard.tsx`:

1. Change `DashboardView` type (find the line with the type declaration):
```typescript
type DashboardView = "search" | "loading" | "results" | "profile" | "shortlist" | "outreach" | "history" | "analyse" | "pipeline" | "team";
```

2. Update `viewToSection` function — add:
```typescript
if (view === "team") return "team";
```

3. Add import at the top:
```typescript
import TeamView from "./TeamView";
```

4. In the render JSX, after the `pipeline` view block, add:
```typescript
{view === "team" && (
  <TeamView companyName={userProfile?.company ?? ""} />
)}
```

- [ ] **Step 3: Verify it builds**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Visual check**

```bash
npm run dev
```

- Sidebar shows "Équipe" section with Team icon
- Clicking it shows TeamView: 4 members, generate token button
- Generating a token shows the invite link with copy button
- Copying shows "Copié" feedback

- [ ] **Step 5: Commit**

```bash
git add app/components/Sidebar.tsx app/components/Dashboard.tsx
git commit -m "feat: add Team section to sidebar and dashboard"
```

---

## Self-review

**Spec coverage:**
- ✓ SWOT HrFlow on each profile → Task 3 + 4 + 5
- ✓ Right panel: 2 tabs (SWOT active by default, Chat IA) → Task 5
- ✓ Right panel fixed to 420px → Task 5
- ✓ Pipeline: 5 columns, sourced removed → Task 6
- ✓ Pipeline: drag & drop → Task 6
- ✓ Pipeline: delete with undo → Task 6
- ✓ Pipeline: stage persists in Supabase → Task 1 + 2 + 6
- ✓ Team view with token generation → Task 7 + 8
- ✓ Sidebar team section → Task 8

**Placeholder scan:** No TBDs, all code is complete.

**Type consistency:**
- `StageId` defined in Task 6, used consistently throughout PipelineView
- `SWOTData` defined and used only in `HrFlowSWOT.tsx`
- `ShortlistEntry.pipeline_stage` added in Task 6 Step 2, consumed in Task 6 Step 1
- `NavSection` extended in Task 8 Step 1, consumed in Dashboard Step 2
