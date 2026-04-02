"use client"

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react"
import { DitheringShader } from "@/components/ui/dithering-shader"

/* ═══════════════════════════════════════════════════
   DESIGN SYSTEM — Elevated Pixel Editorial v2

   - Coral as accent, not flood
   - Deep navy (#0B1226) as strong contrast sections
   - Generous whitespace, rounded cards, pixel CTAs
   - Animated counters, avatars, rich visuals
   - Full-width feature visuals
   ═══════════════════════════════════════════════════ */

const CORAL = "#FF6B6B"
const CORAL_DARK = "#E85555"
const CORAL_DEEP = "#CC4444"
const CORAL_GLOW = "#FF6B6B25"
const CREAM = "#FFF5F0"
const CREAM_MID = "#F5EDE6"
const INK = "#1a1a2e"
const NAVY = "#0B1226"
const MUTED = "#6b7280"
const WHITE = "#FFFFFF"
const SUCCESS = "#10b981"

const serif = "var(--font-display), 'Georgia', serif"

/* ═══════════════════════════════════════════
   SVG Icons
   ═══════════════════════════════════════════ */

function IconGitHub({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function IconLinkedIn({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function IconIndeed({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M11.566 21.882v-8.203c0-1.403.32-2.479 1.136-3.478C14.135 8.47 16.288 7.82 18.479 8.12c.197.025.37.074.543.111V3.476A11.998 11.998 0 0012 0C5.373 0 0 5.373 0 12s5.373 12 12 12c2.291 0 4.432-.646 6.252-1.762v-5.478c-1.835 2.27-4.536 3.613-7.458 3.368-.668-.067-.98-.273-1.043-.535-.043-.17.024-.482.166-.711h1.649z" />
    </svg>
  )
}

function IconHrFlow({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function IconOpenClaw({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function IconOllama({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 014 4v1a4 4 0 01-8 0V6a4 4 0 014-4z" />
      <path d="M6 10v3a6 6 0 0012 0v-3" />
      <path d="M8 22v-3" />
      <path d="M16 22v-3" />
      <circle cx="9" cy="9" r="0.5" fill={color} />
      <circle cx="15" cy="9" r="0.5" fill={color} />
    </svg>
  )
}

const ICONS: Record<string, (props: { size?: number; color?: string }) => ReactNode> = {
  GitHub: IconGitHub,
  LinkedIn: IconLinkedIn,
  Indeed: IconIndeed,
  HrFlow: IconHrFlow,
  "HrFlow.ai": IconHrFlow,
  OpenClaw: IconOpenClaw,
  Ollama: IconOllama,
}

/* ═══════════════════════════════════════════
   Animated Counter
   ═══════════════════════════════════════════ */

function AnimatedNumber({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          setStarted(true)
          obs.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const duration = 1200
    const steps = 40
    const increment = value / steps
    let current = 0
    let step = 0
    const interval = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      current = Math.round(value * eased)
      setDisplay(current)
      if (step >= steps) {
        setDisplay(value)
        clearInterval(interval)
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [started, value])

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  )
}

/* ═══════════════════════════════════════════
   Pixel Button — sharp identity on CTAs only
   ═══════════════════════════════════════════ */

function PixelBtn({
  href,
  children,
  variant = "coral",
  className = "",
  size = "md",
}: {
  href: string
  children: ReactNode
  variant?: "coral" | "dark" | "white" | "outline"
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizes = {
    sm: "px-5 py-2.5 text-xs",
    md: "px-8 py-4 text-sm",
    lg: "px-10 py-5 text-base",
  }

  const bg =
    variant === "coral" ? CORAL
    : variant === "dark" ? INK
    : variant === "outline" ? "transparent"
    : WHITE

  const fg =
    variant === "white" ? INK
    : variant === "outline" ? INK
    : CREAM

  const shadow =
    variant === "coral" ? CORAL_DEEP
    : variant === "outline" ? `${INK}20`
    : variant === "dark" ? "#000"
    : `${INK}15`

  return (
    <a
      href={href}
      className={`inline-block font-mono font-bold uppercase tracking-wider transition-all duration-100 select-none cursor-pointer active:shadow-none active:translate-x-[4px] active:translate-y-[4px] ${sizes[size]} ${className}`}
      style={{
        backgroundColor: bg,
        color: fg,
        boxShadow: `4px 4px 0 0 ${shadow}`,
        border: variant === "outline" ? `2px solid ${INK}` : "none",
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
        opacity: 0.03,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  )
}

/* ═══════════════════════════════════════════
   Avatar placeholder
   ═══════════════════════════════════════════ */

function Avatar({ name, size = 40, bg = CORAL }: { name: string; size?: number; bg?: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2)
  return (
    <div
      className="flex items-center justify-center font-mono font-bold text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
        borderRadius: "50%",
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
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
          backgroundColor: scrolled ? `${WHITE}ee` : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? `1px solid ${INK}08` : "1px solid transparent",
        }}
      >
        <a href="/landing" className="font-mono font-bold text-2xl tracking-tight" style={{ color: CORAL }}>
          PTI<span style={{ color: INK }}>.</span>
        </a>
        <div
          className="hidden md:flex items-center gap-10 text-sm font-mono uppercase tracking-widest"
          style={{ color: MUTED, fontSize: "11px" }}
        >
          <a href="#features" className="hover:text-[#1a1a2e] transition-colors">Features</a>
          <a href="#demo" className="hover:text-[#1a1a2e] transition-colors">Demo</a>
          <a href="#pipeline" className="hover:text-[#1a1a2e] transition-colors">Pipeline</a>
          <a href="#stack" className="hover:text-[#1a1a2e] transition-colors">Stack</a>
        </div>
        <div className="flex items-center gap-3">
          <PixelBtn href="#demo" variant="outline" size="sm">Watch Demo</PixelBtn>
          <PixelBtn href="/" variant="coral" size="sm">Request Access &rarr;</PixelBtn>
        </div>
      </div>
    </nav>
  )
}

/* ═══════════════════════════════════════════
   Hero
   ═══════════════════════════════════════════ */

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: WHITE }}>
      <div className="absolute inset-0 opacity-20">
        <DitheringShader
          shape="wave"
          type="8x8"
          colorBack="#FFFFFF"
          colorFront="#FF6B6B"
          width={1920}
          height={1080}
          pxSize={3}
          speed={0.3}
          style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: `linear-gradient(to top, ${WHITE}, transparent)` }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2.5 px-5 py-2.5 mb-10 font-mono text-xs uppercase tracking-[0.15em] animate-fade-in-up"
            style={{
              animationDelay: "0.15s", animationFillMode: "both",
              backgroundColor: `${CORAL}10`, border: `1.5px solid ${CORAL}30`, color: CORAL,
              borderRadius: "100px",
            }}
          >
            <span className="w-2 h-2 animate-pulse-dot" style={{ backgroundColor: CORAL, borderRadius: "50%" }} />
            Built for HrFlow.ai Hackathon 2026
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
            <span className="block leading-[0.92] tracking-[-0.03em]" style={{ fontFamily: serif, fontSize: "clamp(3rem, 6.5vw, 6rem)", color: INK }}>
              Stop searching.
            </span>
            <span className="block leading-[0.92] tracking-[-0.03em] mt-2" style={{ fontFamily: serif, fontSize: "clamp(3rem, 6.5vw, 6rem)", color: INK }}>
              Start <span style={{ color: CORAL, fontStyle: "italic" }}>finding.</span>
            </span>
          </h1>

          <p className="mt-8 text-xl leading-relaxed max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "both", color: MUTED }}>
            An AI-powered sourcing agent that discovers, enriches, and scores
            top passive talent across GitHub, LinkedIn, and Indeed — in real time.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap animate-fade-in-up" style={{ animationDelay: "0.7s", animationFillMode: "both" }}>
            <PixelBtn href="/" variant="coral" size="lg">Launch Dashboard &rarr;</PixelBtn>
            <PixelBtn href="#demo" variant="outline" size="lg">Watch Demo</PixelBtn>
          </div>

          {/* Social proof */}
          <div className="mt-14 flex items-center justify-center gap-8 flex-wrap animate-fade-in-up" style={{ animationDelay: "0.9s", animationFillMode: "both" }}>
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color: `${MUTED}90` }}>Powered by</span>
            {["HrFlow.ai", "OpenClaw", "Ollama"].map((name) => (
              <span key={name} className="font-mono font-bold text-sm tracking-tight" style={{ color: `${INK}60` }}>{name}</span>
            ))}
          </div>
        </div>

        {/* Product Screenshot — large, immersive */}
        <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "1s", animationFillMode: "both" }}>
          <div className="relative overflow-hidden" style={{ borderRadius: "12px", backgroundColor: NAVY, boxShadow: `0 50px 100px -30px ${INK}40, 0 0 0 1px ${WHITE}10` }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5" style={{ backgroundColor: NAVY, borderBottom: `1px solid ${WHITE}08` }}>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
              </div>
              <div className="ml-4 flex-1 h-7 flex items-center px-4 font-mono text-xs" style={{ backgroundColor: `${WHITE}06`, color: `${WHITE}35`, borderRadius: "6px" }}>
                app.pti.ai/dashboard
              </div>
            </div>
            {/* Dashboard mockup */}
            <div className="aspect-[16/9] relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY}, #111827)` }}>
              <div className="w-full h-full p-6 grid grid-cols-[240px_1fr_300px] gap-4" style={{ opacity: 0.95 }}>
                {/* Sidebar */}
                <div className="flex flex-col gap-3">
                  <div className="h-10 flex items-center px-4 font-mono text-sm font-bold" style={{ color: CORAL }}>PTI.</div>
                  <div className="h-9 flex items-center px-3 gap-2" style={{ backgroundColor: `${CORAL}12`, borderRadius: "8px" }}>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: `${CORAL}40` }} />
                    <div className="h-2 w-16" style={{ backgroundColor: `${CORAL}50`, borderRadius: "4px" }} />
                  </div>
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-9 flex items-center px-3 gap-2" style={{ borderRadius: "8px" }}>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: `${WHITE}08` }} />
                      <div className="h-2" style={{ width: `${50 + n * 10}px`, backgroundColor: `${WHITE}08`, borderRadius: "4px" }} />
                    </div>
                  ))}
                  <div className="mt-auto p-3" style={{ backgroundColor: `${WHITE}04`, borderRadius: "8px" }}>
                    <div className="flex items-center gap-2">
                      <Avatar name="You" size={28} bg={`${WHITE}15`} />
                      <div className="h-2 w-16" style={{ backgroundColor: `${WHITE}10`, borderRadius: "4px" }} />
                    </div>
                  </div>
                </div>
                {/* Center — candidates */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="h-3 w-40" style={{ backgroundColor: `${WHITE}15`, borderRadius: "4px" }} />
                    <div className="h-8 px-4 flex items-center font-mono text-xs" style={{ backgroundColor: CORAL, color: WHITE, borderRadius: "6px" }}>
                      + New Search
                    </div>
                  </div>
                  {[
                    { name: "Sophie Martin", role: "ML Engineer, 7 yrs", score: 94 },
                    { name: "Lucas Moreau", role: "Data Scientist, 5 yrs", score: 89 },
                    { name: "Camille Petit", role: "Python Dev, 6 yrs", score: 85 },
                    { name: "Hugo Lambert", role: "AI Researcher, 4 yrs", score: 81 },
                  ].map((c, i) => (
                    <div
                      key={c.name}
                      className="p-4 flex items-center gap-4 transition-all"
                      style={{
                        backgroundColor: i === 0 ? `${CORAL}08` : `${WHITE}04`,
                        borderRadius: "10px",
                        border: i === 0 ? `1px solid ${CORAL}20` : `1px solid ${WHITE}06`,
                      }}
                    >
                      <Avatar name={c.name} size={36} bg={i === 0 ? CORAL : `${WHITE}15`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ color: `${WHITE}80` }}>{c.name}</div>
                        <div className="text-[10px] mt-0.5 truncate" style={{ color: `${WHITE}35` }}>{c.role}</div>
                      </div>
                      {/* Score badge */}
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden" style={{ backgroundColor: `${WHITE}08`, borderRadius: "4px" }}>
                          <div className="h-full" style={{ width: `${c.score}%`, backgroundColor: c.score > 90 ? SUCCESS : CORAL, borderRadius: "4px" }} />
                        </div>
                        <span className="font-mono font-bold text-xs" style={{ color: c.score > 90 ? SUCCESS : CORAL }}>{c.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Right — detail panel */}
                <div className="flex flex-col gap-3 p-4" style={{ backgroundColor: `${WHITE}04`, borderRadius: "10px" }}>
                  <div className="flex items-center gap-3 pb-3" style={{ borderBottom: `1px solid ${WHITE}06` }}>
                    <Avatar name="Sophie Martin" size={44} bg={CORAL} />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: `${WHITE}85` }}>Sophie Martin</div>
                      <div className="text-[10px]" style={{ color: `${WHITE}35` }}>ML Engineer &middot; Paris</div>
                    </div>
                  </div>
                  {/* SWOT mini */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {[
                      { l: "S", c: SUCCESS, items: ["Python 8yr", "ML Expert"] },
                      { l: "W", c: CORAL, items: ["No React"] },
                      { l: "O", c: "#3b82f6", items: ["Open to CDI"] },
                      { l: "T", c: "#f59e0b", items: ["High demand"] },
                    ].map(s => (
                      <div key={s.l} className="p-2.5" style={{ backgroundColor: `${WHITE}04`, borderRadius: "8px" }}>
                        <span className="text-[10px] font-mono font-bold" style={{ color: s.c }}>{s.l}</span>
                        {s.items.map(item => (
                          <div key={item} className="text-[9px] mt-1" style={{ color: `${WHITE}30` }}>{item}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex gap-2">
                    <div className="h-9 flex-1 flex items-center justify-center font-mono text-xs font-bold" style={{ backgroundColor: CORAL, color: WHITE, borderRadius: "6px" }}>
                      Contact
                    </div>
                    <div className="h-9 flex-1 flex items-center justify-center font-mono text-xs" style={{ backgroundColor: `${WHITE}06`, color: `${WHITE}40`, borderRadius: "6px" }}>
                      Save
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect under screenshot */}
          <div className="mx-auto w-3/4 h-16 -mt-4" style={{ background: `radial-gradient(ellipse at center, ${CORAL}15, transparent 70%)` }} />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Metrics — Animated counters
   ═══════════════════════════════════════════ */

function MetricsBar() {
  const metrics = [
    { value: 10000, suffix: "+", label: "Indexed profiles" },
    { value: 3, suffix: "+", label: "Data sources" },
    { value: 5, prefix: "<", suffix: "s", label: "Time to results" },
    { value: 94, suffix: "%", label: "Matching accuracy" },
  ]

  return (
    <section className="py-20 relative" style={{ backgroundColor: CREAM }}>
      <div className="mx-auto max-w-6xl px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 100}>
              <div className="text-center">
                <div className="font-mono font-bold tracking-tight" style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", color: CORAL }}>
                  <AnimatedNumber value={m.value} suffix={m.suffix} prefix={m.prefix} />
                </div>
                <div className="mt-2 font-mono text-xs uppercase tracking-[0.15em]" style={{ color: MUTED }}>
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
   Problem — with visual contrast
   ═══════════════════════════════════════════ */

function ProblemSection() {
  return (
    <section className="py-28 md:py-36" style={{ backgroundColor: WHITE }}>
      <div className="mx-auto max-w-6xl px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <Reveal>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] mb-6" style={{ color: CORAL }}>The Problem</p>
              <h2 className="leading-[1.08] tracking-[-0.02em]" style={{ fontFamily: serif, fontSize: "clamp(2rem, 4vw, 3.2rem)", color: INK }}>
                Your best hires <span style={{ fontStyle: "italic", color: CORAL }}>never applied.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed" style={{ color: MUTED }}>
                Top talent is passive — they are not on job boards. Sourcing
                across GitHub, LinkedIn, and Indeed by hand takes weeks. By the
                time you find them, they are already gone.
              </p>
              <div className="mt-8 w-16 h-1" style={{ backgroundColor: CORAL }} />
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "150+", title: "CVs per role", desc: "Recruiters drown in volume, miss the best fits", accent: false },
                { icon: "72%", title: "Passive talent", desc: "The majority of top candidates never apply", accent: false },
                { icon: "3 wks", title: "Manual sourcing", desc: "Time wasted searching across platforms", accent: false },
                { icon: "< 5s", title: "With PTI", desc: "AI-powered sourcing delivers ranked results instantly", accent: true },
              ].map((card) => (
                <div
                  key={card.title}
                  className="p-6 transition-all duration-200 hover:-translate-y-1"
                  style={{
                    backgroundColor: card.accent ? `${CORAL}06` : CREAM,
                    border: card.accent ? `2px solid ${CORAL}20` : `1px solid ${INK}06`,
                    boxShadow: card.accent ? `4px 4px 0 0 ${CORAL}15` : `4px 4px 0 0 ${INK}06`,
                    borderRadius: "12px",
                  }}
                >
                  <div className="font-mono font-bold text-2xl mb-3" style={{ color: card.accent ? CORAL : INK }}>{card.icon}</div>
                  <p className="font-semibold text-sm mb-1" style={{ color: INK }}>{card.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: MUTED }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Feature Visuals — BIGGER, richer
   ═══════════════════════════════════════════ */

function SourcesVisual() {
  const sources = [
    { name: "GitHub", sub: "Developer repos & activity", bg: "#24292e", count: "2.4k profiles" },
    { name: "LinkedIn", sub: "Professional profiles", bg: "#0A66C2", count: "5.1k profiles" },
    { name: "Indeed", sub: "Job applications", bg: "#2164F3", count: "1.8k profiles" },
    { name: "HrFlow", sub: "Indexed CVs", bg: CORAL, count: "10k+ profiles" },
  ]
  return (
    <div className="w-full" style={{ backgroundColor: CREAM, borderRadius: "16px", border: `1px solid ${INK}06`, overflow: "hidden" }}>
      {/* Header bar */}
      <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${INK}06` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: CORAL, borderRadius: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider" style={{ color: MUTED }}>Multi-source aggregation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2" style={{ backgroundColor: SUCCESS, borderRadius: "50%" }} />
          <span className="text-xs font-mono" style={{ color: SUCCESS }}>Live</span>
        </div>
      </div>
      {/* Sources grid */}
      <div className="p-6 grid grid-cols-2 gap-4">
        {sources.map((s) => {
          const Icon = ICONS[s.name]
          return (
            <div key={s.name} className="p-5 transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: WHITE, borderRadius: "12px", border: `1px solid ${INK}06` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 flex items-center justify-center" style={{ backgroundColor: s.bg, borderRadius: "10px" }}>
                  {Icon ? <Icon size={20} color="white" /> : null}
                </div>
                <span className="text-[10px] font-mono" style={{ color: MUTED }}>{s.count}</span>
              </div>
              <p className="font-semibold text-sm" style={{ color: INK }}>{s.name}</p>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>{s.sub}</p>
            </div>
          )
        })}
      </div>
      {/* Bottom: converging indicator */}
      <div className="px-8 py-4 flex items-center gap-3" style={{ backgroundColor: `${CORAL}06`, borderTop: `1px solid ${INK}06` }}>
        <div className="flex -space-x-2">
          {[
            { bg: "#24292e", name: "GitHub" },
            { bg: "#0A66C2", name: "LinkedIn" },
            { bg: "#2164F3", name: "Indeed" },
            { bg: CORAL, name: "HrFlow" },
          ].map((item, i) => {
            const Icon = ICONS[item.name]
            return (
              <div key={i} className="w-7 h-7 flex items-center justify-center border-2 border-white" style={{ backgroundColor: item.bg, borderRadius: "50%" }}>
                {Icon ? <Icon size={12} color="white" /> : null}
              </div>
            )
          })}
        </div>
        <span className="text-xs" style={{ color: MUTED }}>All sources merge into a single, ranked pipeline</span>
      </div>
    </div>
  )
}

function ScoreVisual() {
  return (
    <div className="w-full" style={{ backgroundColor: CREAM, borderRadius: "16px", border: `1px solid ${INK}06`, overflow: "hidden" }}>
      {/* Profile header */}
      <div className="px-8 py-6 flex items-center gap-4" style={{ borderBottom: `1px solid ${INK}06` }}>
        <Avatar name="Sophie Martin" size={52} bg={CORAL} />
        <div className="flex-1">
          <div className="font-semibold text-base" style={{ color: INK }}>Sophie Martin</div>
          <div className="text-sm" style={{ color: MUTED }}>Senior ML Engineer &middot; Paris &middot; 7 yrs exp.</div>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-2xl" style={{ color: CORAL }}>87%</div>
          <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: MUTED }}>Match</div>
        </div>
      </div>
      {/* Score ring + SWOT */}
      <div className="p-8 flex items-start gap-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke={`${INK}08`} strokeWidth="6" fill="none" />
            <circle cx="50" cy="50" r="40" stroke={CORAL} strokeWidth="6" fill="none" strokeDasharray="251.33" strokeDashoffset="33" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-mono font-bold" style={{ color: INK }}>87%</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3">
          {[
            { label: "Strengths", color: SUCCESS, items: ["Python Expert — 8 yrs", "ML / Deep Learning"] },
            { label: "Weaknesses", color: CORAL, items: ["No frontend exp."] },
            { label: "Opportunities", color: "#3b82f6", items: ["Open to CDI", "Paris-based"] },
            { label: "Threats", color: "#f59e0b", items: ["High market demand"] },
          ].map(s => (
            <div key={s.label} className="p-3" style={{ backgroundColor: WHITE, borderRadius: "10px", border: `1px solid ${INK}06` }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2" style={{ backgroundColor: s.color, borderRadius: "50%" }} />
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: s.color }}>{s.label}</span>
              </div>
              {s.items.map(item => (
                <div key={item} className="text-xs leading-relaxed" style={{ color: INK }}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PipelineFlowVisual() {
  const steps = [
    { letter: "X", name: "X-Ray", desc: "Discover profiles", status: "Done", color: SUCCESS },
    { letter: "E", name: "Enrich", desc: "Add context", status: "Done", color: SUCCESS },
    { letter: "I", name: "Index", desc: "Structure data", status: "Running", color: "#3b82f6" },
    { letter: "S", name: "Score", desc: "Rank candidates", status: "Queued", color: MUTED },
  ]
  return (
    <div className="w-full" style={{ backgroundColor: CREAM, borderRadius: "16px", border: `1px solid ${INK}06`, overflow: "hidden" }}>
      {/* Status bar */}
      <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${INK}06` }}>
        <span className="font-mono text-xs uppercase tracking-wider" style={{ color: MUTED }}>Pipeline Status</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 animate-pulse" style={{ backgroundColor: "#3b82f6", borderRadius: "50%" }} />
          <span className="font-mono text-xs" style={{ color: "#3b82f6" }}>Processing 12 profiles...</span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="px-8 pt-5">
        <div className="h-2 w-full overflow-hidden" style={{ backgroundColor: `${INK}06`, borderRadius: "4px" }}>
          <div className="h-full transition-all duration-1000" style={{ width: "62%", background: `linear-gradient(90deg, ${SUCCESS}, #3b82f6)`, borderRadius: "4px" }} />
        </div>
      </div>
      {/* Steps */}
      <div className="p-6 grid grid-cols-4 gap-3">
        {steps.map((s, i) => (
          <div key={s.name} className="relative">
            <div className="p-4 text-center" style={{ backgroundColor: WHITE, borderRadius: "12px", border: `1px solid ${s.color}20` }}>
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center font-mono font-bold text-sm text-white" style={{ backgroundColor: s.color === MUTED ? `${INK}15` : s.color, borderRadius: "12px" }}>
                {s.letter}
              </div>
              <p className="font-mono font-bold text-xs" style={{ color: INK }}>{s.name}</p>
              <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>{s.desc}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5" style={{ backgroundColor: `${s.color}10`, borderRadius: "100px" }}>
                {s.status === "Running" && <div className="w-1.5 h-1.5 animate-pulse" style={{ backgroundColor: s.color, borderRadius: "50%" }} />}
                <span className="text-[9px] font-mono font-bold uppercase" style={{ color: s.color }}>{s.status}</span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="absolute top-1/2 -right-2 w-4 text-center font-mono" style={{ color: `${INK}20`, transform: "translateY(-50%)" }}>&rarr;</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatVisual() {
  return (
    <div className="w-full" style={{ backgroundColor: CREAM, borderRadius: "16px", border: `1px solid ${INK}06`, overflow: "hidden" }}>
      {/* Chat header */}
      <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${INK}06` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center font-mono font-bold text-xs text-white" style={{ backgroundColor: CORAL, borderRadius: "8px" }}>AI</div>
          <div>
            <span className="font-semibold text-sm" style={{ color: INK }}>PTI Assistant</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5" style={{ backgroundColor: SUCCESS, borderRadius: "50%" }} />
              <span className="text-[10px]" style={{ color: SUCCESS }}>Online</span>
            </div>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="p-6 space-y-5">
        {/* User */}
        <div className="flex items-start gap-3">
          <Avatar name="HR Manager" size={36} bg={INK} />
          <div className="flex-1">
            <div className="text-[10px] font-mono mb-1" style={{ color: MUTED }}>You</div>
            <div className="px-5 py-3.5 text-sm leading-relaxed" style={{ backgroundColor: WHITE, color: INK, borderRadius: "0 12px 12px 12px" }}>
              Find me senior Python developers in Paris, available for CDI, with machine learning experience.
            </div>
          </div>
        </div>
        {/* AI */}
        <div className="flex items-start gap-3">
          <Avatar name="AI" size={36} bg={CORAL} />
          <div className="flex-1">
            <div className="text-[10px] font-mono mb-1" style={{ color: MUTED }}>PTI</div>
            <div className="px-5 py-3.5 text-sm leading-relaxed" style={{ backgroundColor: WHITE, color: INK, borderRadius: "0 12px 12px 12px" }}>
              Found <strong>12 candidates</strong> across 3 sources in 4.2s.
              <div className="mt-3 flex items-center gap-3 p-3" style={{ backgroundColor: CREAM, borderRadius: "8px" }}>
                <Avatar name="Sophie Martin" size={32} bg={CORAL} />
                <div className="flex-1">
                  <div className="text-xs font-semibold" style={{ color: INK }}>Sophie Martin</div>
                  <div className="text-[10px]" style={{ color: MUTED }}>ML Engineer, 7yrs Python, Paris</div>
                </div>
                <span className="font-mono font-bold text-sm" style={{ color: CORAL }}>94%</span>
              </div>
            </div>
          </div>
        </div>
        {/* Typing */}
        <div className="flex items-center gap-3 pl-12">
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: WHITE, borderRadius: "12px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 animate-pulse" style={{ backgroundColor: `${CORAL}50`, animationDelay: `${i * 200}ms`, borderRadius: "50%" }} />
            ))}
          </div>
          <span className="text-xs font-mono" style={{ color: `${MUTED}80` }}>Generating SWOT analysis...</span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Features — Full-width visuals, stacked
   ═══════════════════════════════════════════ */

const features = [
  {
    num: "01",
    tag: "Multi-Source",
    title: "Search everywhere.\nFind anyone.",
    desc: "Query GitHub, LinkedIn, Indeed, and 10,000+ indexed profiles simultaneously. Our AI agent connects to every major talent source so you never miss a candidate.",
    visual: <SourcesVisual />,
    bg: CREAM,
  },
  {
    num: "02",
    tag: "AI Scoring",
    title: "Every candidate.\nRanked & explained.",
    desc: "HrFlow.ai\u2019s proprietary algorithm scores every candidate 0\u2013100%. SWOT analysis makes every match transparent \u2014 strengths, gaps, and reasoning visible at a glance.",
    visual: <ScoreVisual />,
    bg: WHITE,
  },
  {
    num: "03",
    tag: "JIT Pipeline",
    title: "Real-time.\nNot yesterday\u2019s data.",
    desc: "X-Ray discovers. Enrich reveals context. Index structures data. Score ranks candidates. Every step happens in real time \u2014 no stale databases, no waiting.",
    visual: <PipelineFlowVisual />,
    bg: CREAM,
  },
  {
    num: "04",
    tag: "Natural Language",
    title: "Just describe\nwho you need.",
    desc: "Type a job description or ask in plain language. The agent parses your intent, searches intelligently, and delivers ranked results with full transparency.",
    visual: <ChatVisual />,
    bg: WHITE,
  },
]

function FeaturesSection() {
  return (
    <section id="features">
      {features.map((f, i) => (
        <div key={f.num} className="py-24 md:py-32" style={{ backgroundColor: f.bg }}>
          <div className="mx-auto max-w-6xl px-8">
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono font-bold text-xs px-3 py-1" style={{ backgroundColor: `${CORAL}10`, color: CORAL, borderRadius: "100px" }}>{f.num}</span>
                <span className="font-mono text-xs uppercase tracking-wider" style={{ color: MUTED }}>{f.tag}</span>
              </div>
              <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-start">
                <div className="lg:sticky lg:top-32">
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] whitespace-pre-line" style={{ color: INK }}>{f.title}</h3>
                  <p className="mt-5 text-base md:text-lg leading-relaxed max-w-lg" style={{ color: MUTED }}>{f.desc}</p>
                  <div className="mt-6 w-12 h-1" style={{ backgroundColor: CORAL }} />
                </div>
                <div>{f.visual}</div>
              </div>
            </Reveal>
          </div>
        </div>
      ))}
    </section>
  )
}

/* ═══════════════════════════════════════════
   Demo / Video — Dark, immersive
   ═══════════════════════════════════════════ */

function DemoSection() {
  return (
    <section id="demo" className="py-28 md:py-36 relative overflow-hidden" style={{ backgroundColor: NAVY }}>
      <div className="absolute inset-0 opacity-20">
        <DitheringShader
          shape="warp"
          type="8x8"
          colorBack="#0B1226"
          colorFront="#FF6B6B"
          width={1920}
          height={1080}
          pxSize={4}
          speed={0.2}
          style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: CORAL }}>See It In Action</p>
            <h2 className="leading-[1.05] tracking-[-0.02em] text-white" style={{ fontFamily: serif, fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}>
              From job description to <span style={{ fontStyle: "italic", color: CORAL }}>ranked candidates</span> in seconds.
            </h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: `${WHITE}60` }}>
              Watch how PTI transforms a simple job description into a pipeline
              of scored, enriched, and ready-to-contact candidates.
            </p>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="relative aspect-video max-w-4xl mx-auto overflow-hidden cursor-pointer group" style={{ borderRadius: "16px", border: `1px solid ${WHITE}10`, background: `linear-gradient(135deg, ${NAVY}, #1a1a3e, ${NAVY})` }}>
            {/* Fake screenshot background — faded dashboard */}
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full p-8 grid grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-lg" style={{ backgroundColor: `${WHITE}05` }} />
                ))}
              </div>
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: CORAL, borderRadius: "50%", boxShadow: `0 0 0 16px ${CORAL}15, 0 0 0 32px ${CORAL}08` }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <polygon points="9,5 20,12 9,19" />
                </svg>
              </div>
              <span className="font-mono text-xs uppercase tracking-wider" style={{ color: `${WHITE}50` }}>Watch the 2-min demo</span>
            </div>
          </div>
        </Reveal>

        {/* Stats row */}
        <Reveal delay={400}>
          <div className="mt-14 grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            {[
              { val: "4.2s", desc: "Average query time" },
              { val: "4 steps", desc: "Automated pipeline" },
              { val: "Zero", desc: "Manual sourcing" },
            ].map(s => (
              <div key={s.desc}>
                <div className="font-mono font-bold text-xl" style={{ color: CORAL }}>{s.val}</div>
                <div className="mt-1 text-xs font-mono uppercase tracking-wider" style={{ color: `${WHITE}35` }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Pipeline — Coral accent section
   ═══════════════════════════════════════════ */

function PipelineSection() {
  const steps = [
    { letter: "X", name: "X-Ray", desc: "Discover passive talent across GitHub, LinkedIn, Indeed via OpenClaw orchestration." },
    { letter: "E", name: "Enrich", desc: "Reveal full professional context with Proxycurl and GitHub activity analysis." },
    { letter: "I", name: "Index", desc: "Parse and structure CV data with HrFlow.ai into a searchable knowledge base." },
    { letter: "S", name: "Score", desc: "AI scoring 0\u2013100% using HrFlow\u2019s proprietary matching algorithm." },
  ]

  return (
    <section id="pipeline" className="py-28 md:py-36 relative overflow-hidden" style={{ backgroundColor: CORAL }}>
      <div className="absolute inset-0 opacity-15">
        <DitheringShader shape="warp" type="8x8" colorBack="#FF6B6B" colorFront="#CC4444" width={1920} height={1080} pxSize={4} speed={0.2} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5 text-white/50">Pipeline</p>
            <h2 className="leading-[1.05] tracking-[-0.02em] text-white" style={{ fontFamily: serif, fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}>
              Four steps. <span style={{ fontStyle: "italic" }}>Zero manual work.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/70 max-w-xl mx-auto">
              Our Just-in-Time pipeline processes candidates the moment they are discovered. Real time, always fresh.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <Reveal key={s.name} delay={i * 100}>
              <div className="p-7 h-full transition-all duration-200 hover:-translate-y-2" style={{ backgroundColor: WHITE, borderRadius: "14px", boxShadow: `0 20px 40px -10px ${CORAL_DEEP}50` }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center font-mono font-bold text-base text-white" style={{ backgroundColor: CORAL, borderRadius: "12px" }}>{s.letter}</div>
                  <span className="text-xs font-mono" style={{ color: MUTED }}>Step 0{i + 1}</span>
                </div>
                <h3 className="font-bold text-xl mb-3" style={{ color: INK }}>{s.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Testimonials — with avatars, human feel
   ═══════════════════════════════════════════ */

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "We reduced our time-to-shortlist from 2 weeks to 30 minutes. The SWOT analysis gives our team confidence in every match.",
      name: "Marie Dupont",
      role: "Head of Talent Acquisition",
      company: "Tech Corp",
      bg: CORAL,
    },
    {
      quote: "The multi-source search is a game-changer. We\u2019re finding developers on GitHub that we never would have discovered manually.",
      name: "Thomas Bernard",
      role: "Senior Recruiter",
      company: "Scale Studio",
      bg: "#3b82f6",
    },
    {
      quote: "Finally, a sourcing tool that explains WHY a candidate is a good fit \u2014 not just that they matched some keywords.",
      name: "Camille Leroy",
      role: "VP People",
      company: "DataFlow Labs",
      bg: "#7C3AED",
    },
  ]

  return (
    <section className="py-28 md:py-36" style={{ backgroundColor: CREAM }}>
      <div className="mx-auto max-w-7xl px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: CORAL }}>What Recruiters Say</p>
            <h2 className="leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: serif, fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", color: INK }}>
              Built for people who <span style={{ color: CORAL, fontStyle: "italic" }}>hire people.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 120}>
              <div className="p-8 h-full flex flex-col transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: WHITE, borderRadius: "16px", border: `1px solid ${INK}06`, boxShadow: `0 4px 24px -4px ${INK}08` }}>
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
                <p className="text-base leading-relaxed flex-1" style={{ color: INK }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-8 pt-6 flex items-center gap-3" style={{ borderTop: `1px solid ${INK}06` }}>
                  <Avatar name={t.name} size={44} bg={t.bg} />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: INK }}>{t.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>{t.role} &middot; {t.company}</p>
                  </div>
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
   Stack / Integrations
   ═══════════════════════════════════════════ */

function StackSection() {
  const items = [
    { name: "HrFlow.ai", desc: "CV parsing, indexing & AI scoring engine", bg: CORAL },
    { name: "OpenClaw", desc: "Multi-agent orchestration & Telegram bot", bg: "#7C3AED" },
    { name: "GitHub", desc: "Developer activity & repository analysis", bg: "#24292e" },
    { name: "LinkedIn", desc: "Professional profile enrichment", bg: "#0A66C2" },
    { name: "Indeed", desc: "Job board scraping & candidate discovery", bg: "#2164F3" },
    { name: "Ollama", desc: "Local LLM inference \u2014 Qwen3 14B", bg: "#10b981" },
  ]

  return (
    <section id="stack" className="py-28 md:py-36" style={{ backgroundColor: WHITE }}>
      <div className="mx-auto max-w-7xl px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: CORAL }}>Integrations</p>
            <h2 className="leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: serif, fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", color: INK }}>
              Built on <span style={{ color: CORAL, fontStyle: "italic" }}>industry leaders.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: MUTED }}>
              PTI connects the best tools in recruitment, AI, and developer platforms into one seamless pipeline.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-5">
          {items.map((x, i) => (
            <Reveal key={x.name} delay={i * 60}>
              <div className="p-7 transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: CREAM, borderRadius: "14px", border: `1px solid ${INK}06` }}>
                <div className="flex items-center justify-center mb-5" style={{ backgroundColor: x.bg, borderRadius: "12px", width: 52, height: 52 }}>
                  {ICONS[x.name] ? ICONS[x.name]({ size: 24, color: "white" }) : <span className="text-white font-mono font-bold text-sm">{x.name[0]}</span>}
                </div>
                <p className="font-semibold text-lg" style={{ color: INK }}>{x.name}</p>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: MUTED }}>{x.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   CTA — Dark, aspirational
   ═══════════════════════════════════════════ */

function CTASection() {
  return (
    <section className="relative py-32 md:py-44 overflow-hidden" style={{ backgroundColor: NAVY }}>
      <div className="absolute inset-0 opacity-20">
        <DitheringShader shape="ripple" type="8x8" colorBack="#0B1226" colorFront="#FF6B6B" width={1920} height={1080} pxSize={5} speed={0.3} style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} />
      </div>

      <div className="relative z-10 text-center px-8 max-w-3xl mx-auto">
        <Reveal>
          <h2 className="leading-[0.95] tracking-[-0.03em] text-white" style={{ fontFamily: serif, fontSize: "clamp(2.8rem, 5.5vw, 5rem)" }}>
            Ready to find talent<br />
            <span style={{ fontStyle: "italic", color: CORAL }}>before they apply?</span>
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-6 text-lg max-w-lg mx-auto leading-relaxed" style={{ color: `${WHITE}60` }}>
            Join the recruiters who source, score, and engage the best passive
            talent \u2014 all in real time, powered by AI.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <PixelBtn href="/" variant="coral" size="lg">Launch Dashboard &rarr;</PixelBtn>
            <PixelBtn href="#demo" variant="white" size="lg">Watch Demo</PixelBtn>
          </div>
        </Reveal>
        <Reveal delay={400}>
          <p className="mt-8 font-mono text-xs uppercase tracking-wider" style={{ color: `${WHITE}25` }}>
            Free to try &middot; No credit card required
          </p>
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
    <footer className="py-16" style={{ backgroundColor: CREAM, borderTop: `1px solid ${INK}06` }}>
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div>
            <span className="font-mono font-bold text-xl tracking-tight" style={{ color: CORAL }}>
              PTI<span style={{ color: INK }}>.</span>
            </span>
            <p className="mt-2 text-sm max-w-xs" style={{ color: MUTED }}>
              Passive Talent Intelligence \u2014 AI-powered sourcing that finds the candidates who never apply.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: INK }}>Product</p>
              <div className="space-y-2">
                {["Features", "Pipeline", "Demo", "Stack"].map(link => (
                  <a key={link} href={`#${link.toLowerCase()}`} className="block text-sm transition-colors hover:text-[#1a1a2e]" style={{ color: MUTED }}>{link}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: INK }}>Built With</p>
              <div className="space-y-2">
                {["HrFlow.ai", "OpenClaw", "Ollama", "Next.js"].map(link => (
                  <span key={link} className="block text-sm" style={{ color: MUTED }}>{link}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${INK}06` }}>
          <p className="text-sm" style={{ color: `${MUTED}80` }}>Built for HrFlow.ai Hackathon 2026</p>
          <p className="text-sm" style={{ color: `${MUTED}80` }}>Powered by HrFlow.ai & OpenClaw</p>
        </div>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════
   Page
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: WHITE, color: INK }}>
      <Grain />
      <Nav />
      <Hero />
      <MetricsBar />
      <ProblemSection />
      <FeaturesSection />
      <DemoSection />
      <PipelineSection />
      <TestimonialsSection />
      <StackSection />
      <CTASection />
      <Footer />
    </div>
  )
}
