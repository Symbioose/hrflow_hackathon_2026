"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { DitheringShader } from "@/components/ui/dithering-shader"

/* ═══════════════════════════════════════════════════
   DESIGN SYSTEM

   Aesthetic: "Pixel Editorial"
   - Coral (#FF6B6B) floods entire sections — dominant, not accent
   - Cream (#FFF5F0) alternates with coral
   - Instrument Serif for display, Geist Mono for UI
   - All corners sharp (0 border-radius)
   - Hard pixel drop-shadows, no soft/blur shadows
   - Grain texture overlay
   - DitheringShader visible as texture, not hidden
   ═══════════════════════════════════════════════════ */

const CORAL = "#FF6B6B"
const CORAL_DARK = "#E85555"
const CORAL_DEEP = "#CC4444"
const CREAM = "#FFF5F0"
const CREAM_MID = "#F5EDE6"
const INK = "#1a1a2e"
const MUTED = "#6b7280"

const serif = "var(--font-display), 'Georgia', serif"

/* ═══════════════════════════════════════════
   Pixel Button
   ═══════════════════════════════════════════ */

function PixelBtn({
  href,
  children,
  variant = "coral",
  className = "",
}: {
  href: string
  children: ReactNode
  variant?: "coral" | "dark" | "white"
  className?: string
}) {
  const styles = {
    coral: `bg-[${CORAL}] text-white shadow-[5px_5px_0_0_${CORAL_DEEP}] hover:shadow-[2px_2px_0_0_${CORAL_DEEP}] hover:translate-x-[3px] hover:translate-y-[3px]`,
    dark: `bg-[${INK}] text-[${CREAM}] shadow-[5px_5px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-[3px] hover:translate-y-[3px]`,
    white: `bg-white text-[${INK}] shadow-[5px_5px_0_0_rgba(0,0,0,0.15)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.15)] hover:translate-x-[3px] hover:translate-y-[3px]`,
  }

  return (
    <a
      href={href}
      className={`inline-block font-mono font-bold uppercase tracking-wider text-sm px-8 py-4 transition-all duration-100 select-none cursor-pointer active:shadow-none active:translate-x-[5px] active:translate-y-[5px] ${className}`}
      style={{
        backgroundColor:
          variant === "coral" ? CORAL : variant === "dark" ? INK : "white",
        color: variant === "white" ? INK : CREAM,
        boxShadow: `5px 5px 0 0 ${
          variant === "coral"
            ? CORAL_DEEP
            : variant === "dark"
            ? "#000"
            : "rgba(0,0,0,0.12)"
        }`,
      }}
    >
      {children}
    </a>
  )
}

/* ═══════════════════════════════════════════
   Scroll Reveal
   ═══════════════════════════════════════════ */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let t: ReturnType<typeof setTimeout>
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (delay) t = setTimeout(() => setVis(true), delay)
          else setVis(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      clearTimeout(t)
    }
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════
   Grain Overlay
   ═══════════════════════════════════════════ */

function Grain() {
  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{
        opacity: 0.04,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  )
}

/* ═══════════════════════════════════════════
   Navigation
   ═══════════════════════════════════════════ */

function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", h, { passive: true })
    return () => window.removeEventListener("scroll", h)
  }, [])

  return (
    <nav className="fixed top-0 inset-x-0 z-50">
      <div
        className="mx-auto max-w-7xl flex items-center justify-between px-8 py-5 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? `${CREAM}ee` : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? `2px solid ${INK}10` : "2px solid transparent",
        }}
      >
        <a
          href="/landing"
          className="font-mono font-bold text-2xl tracking-tight"
          style={{ color: CORAL }}
        >
          PTI<span style={{ color: INK }}>.</span>
        </a>
        <div className="hidden md:flex items-center gap-10 text-sm font-mono uppercase tracking-widest"
          style={{ color: MUTED, fontSize: "11px" }}>
          <a href="#features" className="hover:text-[#1a1a2e] transition-colors">Features</a>
          <a href="#pipeline" className="hover:text-[#1a1a2e] transition-colors">Pipeline</a>
          <a href="#stack" className="hover:text-[#1a1a2e] transition-colors">Stack</a>
        </div>
        <PixelBtn href="/" variant="dark" className="!px-5 !py-2.5 !text-xs">
          Dashboard &rarr;
        </PixelBtn>
      </div>
    </nav>
  )
}

/* ═══════════════════════════════════════════
   Hero — Asymmetric, shader visible
   ═══════════════════════════════════════════ */

function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: CREAM }}
    >
      {/* Shader — visible, not buried */}
      <div className="absolute inset-0 opacity-50">
        <DitheringShader
          shape="wave"
          type="8x8"
          colorBack="#FFF5F0"
          colorFront="#FF6B6B"
          width={1920}
          height={1080}
          pxSize={3}
          speed={0.4}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>

      {/* Soft fade only at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: `linear-gradient(to top, ${CREAM}, transparent)`,
        }}
      />

      {/* Content — LEFT aligned, asymmetric */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center pt-32 pb-20">
        <div>
          {/* Tag */}
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 font-mono text-xs uppercase tracking-[0.15em] animate-fade-in-up"
            style={{
              animationDelay: "0.15s",
              animationFillMode: "both",
              border: `2px solid ${CORAL}`,
              color: CORAL,
            }}
          >
            <span
              className="w-2 h-2 animate-pulse-dot"
              style={{ backgroundColor: CORAL }}
            />
            Real-Time AI Sourcing
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up"
            style={{ animationDelay: "0.3s", animationFillMode: "both" }}
          >
            <span
              className="block leading-[0.92] tracking-[-0.03em]"
              style={{
                fontFamily: serif,
                fontSize: "clamp(3.5rem, 7.5vw, 7rem)",
                color: INK,
              }}
            >
              Passive Talent
            </span>
            <span
              className="block leading-[0.92] tracking-[-0.03em]"
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(3.5rem, 7.5vw, 7rem)",
                color: CORAL,
              }}
            >
              Intelligence.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mt-8 text-lg leading-relaxed max-w-lg animate-fade-in-up"
            style={{
              animationDelay: "0.5s",
              animationFillMode: "both",
              color: MUTED,
            }}
          >
            An AI agent that sources, enriches and scores top passive talent
            in real time — powered by HrFlow.ai&nbsp;&&nbsp;OpenClaw.
          </p>

          {/* CTAs */}
          <div
            className="mt-10 flex items-center gap-4 flex-wrap animate-fade-in-up"
            style={{ animationDelay: "0.7s", animationFillMode: "both" }}
          >
            <PixelBtn href="/" variant="coral">
              Launch Dashboard &rarr;
            </PixelBtn>
            <PixelBtn href="#features" variant="dark">
              How It Works
            </PixelBtn>
          </div>
        </div>

        {/* Right — decorative coral block with shader */}
        <div
          className="hidden lg:block relative animate-fade-in-up"
          style={{ animationDelay: "0.5s", animationFillMode: "both" }}
        >
          <div
            className="aspect-square w-full max-w-[420px] ml-auto relative overflow-hidden"
            style={{ backgroundColor: CORAL }}
          >
            <DitheringShader
              shape="swirl"
              type="8x8"
              colorBack="#FF6B6B"
              colorFront="#FFF5F0"
              width={800}
              height={800}
              pxSize={4}
              speed={0.5}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
          </div>
          {/* Offset shadow block */}
          <div
            className="absolute -bottom-4 -right-4 w-full aspect-square max-w-[420px] -z-10"
            style={{ backgroundColor: INK, opacity: 0.08 }}
          />
        </div>
      </div>

      {/* Scroll hint */}
      <div
        className="absolute bottom-8 left-8 flex items-center gap-3 animate-fade-in-up"
        style={{ animationDelay: "1s", animationFillMode: "both" }}
      >
        <div className="w-px h-10" style={{ backgroundColor: MUTED }} />
        <span
          className="font-mono uppercase tracking-[0.2em]"
          style={{ fontSize: "10px", color: MUTED }}
        >
          Scroll
        </span>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Problem — FULL CORAL FLOOD
   ═══════════════════════════════════════════ */

function ProblemSection() {
  return (
    <section
      className="py-28 md:py-36 relative overflow-hidden"
      style={{ backgroundColor: CORAL }}
    >
      <div className="mx-auto max-w-5xl px-8 relative z-10">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-6 text-white/60">
            The Problem
          </p>
          <h2
            className="leading-[1.1] tracking-[-0.02em] text-white"
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
            }}
          >
            150+ CVs per role.
            <br />
            Zero time to review them all.
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-8 text-lg md:text-xl leading-relaxed max-w-2xl text-white/80">
            The best candidates never apply. They are passive talent — already
            employed, not searching. Recruiters miss them because sourcing
            across GitHub, LinkedIn, and Indeed by hand takes weeks.
            <span className="text-white font-semibold">
              {" "}We built an agent to do it in seconds.
            </span>
          </p>
        </Reveal>

        {/* Metrics row on coral */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { val: "3+", label: "Sources" },
            { val: "AI", label: "Scoring" },
            { val: "JIT", label: "Real-Time" },
            { val: "NLP", label: "Natural Language" },
          ].map((m, i) => (
            <Reveal key={m.label} delay={i * 80}>
              <div
                className="p-5 text-center"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
              >
                <div className="text-2xl md:text-3xl font-mono font-bold text-white">
                  {m.val}
                </div>
                <div className="mt-1 text-xs font-mono uppercase tracking-wider text-white/60">
                  {m.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Feature Visuals
   ═══════════════════════════════════════════ */

function SourcesVisual() {
  const sources = [
    { name: "GitHub", letter: "GH", sub: "Developer repos", bg: "#24292e" },
    { name: "LinkedIn", letter: "in", sub: "Professional profiles", bg: "#0A66C2" },
    { name: "Indeed", letter: "IN", sub: "Job applications", bg: "#2164F3" },
    { name: "HrFlow", letter: "H", sub: "10k+ indexed CVs", bg: CORAL },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {sources.map((s) => (
        <div
          key={s.name}
          className="p-5 transition-all duration-200 hover:-translate-y-1"
          style={{
            backgroundColor: "white",
            border: `2px solid ${INK}10`,
            boxShadow: `4px 4px 0 0 ${INK}0d`,
          }}
        >
          <div
            className="w-11 h-11 flex items-center justify-center text-white font-mono font-bold text-sm mb-3"
            style={{ backgroundColor: s.bg }}
          >
            {s.letter}
          </div>
          <p className="font-semibold text-sm" style={{ color: INK }}>{s.name}</p>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>{s.sub}</p>
        </div>
      ))}
    </div>
  )
}

function ScoreVisual() {
  return (
    <div
      className="p-8"
      style={{
        backgroundColor: "white",
        border: `2px solid ${INK}10`,
        boxShadow: `6px 6px 0 0 ${INK}0d`,
      }}
    >
      <div className="flex items-center gap-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#F0EDE8" strokeWidth="8" fill="none" />
            <circle
              cx="50" cy="50" r="40" stroke={CORAL} strokeWidth="8" fill="none"
              strokeDasharray="251.33" strokeDashoffset="33" strokeLinecap="square"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-bold" style={{ color: INK }}>87%</span>
            <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: MUTED }}>Match</span>
          </div>
        </div>
        <div className="space-y-2.5">
          <p className="text-[10px] font-mono uppercase tracking-wider mb-3" style={{ color: MUTED }}>
            SWOT Analysis
          </p>
          {[
            { ok: true, t: "Python Expert" },
            { ok: true, t: "5+ yrs Experience" },
            { ok: true, t: "Paris, CDI" },
            { ok: false, t: "No React exp." },
          ].map((x) => (
            <div key={x.t} className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5" style={{ backgroundColor: x.ok ? "#10b981" : CORAL }} />
              <span className="text-sm" style={{ color: INK }}>{x.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PipelineFlowVisual() {
  const steps = [
    { letter: "X", name: "X-Ray" },
    { letter: "E", name: "Enrich" },
    { letter: "I", name: "Index" },
    { letter: "S", name: "Score" },
  ]
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.name} className="contents">
          <div
            className="flex-1 p-4 text-center transition-all duration-200 hover:-translate-y-1"
            style={{
              backgroundColor: "white",
              border: `2px solid ${INK}10`,
              boxShadow: `3px 3px 0 0 ${INK}0d`,
            }}
          >
            <div
              className="w-9 h-9 mx-auto mb-2 flex items-center justify-center font-mono font-bold text-sm text-white"
              style={{ backgroundColor: CORAL }}
            >
              {s.letter}
            </div>
            <p className="font-mono font-bold text-xs" style={{ color: INK }}>{s.name}</p>
          </div>
          {i < steps.length - 1 && (
            <span className="font-mono text-lg" style={{ color: CORAL }}>
              &rarr;
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function ChatVisual() {
  return (
    <div
      className="p-5 space-y-4"
      style={{
        backgroundColor: "white",
        border: `2px solid ${INK}10`,
        boxShadow: `6px 6px 0 0 ${INK}0d`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold text-white"
          style={{ backgroundColor: INK }}
        >
          You
        </div>
        <div className="px-4 py-3 text-sm leading-relaxed" style={{ backgroundColor: CREAM_MID, color: INK }}>
          Find me senior Python developers in Paris, available for CDI, with
          machine learning experience.
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold text-white"
          style={{ backgroundColor: CORAL }}
        >
          AI
        </div>
        <div className="px-4 py-3 text-sm leading-relaxed" style={{ backgroundColor: CREAM_MID, color: MUTED }}>
          Found <span style={{ color: INK, fontWeight: 600 }}>12 candidates</span> matching.
          Top: <span className="font-mono font-bold" style={{ color: CORAL }}>Sophie Martin — 94%</span> — Senior ML Engineer, 7yrs Python, Paris.
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Features — Numbered, editorial
   ═══════════════════════════════════════════ */

const features = [
  {
    num: "01",
    title: "Multi-Source Intelligence",
    desc: "Search across GitHub repositories, LinkedIn profiles, Indeed listings, and 10,000+ indexed candidates in a single query. Find talent that never applies.",
    visual: <SourcesVisual />,
  },
  {
    num: "02",
    title: "AI Scoring & Matching",
    desc: "HrFlow.ai\u2019s proprietary algorithm scores every candidate 0\u2013100%. SWOT analysis explains every match: strengths and skill gaps, transparent.",
    visual: <ScoreVisual />,
  },
  {
    num: "03",
    title: "Just-in-Time Pipeline",
    desc: "X-Ray discovers. Enrich reveals context. Index structures data. Score ranks candidates. Real time, no stale data, no waiting.",
    visual: <PipelineFlowVisual />,
  },
  {
    num: "04",
    title: "Natural Language Interface",
    desc: "Type a job description or ask in plain language. The agent parses intent, searches intelligently, delivers ranked results with full transparency.",
    visual: <ChatVisual />,
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="py-28 md:py-36" style={{ backgroundColor: CREAM }}>
      <div className="mx-auto max-w-7xl px-8">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: CORAL }}>
            Features
          </p>
          <h2
            className="leading-[1.05] tracking-[-0.02em]"
            style={{
              fontFamily: serif,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: INK,
            }}
          >
            Everything you need to
            <br />
            <span style={{ color: CORAL, fontStyle: "italic" }}>
              find the best talent.
            </span>
          </h2>
        </Reveal>

        <div className="mt-24 space-y-28 md:space-y-32">
          {features.map((f, i) => (
            <Reveal key={f.num}>
              <div
                className={`flex flex-col gap-12 lg:gap-20 ${
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-start`}
              >
                {/* Text */}
                <div className="flex-1 relative">
                  {/* Giant number */}
                  <span
                    className="block font-mono font-bold leading-none select-none"
                    style={{
                      fontSize: "clamp(5rem, 10vw, 8rem)",
                      color: CORAL,
                      opacity: 0.1,
                    }}
                  >
                    {f.num}
                  </span>
                  <h3
                    className="text-2xl md:text-3xl font-bold tracking-tight -mt-12 md:-mt-16"
                    style={{ color: INK }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="mt-4 text-base md:text-lg leading-relaxed max-w-lg"
                    style={{ color: MUTED }}
                  >
                    {f.desc}
                  </p>
                  {/* Decorative coral line */}
                  <div className="mt-6 w-16 h-1" style={{ backgroundColor: CORAL }} />
                </div>
                {/* Visual */}
                <div className="flex-1 w-full max-w-lg">{f.visual}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Pipeline — CORAL FLOOD
   ═══════════════════════════════════════════ */

function PipelineSection() {
  const steps = [
    {
      letter: "X",
      name: "X-Ray",
      desc: "Discover passive talent across GitHub, LinkedIn, Indeed via OpenClaw orchestration.",
    },
    {
      letter: "E",
      name: "Enrich",
      desc: "Reveal full professional context with Proxycurl and GitHub activity analysis.",
    },
    {
      letter: "I",
      name: "Index",
      desc: "Parse and structure CV data with HrFlow.ai into a searchable knowledge base.",
    },
    {
      letter: "S",
      name: "Score",
      desc: "AI scoring 0\u2013100% using HrFlow\u2019s proprietary matching algorithm.",
    },
  ]

  return (
    <section
      id="pipeline"
      className="py-28 md:py-36 relative overflow-hidden"
      style={{ backgroundColor: CORAL }}
    >
      {/* Subtle shader texture */}
      <div className="absolute inset-0 opacity-20">
        <DitheringShader
          shape="warp"
          type="8x8"
          colorBack="#FF6B6B"
          colorFront="#CC4444"
          width={1920}
          height={1080}
          pxSize={4}
          speed={0.2}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-8">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4 text-white/50">
            Pipeline
          </p>
          <h2
            className="leading-[1.05] tracking-[-0.02em] text-white"
            style={{
              fontFamily: serif,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
            }}
          >
            JIT. Real-time.
            <br />
            <span style={{ fontStyle: "italic" }}>No stale data.</span>
          </h2>
          <p className="mt-4 text-lg max-w-xl leading-relaxed text-white/70">
            Our Just-in-Time pipeline processes candidates the moment they are
            discovered. Every step in sequence, in real time.
          </p>
        </Reveal>

        {/* White cards on coral bg */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <Reveal key={s.name} delay={i * 100}>
              <div
                className="p-6 h-full transition-all duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: "white",
                  boxShadow: `6px 6px 0 0 ${CORAL_DEEP}`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center font-mono font-bold text-sm text-white"
                    style={{ backgroundColor: CORAL }}
                  >
                    {s.letter}
                  </div>
                  <span className="text-xs font-mono" style={{ color: MUTED }}>
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: INK }}>
                  {s.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Stack / Integrations
   ═══════════════════════════════════════════ */

function StackSection() {
  const items = [
    { name: "HrFlow.ai", desc: "CV parsing, indexing & AI scoring", letter: "H", bg: CORAL },
    { name: "OpenClaw", desc: "Orchestration & Telegram", letter: "O", bg: "#7C3AED" },
    { name: "GitHub", desc: "Developer passive sourcing", letter: "GH", bg: "#24292e" },
    { name: "LinkedIn", desc: "Profile enrichment", letter: "in", bg: "#0A66C2" },
    { name: "Indeed", desc: "Job board scraping", letter: "IN", bg: "#2164F3" },
    { name: "Ollama", desc: "Local LLM \u2014 Qwen3 14B", letter: "Q", bg: "#10b981" },
  ]

  return (
    <section id="stack" className="py-28 md:py-36" style={{ backgroundColor: CREAM }}>
      <div className="mx-auto max-w-7xl px-8">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] mb-4" style={{ color: CORAL }}>
            Stack
          </p>
          <h2
            className="leading-[1.05] tracking-[-0.02em]"
            style={{
              fontFamily: serif,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: INK,
            }}
          >
            Powered by{" "}
            <span style={{ color: CORAL, fontStyle: "italic" }}>the best.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((x, i) => (
            <Reveal key={x.name} delay={i * 60}>
              <div
                className="p-6 transition-all duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: "white",
                  border: `2px solid ${INK}10`,
                  boxShadow: `4px 4px 0 0 ${INK}0d`,
                }}
              >
                <div
                  className="w-11 h-11 flex items-center justify-center text-white font-mono font-bold text-sm mb-4"
                  style={{ backgroundColor: x.bg }}
                >
                  {x.letter}
                </div>
                <p className="font-semibold" style={{ color: INK }}>{x.name}</p>
                <p className="text-sm mt-1" style={{ color: MUTED }}>{x.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   CTA — CORAL FLOOD with shader
   ═══════════════════════════════════════════ */

function CTASection() {
  return (
    <section
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: CORAL }}
    >
      {/* Shader visible */}
      <div className="absolute inset-0 opacity-30">
        <DitheringShader
          shape="ripple"
          type="8x8"
          colorBack="#FF6B6B"
          colorFront="#FFF5F0"
          width={1920}
          height={1080}
          pxSize={5}
          speed={0.3}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>

      <div className="relative z-10 text-center px-8 max-w-3xl mx-auto">
        <Reveal>
          <h2
            className="leading-[0.95] tracking-[-0.03em] text-white"
            style={{
              fontFamily: serif,
              fontSize: "clamp(3rem, 6vw, 5.5rem)",
            }}
          >
            Ready to
            <br />
            <span style={{ fontStyle: "italic" }}>hire smarter?</span>
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-6 text-lg max-w-md mx-auto leading-relaxed text-white/80">
            Source, score and engage the best passive talent — all in real time.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-10">
            <PixelBtn href="/" variant="white" className="!text-base !px-10 !py-4">
              Try It Now &rarr;
            </PixelBtn>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="py-12" style={{ backgroundColor: CREAM_MID, borderTop: `2px solid ${INK}08` }}>
      <div className="mx-auto max-w-7xl px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-lg tracking-tight" style={{ color: CORAL }}>
            PTI<span style={{ color: INK }}>.</span>
          </span>
          <span className="text-sm" style={{ color: MUTED }}>
            Passive Talent Intelligence
          </span>
        </div>
        <p className="text-sm text-center md:text-right" style={{ color: MUTED }}>
          Built for HrFlow.ai Hackathon 2026 — Powered by HrFlow.ai & OpenClaw
        </p>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════
   Page
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: CREAM, color: INK }}>
      <Grain />
      <Nav />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <PipelineSection />
      <StackSection />
      <CTASection />
      <Footer />
    </div>
  )
}
