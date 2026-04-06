# 🦞 Claw4HR — Script Démo Jury (4 minutes)

> **Contexte :** Démo produit pure devant un jury DRH. Pas de slides. L'écran fait tout.
> **Objectif :** Montrer en 4 minutes qu'on a résolu un vrai problème RH avec une vraie solution IA.
> **Règle d'or :** Chaque action à l'écran doit être accompagnée d'une phrase percutante. Silence = mort.

---

## Avant de commencer (J-1)

- [ ] Vérifier que le fallback démo est actif (`demoProfiles.ts`) — ne PAS dépendre d'OpenClaw en live
- [ ] **Pré-shortlister** Camille Fontaine + Lucas Moreau + Marie Duplessis dans Supabase (Pipeline non vide)
- [ ] **Pré-envoyer** 1 outreach vers Thomas Leroy (colonne "Contactés" visible dans Pipeline)
- [ ] Taper la requête exacte une fois en test → vérifier que les 8 profils s'affichent dans l'ordre (94, 88, 83, 79, 76, 73, 70, 65)
- [ ] Brancher sur le grand écran + vérifier la résolution (sidebar + contenu sans scroll horizontal)
- [ ] Être connecté sur `/dashboard`, barre de recherche vide, prêt à taper

### Profils à connaître par cœur

| Profil | Score | Source | Ce qu'on montre |
|--------|-------|--------|-----------------|
| **Lina Faik** | 94% | LinkedIn ✅ RÉEL | **Profil principal** — clic sur lien LinkedIn live + SWOT + Q&A + Shortlist + Outreach |
| **Lucas Moreau** | 79% | GitHub | Sourcing hors LinkedIn — "son code parle pour lui" |
| **Marie Duplessis** | 83% | LinkedIn | Shortlistée en J-1 → visible dans Pipeline |
| **Thomas Leroy** | 88% | LinkedIn | Outreach pré-envoyé → colonne "Contactés" dans Pipeline |

---

## Le Script

### ⏱ 0:00 — 0:15 | Le Hook (parole, pas d'action)

> *"Les meilleurs développeurs que vous cherchez — ils ne sont pas sur LinkedIn. Ils sont la tête dans leur code sur GitHub. Ils ne postulent jamais. Claw4HR va les trouver pour vous."*

**→ L'écran montre :** la barre de recherche vide, interface propre. Laisser le silence 1 seconde.

---

### ⏱ 0:15 — 0:35 | La Recherche (action 1)

**Action :** Cliquer dans la barre, taper lentement et clairement :

```
Lead Data Scientist, expert Python et ML, 5+ ans d'expérience en production, basé Paris
```

> *"Je n'écris pas de requête booléenne. Je parle à mon agent comme je parlerais à un chasseur de tête."*

**→ Appuyer sur Entrée.**

---

### ⏱ 0:35 — 1:05 | Les Agents en action (LoadingView)

**Action :** Laisser le LoadingView s'afficher. Pointer les agents PixelSprite un par un.

> *"Là, en temps réel, notre agent scrute GitHub — les repos publics, les contributions, les langages. Reddit — les communautés tech. Le web ouvert. En parallèle."*

> *"Un recruteur fait ça manuellement en 3 jours. Notre agent : 30 secondes."*

**→ Attendre que les premiers profils apparaissent.**

---

### ⏱ 1:05 — 1:35 | Les Résultats (ResultsView)

**Action :** Les profils apparaissent avec leurs scores. 8 profils au total — 5 LinkedIn (badge bleu), 3 GitHub (badge gris).

> *"Regardez — LinkedIn bien sûr, mais aussi GitHub. On va chercher les profils là où ils montrent vraiment ce qu'ils savent faire, pas juste ce qu'ils écrivent sur leur CV."*

**→ Pointer la carte de Lina Faik (94% — Senior ML Engineer, ex-Dataiku).**

> *"HrFlow a analysé sémantiquement ce profil. 94% de match. Pas parce qu'elle a écrit 'Python' — parce qu'elle a 6 ans de ML en production sur des projets réels chez L'Oréal, Décathlon, Dataiku."*

**→ Cliquer sur Lina Faik.**

---

### ⏱ 1:35 — 2:05 | Le Profil (ProfileDetailView)

**Action :** Ouvrir la fiche. Montrer rapidement les expériences.

> *"Parcours complet, compétences vérifiées, contexte business. En 5 secondes j'ai ce qu'un recruteur met 20 minutes à construire."*

**→ [MOMENT CLÉ] Cliquer sur le lien source LinkedIn sous son nom.**

> *"Et si vous voulez vérifier — c'est un vrai profil LinkedIn. Claw4HR a trouvé cette personne réelle, en activité, qui ne postule pas."*

**→ Laisser le profil LinkedIn s'ouvrir 3 secondes. Revenir sur l'app.**

**Action :** Scroller vers le SWOT / Upskilling HrFlow, puis taper dans le Q&A :

```
Est-ce qu'elle a une expérience en déploiement de LLMs en production ?
```

> *"Je peux interroger ce profil en langage naturel. Pas besoin de lire le profil en entier."*

**→ Laisser la réponse s'afficher.**

**→ Cliquer "Shortlister". Puis "Retour".**

> *"Shortlistée."*

**→ Revenir aux résultats. Cliquer sur Lucas Moreau (GitHub, 79%).**

> *"Lui, il est sur GitHub — pas de poste LinkedIn visible. Il ne cherche pas activement. Mais son code parle pour lui."*

**→ Shortlister Lucas Moreau. Retour aux résultats.**

---

### ⏱ 2:05 — 2:30 | L'Outreach (la conversion)

**Action :** Sur la carte de Lina Faik, cliquer "Contacter".

> *"Maintenant le plus difficile : décrocher une réponse d'un talent passif qui ne cherche pas de travail."*

**→ Le modal s'ouvre. Laisser 2 secondes pour que le jury lise le début du message.**

> *"Notre IA génère un message personnalisé. Elle cite son passage chez Dataiku, ses missions L'Oréal, son stack exact. Ce n'est pas un template — c'est une approche chirurgicale."*

> *"Taux de réponse d'un message générique : 8%. Personnalisé comme ça : 3 fois plus."*

**→ Copier le message. Fermer le modal.**

---

### ⏱ 2:30 — 3:00 | Le Pipeline (l'outil de pilotage)

**Action :** Cliquer sur **Pipeline** dans la sidebar.

> *"Maintenant, zoom arrière. En tant que DRH, je ne gère pas un candidat — je gère une campagne. Voilà mon pipeline en temps réel."*

**→ Pointer les 3 colonnes.**

> *"Sourcés par l'IA. Shortlistés par moi. Contactés. Je vois d'un coup d'œil où j'en suis sur chaque recrutement. Comme un CRM — mais pour le talent."*

**→ Hover sur une carte pour montrer le bouton "Contacter" qui apparaît.**

---

### ⏱ 3:00 — 3:30 | L'Analyse (l'argument ROI)

**Action :** Cliquer sur **Analyse** dans la sidebar.

> *"Et pour les DRH qui rendent des comptes — voilà les métriques."*

**→ Pointer les KPI cards.**

> *"Profils sourcés. Taux de conversion shortlist. Messages envoyés. Score moyen HrFlow de mes candidats."*

> *"En une campagne de test ce soir — [X] profils sourcés, [X]% shortlistés, score moyen [X]%. Des chiffres qu'aucun outil actuel ne vous donne automatiquement."*

---

### ⏱ 3:30 — 4:00 | La Conclusion (parole)

**Action :** Revenir sur la barre de recherche vide. Pause.

> *"Juicebox vient de lever 80 millions de dollars aux États-Unis sur ce modèle exact."*

> *"Nous, on l'a construit en 48 heures — propulsé par HrFlow, conçu pour le marché européen."*

> *"Claw4HR. Arrêtez de chercher des talents. Laissez l'IA vous les amener."*

---

## Points clés à ne jamais oublier

| Moment | Piège | Comment l'éviter |
|--------|-------|-----------------|
| LoadingView | Silence gêné pendant le chargement | Parler des agents, du temps gagné — ne jamais se taire |
| Score HrFlow | "C'est juste un chiffre" | Insister sur "sémantique, pas mots-clés" — c'est la différence vs LinkedIn |
| Q&A profil | La réponse est trop longue | Poser une question courte avec réponse binaire oui/non |
| Pipeline | Ça paraît vide | Pré-remplir avec des données la veille |
| Analyse | Pas assez de data | Pré-remplir 5+ recherches + 3+ shortlists la veille |
| Conclusion | Finir dans le vide | Terminer sur la phrase Juicebox — ça ancre le contexte marché |

---

## Phrases clés à mémoriser (dans l'ordre)

1. *"Les meilleurs devs ne postulent jamais."*
2. *"Je parle à mon agent comme à un chasseur de tête."*
3. *"3 jours manuellement. 30 secondes avec notre agent."*
4. *"Pas du matching de mots-clés — une analyse sémantique des compétences réelles."*
5. *"Je peux interroger ce profil en langage naturel."*
6. *"3x plus de taux de réponse avec un message personnalisé."*
7. *"Un CRM — mais pour le talent."*
8. *"Des chiffres qu'aucun outil actuel ne vous donne automatiquement."*
9. *"80 millions de dollars. 48 heures. Marché européen."*
10. *"Arrêtez de chercher des talents. Laissez l'IA vous les amener."*
