import type { SourcedProfile } from "@/app/lib/types";

/**
 * Hardcoded demo profiles — used when OpenClaw is not available.
 * These look realistic and impressive for the hackathon jury.
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
        description:
          "Modèles de recommandation publicitaire, A/B testing à grande échelle, pipeline ML en production (100M+ prédictions/jour).",
      },
      {
        title: "Data Scientist",
        company: "BNP Paribas",
        location: "Paris",
        period: "2018 — 2021",
        description:
          "Détection de fraude temps réel, scoring crédit, NLP sur données clients (traitement de 500k emails/mois).",
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
        description:
          "Migration infra vers GCP (zero downtime), mise en place GitOps avec ArgoCD, réduction des coûts cloud de 35%.",
      },
      {
        title: "DevOps Engineer",
        company: "OVHcloud",
        location: "Roubaix",
        period: "2018 — 2022",
        description:
          "Gestion de 200+ clusters Kubernetes, automatisation Terraform, monitoring Prometheus/Grafana pour 500 clients enterprise.",
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
        description:
          "Développement de la marketplace freelance, optimisations performance (LCP -40%), composants design system.",
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
      {
        degree: "Licence Pro Développement Web",
        school: "Université de Bordeaux",
        period: "2017 — 2020",
      },
    ],
    hrflow_score: 65,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
];

/**
 * Streams demo profiles one by one with a staggered delay.
 * Returns a cleanup function to cancel pending timers.
 */
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
