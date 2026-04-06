# Account Header + Outreach Generation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent header with "Mon compte" dropdown (recherches récentes, shortlist, outreach) backed by Supabase, plus AI-generated personalized outreach messages via Claude API.

**Architecture:** Supabase stores all account data keyed by a `session_id` UUID generated client-side and persisted in localStorage — no auth required. A persistent `Header` component wraps all 4 dashboard views. Outreach messages are generated server-side by streaming the Anthropic API and saved to Supabase.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, `@supabase/supabase-js`, Anthropic API (fetch, no SDK needed), TypeScript

---

## File Map

**Create:**
- `app/lib/supabase.ts` — Supabase browser client
- `app/lib/session.ts` — session_id generation/read from localStorage
- `app/components/Header.tsx` — fixed header bar with logo + account button
- `app/components/AccountDropdown.tsx` — dropdown with 3 sections
- `app/components/OutreachModal.tsx` — streaming outreach message modal
- `app/api/account/searches/route.ts` — GET / POST saved searches
- `app/api/account/shortlist/route.ts` — GET / POST / DELETE shortlist
- `app/api/account/outreach/route.ts` — GET outreach history
- `app/api/outreach/generate/route.ts` — POST generate + save message (streaming)

**Modify:**
- `app/lib/types.ts` — add SavedSearch, ShortlistEntry, OutreachEntry types
- `app/components/SearchView.tsx` — remove 🦞, add top padding, use SVG logo
- `app/components/CandidateCard.tsx` — add save/star button
- `app/components/ProfileDetailView.tsx` — add Sauvegarder + Contacter buttons, accept new props
- `app/components/Dashboard.tsx` — wrap all views with Header, wire save/outreach handlers

---

## Task 1: Install dependencies + Supabase project setup

**Files:** `package.json`, `.env.local`

- [ ] **Step 1: Install Supabase client**

```bash
cd /Users/emilejouannet/Developer/hackathons/hrflow/hrflow_hackathon_2026
npm install @supabase/supabase-js
```

- [ ] **Step 2: Create Supabase project via MCP**

Use `mcp__supabase__list_organizations` to get your org ID, then `mcp__supabase__create_project` with:
- `name`: `claw4hr`
- `region`: `eu-west-3` (Paris)
- `db_pass`: generate a strong password (save it somewhere)

Save the returned `project_ref` (e.g. `abcdefghijkl`).

- [ ] **Step 3: Apply database migration via MCP**

Use `mcp__supabase__apply_migration` with `project_id` = your project_ref and this SQL:

```sql
create table searches (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  query text not null,
  profile_count int default 0,
  created_at timestamptz default now()
);

create table shortlist (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  profile_key text not null,
  profile_data jsonb not null,
  saved_at timestamptz default now(),
  unique(session_id, profile_key)
);

create table outreach (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  profile_key text not null,
  profile_name text not null,
  message text not null,
  created_at timestamptz default now()
);

-- Allow public read/write (no auth for hackathon)
alter table searches enable row level security;
alter table shortlist enable row level security;
alter table outreach enable row level security;

create policy "public_all" on searches for all using (true) with check (true);
create policy "public_all" on shortlist for all using (true) with check (true);
create policy "public_all" on outreach for all using (true) with check (true);
```

- [ ] **Step 4: Get project URL + anon key via MCP**

Use `mcp__supabase__get_project_url` and `mcp__supabase__get_publishable_keys` with your project_ref.

- [ ] **Step 5: Add env vars to .env.local**

Append to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://<project_ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
ANTHROPIC_API_KEY=<your_anthropic_api_key>
```

For `ANTHROPIC_API_KEY`: use your existing key from Anthropic console (or ask the user to provide it).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install @supabase/supabase-js"
```

---

## Task 2: Types + session utility + Supabase client

**Files:**
- Modify: `app/lib/types.ts`
- Create: `app/lib/session.ts`
- Create: `app/lib/supabase.ts`

- [ ] **Step 1: Add account types to `app/lib/types.ts`**

Append at the end of the file:

```typescript
// ─── Account / Supabase types ───────────────────────────────────

export interface SavedSearch {
  id: string;
  session_id: string;
  query: string;
  profile_count: number;
  created_at: string;
}

export interface ShortlistEntry {
  id: string;
  session_id: string;
  profile_key: string;
  profile_data: SourcedProfile;
  saved_at: string;
}

export interface OutreachEntry {
  id: string;
  session_id: string;
  profile_key: string;
  profile_name: string;
  message: string;
  created_at: string;
}
```

- [ ] **Step 2: Create `app/lib/session.ts`**

```typescript
const SESSION_KEY = "claw4hr_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
```

- [ ] **Step 3: Create `app/lib/supabase.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);
```

- [ ] **Step 4: Verify build compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors on these new files.

- [ ] **Step 5: Commit**

```bash
git add app/lib/types.ts app/lib/session.ts app/lib/supabase.ts
git commit -m "feat: supabase client, session utility, account types"
```

---

## Task 3: Account API routes

**Files:**
- Create: `app/api/account/searches/route.ts`
- Create: `app/api/account/shortlist/route.ts`
- Create: `app/api/account/outreach/route.ts`

- [ ] **Step 1: Create `app/api/account/searches/route.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ data: [] });

  const { data, error } = await db()
    .from("searches")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { session_id, query, profile_count } = body;
  if (!session_id || !query) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const { data, error } = await db()
    .from("searches")
    .insert({ session_id, query, profile_count: profile_count ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

- [ ] **Step 2: Create `app/api/account/shortlist/route.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ data: [] });

  const { data, error } = await db()
    .from("shortlist")
    .select("*")
    .eq("session_id", sessionId)
    .order("saved_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { session_id, profile_key, profile_data } = body;
  if (!session_id || !profile_key || !profile_data) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const { data, error } = await db()
    .from("shortlist")
    .upsert({ session_id, profile_key, profile_data }, { onConflict: "session_id,profile_key" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { session_id, profile_key } = body;
  if (!session_id || !profile_key) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const { error } = await db()
    .from("shortlist")
    .delete()
    .eq("session_id", session_id)
    .eq("profile_key", profile_key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Create `app/api/account/outreach/route.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ data: [] });

  const { data, error } = await db()
    .from("outreach")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 5: Commit**

```bash
git add app/api/account/
git commit -m "feat: account API routes (searches, shortlist, outreach)"
```

---

## Task 4: Outreach generation API route

**Files:**
- Create: `app/api/outreach/generate/route.ts`

- [ ] **Step 1: Create `app/api/outreach/generate/route.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import type { SourcedProfile } from "@/app/lib/types";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function buildPrompt(profile: SourcedProfile): string {
  const experience = profile.experiences[0]
    ? `${profile.experiences[0].title} chez ${profile.experiences[0].company}`
    : profile.title;

  const github = profile.sources.find((s) => s.type === "github");
  const sourceDetail = github
    ? `présent sur GitHub (${github.label})`
    : `profil sourcé sur ${profile.sources[0]?.label ?? "le web"}`;

  return `Tu es un recruteur expert. Génère un message d'approche personnalisé en français (5-7 lignes maximum) pour ce candidat passif.

Profil :
- Nom : ${profile.name}
- Titre : ${profile.title}
- Localisation : ${profile.location}
- Expérience : ${profile.experience_years} ans
- Dernière expérience : ${experience}
- Compétences clés : ${profile.skills.slice(0, 5).join(", ")}
- Source : ${sourceDetail}
- Résumé : ${profile.summary}

Règles STRICTES :
1. Cite 1-2 détails CONCRETS et SPÉCIFIQUES du profil (projet, ancienne boîte, technologie rare)
2. Ton professionnel mais humain — pas de bullshit corporate
3. Commence par "Bonjour ${profile.name.split(" ")[0]},"
4. Termine par UNE question ouverte simple (disponibilité, intérêt)
5. Maximum 7 lignes, pas de signature`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { profile, session_id } = body as { profile: SourcedProfile; session_id: string };

  if (!profile || !session_id) {
    return new Response("missing profile or session_id", { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("ANTHROPIC_API_KEY not configured", { status: 500 });
  }

  // Call Anthropic API with streaming
  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      stream: true,
      messages: [{ role: "user", content: buildPrompt(profile) }],
    }),
  });

  if (!anthropicRes.ok) {
    const err = await anthropicRes.text();
    return new Response(`Anthropic error: ${err}`, { status: 500 });
  }

  // Collect full message while streaming to client
  let fullMessage = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = anthropicRes.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const json = line.slice(6);
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              const text = parsed.delta.text;
              fullMessage += text;
              controller.enqueue(new TextEncoder().encode(text));
            }
          } catch {}
        }
      }

      // Save to Supabase after stream completes
      if (fullMessage) {
        await db().from("outreach").insert({
          session_id,
          profile_key: profile.key,
          profile_name: profile.name,
          message: fullMessage,
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add app/api/outreach/generate/route.ts
git commit -m "feat: outreach generation API route (Claude streaming + Supabase save)"
```

---

## Task 5: Header + AccountDropdown components

**Files:**
- Create: `app/components/Header.tsx`
- Create: `app/components/AccountDropdown.tsx`

- [ ] **Step 1: Create `app/components/AccountDropdown.tsx`**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import type { SavedSearch, ShortlistEntry, OutreachEntry, SourcedProfile } from "@/app/lib/types";

interface AccountDropdownProps {
  sessionId: string;
  shortlistKeys: Set<string>;
  onRelaunchSearch: (query: string) => void;
  onOpenProfile: (profile: SourcedProfile) => void;
  onClose: () => void;
}

export default function AccountDropdown({
  sessionId,
  shortlistKeys,
  onRelaunchSearch,
  onOpenProfile,
  onClose,
}: AccountDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);
  const [outreach, setOutreach] = useState<OutreachEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, sl, o] = await Promise.all([
        fetch(`/api/account/searches?session_id=${sessionId}`).then((r) => r.json()),
        fetch(`/api/account/shortlist?session_id=${sessionId}`).then((r) => r.json()),
        fetch(`/api/account/outreach?session_id=${sessionId}`).then((r) => r.json()),
      ]);
      setSearches(s.data ?? []);
      setShortlist(sl.data ?? []);
      setOutreach(o.data ?? []);
      setLoading(false);
    }
    load();
  }, [sessionId]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-xl overflow-hidden z-50"
      style={{
        background: "#fff",
        border: "2px solid var(--ink)",
        boxShadow: "6px 6px 0 0 var(--ink)",
      }}
    >
      {loading ? (
        <div className="p-4 text-center text-sm font-mono" style={{ color: "var(--muted-text)" }}>
          Chargement...
        </div>
      ) : (
        <>
          {/* Searches */}
          <Section
            icon="🔍"
            title="Recherches récentes"
            empty={searches.length === 0}
            emptyText="Aucune recherche"
          >
            {searches.slice(0, 5).map((s) => (
              <button
                key={s.id}
                onClick={() => { onRelaunchSearch(s.query); onClose(); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--cream)] transition-colors flex items-center justify-between gap-2"
              >
                <span className="truncate font-mono" style={{ color: "var(--ink)" }}>{s.query}</span>
                <span className="text-xs flex-shrink-0" style={{ color: "var(--muted-text)" }}>
                  {s.profile_count > 0 ? `${s.profile_count} profils` : ""}
                </span>
              </button>
            ))}
          </Section>

          <Divider />

          {/* Shortlist */}
          <Section
            icon="★"
            title={`Ma Shortlist${shortlist.length > 0 ? ` (${shortlist.length})` : ""}`}
            empty={shortlist.length === 0}
            emptyText="Aucun profil sauvegardé"
          >
            {shortlist.slice(0, 5).map((entry) => (
              <button
                key={entry.id}
                onClick={() => { onOpenProfile(entry.profile_data); onClose(); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-[var(--cream)] transition-colors flex items-center gap-3"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ backgroundColor: entry.profile_data.avatar_color }}
                >
                  {entry.profile_data.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate text-xs" style={{ color: "var(--ink)" }}>
                    {entry.profile_data.name}
                  </p>
                  <p className="truncate text-[11px]" style={{ color: "var(--muted-text)" }}>
                    {entry.profile_data.title}
                  </p>
                </div>
              </button>
            ))}
          </Section>

          <Divider />

          {/* Outreach */}
          <Section
            icon="✉"
            title={`Outreach${outreach.length > 0 ? ` (${outreach.length})` : ""}`}
            empty={outreach.length === 0}
            emptyText="Aucun message envoyé"
          >
            {outreach.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="px-4 py-2 text-sm"
              >
                <p className="font-bold text-xs truncate" style={{ color: "var(--ink)" }}>
                  Message → {o.profile_name}
                </p>
                <p className="text-[11px] line-clamp-2 mt-0.5" style={{ color: "var(--muted-text)" }}>
                  {o.message.slice(0, 80)}…
                </p>
              </div>
            ))}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  empty,
  emptyText,
  children,
}: {
  icon: string;
  title: string;
  empty: boolean;
  emptyText: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="px-4 py-2 flex items-center gap-2"
        style={{ background: "var(--cream)", borderBottom: "1px solid #e5e7eb" }}
      >
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: "var(--ink)" }}>
          {title}
        </span>
      </div>
      {empty ? (
        <p className="px-4 py-3 text-xs font-mono" style={{ color: "var(--muted-text)" }}>{emptyText}</p>
      ) : children}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid #e5e7eb" }} />;
}
```

- [ ] **Step 2: Create `app/components/Header.tsx`**

```typescript
"use client";

import { useState } from "react";
import type { SourcedProfile } from "@/app/lib/types";
import AccountDropdown from "./AccountDropdown";

// Stylized claw SVG icon
function ClawIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M8 3C6 3 4.5 4.5 4.5 7v6c0 1.5.8 2.5 2 2.5"
        stroke="var(--coral)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 15.5C7.5 18.5 9.5 20.5 12 20.5s4.5-2 5.5-5"
        stroke="var(--coral)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M16 3C18 3 19.5 4.5 19.5 7v6c0 1.5-.8 2.5-2 2.5"
        stroke="var(--coral)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M12 6v5"
        stroke="var(--coral)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface HeaderProps {
  sessionId: string;
  shortlistKeys: Set<string>;
  onRelaunchSearch: (query: string) => void;
  onOpenProfile: (profile: SourcedProfile) => void;
  shortlistCount: number;
  outreachCount: number;
}

export default function Header({
  sessionId,
  shortlistKeys,
  onRelaunchSearch,
  onOpenProfile,
  shortlistCount,
  outreachCount,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const badgeCount = shortlistCount + outreachCount;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6"
      style={{
        height: 56,
        background: "var(--cream)",
        borderBottom: "2px solid var(--ink)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <ClawIcon size={22} />
        <span
          className="text-lg font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display, Georgia, serif)", color: "var(--ink)" }}
        >
          Claw<span style={{ color: "var(--coral)" }}>4HR</span>
        </span>
      </div>

      {/* Account button */}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-bold transition-all hover:bg-[var(--cream-mid)]"
          style={{ border: "1.5px solid var(--ink)", color: "var(--ink)" }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: "var(--ink)" }}
          >
            {sessionId.slice(0, 2).toUpperCase()}
          </div>
          <span>Mon compte</span>
          {badgeCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: "var(--coral)", color: "#fff" }}
            >
              {badgeCount}
            </span>
          )}
        </button>

        {open && (
          <AccountDropdown
            sessionId={sessionId}
            shortlistKeys={shortlistKeys}
            onRelaunchSearch={onRelaunchSearch}
            onOpenProfile={onOpenProfile}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add app/components/Header.tsx app/components/AccountDropdown.tsx
git commit -m "feat: Header and AccountDropdown components"
```

---

## Task 6: OutreachModal component

**Files:**
- Create: `app/components/OutreachModal.tsx`

- [ ] **Step 1: Create `app/components/OutreachModal.tsx`**

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import type { SourcedProfile } from "@/app/lib/types";

interface OutreachModalProps {
  profile: SourcedProfile;
  sessionId: string;
  onClose: () => void;
}

export default function OutreachModal({ profile, sessionId, onClose }: OutreachModalProps) {
  const [message, setMessage] = useState("");
  const [streaming, setStreaming] = useState(true);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function generate() {
      try {
        const res = await fetch("/api/outreach/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, session_id: sessionId }),
        });

        if (!res.ok || !res.body) {
          setMessage("Erreur lors de la génération. Veuillez réessayer.");
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setMessage(accumulated);
        }
      } catch {
        setMessage("Erreur de connexion. Veuillez réessayer.");
      } finally {
        setStreaming(false);
      }
    }

    generate();
  }, [profile, sessionId]);

  function handleCopy() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,14,26,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "#fff",
          border: "2px solid var(--ink)",
          boxShadow: "8px 8px 0 0 var(--ink)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "2px solid var(--ink)", background: "var(--cream)" }}
        >
          <div>
            <h2 className="font-bold text-base" style={{ color: "var(--ink)" }}>
              ✉ Message d&apos;approche
            </h2>
            <p className="text-xs font-mono mt-0.5" style={{ color: "var(--muted-text)" }}>
              Pour {profile.name} · {profile.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
            style={{ color: "var(--ink)" }}
          >
            ×
          </button>
        </div>

        {/* Message */}
        <div className="p-6">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="w-full text-sm leading-relaxed outline-none resize-none p-3 rounded-lg"
            style={{
              background: "var(--cream)",
              border: "1.5px solid #e5e7eb",
              color: "var(--ink)",
              fontFamily: "Georgia, serif",
            }}
            placeholder={streaming ? "Génération en cours..." : ""}
          />
          {streaming && (
            <p className="text-xs font-mono mt-1" style={{ color: "var(--coral)" }}>
              ● Génération en cours...
            </p>
          )}
        </div>

        {/* Actions */}
        <div
          className="px-6 pb-5 flex gap-3"
        >
          <button
            onClick={handleCopy}
            disabled={streaming || !message}
            className="flex-1 py-2.5 font-mono font-bold text-sm uppercase tracking-wider rounded-lg transition-all disabled:opacity-40"
            style={{
              background: copied ? "var(--success)" : "var(--coral)",
              color: "#fff",
              boxShadow: copied ? "3px 3px 0 0 #059669" : "3px 3px 0 0 var(--coral-deep)",
            }}
          >
            {copied ? "✓ Copié !" : "Copier"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 font-mono font-bold text-sm rounded-lg transition-all"
            style={{
              border: "1.5px solid var(--ink)",
              color: "var(--ink)",
              background: "transparent",
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/OutreachModal.tsx
git commit -m "feat: OutreachModal with streaming generation + copy"
```

---

## Task 7: Update SearchView (remove 🦞, add header padding)

**Files:**
- Modify: `app/components/SearchView.tsx`

- [ ] **Step 1: Replace 🦞 emoji with SVG claw icon in `app/components/SearchView.tsx`**

Replace the logo section (lines 41–54):

```typescript
      {/* Logo */}
      <div className="mb-12 text-center animate-card-reveal">
        <div className="inline-flex items-center gap-3 mb-4">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 3C6 3 4.5 4.5 4.5 7v6c0 1.5.8 2.5 2 2.5"
              stroke="var(--coral)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M6.5 15.5C7.5 18.5 9.5 20.5 12 20.5s4.5-2 5.5-5"
              stroke="var(--coral)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M16 3C18 3 19.5 4.5 19.5 7v6c0 1.5-.8 2.5-2 2.5"
              stroke="var(--coral)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M12 6v5"
              stroke="var(--coral)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
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
```

- [ ] **Step 2: Add top padding to account for fixed header**

Change the outer `div` className from:
```typescript
className="min-h-screen flex flex-col items-center justify-center px-4"
```
to:
```typescript
className="min-h-screen flex flex-col items-center justify-center px-4 pt-14"
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add app/components/SearchView.tsx
git commit -m "feat: replace crab emoji with SVG claw icon, add header padding"
```

---

## Task 8: Update CandidateCard — save/star button

**Files:**
- Modify: `app/components/CandidateCard.tsx`

- [ ] **Step 1: Add `isSaved` + `onSave` props and star button**

Replace the full file content:

```typescript
"use client";

import type { SourcedProfile, SourceType } from "@/app/lib/types";
import ScoreRing from "./ScoreRing";

interface CandidateCardProps {
  profile: SourcedProfile;
  index: number;
  isSaved: boolean;
  onSelect: (profile: SourcedProfile) => void;
  onSave: (profile: SourcedProfile) => void;
}

const SOURCE_COLORS: Record<SourceType, string> = {
  github: "#1a1a2e",
  linkedin: "#0077b5",
  reddit: "#ff4500",
  internet: "#6b7280",
  indeed: "#2164f3",
  hellowork: "#e05c2a",
};

const SOURCE_ICONS: Record<SourceType, string> = {
  github: "⬛",
  linkedin: "🔵",
  reddit: "🟠",
  internet: "🌐",
  indeed: "🟦",
  hellowork: "🟧",
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

export default function CandidateCard({ profile, index, isSaved, onSelect, onSave }: CandidateCardProps) {
  const MAX_SKILLS = 4;
  const extra = profile.skills.length - MAX_SKILLS;

  return (
    <div
      className="animate-card-reveal cursor-pointer group"
      style={{ animationDelay: `${index * 80}ms` }}
      onClick={() => onSelect(profile)}
    >
      <div
        className="flex flex-col gap-4 p-5 rounded-lg transition-all duration-200"
        style={{
          background: "#FFFFFF",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(26,26,46,0.08)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = "0 4px 12px rgba(26,26,46,0.12)";
          el.style.borderColor = "var(--coral)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.boxShadow = "0 1px 3px rgba(26,26,46,0.08)";
          el.style.borderColor = "#e5e7eb";
        }}
      >
        {/* Top row: avatar + info + score ring + save */}
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
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onSave(profile); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110"
              style={{
                background: isSaved ? "#fff8e7" : "#f3f4f6",
                border: `1.5px solid ${isSaved ? "#f59e0b" : "#e5e7eb"}`,
              }}
              title={isSaved ? "Retirer de la shortlist" : "Ajouter à la shortlist"}
            >
              <span style={{ fontSize: 14, color: isSaved ? "#f59e0b" : "#9ca3af" }}>
                {isSaved ? "★" : "☆"}
              </span>
            </button>
            <ScoreRing score={profile.hrflow_score} size={52} />
          </div>
        </div>

        {/* Source badges */}
        <div className="flex gap-2 flex-wrap">
          {profile.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all hover:bg-gray-100"
              style={{
                background: "#f3f4f6",
                color: "#4b5563",
                border: "1px solid #e5e7eb",
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
              className="px-2.5 py-1 rounded text-[11px] font-mono"
              style={{ background: "#f0f0f0", color: "#4b5563" }}
            >
              {skill}
            </span>
          ))}
          {extra > 0 && (
            <span
              className="px-2.5 py-1 rounded text-[11px] font-mono"
              style={{ background: "#f0f0f0", color: "var(--coral)" }}
            >
              +{extra}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          className="w-full py-2 font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:bg-opacity-90"
          style={{
            background: "var(--coral)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
          }}
        >
          Voir le profil →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/CandidateCard.tsx
git commit -m "feat: add save/star button to CandidateCard"
```

---

## Task 9: Update ProfileDetailView — Sauvegarder + Contacter buttons

**Files:**
- Modify: `app/components/ProfileDetailView.tsx`

- [ ] **Step 1: Add `isSaved`, `onSave`, `onContact` props**

Replace the `ProfileDetailViewProps` interface and function signature:

```typescript
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
```

- [ ] **Step 2: Replace the navigation buttons section (lines 41–53)**

```typescript
      {/* Navigation buttons */}
      <div className="px-6 pt-5 pb-3 flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-sm font-bold px-4 py-2 rounded-md transition-all"
          style={{
            color: "var(--ink)",
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
          }}
        >
          ← Retour
        </button>
        <button
          onClick={() => onSave(profile)}
          className="flex items-center gap-2 font-mono text-sm font-bold px-4 py-2 rounded-md transition-all"
          style={{
            color: isSaved ? "#f59e0b" : "var(--ink)",
            background: isSaved ? "#fff8e7" : "#f3f4f6",
            border: `1px solid ${isSaved ? "#f59e0b" : "#e5e7eb"}`,
          }}
        >
          {isSaved ? "★ Sauvegardé" : "☆ Sauvegarder"}
        </button>
        <button
          onClick={() => onContact(profile)}
          className="flex items-center gap-2 font-mono text-sm font-bold px-4 py-2 rounded-md transition-all"
          style={{
            color: "#fff",
            background: "var(--coral)",
            border: "1px solid var(--coral-deep)",
            boxShadow: "2px 2px 0 0 var(--coral-deep)",
          }}
        >
          ✉ Contacter
        </button>
      </div>
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
git add app/components/ProfileDetailView.tsx
git commit -m "feat: add Sauvegarder + Contacter buttons to ProfileDetailView"
```

---

## Task 10: Wire everything in Dashboard

**Files:**
- Modify: `app/components/Dashboard.tsx`

- [ ] **Step 1: Replace full Dashboard.tsx**

```typescript
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SourcedProfile, ChatMessage } from "@/app/lib/types";
import type { AgentSource, AgentState } from "./PixelAgent";
import SearchView from "./SearchView";
import LoadingView from "./LoadingView";
import ResultsView from "./ResultsView";
import ProfileDetailView from "./ProfileDetailView";
import Header from "./Header";
import OutreachModal from "./OutreachModal";
import { streamDemoProfiles } from "@/app/lib/demoProfiles";
import { getSessionId } from "@/app/lib/session";

type DashboardState = "search" | "loading" | "results" | "profile";

function chatMsg(type: "user" | "agent", text: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    type,
    text,
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function Dashboard() {
  const [view, setView] = useState<DashboardState>("search");
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<SourcedProfile[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentSource, AgentState>>({
    github: "idle", linkedin: "idle", reddit: "idle", internet: "idle",
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SourcedProfile | null>(null);
  const [qaMessages, setQaMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);

  // Account state
  const [sessionId] = useState<string>(() => {
    if (typeof window !== "undefined") return getSessionId();
    return "ssr";
  });
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());
  const [shortlistCount, setShortlistCount] = useState(0);
  const [outreachCount, setOutreachCount] = useState(0);
  const [outreachTarget, setOutreachTarget] = useState<SourcedProfile | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const demoCleanupRef = useRef<(() => void) | null>(null);
  const retriesRef = useRef(0);
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchIdRef = useRef(0);

  // ─── Load initial shortlist keys ──────────────────────────────

  useEffect(() => {
    if (!sessionId || sessionId === "ssr") return;
    fetch(`/api/account/shortlist?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        const keys = new Set<string>((data.data ?? []).map((e: { profile_key: string }) => e.profile_key));
        setSavedKeys(keys);
        setShortlistCount(keys.size);
      })
      .catch(() => {});

    fetch(`/api/account/outreach?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setOutreachCount((data.data ?? []).length))
      .catch(() => {});
  }, [sessionId]);

  // ─── SSE connection ────────────────────────────────────────────

  const connectSSE = useCallback((cursor = 0) => {
    if (esRef.current) esRef.current.close();
    const thisSearch = searchIdRef.current;
    const es = new EventSource(`/api/openclaw/stream?cursor=${cursor}`);
    esRef.current = es;

    es.onmessage = (e) => {
      if (searchIdRef.current !== thisSearch) return;
      try {
        const event = JSON.parse(e.data);
        if (event.channel === "profile" && event.payload?.profile) {
          const p = event.payload.profile as SourcedProfile;
          setProfiles((prev) => {
            if (prev.some((x) => x.key === p.key)) return prev;
            return [...prev, p];
          });
          setView((v) => (v === "loading" ? "results" : v));
        }
        if (event.channel === "feed" && event.payload?.source) {
          const source = event.payload.source as AgentSource;
          const status = event.payload.status as "running" | "done" | "error";
          setAgentStatuses((prev) => ({ ...prev, [source]: status }));
        }
      } catch {}
    };

    es.onerror = () => {
      es.close();
      if (searchIdRef.current !== thisSearch) return;
      if (retriesRef.current < 3) {
        retriesRef.current++;
        setTimeout(() => {
          if (searchIdRef.current === thisSearch) connectSSE(cursor);
        }, 2000);
      } else {
        setView("search");
        setIsStreaming(false);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      esRef.current?.close();
      demoCleanupRef.current?.();
      if (streamTimerRef.current) clearTimeout(streamTimerRef.current);
    };
  }, []);

  // ─── Search handler ────────────────────────────────────────────

  const handleSearch = useCallback(async (q: string) => {
    const thisSearch = ++searchIdRef.current;
    retriesRef.current = 0;
    if (streamTimerRef.current) clearTimeout(streamTimerRef.current);

    setQuery(q);
    setProfiles([]);
    setAgentStatuses({ github: "idle", linkedin: "idle", reddit: "idle", internet: "idle" });
    setView("loading");
    setIsStreaming(true);

    connectSSE(0);
    setAgentStatuses({ github: "running", linkedin: "running", reddit: "running", internet: "running" });

    // Log search to Supabase
    if (sessionId && sessionId !== "ssr") {
      fetch("/api/account/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, query: q }),
      }).catch(() => {});
    }

    const res = await fetch("/api/openclaw/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q }),
    });

    if (searchIdRef.current !== thisSearch) return;

    if (!res.ok) {
      (["github", "linkedin", "reddit", "internet"] as AgentSource[]).forEach((src, i) => {
        setTimeout(() => {
          if (searchIdRef.current !== thisSearch) return;
          setAgentStatuses((prev) => ({ ...prev, [src]: "done" }));
        }, 2000 + i * 1500);
      });

      demoCleanupRef.current?.();
      demoCleanupRef.current = streamDemoProfiles((p) => {
        if (searchIdRef.current !== thisSearch) return;
        setProfiles((prev) => {
          if (prev.some((x) => x.key === p.key)) return prev;
          return [...prev, p];
        });
        setView("results");
      }, 1400);
    }

    streamTimerRef.current = setTimeout(() => setIsStreaming(false), 30_000);
  }, [connectSSE, sessionId]);

  // ─── Profile Q&A ───────────────────────────────────────────────

  const handleSelectProfile = useCallback((profile: SourcedProfile) => {
    setSelectedProfile(profile);
    setQaMessages([]);
    setView("profile");

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
    if (streamTimerRef.current) clearTimeout(streamTimerRef.current);
    setView("search");
    setProfiles([]);
    setQuery("");
    setIsStreaming(false);
    setSelectedProfile(null);
    setQaMessages([]);
  }, []);

  // ─── Save / Shortlist ──────────────────────────────────────────

  const handleSave = useCallback((profile: SourcedProfile) => {
    const isCurrentlySaved = savedKeys.has(profile.key);

    // Optimistic update
    setSavedKeys((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) {
        next.delete(profile.key);
        setShortlistCount((c) => Math.max(0, c - 1));
      } else {
        next.add(profile.key);
        setShortlistCount((c) => c + 1);
      }
      return next;
    });

    if (isCurrentlySaved) {
      fetch("/api/account/shortlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, profile_key: profile.key }),
      }).catch(() => {});
    } else {
      fetch("/api/account/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, profile_key: profile.key, profile_data: profile }),
      }).catch(() => {});
    }
  }, [savedKeys, sessionId]);

  // ─── Outreach ──────────────────────────────────────────────────

  const handleContact = useCallback((profile: SourcedProfile) => {
    setOutreachTarget(profile);
  }, []);

  const handleOutreachClose = useCallback(() => {
    setOutreachTarget(null);
    // Refresh outreach count
    fetch(`/api/account/outreach?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setOutreachCount((data.data ?? []).length))
      .catch(() => {});
  }, [sessionId]);

  // ─── Render ────────────────────────────────────────────────────

  const header = (
    <Header
      sessionId={sessionId}
      shortlistKeys={savedKeys}
      onRelaunchSearch={handleSearch}
      onOpenProfile={handleSelectProfile}
      shortlistCount={shortlistCount}
      outreachCount={outreachCount}
    />
  );

  return (
    <>
      {header}
      <div style={{ paddingTop: 56 }}>
        {view === "search" && <SearchView onSearch={handleSearch} />}

        {view === "loading" && (
          <LoadingView query={query} profileCount={profiles.length} agentStatuses={agentStatuses} />
        )}

        {view === "results" && (
          <ResultsView
            profiles={profiles}
            query={query}
            isStreaming={isStreaming}
            agentStatuses={agentStatuses}
            onSelect={handleSelectProfile}
            onNewSearch={handleNewSearch}
            savedKeys={savedKeys}
            onSave={handleSave}
          />
        )}

        {view === "profile" && selectedProfile && (
          <ProfileDetailView
            profile={selectedProfile}
            messages={qaMessages}
            asking={asking}
            isSaved={savedKeys.has(selectedProfile.key)}
            onBack={handleBack}
            onSend={handleAsk}
            onSave={handleSave}
            onContact={handleContact}
          />
        )}
      </div>

      {outreachTarget && (
        <OutreachModal
          profile={outreachTarget}
          sessionId={sessionId}
          onClose={handleOutreachClose}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Update ResultsView to accept savedKeys + onSave props**

Open `app/components/ResultsView.tsx` and add `savedKeys` + `onSave` to the props interface, then pass them down to each `CandidateCard`. Find the props interface and add:

```typescript
savedKeys: Set<string>;
onSave: (profile: SourcedProfile) => void;
```

Then find every `<CandidateCard` usage and add:
```typescript
isSaved={savedKeys.has(profile.key)}
onSave={onSave}
```

- [ ] **Step 3: Verify full build**

```bash
npm run build 2>&1 | tail -30
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add app/components/Dashboard.tsx app/components/ResultsView.tsx
git commit -m "feat: wire Header, shortlist, outreach into Dashboard"
```

---

## Task 11: Smoke test

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Manual checklist**

Open http://localhost:3000 and verify:

1. Header visible with logo (SVG claw) + "Mon compte" button — no 🦞
2. SearchView has top padding (not overlapping header)
3. Type a query → Loading → Results appear
4. Star icon on CandidateCard toggles ☆/★, count badge updates in header
5. Click "Voir le profil" → ProfileDetailView shows "☆ Sauvegarder" + "✉ Contacter" buttons
6. Click "✉ Contacter" → OutreachModal opens, message streams in, "Copier" works
7. Open "Mon compte" → dropdown shows the saved search + shortlisted profile + outreach entry
8. Click a recent search → relaunches the search
9. Click a shortlisted profile → opens ProfileDetailView

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: account header + shortlist + outreach generation — hackathon demo complete"
```
