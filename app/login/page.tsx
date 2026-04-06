"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import GlobeEarth from "@/components/ui/globe-earth";

type Mode = "login" | "signup";

function Input({
  label, type = "text", value, onChange, placeholder, hint,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9ca3af" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{ background: "#f9fafb", border: "1px solid #e5e7eb", color: "#1a1a2e" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6B6B"; e.currentTarget.style.background = "#fff"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#f9fafb"; }}
      />
      {hint && <p className="text-[11px]" style={{ color: "#9ca3af" }}>{hint}</p>}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Email ou mot de passe incorrect.");
    else router.replace("/dashboard");
    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/validate-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const { valid } = await res.json();
    if (!valid) { setError("Token d'accès invalide."); setLoading(false); return; }
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    if (data.user) await supabase.from("user_profiles").insert({ id: data.user.id, name, company });
    router.replace("/dashboard");
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#fff" }}>

      {/* ── Left: Auth form ─────────────────────────────── */}
      <div
        className="w-full lg:w-[500px] flex-shrink-0 flex flex-col justify-between px-12 py-10"
        style={{ borderRight: "1px solid #f3f4f6" }}
      >
        {/* Top */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-xs font-medium transition-all"
            style={{ color: "#9ca3af" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#1a1a2e")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#9ca3af")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Retour
          </button>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>🦞</span>
            <span className="text-sm font-bold" style={{ color: "#1a1a2e" }}>
              Claw<span style={{ color: "#FF6B6B" }}>4HR</span>
            </span>
          </div>
        </div>

        {/* Middle: form */}
        <div className="flex flex-col gap-7 max-w-sm mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#1a1a2e" }}>
              {mode === "login" ? "Bon retour 👋" : "Créer un compte"}
            </h1>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              {mode === "login"
                ? "Connectez-vous pour accéder à votre espace."
                : "Accès restreint — un token est requis."}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex rounded-xl p-1" style={{ background: "#f3f4f6" }}>
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
                style={{
                  background: mode === m ? "#fff" : "transparent",
                  color: mode === m ? "#1a1a2e" : "#9ca3af",
                  boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {m === "login" ? "Se connecter" : "Créer un compte"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@entreprise.com" />
              <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              {error && (
                <p className="text-xs px-4 py-3 rounded-xl" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#FF6B6B", color: "#fff", boxShadow: "0 2px 12px rgba(255,107,107,0.25)" }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#e85555"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FF6B6B"; }}
              >
                {loading ? "Connexion…" : "Se connecter →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <Input label="Token d'accès" value={token} onChange={setToken} placeholder="akaten-xxxx" hint="Demandez votre token à l'équipe Claw4HR" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nom complet" value={name} onChange={setName} placeholder="Jean Dupont" />
                <Input label="Entreprise" value={company} onChange={setCompany} placeholder="Acme Corp" />
              </div>
              <Input label="Email professionnel" type="email" value={email} onChange={setEmail} placeholder="vous@entreprise.com" />
              <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="8 caractères minimum" />
              {error && (
                <p className="text-xs px-4 py-3 rounded-xl" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !token || !name || !company || !email || !password}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#FF6B6B", color: "#fff", boxShadow: "0 2px 12px rgba(255,107,107,0.25)" }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#e85555"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FF6B6B"; }}
              >
                {loading ? "Création…" : "Créer mon compte →"}
              </button>
            </form>
          )}
        </div>

        {/* Bottom */}
        <p className="text-center text-[11px]" style={{ color: "#d1d5db" }}>
          Claw4HR — Accès restreint aux équipes partenaires
        </p>
      </div>

      {/* ── Right: Globe visual ──────────────────────────── */}
      <div
        className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 60% 40%, #ede9fe 0%, #f5f3ff 35%, #fff1f0 100%)",
        }}
      >
        {/* Grain texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.35'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
          opacity: 0.5,
          mixBlendMode: "multiply",
        }} />
        {/* Glow */}
        <div className="absolute rounded-full" style={{
          width: 480, height: 480,
          background: "radial-gradient(circle, rgba(255,107,107,0.1) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        }} />
        <div className="relative z-10 flex flex-col items-center gap-10">
          <GlobeEarth />
          <div className="text-center">
            <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "#FF6B6B" }}>
              Sourcing mondial
            </p>
            <p className="text-sm max-w-[240px] text-center leading-relaxed" style={{ color: "#9ca3af" }}>
              Accédez aux meilleurs talents sur GitHub, LinkedIn, Reddit et le web ouvert.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
