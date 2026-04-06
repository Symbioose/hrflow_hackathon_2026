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
      <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.7)",
          border: "1px solid rgba(0,0,0,0.08)",
          color: "#1a1a2e",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#FF6B6B"; e.currentTarget.style.background = "rgba(255,255,255,0.95)"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.7)"; }}
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* ── Fond spatial ──────────────────────────────────── */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, #0d1a35 0%, #060d1f 60%, #020610 100%)" }} />

      {/* Étoiles */}
      {[
        { top: "8%", left: "12%", size: 2, delay: "0s" },
        { top: "15%", left: "75%", size: 1.5, delay: "1.2s" },
        { top: "25%", left: "30%", size: 1, delay: "0.5s" },
        { top: "60%", left: "88%", size: 2, delay: "2s" },
        { top: "72%", left: "5%", size: 1.5, delay: "0.8s" },
        { top: "85%", left: "55%", size: 1, delay: "1.7s" },
        { top: "40%", left: "92%", size: 2, delay: "0.3s" },
        { top: "5%", left: "48%", size: 1, delay: "2.4s" },
        { top: "90%", left: "22%", size: 1.5, delay: "1s" },
        { top: "50%", left: "18%", size: 1, delay: "3s" },
        { top: "33%", left: "62%", size: 2, delay: "1.5s" },
        { top: "78%", left: "40%", size: 1, delay: "0.7s" },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: s.top, left: s.left,
            width: s.size, height: s.size,
            background: "#fff",
            animation: `twinkling ${2 + i * 0.3}s infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}

      {/* Globe plein écran centré */}
      <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.85 }}>
        <GlobeEarth size={680} />
      </div>

      {/* Overlay sombre pour lisibilité */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(6,13,31,0.1) 30%, rgba(6,13,31,0.65) 100%)" }} />

      {/* Bouton retour */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-medium transition-all z-20"
        style={{ color: "rgba(255,255,255,0.45)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#fff")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.45)")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Retour
      </button>

      {/* Logo */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
        <span style={{ fontSize: 18 }}>🦞</span>
        <span className="text-sm font-bold text-white">Claw<span style={{ color: "#FF6B6B" }}>4HR</span></span>
      </div>

      {/* ── Bulle translucide centrée ─────────────────────── */}
      <div
        className="relative z-10 w-full mx-4 flex flex-col gap-6"
        style={{
          maxWidth: 420,
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: 24,
          padding: "36px 40px",
          boxShadow: "0 8px 48px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.8) inset",
        }}
      >
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: "#1a1a2e" }}>
            {mode === "login" ? "Bon retour 👋" : "Créer un compte"}
          </h1>
          <p className="text-xs" style={{ color: "#6b7280" }}>
            {mode === "login"
              ? "Connectez-vous pour accéder à votre espace."
              : "Accès restreint — un token est requis."}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-xl p-1" style={{ background: "rgba(0,0,0,0.05)" }}>
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#1a1a2e" : "#9ca3af",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {m === "login" ? "Se connecter" : "Créer un compte"}
            </button>
          ))}
        </div>

        {/* Form */}
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@entreprise.com" />
            <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            {error && <p className="text-xs px-3 py-2.5 rounded-xl" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>{error}</p>}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#FF6B6B", color: "#fff", boxShadow: "0 2px 12px rgba(255,107,107,0.3)" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#e85555"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FF6B6B"; }}
            >
              {loading ? "Connexion…" : "Se connecter →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
            <Input label="Token d'accès" value={token} onChange={setToken} placeholder="akaten-xxxx" hint="Demandez votre token à l'équipe Claw4HR" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nom complet" value={name} onChange={setName} placeholder="Jean Dupont" />
              <Input label="Entreprise" value={company} onChange={setCompany} placeholder="Acme Corp" />
            </div>
            <Input label="Email professionnel" type="email" value={email} onChange={setEmail} placeholder="vous@entreprise.com" />
            <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="8 caractères minimum" />
            {error && <p className="text-xs px-3 py-2.5 rounded-xl" style={{ background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}>{error}</p>}
            <button
              type="submit"
              disabled={loading || !token || !name || !company || !email || !password}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#FF6B6B", color: "#fff", boxShadow: "0 2px 12px rgba(255,107,107,0.3)" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#e85555"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FF6B6B"; }}
            >
              {loading ? "Création…" : "Créer mon compte →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
