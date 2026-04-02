# 🦞 Claw4HR : Business Vision & Stratégie (Pitch DRH)

**Le concept :** `claw4hr` (Claw for HR) est un Agent IA autonome conçu pour révolutionner le sourcing de "Talents Passifs". Contrairement aux outils RH traditionnels qui attendent que les candidats postulent, claw4hr utilise l'agent OpenClaw pour chasser, analyser et contacter les meilleurs talents là où ils se trouvent (GitHub, LinkedIn, Reddit, X), de manière éthique et ciblée.

---

## 1. La Proposition de Valeur (Pour les DRH)
Les meilleurs talents ne cherchent pas de travail. Ils sont "passifs".
- **Gain de temps massif :** 80% du temps d'un recruteur est perdu sur du sourcing manuel et des requêtes booléennes. claw4hr automatise la recherche (Just-in-Time Sourcing).
- **Qualité de recrutement (Quality of Hire) :** L'IA analyse sémantiquement les compétences réelles (via HrFlow) et non les "buzzwords" du CV.
- **Diversité & Inclusion :** En se basant sur les "Hard/Soft Skills" factuels (commits GitHub, posts techniques) plutôt que sur le nom de l'école, l'agent réduit les biais cognitifs.
- **Réduction du Time-to-Fill :** Contacter le bon candidat avec le bon message au bon moment.

---

## 2. Analyse Concurrentielle

| Acteur / Outil | Approche | Limites | 🦞 Notre Avantage (Claw4HR) |
|---|---|---|---|
| **LinkedIn Recruiter** | Base de données fermée, mots-clés | Très cher (~10k$/an/siège). Les candidats tech sont sur-sollicités et ne répondent plus. | Sourcing "Out-of-the-box" (GitHub, Reddit, portfolio). Approche hyper-personnalisée qui garantit un taux de réponse >> 15%. |
| **ATS Classiques (Lever, Workable)** | Inbound (gestion des candidatures) | Ne font pas de sourcing proactif. | claw4hr est un agent proactif ("Outbound") qui vient se brancher *en amont* de l'ATS. |
| **PeopleGPT (Juicebox)** | Sourcing IA / LLM | Écosystème fermé, boîte noire, pricing agressif. | Architecture ouverte (OpenClaw + Agent-Reach). Compréhension sémantique spécialisée RH (HrFlow) et transparence totale (Agent Feed). |

---

## 3. Légalité & Conformité (Le point critique)

Le scraping sauvage est un risque juridique. Voici nos solutions pour rassurer les DRH :

### Problème 1 : Le RGPD (Données personnelles)
- **Solution :** Le sourcing B2B est couvert par **l'Intérêt Légitime (Art. 6(1)(f) du RGPD)**, à condition de faire de la *minimisation des données*. L'agent ne stocke que les données professionnelles publiques (compétences, expériences).
- **Règle d'or intégrée :** Suppression automatique des profils non contactés après 30 jours, et obligation d'inclure un lien "Opt-out" généré dans le premier message d'approche.

### Problème 2 : Scraping vs. CGU des plateformes (ex: LinkedIn)
- **Solution :** Utilisation de flux indirects et d'outils comme **Agent-Reach** ou l'API Exa pour indexer sans enfreindre frontalement les CGU. L'agent simule un comportement humain (rate-limiting) et s'appuie sur la Footprint digitale ouverte (GitHub, StackOverflow, Twitter). 

---

## 4. Pricing & Business Model

Un pricing disruptif face aux licences historiques (LinkedIn) :
- **Modèle SaaS Hybride (B2B) :**
  - **Licence Plateforme :** 499 € / mois / Recruteur (Interface SaaS, orchestration des agents).
  - **Usage (Pay-as-you-go) :** Modèle à la consommation sur l'IA (LLM tokens) et les crédits de parsing/scoring HrFlow (ex: 1€ par profil analysé profondément).
- **Pourquoi ça marche ?** Un cabinet de chasse prend 20% du salaire brut. claw4hr rentabilise son coût dès le premier recrutement technique réussi.

---

## 5. Ce qu'il faut intégrer (Stack & Outils)

Pour que ça fonctionne, voici la stack à consolider demain :
1. **Agent-Reach (Le Sourcing) :** Intégration de `gh CLI` pour GitHub, et des connecteurs MCP pour LinkedIn/Reddit. C'est ce qui donne des "yeux" à notre agent.
2. **API HrFlow (Le Cerveau) :** Connexion stricte des endpoints de Parsing (extraire la donnée du web vers un JSON propre) et de Scoring (matcher le JSON avec la Job Description).
3. **OpenClaw (Le Moteur IA) :** Utiliser les "tools" pour orchestrer les étapes (Fetch -> Parse -> Score -> Summarize).
4. **Dashboard Next.js (L'Interface) :**
   - **Omni-Search Bar :** "Trouve-moi un DevOps AWS avec 3 ans d'XP."
   - **Agent Feed :** La console latérale qui rassure le recruteur en montrant le raisonnement de l'IA ("Je cherche sur GitHub...", "Je calcule le score HrFlow...").

---

## 6. Problèmes Anticipés & Solutions (Roadmap de demain)

| ⚠️ Problème | 💡 Solution Technique |
|---|---|
| **Hallucinations de l'IA (Inventer un diplôme)** | **Grounding via HrFlow :** L'agent LLM ne génère pas les compétences, il utilise exclusivement le JSON validé et parsé par le moteur HrFlow. |
| **Candidats "Invisibles" (Pas sur LinkedIn/GitHub)** | L'agent doit utiliser des recherches sémantiques larges (Exa Search) pour trouver des mentions dans des blogs personnels, des talks YouTube ou des forums discord. |
| **Biais de recrutement (L'IA préfère certains profils)** | Anonymisation des CVs au niveau du prompt d'évaluation (cacher nom/genre/âge avant le scoring). |
| **Temps de latence (L'agent est trop lent à sourcer en live)** | Mettre en place un système asynchrone (Webhooks). Le recruteur lance la recherche, l'agent feed tourne en background, et envoie une notif quand les 10 meilleurs profils sont prêts. |

---
*Document mis à jour pour présentation stratégique (Hackathon HrFlow).*
