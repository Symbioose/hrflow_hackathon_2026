"use client"

import { useState, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import dynamic from "next/dynamic"
import {
  Globe2,
  BarChart3,
  Zap,
  MessageSquare,
  Search,
  Database,
  Layers,
  Trophy,
} from "lucide-react"

const Globe = dynamic(() => import("@/components/ui/globe"), { ssr: false })

/* ═══════════════════════════════════════════
   Scroll Reveal Helper
   ═══════════════════════════════════════════ */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={prefersReduced ? { duration: 0 } : { duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   Section 1: Navigation
   ═══════════════════════════════════════════ */

function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-200"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="/landing" className="font-bold text-xl text-slate-900">
          Claw4HR
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5 -translate-y-2" />
        </a>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          <a href="#features" className="hover:text-slate-900 transition-colors">
            Features
          </a>
          <a href="#pipeline" className="hover:text-slate-900 transition-colors">
            How it works
          </a>
          <a href="#integrations" className="hover:text-slate-900 transition-colors">
            Integrations
          </a>
        </div>

        {/* CTA */}
        <a
          href="/"
          className="bg-indigo-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Start Sourcing
        </a>
      </div>
    </nav>
  )
}

/* ═══════════════════════════════════════════
   Section 2: Hero
   ═══════════════════════════════════════════ */

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Globe background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Globe />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <Reveal>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 landing-pulse" />
            AI-Powered Talent Sourcing
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Source talent from
            <br />
            <span className="text-indigo-600">everywhere.</span>
            <br />
            <span className="text-indigo-600">Instantly.</span>
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal delay={0.2}>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mt-6">
            Claw4HR connects to GitHub, LinkedIn, Indeed and more — finding,
            scoring, and ranking passive candidates in real-time with AI.
          </p>
        </Reveal>

        {/* CTA row */}
        <Reveal delay={0.3}>
          <div className="flex gap-4 justify-center mt-10 flex-wrap">
            <a
              href="/"
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/25"
            >
              Start Sourcing
            </a>
            <a
              href="#pipeline"
              className="border-2 border-slate-200 px-8 py-3.5 rounded-xl font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
            >
              See How It Works
            </a>
          </div>
        </Reveal>

        {/* Trust metrics */}
        <Reveal delay={0.4}>
          <div className="flex gap-8 md:gap-12 justify-center mt-16 flex-wrap">
            {[
              { value: "800M+", label: "Profiles Indexed" },
              { value: "6+", label: "Data Sources" },
              { value: "<2min", label: "Time to Results" },
              { value: "GDPR", label: "Compliant" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl font-bold text-slate-900">{item.value}</div>
                <div className="text-sm text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Section 3: Problem Statement
   ═══════════════════════════════════════════ */

function ProblemSection() {
  const stats = [
    {
      number: "13h",
      suffix: "/week",
      desc: "Average time recruiters spend manually sourcing candidates",
    },
    {
      number: "80%",
      suffix: "",
      desc: "Of top candidates are passive — they never apply to job postings",
    },
    {
      number: "<2min",
      suffix: "",
      desc: "Claw4HR's average time to deliver first ranked results",
    },
  ]

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4">
            The Problem
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight max-w-3xl">
            Recruiters spend 80% of their time sourcing. We cut that to zero.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {stats.map((stat, i) => (
            <Reveal key={stat.number} delay={i * 0.1}>
              <div className="bg-slate-50 rounded-2xl p-8 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-indigo-600">
                    {stat.number}
                  </span>
                  {stat.suffix && (
                    <span className="text-lg text-slate-400">{stat.suffix}</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-3">{stat.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Section 4: Features Grid
   ═══════════════════════════════════════════ */

function FeaturesSection() {
  const features = [
    {
      icon: Globe2,
      title: "Multi-Source Intelligence",
      desc: "Search GitHub, LinkedIn, Indeed, and more from a single query. Our AI aggregates profiles across platforms to find talent that never applies.",
    },
    {
      icon: BarChart3,
      title: "AI Scoring & Matching",
      desc: "Every candidate scored 0\u2013100% with SWOT analysis. Not keywords \u2014 real semantic skill understanding powered by HrFlow.ai.",
    },
    {
      icon: Zap,
      title: "Just-in-Time Pipeline",
      desc: "X-Ray, Enrich, Index, Score \u2014 our 4-step pipeline processes candidates in real-time. No stale data, no batch jobs.",
    },
    {
      icon: MessageSquare,
      title: "Natural Language Search",
      desc: "Describe your ideal candidate in plain English. Our NLP engine understands context, intent, and nuance.",
    },
  ]

  return (
    <section id="features" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Everything you need to find the best talent.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.1}>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="text-slate-500 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Section 5: Pipeline (How It Works)
   ═══════════════════════════════════════════ */

function PipelineSection() {
  const steps = [
    {
      num: "01",
      icon: Search,
      title: "X-Ray",
      desc: "Discover passive talent across GitHub, LinkedIn, and Indeed via intelligent web search.",
    },
    {
      num: "02",
      icon: Database,
      title: "Enrich",
      desc: "Complete profiles with public data \u2014 repos, contributions, work history.",
    },
    {
      num: "03",
      icon: Layers,
      title: "Index",
      desc: "Parse and structure with HrFlow.ai into a searchable knowledge base.",
    },
    {
      num: "04",
      icon: Trophy,
      title: "Score",
      desc: "AI scoring 0\u2013100% using semantic skill matching. SWOT analysis included.",
    },
  ]

  return (
    <section id="pipeline" className="bg-slate-900 text-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            From search to shortlist in 4 steps
          </h2>
          <p className="text-slate-400 mt-4 max-w-2xl">
            Our Just-in-Time pipeline processes candidates the moment they are
            discovered. Every step automated, every result ranked.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.1}>
              <div className="relative bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                <span className="text-sm font-mono text-indigo-400 mb-3 block">
                  {step.num}
                </span>
                <step.icon className="w-6 h-6 text-indigo-400 mb-3" />
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-slate-400 mt-2">{step.desc}</p>

                {/* Connector arrow */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600 text-lg">
                    &rarr;
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Section 6: Integrations
   ═══════════════════════════════════════════ */

function IntegrationsSection() {
  const integrations = [
    {
      letter: "H",
      bg: "bg-indigo-500",
      name: "HrFlow.ai",
      desc: "CV parsing, indexing & AI scoring",
    },
    {
      letter: "O",
      bg: "bg-violet-500",
      name: "OpenClaw",
      desc: "AI orchestration & Telegram",
    },
    {
      letter: "GH",
      bg: "bg-slate-800",
      name: "GitHub",
      desc: "Developer profile discovery",
    },
    {
      letter: "in",
      bg: "bg-blue-600",
      name: "LinkedIn",
      desc: "Professional profile enrichment",
    },
    {
      letter: "IN",
      bg: "bg-blue-500",
      name: "Indeed",
      desc: "Job board intelligence",
    },
    {
      letter: "Q",
      bg: "bg-emerald-500",
      name: "Ollama",
      desc: "Local LLM \u2014 Qwen3 14B",
    },
  ]

  return (
    <section id="integrations" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-4">
            Integrations
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Connects to your entire stack
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-16">
          {integrations.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.05}>
              <div className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-3 ${item.bg}`}
                >
                  {item.letter}
                </div>
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Section 7: Final CTA
   ═══════════════════════════════════════════ */

function CTASection() {
  return (
    <section className="relative bg-gradient-to-br from-indigo-600 to-indigo-800 py-24 overflow-hidden">
      {/* Globe silhouette */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Globe />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Start sourcing smarter today
          </h2>
          <p className="text-indigo-200 mt-4 max-w-lg mx-auto">
            Join the next generation of recruiters who let AI do the heavy
            lifting. Source, score, and engage top talent in minutes.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="flex gap-4 justify-center mt-10 flex-wrap">
            <a
              href="/"
              className="bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-50 transition"
            >
              Try Claw4HR
            </a>
            <a
              href="#features"
              className="border border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition"
            >
              View Documentation
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   Section 8: Footer
   ═══════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="border-t border-slate-200 py-12 bg-white">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg text-slate-900">
            Claw4HR
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5 -translate-y-2" />
          </span>
          <span className="text-sm text-slate-500">
            Passive Talent Intelligence
          </span>
        </div>
        <p className="text-sm text-slate-400 text-center md:text-right">
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
    <div className="bg-white text-slate-900">
      <Nav />
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <PipelineSection />
      <IntegrationsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
