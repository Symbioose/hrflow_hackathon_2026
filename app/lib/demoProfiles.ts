import type { SourcedProfile } from "@/app/lib/types";

/**
 * Real profiles sourced by OpenClaw — "Data Scientist NLP Paris"
 * Used as demo fallback when OpenClaw is not available.
 */
export const DEMO_PROFILES: SourcedProfile[] = [
  {
    key: "demo-marie-meta",
    name: "Marie Lambert",
    title: "AI Research Engineer — NLP & GenAI",
    location: "Paris, France",
    experience_years: 10,
    summary: "Data Scientist spécialisée en NLP et GenAI avec une forte expérience dans les secteurs de la santé et des médias. Elle a conçu des pipelines RAG pour l'extraction d'informations métier.",
    sources: [{ type: "github", url: "https://github.com/marie-nmt", label: "github.com/marie-nmt" }],
    skills: ["Python", "NLP", "PyTorch", "RAG", "GenAI", "Hugging Face", "LangChain"],
    experiences: [
      {
        title: "AI Research Engineer",
        company: "Meta FAIR",
        location: "Paris",
        period: "2020 — Présent",
        description: "Participation au développement de grands modèles de traduction automatique et d'évaluation des biais linguistiques.",
      },
    ],
    educations: [{ degree: "Diplôme d'Ingénieur, Spécialité Informatique", school: "CentraleSupélec", period: "2016 — 2019" }],
    hrflow_score: 89,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-julien-mistral",
    name: "Julien Moreau",
    title: "Machine Learning Engineer — LLM",
    location: "Paris, France",
    experience_years: 6,
    summary: "Expert en création de LLMs (Large Language Models) depuis l'entraînement distribué jusqu'au fine-tuning (SFT/RLHF) pour des applications conversationnelles.",
    sources: [{ type: "linkedin", url: "https://fr.linkedin.com/in/julien-mistral", label: "linkedin.com/in/julien-mistral" }],
    skills: ["Python", "NLP", "LLM", "Distributed Training", "CUDA", "RLHF", "PyTorch"],
    experiences: [
      {
        title: "Machine Learning Engineer - NLP",
        company: "Mistral AI",
        location: "Paris",
        period: "2023 — Présent",
        description: "Entraînement de modèles de langage state-of-the-art. Optimisation des pipelines de données textuelles à grande échelle.",
      },
    ],
    educations: [{ degree: "Doctorat en Intelligence Artificielle", school: "INRIA Paris", period: "2018 — 2021" }],
    hrflow_score: 85,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
  {
    key: "demo-sophie-criteo",
    name: "Sophie Benali",
    title: "Senior Data Scientist — NLP & Recommender",
    location: "Paris, France",
    experience_years: 7,
    summary: "Data Scientist avec une double expertise NLP et systèmes de recommandation, optimisant la pertinence des annonces textuelles.",
    sources: [{ type: "github", url: "https://github.com/sophie-ml", label: "github.com/sophie-ml" }],
    skills: ["Python", "NLP", "Recommender Systems", "Spark", "TensorFlow", "SQL", "Scala"],
    experiences: [
      {
        title: "Senior Data Scientist",
        company: "Criteo",
        location: "Paris",
        period: "2018 — Présent",
        description: "Modélisation de la sémantique des annonces publicitaires pour améliorer le ciblage contextuel sans cookies.",
      },
    ],
    educations: [{ degree: "Master Big Data", school: "Télécom Paris", period: "2016 — 2017" }],
    hrflow_score: 82,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-lucas-doctolib",
    name: "Lucas Petit",
    title: "Data Scientist NLP — Santé",
    location: "Paris, France",
    experience_years: 4,
    summary: "Spécialiste NLP appliqué à la santé (Medical NLP). Il extrait des informations critiques de dossiers médicaux non structurés pour aider la prise de décision clinique.",
    sources: [{ type: "linkedin", url: "https://fr.linkedin.com/in/lucas-mednlp", label: "linkedin.com/in/lucas-mednlp" }],
    skills: ["Python", "Clinical NLP", "BioBERT", "Spacy", "RAG", "FHIR", "PostgreSQL"],
    experiences: [
      {
        title: "Data Scientist NLP",
        company: "Doctolib",
        location: "Paris",
        period: "2021 — Présent",
        description: "Développement de modèles NLP pour structurer l'historique patient à partir de notes textuelles sécurisées.",
      },
    ],
    educations: [{ degree: "Master Informatique pour la Santé", school: "Sorbonne Université", period: "2019 — 2021" }],
    hrflow_score: 74,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
  {
    key: "demo-emma-shift",
    name: "Emma Rousseau",
    title: "Machine Learning Engineer — Fraud Detection",
    location: "Paris, France",
    experience_years: 5,
    summary: "Data Scientist focalisée sur l'analyse de documents frauduleux dans le secteur de l'assurance grâce au traitement d'images et au NLP.",
    sources: [{ type: "github", url: "https://github.com/emma-ai-fraud", label: "github.com/emma-ai-fraud" }],
    skills: ["Python", "NLP", "OCR", "Fraud Detection", "XGBoost", "Computer Vision", "AWS"],
    experiences: [
      {
        title: "Machine Learning Engineer",
        company: "Shift Technology",
        location: "Paris",
        period: "2019 — Présent",
        description: "Extraction de texte via OCR couplée à des modèles NLP pour détecter des incohérences dans les déclarations de sinistres.",
      },
    ],
    educations: [{ degree: "Diplôme d'Ingénieur", school: "Mines ParisTech", period: "2016 — 2019" }],
    hrflow_score: 71,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-hugo-alan",
    name: "Hugo Fontaine",
    title: "AI Engineer — NLP & Chatbots",
    location: "Paris, France",
    experience_years: 3,
    summary: "Ingénieur IA créant des agents conversationnels et des assistants virtuels pour l'automatisation du support utilisateur dans le secteur de la mutuelle.",
    sources: [{ type: "linkedin", url: "https://fr.linkedin.com/in/hugo-ai", label: "linkedin.com/in/hugo-ai" }],
    skills: ["Python", "NLP", "Chatbots", "LLM", "GCP", "FastAPI", "Rasa"],
    experiences: [
      {
        title: "AI Engineer (NLP)",
        company: "Alan",
        location: "Paris",
        period: "2022 — Présent",
        description: "Amélioration du routage des tickets de support client via l'analyse sémantique des requêtes entrantes.",
      },
    ],
    educations: [{ degree: "Master Intelligence Artificielle", school: "Université Paris Cité", period: "2020 — 2022" }],
    hrflow_score: 62,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
  {
    key: "demo-clara-datadog",
    name: "Clara Martin",
    title: "Data Scientist — AIOps & NLP",
    location: "Paris, France",
    experience_years: 4,
    summary: "Data Scientist spécialisée dans l'analyse de logs informatiques (AIOps). Elle utilise le NLP pour identifier des anomalies dans des flux de textes non structurés.",
    sources: [{ type: "github", url: "https://github.com/clara-data", label: "github.com/clara-data" }],
    skills: ["Python", "NLP", "AIOps", "Elasticsearch", "PyTorch", "Kafka", "Grafana"],
    experiences: [
      {
        title: "Data Scientist",
        company: "Datadog",
        location: "Paris",
        period: "2021 — Présent",
        description: "Clustering et résumé automatique de logs d'erreurs pour alerter rapidement les équipes SRE.",
      },
    ],
    educations: [{ degree: "Master Data Science", school: "ENSAE Paris", period: "2018 — 2021" }],
    hrflow_score: 57,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-thomas-hf",
    name: "Thomas Rémy",
    title: "NLP Researcher / Engineer",
    location: "Paris, France",
    experience_years: 4,
    summary: "Chercheur appliqué et Data Scientist NLP avec une expertise sur l'optimisation des architectures Transformers pour des inférences rapides.",
    sources: [{ type: "github", url: "https://github.com/thomas-nlp-research", label: "github.com/thomas-nlp-research" }],
    skills: ["Python", "NLP", "Transformers", "PyTorch", "ONNX", "Quantization", "Rust"],
    experiences: [
      {
        title: "NLP Researcher / Engineer",
        company: "Hugging Face",
        location: "Paris",
        period: "2022 — Présent",
        description: "Recherche et implémentation de techniques de quantification pour accélérer l'inférence des modèles de langage open-source.",
      },
    ],
    educations: [{ degree: "Master MVA (Mathématiques, Vision, Apprentissage)", school: "ENS Paris-Saclay", period: "2020 — 2021" }],
    hrflow_score: 91,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-antoine-ubisoft",
    name: "Antoine Dupont",
    title: "Senior Data Scientist — NLP & Modération",
    location: "Paris, France",
    experience_years: 6,
    summary: "Expert NLP appliqué à la modération de contenu et à l'analyse du comportement des joueurs dans le domaine du jeu vidéo.",
    sources: [{ type: "linkedin", url: "https://fr.linkedin.com/in/antoine-nlp", label: "linkedin.com/in/antoine-nlp" }],
    skills: ["Python", "NLP", "Text Classification", "AWS", "FastAPI", "Redis", "Docker"],
    experiences: [
      {
        title: "Senior Data Scientist",
        company: "Ubisoft",
        location: "Paris",
        period: "2018 — Présent",
        description: "Développement de modèles NLP temps réel pour la détection de toxicité dans les chats textuels des jeux multijoueurs.",
      },
    ],
    educations: [{ degree: "Master Informatique - Machine Learning", school: "Université Pierre et Marie Curie (UPMC)", period: "2016 — 2018" }],
    hrflow_score: 68,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
  {
    key: "demo-nicolas-thales",
    name: "Nicolas Henriot",
    title: "Lead NLP Data Scientist — Défense",
    location: "Paris, France",
    experience_years: 8,
    summary: "Ingénieur R&D en traitement du signal et NLP, travaillant sur des problématiques de défense et de renseignement via des modèles souverains.",
    sources: [{ type: "linkedin", url: "https://fr.linkedin.com/in/nicolas-h-thales", label: "linkedin.com/in/nicolas-h-thales" }],
    skills: ["Python", "NLP", "Speech-to-Text", "C++", "Defense", "Named Entity Recognition", "Graph NLP"],
    experiences: [
      {
        title: "Lead NLP Data Scientist",
        company: "Thales",
        location: "Paris",
        period: "2017 — Présent",
        description: "Extraction d'entités complexes et analyse de réseau sémantique sur des corpus de données sécurisées.",
      },
    ],
    educations: [{ degree: "Diplôme d'Ingénieur Supélec", school: "CentraleSupélec", period: "2014 — 2017" }],
    hrflow_score: 78,
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
