import type { SourcedProfile } from "@/app/lib/types";

/**
 * Real NLP/ML profiles from the Paris tech ecosystem.
 * Used as demo fallback when OpenClaw is not available.
 * All information sourced from public profiles.
 */
export const DEMO_PROFILES: SourcedProfile[] = [
  {
    key: "demo-guillaume-lample",
    name: "Guillaume Lample",
    title: "Co-founder & Chief Scientist — Mistral AI",
    location: "Paris, France",
    experience_years: 12,
    summary: "Co-fondateur et Chief Scientist de Mistral AI, l'une des startups IA les plus valorisées d'Europe. Ancien Research Scientist à Meta FAIR Paris, créateur de LLaMA et pionnier de la traduction automatique non supervisée. Auteur de travaux fondateurs sur le Named Entity Recognition neuronal.",
    sources: [{ type: "github", url: "https://github.com/glample", label: "github.com/glample" }],
    skills: ["Python", "NLP", "LLM", "Unsupervised Machine Translation", "PyTorch", "CUDA", "Named Entity Recognition"],
    experiences: [
      {
        title: "Co-founder & Chief Scientist",
        company: "Mistral AI",
        location: "Paris",
        period: "2023 — Présent",
        description: "Co-fondation de Mistral AI. Développement des modèles Mistral 7B et Mixtral — référence mondiale des LLMs open-source. Levée de 1.1Md€.",
      },
      {
        title: "Research Scientist",
        company: "Meta FAIR",
        location: "Paris",
        period: "2016 — 2023",
        description: "Recherche fondamentale en NLP : traduction non supervisée, modèles de langage multilingues, raisonnement symbolique. Co-créateur de LLaMA.",
      },
    ],
    educations: [
      { degree: "MSc Artificial Intelligence", school: "Carnegie Mellon University", period: "2014 — 2016" },
      { degree: "Diplôme d'ingénieur", school: "École Polytechnique", period: "2011 — 2014" },
    ],
    hrflow_score: 91,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-thomas-wolf",
    name: "Thomas Wolf",
    title: "Chief Science Officer & Co-founder — Hugging Face",
    location: "Paris, France",
    experience_years: 10,
    summary: "Co-fondateur et Chief Science Officer de Hugging Face. Architecte des librairies open-source Transformers et Datasets, utilisées par des millions de développeurs dans le monde. Auteur du livre 'Natural Language Processing with Transformers'. Ancien docteur en physique et patent attorney.",
    sources: [{ type: "github", url: "https://github.com/thomwolf", label: "github.com/thomwolf" }],
    skills: ["Python", "NLP", "Transformers", "PyTorch", "Large Language Models", "Open Source", "Datasets"],
    experiences: [
      {
        title: "Chief Science Officer & Co-founder",
        company: "Hugging Face",
        location: "Paris",
        period: "2017 — Présent",
        description: "Création des librairies Transformers et Datasets. Animation de la communauté open-source AI avec 500 000+ modèles hébergés. Co-organisation de BigScience (BLOOM model).",
      },
    ],
    educations: [
      { degree: "Licence de droit (Patent Attorney)", school: "Université Panthéon-Sorbonne", period: "2009 — 2012" },
      { degree: "Doctorat en Physique (Supraconducteurs)", school: "Université Paris-Sud", period: "2004 — 2008" },
    ],
    hrflow_score: 89,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-victor-sanh",
    name: "Victor Sanh",
    title: "Research Scientist — Hugging Face",
    location: "Paris, France",
    experience_years: 7,
    summary: "Research Scientist chez Hugging Face et créateur de DistilBERT — version allégée de BERT 40% plus rapide et 60% plus légère. Co-auteur de T0, modèle multi-tâches zero-shot. Expert en distillation de modèles et apprentissage multi-tâches pour le NLP.",
    sources: [{ type: "github", url: "https://github.com/VictorSanh", label: "github.com/VictorSanh" }],
    skills: ["Python", "NLP", "Transformers", "DistilBERT", "Model Distillation", "Multi-task Learning", "PyTorch"],
    experiences: [
      {
        title: "Research Scientist",
        company: "Hugging Face",
        location: "Paris",
        period: "2019 — Présent",
        description: "Création de DistilBERT (40M de téléchargements/mois). Co-auteur de T0, modèle zero-shot multi-tâches. Contributions majeures à la librairie Transformers.",
      },
    ],
    educations: [
      { degree: "MSc Machine Learning", school: "ENS Paris / ENPC", period: "2017 — 2019" },
    ],
    hrflow_score: 85,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-alexis-conneau",
    name: "Alexis Conneau",
    title: "Research Scientist — former Meta FAIR Paris",
    location: "Paris, France",
    experience_years: 9,
    summary: "Ancien Research Scientist à Meta FAIR Paris, créateur d'InferSent, XLM et MUSE — des librairies de référence en représentation multilingue de phrases. Plus de 36 000 citations académiques. Expert reconnu en compréhension cross-linguale et embeddings universels.",
    sources: [{ type: "github", url: "https://github.com/aconneau", label: "github.com/aconneau" }],
    skills: ["Python", "NLP", "Cross-lingual NLP", "XLM", "InferSent", "MUSE", "PyTorch", "Multilingual Models"],
    experiences: [
      {
        title: "Research Scientist",
        company: "Meta FAIR",
        location: "Paris",
        period: "2017 — 2023",
        description: "Création d'InferSent (sentence embeddings), XLM (cross-lingual pretraining) et MUSE (multilingual word embeddings). Recherche fondamentale en représentation cross-linguale.",
      },
    ],
    educations: [
      { degree: "Diplôme d'ingénieur (Mathématiques)", school: "École Polytechnique", period: "2012 — 2015" },
    ],
    hrflow_score: 82,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-benoit-sagot",
    name: "Benoît Sagot",
    title: "Directeur de Recherche — Inria Paris",
    location: "Paris, France",
    experience_years: 18,
    summary: "Directeur de Recherche Inria, responsable de l'équipe ALMAnaCH. Titulaire d'une chaire au Collège de France (2023-2024) en informatique et sciences du numérique. Co-auteur de CamemBERT et architecte du corpus OSCAR. Référence française en NLP et humanités numériques.",
    sources: [{ type: "linkedin", url: "https://fr.linkedin.com/in/beno%C3%AEt-sagot-4731735", label: "linkedin.com/in/benoit-sagot" }],
    skills: ["Python", "NLP", "CamemBERT", "Computational Linguistics", "OSCAR Corpus", "Named Entity Recognition", "Language Resources"],
    experiences: [
      {
        title: "Directeur de Recherche & Head of ALMAnaCH",
        company: "Inria Paris",
        location: "Paris",
        period: "2017 — Présent",
        description: "Direction de l'équipe ALMAnaCH (15 chercheurs). Co-création de CamemBERT — le modèle BERT français de référence. Chaire Collège de France 2023.",
      },
    ],
    educations: [
      { degree: "Doctorat en Informatique", school: "Université Paris-Diderot", period: "2002 — 2006" },
      { degree: "Diplôme d'ingénieur", school: "École Polytechnique", period: "1998 — 2002" },
    ],
    hrflow_score: 78,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
  {
    key: "demo-julien-chaumond",
    name: "Julien Chaumond",
    title: "CTO & Co-founder — Hugging Face",
    location: "Paris, France",
    experience_years: 10,
    summary: "CTO et co-fondateur de Hugging Face. Architecte du Hugging Face Hub qui héberge 500 000+ modèles open-source. Expert en déploiement de modèles de langage à grande échelle et en MLOps. Ancien ingénieur au Corps des Télécommunications.",
    sources: [{ type: "github", url: "https://github.com/julien-c", label: "github.com/julien-c" }],
    skills: ["Python", "JavaScript", "Machine Learning", "MLOps", "LLMs", "Infrastructure", "Open Source"],
    experiences: [
      {
        title: "CTO & Co-founder",
        company: "Hugging Face",
        location: "Paris",
        period: "2016 — Présent",
        description: "Co-fondation et direction technique de Hugging Face. Construction du Hub (500 000+ modèles, 100 000+ datasets). Intégrations AWS/Azure/GCP pour le déploiement enterprise.",
      },
    ],
    educations: [
      { degree: "MSc Electrical Engineering & Computer Science", school: "Stanford University", period: "2010 — 2012" },
      { degree: "Ingénieur des Télécommunications", school: "Corps des Télécommunications", period: "2007 — 2010" },
    ],
    hrflow_score: 74,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-olivier-grisel",
    name: "Olivier Grisel",
    title: "Machine Learning Engineer — :probabl",
    location: "Paris, France",
    experience_years: 15,
    summary: "ML Engineer chez :probabl et lead technique de la fondation scikit-learn. Core contributor depuis 2010 à l'une des librairies ML les plus utilisées au monde. Expert en Machine Learning appliqué au NLP et text mining. Enseignant à l'École Polytechnique et Paris-Saclay.",
    sources: [{ type: "github", url: "https://github.com/ogrisel", label: "github.com/ogrisel" }],
    skills: ["Python", "scikit-learn", "NLP", "Text Mining", "Deep Learning", "CUDA", "NumPy"],
    experiences: [
      {
        title: "Machine Learning Engineer",
        company: ":probabl",
        location: "Paris",
        period: "2023 — Présent",
        description: "Lead technique de la fondation scikit-learn. Développement et maintenance de la librairie scikit-learn (200k+ étoiles GitHub). Enseignement deep learning à l'École Polytechnique.",
      },
      {
        title: "Machine Learning Engineer",
        company: "Inria",
        location: "Paris",
        period: "2011 — 2023",
        description: "Amélioration de scikit-learn et outils associés. Expert en text mining et apprentissage automatique appliqué au NLP.",
      },
    ],
    educations: [
      { degree: "MSc Advanced Computing", school: "Imperial College London", period: "2006 — 2007" },
      { degree: "MSc Mathématiques et Informatique", school: "ENSTA ParisTech", period: "2003 — 2006" },
    ],
    hrflow_score: 71,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-pedro-ortiz",
    name: "Pedro Ortiz Suarez",
    title: "Principal Research Scientist — Common Crawl Foundation",
    location: "Paris, France",
    experience_years: 7,
    summary: "Principal Research Scientist, ancien doctorant à Inria Paris (ALMAnaCH / Sorbonne Université). Co-auteur de CamemBERT — le modèle BERT français — et du corpus OSCAR (175 langues, plusieurs téraoctets). Expert en ressources linguistiques pour langues peu dotées.",
    sources: [{ type: "github", url: "https://github.com/pjox", label: "github.com/pjox" }],
    skills: ["Python", "NLP", "CamemBERT", "OSCAR Corpus", "Named Entity Recognition", "Multilingual NLP", "Language Models"],
    experiences: [
      {
        title: "Principal Research Scientist",
        company: "Common Crawl Foundation",
        location: "Paris",
        period: "2022 — Présent",
        description: "Construction de grands corpus multilingues pour l'entraînement de modèles de langage. Co-auteur de OSCAR (Open Super-large Crawled Aggregated coRpus).",
      },
      {
        title: "Doctorant en NLP",
        company: "Inria Paris / Sorbonne Université",
        location: "Paris",
        period: "2018 — 2022",
        description: "Thèse sur les grands corpus pour modèles de langage. Co-création de CamemBERT et du corpus OSCAR.",
      },
    ],
    educations: [
      { degree: "Doctorat en Informatique", school: "Sorbonne Université / Inria Paris", period: "2018 — 2022" },
    ],
    hrflow_score: 68,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
  },
  {
    key: "demo-yacine-jernite",
    name: "Yacine Jernite",
    title: "ML & Society Lead — Hugging Face",
    location: "Paris, France",
    experience_years: 8,
    summary: "Lead de l'équipe ML & Society chez Hugging Face. Co-organisateur du workshop BigScience (BLOOM — modèle de langage 176B paramètres). Expert en gouvernance des données d'IA, éthique des LLMs et conformité réglementaire. Plus de 24 000 citations académiques.",
    sources: [{ type: "linkedin", url: "https://www.linkedin.com/in/yacine-jernite-997ba81b6/", label: "linkedin.com/in/yacine-jernite" }],
    skills: ["Python", "NLP", "AI Ethics", "Data Governance", "ML Systems", "BigScience", "LLM Regulation"],
    experiences: [
      {
        title: "ML & Society Lead",
        company: "Hugging Face",
        location: "Paris",
        period: "2020 — Présent",
        description: "Direction de l'équipe ML & Society. Co-organisation de BigScience (BLOOM 176B). Travaux sur la gouvernance des datasets et la conformité IA (AI Act).",
      },
    ],
    educations: [
      { degree: "PhD Computer Science", school: "New York University", period: "2015 — 2020" },
    ],
    hrflow_score: 62,
    hrflow_key: null,
    avatar_color: "#0077b5",
  },
  {
    key: "demo-raushan-turganbay",
    name: "Raushan Turganbay",
    title: "Machine Learning Engineer — Hugging Face",
    location: "Paris, France",
    experience_years: 4,
    summary: "ML Engineer chez Hugging Face spécialisé en modèles multimodaux et vision-langage. Contributeur actif à la librairie Transformers — notamment les intégrations Gemma 4 et les architectures vision-language. Expert en RLHF et fine-tuning de modèles génératifs.",
    sources: [{ type: "github", url: "https://github.com/zucchini-nlp", label: "github.com/zucchini-nlp" }],
    skills: ["Python", "NLP", "Multimodal Models", "Vision-Language", "RLHF", "Transformers", "PyTorch"],
    experiences: [
      {
        title: "Machine Learning Engineer",
        company: "Hugging Face",
        location: "Paris",
        period: "2022 — Présent",
        description: "Développement et intégration de modèles multimodaux dans la librairie Transformers. Intégrations Gemma 4, LLaVA, et modèles vision-language. Contributions RLHF.",
      },
    ],
    educations: [
      { degree: "MSc Machine Learning", school: "Université Paris-Saclay", period: "2020 — 2022" },
    ],
    hrflow_score: 57,
    hrflow_key: null,
    avatar_color: "#FF6B6B",
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
