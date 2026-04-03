"use client"

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react"
import { DitheringShader } from "@/components/ui/dithering-shader"
import dynamic from "next/dynamic"
const GlobeCanvas = dynamic(() => import("@/components/ui/globe"), { ssr: false })

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
          Claw4HR
        </a>
        <div
          className="hidden md:flex items-center gap-10 text-sm font-mono uppercase tracking-widest"
          style={{ color: MUTED, fontSize: "11px" }}
        >
          <a href="#features" className="hover:text-[#1a1a2e] transition-colors">Fonctionnalités</a>
          <a href="#demo" className="hover:text-[#1a1a2e] transition-colors">Démo</a>
        </div>
        <div className="flex items-center gap-3">
          <PixelBtn href="#demo" variant="outline" size="sm">Voir la Démo</PixelBtn>
          <PixelBtn href="#demo" variant="coral" size="sm">Demander une démo &rarr;</PixelBtn>
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
            Hackathon HrFlow.ai 2026
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
            <span className="block leading-[0.92] tracking-[-0.03em]" style={{ fontFamily: serif, fontSize: "clamp(3rem, 6.5vw, 6rem)", color: INK }}>
              Arrêtez de chercher.
            </span>
            <span className="block leading-[0.92] tracking-[-0.03em] mt-2" style={{ fontFamily: serif, fontSize: "clamp(3rem, 6.5vw, 6rem)", color: INK }}>
              Commencez à <span style={{ color: CORAL, fontStyle: "italic" }}>trouver.</span>
            </span>
          </h1>

          <p className="mt-8 text-xl leading-relaxed max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "both", color: MUTED }}>
            Un agent IA qui découvre, enrichit et évalue les meilleurs talents passifs sur GitHub, LinkedIn et Indeed — en temps réel.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap animate-fade-in-up" style={{ animationDelay: "0.7s", animationFillMode: "both" }}>
            <PixelBtn href="#demo" variant="coral" size="lg">Demander une démo &rarr;</PixelBtn>
            <PixelBtn href="#demo" variant="outline" size="lg">Voir la Démo</PixelBtn>
          </div>

        </div>

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
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Metrics — Animated counters
   ═══════════════════════════════════════════ */

function MetricsBar() {
  const metrics = [
    { value: 10000, suffix: "+", label: "Profils indexés" },
    { value: 3, suffix: "+", label: "Sources de données" },
    { value: 5, prefix: "<", suffix: "s", label: "Temps de réponse" },
    { value: 94, suffix: "%", label: "Précision du matching" },
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
   Feature Visuals — BIGGER, richer
   ═══════════════════════════════════════════ */

function SourcesVisual() {
  const sources = [
    { name: "GitHub", letter: "GH", sub: "Repos & activité développeur", bg: "#24292e", count: "2.4k profils" },
    { name: "LinkedIn", letter: "in", sub: "Profils professionnels", bg: "#0A66C2", count: "5.1k profils" },
    { name: "Indeed", letter: "IN", sub: "Candidatures", bg: "#2164F3", count: "1.8k profils" },
    { name: "HrFlow", letter: "H", sub: "CVs indexés", bg: CORAL, count: "10k+ profils" },
  ]
  return (
    <div className="w-full" style={{ backgroundColor: CREAM, borderRadius: "16px", border: `1px solid ${INK}06`, overflow: "hidden" }}>
      {/* Header bar */}
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
      {/* Sources grid */}
      <div className="p-6 grid grid-cols-2 gap-4">
        {sources.map((s) => (
          <div key={s.name} className="p-5 transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: WHITE, borderRadius: "12px", border: `1px solid ${INK}06` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 flex items-center justify-center text-white font-mono font-bold text-sm" style={{ backgroundColor: s.bg, borderRadius: "10px" }}>{s.letter}</div>
              <span className="text-[10px] font-mono" style={{ color: MUTED }}>{s.count}</span>
            </div>
            <p className="font-semibold text-sm" style={{ color: INK }}>{s.name}</p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>{s.sub}</p>
          </div>
        ))}
      </div>
      {/* Bottom: converging indicator */}
      <div className="px-8 py-4 flex items-center gap-3" style={{ backgroundColor: `${CORAL}06`, borderTop: `1px solid ${INK}06` }}>
        <div className="flex -space-x-2">
          {["#24292e", "#0A66C2", "#2164F3", CORAL].map((c, i) => (
            <div key={i} className="w-6 h-6 flex items-center justify-center text-white text-[8px] font-bold border-2 border-white" style={{ backgroundColor: c, borderRadius: "50%" }}>
              {["GH", "in", "IN", "H"][i]}
            </div>
          ))}
        </div>
        <span className="text-xs" style={{ color: MUTED }}>Toutes les sources convergent en un seul pipeline classé</span>
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
          <div className="text-sm" style={{ color: MUTED }}>Ingénieure ML Senior &middot; Paris &middot; 7 ans d'exp.</div>
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
            { label: "Forces", color: SUCCESS, items: ["Expert Python — 8 ans", "ML / Deep Learning"] },
            { label: "Faiblesses", color: CORAL, items: ["Pas d'exp. frontend"] },
            { label: "Opportunités", color: "#3b82f6", items: ["Ouvert au CDI", "Paris"] },
            { label: "Menaces", color: "#f59e0b", items: ["Forte demande marché"] },
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
    { letter: "X", name: "X-Ray", desc: "Découvrir les profils", status: "Fait", color: SUCCESS },
    { letter: "E", name: "Enrich", desc: "Ajouter le contexte", status: "Fait", color: SUCCESS },
    { letter: "I", name: "Index", desc: "Structurer les données", status: "En cours", color: "#3b82f6" },
    { letter: "S", name: "Score", desc: "Classer les candidats", status: "En attente", color: MUTED },
  ]
  return (
    <div className="w-full" style={{ backgroundColor: CREAM, borderRadius: "16px", border: `1px solid ${INK}06`, overflow: "hidden" }}>
      {/* Status bar */}
      <div className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${INK}06` }}>
        <span className="font-mono text-xs uppercase tracking-wider" style={{ color: MUTED }}>Statut du Pipeline</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 animate-pulse" style={{ backgroundColor: "#3b82f6", borderRadius: "50%" }} />
          <span className="font-mono text-xs" style={{ color: "#3b82f6" }}>Traitement de 12 profils...</span>
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
                {s.status === "En cours" && <div className="w-1.5 h-1.5 animate-pulse" style={{ backgroundColor: s.color, borderRadius: "50%" }} />}
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

/* ═══════════════════════════════════════════
   Features — Full-width visuals, stacked
   ═══════════════════════════════════════════ */

const features = [
  {
    num: "01",
    tag: "Multi-Source",
    title: "Cherchez partout.\nTrouvez n'importe qui.",
    desc: "Interrogez GitHub, LinkedIn, Indeed et plus de 10 000 profils indexés simultanément. Notre agent IA se connecte à toutes les sources de talents.",
    visual: <SourcesVisual />,
    bg: CREAM,
  },
  {
    num: "02",
    tag: "AI Scoring",
    title: "Chaque candidat.\nClassé & expliqué.",
    desc: "L'algorithme propriétaire de HrFlow.ai note chaque candidat de 0 à 100%. L'analyse SWOT rend chaque match transparent — forces, lacunes et raisonnement.",
    visual: <ScoreVisual />,
    bg: WHITE,
  },
  {
    num: "03",
    tag: "Pipeline JIT",
    title: "Quatre étapes.\nZéro travail manuel.",
    desc: "De la découverte au contact — X-Ray, Enrich, Index, Score. Chaque étape s'exécute en temps réel dès qu'un talent est détecté.",
    visual: <PipelineFlowVisual />,
    bg: CREAM,
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
            <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: CORAL }}>Voyez-le en Action</p>
            <h2 className="leading-[1.05] tracking-[-0.02em] text-white" style={{ fontFamily: serif, fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}>
              De la description de poste aux <span style={{ fontStyle: "italic", color: CORAL }}>candidats classés</span> en quelques secondes.
            </h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: `${WHITE}60` }}>
              Regardez comment Claw4HR transforme une simple description de poste en un pipeline de candidats scorés, enrichis et prêts à contacter.
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

            {/* TODO: remplacer par la vraie vidéo (tag <video> ou embed YouTube/Vimeo) */}
            {/* Play button */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: CORAL, borderRadius: "50%", boxShadow: `0 0 0 16px ${CORAL}15, 0 0 0 32px ${CORAL}08` }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <polygon points="9,5 20,12 9,19" />
                </svg>
              </div>
              <span className="font-mono text-xs uppercase tracking-wider" style={{ color: `${WHITE}50` }}>Regarder la démo de 2 min</span>
            </div>
          </div>
        </Reveal>


      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Stack / Integrations
   ═══════════════════════════════════════════ */

function StackSection() {
  const items = [
    { name: "HrFlow.ai", desc: "Parsing CV, indexation & moteur de scoring IA", letter: "H", bg: CORAL },
    { name: "OpenClaw", desc: "Orchestration multi-agents & bot Telegram", letter: "O", bg: "#7C3AED" },
    { name: "GitHub", desc: "Activité développeur & analyse de repos", letter: "GH", bg: "#24292e" },
    { name: "LinkedIn", desc: "Enrichissement de profils professionnels", letter: "in", bg: "#0A66C2" },
    { name: "Indeed", desc: "Scraping job boards & découverte de candidats", letter: "IN", bg: "#2164F3" },
    { name: "Ollama", desc: "Inférence LLM locale — Qwen3 14B", letter: "Q", bg: "#10b981" },
  ]

  return (
    <section id="stack" className="py-28 md:py-36" style={{ backgroundColor: WHITE }}>
      <div className="mx-auto max-w-7xl px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: CORAL }}>Integrations</p>
            <h2 className="leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: serif, fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", color: INK }}>
              Construit sur <span style={{ color: CORAL, fontStyle: "italic" }}>les meilleurs.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: MUTED }}>
              Claw4HR connecte les meilleurs outils de recrutement, d'IA et de plateformes développeur en un seul pipeline.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-5">
          {items.map((x, i) => (
            <Reveal key={x.name} delay={i * 60}>
              <div className="p-7 transition-all duration-200 hover:-translate-y-1" style={{ backgroundColor: CREAM, borderRadius: "14px", border: `1px solid ${INK}06` }}>
                <div className="w-13 h-13 flex items-center justify-center text-white font-mono font-bold text-sm mb-5" style={{ backgroundColor: x.bg, borderRadius: "12px", width: 52, height: 52 }}>{x.letter}</div>
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
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <GlobeCanvas />
      </div>

      <div className="relative z-10 text-center px-8 max-w-3xl mx-auto">
        <Reveal>
          <h2 className="leading-[0.95] tracking-[-0.03em] text-white" style={{ fontFamily: serif, fontSize: "clamp(2.8rem, 5.5vw, 5rem)" }}>
            Prêt à trouver les talents<br />
            <span style={{ fontStyle: "italic", color: CORAL }}>avant qu'ils ne postulent ?</span>
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="mt-6 text-lg max-w-lg mx-auto leading-relaxed" style={{ color: `${WHITE}60` }}>
            Rejoignez les recruteurs qui sourcent, scorent et engagent les meilleurs talents passifs — en temps réel, propulsé par l'IA.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <PixelBtn href="#demo" variant="coral" size="lg">Demander une démo &rarr;</PixelBtn>
            <PixelBtn href="mailto:contact@claw4hr.ai" variant="white" size="lg">Contacter l'équipe</PixelBtn>
          </div>
        </Reveal>
        <Reveal delay={400}>
          <p className="mt-8 font-mono text-xs uppercase tracking-wider" style={{ color: `${WHITE}25` }}>
            Sur invitation &middot; Démo personnalisée disponible
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   FAQ — Accordion
   ═══════════════════════════════════════════ */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="cursor-pointer transition-all duration-200"
      style={{ borderBottom: `1px solid ${INK}08` }}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between py-6 px-2">
        <h3 className="font-semibold text-base pr-8" style={{ color: INK }}>{q}</h3>
        <div
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center transition-transform duration-300"
          style={{ backgroundColor: open ? `${CORAL}10` : `${INK}05`, borderRadius: "8px", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={open ? CORAL : MUTED} strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14" /><path d="M5 12h14" />
          </svg>
        </div>
      </div>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "200px" : "0px", opacity: open ? 1 : 0 }}
      >
        <p className="px-2 pb-6 text-sm leading-relaxed" style={{ color: MUTED }}>{a}</p>
      </div>
    </div>
  )
}

function FAQSection() {
  const faqs = [
    { q: "Comment Claw4HR trouve-t-il les talents passifs ?", a: "Claw4HR utilise des agents IA pour rechercher simultanément sur GitHub, LinkedIn, Indeed et notre base de plus de 10 000 CVs indexés. Il découvre les talents qui ne postulent jamais sur les job boards." },
    { q: "Qu'est-ce que l'analyse SWOT par candidat ?", a: "Chaque candidat reçoit une analyse Forces, Faiblesses, Opportunités et Menaces générée par l'IA. Cela donne aux recruteurs un raisonnement transparent derrière chaque score de matching — pas juste un chiffre." },
    { q: "Quelle est la rapidité des résultats ?", a: "La plupart des recherches retournent des candidats classés en moins de 5 secondes. Le pipeline JIT traite chaque candidat en temps réel — aucune base de données obsolète, aucun traitement différé." },
    { q: "Puis-je rechercher en langage naturel ?", a: "Oui. Décrivez simplement le profil dont vous avez besoin — 'Développeur Python senior à Paris avec de l'expérience en ML' — et l'agent IA analyse votre intention et recherche intelligemment sur toutes les sources." },
  ]

  return (
    <section className="py-28 md:py-36" style={{ backgroundColor: WHITE }}>
      <div className="mx-auto max-w-3xl px-8">
        <Reveal>
          <div className="text-center mb-14">
            <p className="font-mono text-xs uppercase tracking-[0.2em] mb-5" style={{ color: CORAL }}>FAQ</p>
            <h2 className="leading-[1.05] tracking-[-0.02em]" style={{ fontFamily: serif, fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)", color: INK }}>
              Vos questions, <span style={{ color: CORAL, fontStyle: "italic" }}>nos réponses.</span>
            </h2>
          </div>
        </Reveal>
        <div>
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 50}>
              <FAQItem q={faq.q} a={faq.a} />
            </Reveal>
          ))}
        </div>
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
              Claw4HR
            </span>
            <p className="mt-2 text-sm max-w-xs" style={{ color: MUTED }}>
              Intelligence de Talents Passifs — Sourcing IA qui trouve les candidats qui ne postulent jamais.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: INK }}>Produit</p>
              <div className="space-y-2">
                {[{label: "Fonctionnalités", href: "features"}, {label: "Démo", href: "demo"}, {label: "Stack", href: "stack"}].map(link => (
                  <a key={link.href} href={`#${link.href}`} className="block text-sm transition-colors hover:text-[#1a1a2e]" style={{ color: MUTED }}>{link.label}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: INK }}>Construit avec</p>
              <div className="space-y-2">
                {["HrFlow.ai", "OpenClaw", "Ollama", "Next.js"].map(link => (
                  <span key={link} className="block text-sm" style={{ color: MUTED }}>{link}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: `1px solid ${INK}06` }}>
          <p className="text-sm" style={{ color: `${MUTED}80` }}>Conçu pour le Hackathon HrFlow.ai 2026</p>
          <p className="text-sm" style={{ color: `${MUTED}80` }}>Propulsé par HrFlow.ai & OpenClaw</p>
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
      <FeaturesSection />
      <DemoSection />
      <StackSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  )
}
