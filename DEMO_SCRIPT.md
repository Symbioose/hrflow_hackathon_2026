# 🦞 Claw4HR — Script Démo Jury (4 minutes)

> **Contexte :** Démo produit pure devant un jury DRH. Pas de slides. L'écran fait tout.
> **Objectif :** Montrer en 4 minutes qu'on a résolu un vrai problème RH avec une vraie solution IA.
> **Règle d'or :** Chaque action à l'écran doit être accompagnée d'une phrase percutante. Silence = mort.

---

## Avant de commencer (J-1)

- [ ] Lancer le fallback démo (`demoProfiles.ts`) — ne PAS dépendre d'OpenClaw en live
- [ ] Pré-remplir 3-4 profils dans la shortlist Supabase (pour que Pipeline et Analyse aient des données)
- [ ] Pré-envoyer 1-2 outreach (pour montrer la colonne "Contactés" non vide)
- [ ] Tester la requête exacte du script → vérifier que les profils démo s'affichent bien
- [ ] Brancher sur le grand écran + vérifier la résolution (sidebar visible, pas de scroll horizontal)
- [ ] Naviguer sur `/dashboard` en étant connecté → page prête, barre de recherche visible

---

## Le Script

### ⏱ 0:00 — 0:15 | Le Hook (parole, pas d'action)

> *"Les meilleurs développeurs que vous cherchez — ils ne sont pas sur LinkedIn. Ils sont la tête dans leur code sur GitHub. Ils ne postulent jamais. Claw4HR va les trouver pour vous."*

**→ L'écran montre :** la barre de recherche vide, interface propre. Laisser le silence 1 seconde.

---

### ⏱ 0:15 — 0:35 | La Recherche (action 1)

**Action :** Cliquer dans la barre, taper lentement et clairement :

```
Lead Data Scientist NLP, Paris, 5 ans d'expérience
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

**Action :** Les profils apparaissent avec leurs scores. Pointer le score HrFlow sur la meilleure carte.

> *"Chaque profil est scoré par l'API HrFlow. Pas du matching de mots-clés — une analyse sémantique profonde des compétences réelles. Ce candidat à 87% ? HrFlow a lu son parcours, ses projets GitHub, et l'a comparé au poste."*

> *"Ici on ne trie plus des CVs. On choisit parmi des profils déjà qualifiés."*

**→ Cliquer sur le profil avec le meilleur score.**

---

### ⏱ 1:35 — 2:05 | Le Profil (ProfileDetailView)

**Action :** Ouvrir la fiche candidat. Scroller jusqu'à la section SWOT / Upskilling.

> *"Fiche complète : expériences, compétences, sources. Mais surtout — l'analyse HrFlow : Forces, axes de développement, adéquation avec le poste."*

**Action :** Taper une question dans le Q&A :

```
Est-ce qu'il a de l'expérience en management d'équipe ?
```

> *"Je peux interroger ce profil en langage naturel. Mon recruteur ne lit plus 200 pages de CV. Il pose des questions."*

**→ Laisser la réponse s'afficher, puis cliquer "Shortlister".**

> *"Je le sauvegarde."*

---

### ⏱ 2:05 — 2:30 | L'Outreach (la conversion)

**Action :** Cliquer "Contacter". Le modal outreach s'ouvre avec le message pré-généré.

> *"Notre IA génère un message d'approche personnalisé — basé sur ce qu'elle a trouvé sur ce candidat spécifiquement. Elle cite son dernier projet, son stack, son contexte."*

> *"Les messages génériques ont un taux de réponse de 8%. Un message personnalisé comme celui-ci : 3 fois plus."*

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
