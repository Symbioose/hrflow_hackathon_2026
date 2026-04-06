import type { SourcedProfile } from "@/app/lib/types";

/**
 * Demo profiles for "Lead Data Scientist, expert Python et ML, 5+ ans d'expérience en production, basé Paris"
 * Mix: 5 LinkedIn + 3 GitHub. Senior practitioners (not founders/researchers).
 * Used as demo fallback when OpenClaw is not available.
 */
export const DEMO_PROFILES: SourcedProfile[] = [
  // ─── LinkedIn ──────────────────────────────────────────────────
  {
    key: "demo-lina-faik",
    name: "Lina Faik",
    title: "Senior ML Engineer & Data Scientist — Freelance",
    location: "Paris, Île-de-France",
    experience_years: 6,
    summary: "Senior ML Engineer & Data Scientist freelance, ex-Dataiku. Intervient chez des grands comptes (L'Oréal, Décathlon) sur des projets ML end-to-end : LLMs, Graph Neural Networks, modèles de classification et de recommandation. Auteure technique sur Medium (Towards Data Science) et sur le blog Dataiku. Forte culture du déploiement en production et de la transmission.",
    sources: [{ type: "linkedin", url: "https://www.linkedin.com/in/lina-faik/", label: "linkedin.com/in/lina-faik" }],
    skills: ["Python", "Machine Learning", "LLMs", "Graph Neural Networks", "NLP", "MLflow", "PyTorch", "FastAPI", "scikit-learn", "SQL"],
    experiences: [
      {
        title: "Senior ML Engineer & Data Scientist",
        company: "Data Impulz (Freelance)",
        location: "Paris",
        period: "2022 — Présent",
        description: "Missions ML longue durée chez L'Oréal et Décathlon : développement de modèles de recommandation, fine-tuning de LLMs, pipelines de traitement de données à grande échelle. Rédaction d'articles techniques publiés sur Towards Data Science et le blog Dataiku.",
      },
      {
        title: "Data Scientist",
        company: "Dataiku",
        location: "Paris",
        period: "2019 — 2022",
        description: "Data Scientist et technical writer chez Dataiku. Développement de solutions ML sur la plateforme, accompagnement clients, contributions au blog officiel sur des sujets LLM, Graph Neural Networks et ML industriel.",
      },
    ],
    educations: [
      { degree: "Diplôme d'ingénieur", school: "École des Ponts ParisTech", period: "2016 — 2019" },
    ],
    hrflow_score: 94,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
  {
    key: "demo-thomas-leroy",
    name: "Thomas Leroy",
    title: "Senior ML Engineer — Doctolib",
    location: "Paris, Île-de-France",
    experience_years: 6,
    summary: "ML Engineer Senior chez Doctolib, responsable des modèles de traitement automatique du langage médical (extraction d'entités, classification de motifs de consultation). Expert en déploiement de modèles sur infrastructure critique avec des contraintes fortes de latence et de conformité RGPD/HDS. Ancien chez Ekimetrics.",
    sources: [{ type: "linkedin", url: "https://www.linkedin.com/in/thomas-leroy-mleng/", label: "linkedin.com/in/thomas-leroy-mleng" }],
    skills: ["Python", "NLP", "HuggingFace Transformers", "FastAPI", "Docker", "Kubernetes", "PostgreSQL", "scikit-learn", "BERT", "MLOps"],
    experiences: [
      {
        title: "Senior ML Engineer",
        company: "Doctolib",
        location: "Paris",
        period: "2022 — Présent",
        description: "Développement de modèles NLP pour l'extraction automatique d'informations médicales (CIM-10, motifs de consultation). Déploiement via FastAPI sur infrastructure HDS. Contrainte de latence < 200ms. Fine-tuning de CamemBERT sur données médicales anonymisées.",
      },
      {
        title: "Data Scientist",
        company: "Ekimetrics",
        location: "Paris",
        period: "2019 — 2022",
        description: "Consulting data science pour grands comptes (LVMH, L'Oréal, Danone). Modèles de Marketing Mix Modeling, attribution multi-touch, forecasting. Python, R, Spark.",
      },
    ],
    educations: [
      { degree: "Diplôme d'ingénieur — Spécialité Data Science", school: "Télécom Paris", period: "2016 — 2019" },
    ],
    hrflow_score: 88,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
  {
    key: "demo-marie-duplessis",
    name: "Marie Duplessis",
    title: "Lead Data Scientist — BlaBlaCar",
    location: "Paris, Île-de-France",
    experience_years: 8,
    summary: "Lead Data Scientist chez BlaBlaCar sur les problématiques de matching conducteur-passager, pricing dynamique et détection de fraude. 8 ans d'expérience en ML appliqué à des plateformes marketplaces à fort volume. Ancienne chez Meero et la SNCF. Forte expertise en feature engineering et modèles de séries temporelles.",
    sources: [{ type: "linkedin", url: "https://www.linkedin.com/in/marie-duplessis-ds/", label: "linkedin.com/in/marie-duplessis-ds" }],
    skills: ["Python", "XGBoost", "LightGBM", "Spark", "Airflow", "MLflow", "Time Series", "SQL", "Fraud Detection", "Pricing"],
    experiences: [
      {
        title: "Lead Data Scientist",
        company: "BlaBlaCar",
        location: "Paris",
        period: "2021 — Présent",
        description: "Lead de l'équipe ML Trust & Safety (fraude, bad actors). Modèles de scoring de confiance sur 100M+ profils. Réduction de 35% des incidents de fraude via ensemble methods. Stack : Python, LightGBM, Spark, Airflow.",
      },
      {
        title: "Senior Data Scientist",
        company: "Meero",
        location: "Paris",
        period: "2019 — 2021",
        description: "Algorithmes de matching photographe-client et pricing dynamique. Computer vision pour la qualité des photos. Forte contrainte de scalabilité (200k+ photos/jour).",
      },
      {
        title: "Data Scientist",
        company: "SNCF Connect & Tech",
        location: "Paris",
        period: "2016 — 2019",
        description: "Modèles de forecasting de la demande et optimisation des prix. Premier projet ML en production à large échelle.",
      },
    ],
    educations: [
      { degree: "MSc Statistiques & Machine Learning", school: "ENSAE Paris", period: "2014 — 2016" },
      { degree: "Licence Mathématiques Appliquées", school: "Université Paris-Dauphine", period: "2011 — 2014" },
    ],
    hrflow_score: 83,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
  {
    key: "demo-antoine-marchand",
    name: "Antoine Marchand",
    title: "Senior Data Scientist — Leboncoin",
    location: "Paris, Île-de-France",
    experience_years: 5,
    summary: "Senior Data Scientist chez Leboncoin sur les systèmes de recommendation et la personnalisation du feed. Spécialisé en NLP pour la classification automatique d'annonces et la détection de contenus inappropriés. 5 ans d'expérience post-école avec une progression rapide vers des sujets ML complexes. Ancien consultant chez Quantmetry.",
    sources: [{ type: "linkedin", url: "https://www.linkedin.com/in/antoine-marchand-leboncoin/", label: "linkedin.com/in/antoine-marchand-leboncoin" }],
    skills: ["Python", "PyTorch", "NLP", "Recommendation Systems", "Elasticsearch", "FastAPI", "scikit-learn", "SQL", "GCP", "dbt"],
    experiences: [
      {
        title: "Senior Data Scientist",
        company: "Leboncoin",
        location: "Paris",
        period: "2022 — Présent",
        description: "Système de recommendation d'annonces (collaborative filtering + content-based). Modèle NLP de classification automatique dans 800+ catégories. Détection de contenus frauduleux avec BERT fine-tuné sur données internes.",
      },
      {
        title: "Data Scientist",
        company: "Quantmetry",
        location: "Paris",
        period: "2019 — 2022",
        description: "Consulting ML pour secteur financier et assurance. Modèles de scoring crédit, détection d'anomalies, NLP sur contrats. Livraison de projets end-to-end.",
      },
    ],
    educations: [
      { degree: "MSc Intelligence Artificielle", school: "Université Paris-Saclay (M2 IASD)", period: "2018 — 2019" },
      { degree: "Diplôme d'ingénieur", school: "CentraleSupélec", period: "2015 — 2018" },
    ],
    hrflow_score: 76,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
  {
    key: "demo-sarah-cohen",
    name: "Sarah Cohen",
    title: "ML Engineer — Contentsquare",
    location: "Paris, Île-de-France",
    experience_years: 5,
    summary: "ML Engineer chez Contentsquare sur l'analyse comportementale et la détection d'anomalies UX. Expérience solide en computer vision et traitement de flux de données temps réel (Kafka, Flink). Background mathématique fort (ENS). Appréciée pour sa capacité à passer rapidement de la recherche à la production.",
    sources: [{ type: "linkedin", url: "https://www.linkedin.com/in/sarah-cohen-mleng-paris/", label: "linkedin.com/in/sarah-cohen-mleng-paris" }],
    skills: ["Python", "PyTorch", "Computer Vision", "Kafka", "Flink", "FastAPI", "Anomaly Detection", "AWS", "Terraform"],
    experiences: [
      {
        title: "ML Engineer",
        company: "Contentsquare",
        location: "Paris",
        period: "2021 — Présent",
        description: "Modèles de détection d'anomalies comportementales sur flux temps réel (50k events/sec). Computer vision pour l'analyse automatique de screenshots d'interfaces. Déploiement sur AWS EKS.",
      },
      {
        title: "Research Engineer",
        company: "Inria Paris",
        location: "Paris",
        period: "2019 — 2021",
        description: "Ingénieure de recherche sur des projets de vision par ordinateur. Implémentation d'architectures SOTA, participation à des publications NeurIPS et ICCV.",
      },
    ],
    educations: [
      { degree: "MSc Machine Learning (MVA)", school: "ENS Paris-Saclay", period: "2017 — 2019" },
    ],
    hrflow_score: 70,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },

  // ─── GitHub ────────────────────────────────────────────────────
  {
    key: "demo-lucas-moreau",
    name: "Lucas Moreau",
    title: "Senior ML Engineer — Dataiku",
    location: "Paris, Île-de-France",
    experience_years: 6,
    summary: "ML Engineer Senior chez Dataiku, spécialisé dans l'industrialisation de pipelines ML et l'intégration de LLMs dans des workflows d'entreprise. Contributeur actif open source (plugins Dataiku, LangChain tools). GitHub avec 40+ repos publics — projets personnels sur RAG, fine-tuning et évaluation de modèles.",
    sources: [
      { type: "github", url: "https://github.com/lmoreau-ml", label: "github.com/lmoreau-ml" },
      { type: "linkedin", url: "https://www.linkedin.com/in/lucas-moreau-ml/", label: "linkedin.com/in/lucas-moreau-ml" },
    ],
    skills: ["Python", "LangChain", "MLflow", "LLMs", "RAG", "Kubernetes", "Terraform", "SQL", "Dataiku", "OpenAI API"],
    experiences: [
      {
        title: "Senior ML Engineer",
        company: "Dataiku",
        location: "Paris",
        period: "2021 — Présent",
        description: "Développement de plugins ML pour la plateforme Dataiku (Python, LLMs). Intégration de pipelines LangChain pour des clients enterprise. Speaker aux Dataiku Everyday AI Conferences. Repo open source : dataiku-langchain-tools (380 ★).",
      },
      {
        title: "Data Scientist",
        company: "Deezer",
        location: "Paris",
        period: "2018 — 2021",
        description: "Systèmes de recommendation musicale (collaborative filtering, audio features). Expérimentation A/B à grande échelle. Traitement audio avec librosa et PyTorch.",
      },
    ],
    educations: [
      { degree: "MSc Data Science", school: "EPITA", period: "2016 — 2018" },
      { degree: "Licence Informatique", school: "Université Paris-Est Créteil", period: "2013 — 2016" },
    ],
    hrflow_score: 79,
    hrflow_key: null,
    avatar_color: "#1f2937",
  },
  {
    key: "demo-remi-gautier",
    name: "Rémi Gautier",
    title: "ML Research Engineer — Owkin",
    location: "Paris, Île-de-France",
    experience_years: 5,
    summary: "ML Research Engineer chez Owkin (IA pour la recherche médicale) avec un fort profil mathématique. Expertise en apprentissage fédéré et computer vision appliquée à l'histologie. GitHub actif avec des projets personnels sur la distillation de modèles et l'interprétabilité (SHAP, LIME). Profil rare : rigueur recherche + delivery production.",
    sources: [
      { type: "github", url: "https://github.com/rgautier-ml", label: "github.com/rgautier-ml" },
    ],
    skills: ["Python", "PyTorch", "Federated Learning", "Computer Vision", "SHAP", "scikit-learn", "Docker", "Git", "NumPy", "Pandas"],
    experiences: [
      {
        title: "ML Research Engineer",
        company: "Owkin",
        location: "Paris",
        period: "2022 — Présent",
        description: "Développement de modèles de computer vision pour l'analyse de lames histologiques (détection de tumeurs). Architecture d'apprentissage fédéré sur des données hospitalières multi-sites. Co-auteur de 2 publications (Nature Methods, MICCAI).",
      },
      {
        title: "ML Engineer",
        company: "Shift Technology",
        location: "Paris",
        period: "2019 — 2022",
        description: "Modèles de détection de fraude assurance (réseau de neurones sur graphes, GNN). Traitement de données hétérogènes (texte + structuré). Fort impact business : 12M€ de fraude détectée en 2021.",
      },
    ],
    educations: [
      { degree: "MSc Mathématiques, Vision, Apprentissage (MVA)", school: "ENS Paris-Saclay", period: "2017 — 2019" },
      { degree: "Licence Mathématiques", school: "Université Pierre et Marie Curie (Sorbonne)", period: "2014 — 2017" },
    ],
    hrflow_score: 73,
    hrflow_key: null,
    avatar_color: "#1f2937",
  },
  {
    key: "demo-emma-bernard",
    name: "Emma Bernard",
    title: "Senior Data Scientist — ManoMano",
    location: "Paris, Île-de-France",
    experience_years: 5,
    summary: "Senior Data Scientist chez ManoMano (marketplace bricolage & jardinage) sur la search et le ranking de produits. Spécialisée en NLP et retrieval augmenté pour l'e-commerce. GitHub avec des projets sur semantic search et embeddings. Profil e-commerce très recherché : maîtrise des métriques business (GMV, CTR, conversion) autant que des métriques ML.",
    sources: [
      { type: "github", url: "https://github.com/emmabernard-ds", label: "github.com/emmabernard-ds" },
      { type: "linkedin", url: "https://www.linkedin.com/in/emma-bernard-datascientist/", label: "linkedin.com/in/emma-bernard-datascientist" },
    ],
    skills: ["Python", "NLP", "Elasticsearch", "Sentence Transformers", "PyTorch", "Airflow", "dbt", "BigQuery", "A/B Testing", "Semantic Search"],
    experiences: [
      {
        title: "Senior Data Scientist — Search & Ranking",
        company: "ManoMano",
        location: "Paris",
        period: "2021 — Présent",
        description: "Refonte du moteur de recherche produit (passage BM25 → dense retrieval avec Sentence Transformers). +22% de taux de conversion sur la search. Fine-tuning de modèles d'embedding sur catalogue propriétaire (3M+ produits). Stack : Python, Elasticsearch, Airflow, BigQuery.",
      },
      {
        title: "Data Scientist",
        company: "Cdiscount",
        location: "Bordeaux",
        period: "2019 — 2021",
        description: "Systèmes de recommendation produit, personnalisation des emails transactionnels. Premiers modèles NLP pour la classification du catalogue.",
      },
    ],
    educations: [
      { degree: "MSc Machine Learning & Data Mining", school: "Mines Saint-Étienne", period: "2017 — 2019" },
    ],
    hrflow_score: 65,
    hrflow_key: null,
    avatar_color: "#1f2937",
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
