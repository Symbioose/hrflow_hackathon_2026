"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

type Mode = "login" | "signup";

function ClawLogo() {
  return (
    <div className="flex items-center gap-2.5 justify-center mb-8">
      <span style={{ fontSize: 28 }}>🦞</span>
      <span className="text-2xl font-bold tracking-tight text-white">
        Claw<span style={{ color: "#FF6B6B" }}>4HR</span>
      </span>
    </div>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#FF6B6B")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
      />
      {hint && <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{hint}</p>}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup extra fields
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.replace("/dashboard");
    }
    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate invite token server-side
    const res = await fetch("/api/auth/validate-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const { valid } = await res.json();
    if (!valid) {
      setError("Token d'accès invalide.");
      setLoading(false);
      return;
    }

    // Create account
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Save profile
    if (data.user) {
      await supabase.from("user_profiles").insert({
        id: data.user.id,
        name,
        company,
      });
    }

    router.replace("/dashboard");
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "#0d1117",
        backgroundImage: "radial-gradient(ellipse at 60% 0%, rgba(255,107,107,0.08) 0%, transparent 60%)",
      }}
    >
      <div className="w-full max-w-md">
        <ClawLogo />

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Mode toggle */}
          <div
            className="flex rounded-xl p-1 mb-8"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all"
                style={{
                  background: mode === m ? "#FF6B6B" : "transparent",
                  color: mode === m ? "#fff" : "rgba(255,255,255,0.4)",
                }}
              >
                {m === "login" ? "Se connecter" : "Créer un compte"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@entreprise.com" />
              <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

              {error && (
                <p className="text-xs px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "#FF6B6B",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(255,107,107,0.3)",
                }}
              >
                {loading ? "Connexion…" : "Se connecter →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="flex flex-col gap-5">
              <Input
                label="Token d'accès"
                value={token}
                onChange={setToken}
                placeholder="akaten-xxxx"
                hint="Demandez votre token d'accès à l'équipe Claw4HR"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nom complet" value={name} onChange={setName} placeholder="Jean Dupont" />
                <Input label="Entreprise" value={company} onChange={setCompany} placeholder="Acme Corp" />
              </div>
              <Input label="Email professionnel" type="email" value={email} onChange={setEmail} placeholder="vous@entreprise.com" />
              <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="8 caractères minimum" />

              {error && (
                <p className="text-xs px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !token || !name || !company || !email || !password}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "#FF6B6B",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(255,107,107,0.3)",
                }}
              >
                {loading ? "Création…" : "Créer mon compte →"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.2)" }}>
          Claw4HR — Accès restreint aux équipes partenaires
        </p>
      </div>
    </div>
  );
}
