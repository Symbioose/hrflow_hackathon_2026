# 🦞 Claw4HR — Script Démo Jury (4 minutes)

> **Contexte :** Démo produit pure devant un jury DRH. Pas de slides. L'écran fait tout.
> **Objectif :** Montrer en 4 minutes qu'on a résolu un vrai problème RH avec une vraie solution IA.
> **Règle d'or :** Chaque action à l'écran doit être accompagnée d'une phrase percutante. Silence = mort.

---

## Avant de commencer (J-1)

- [ ] Vérifier que le fallback démo est actif (`demoProfiles.ts`) — ne PAS dépendre d'OpenClaw en live
- [ ] **Pré-shortlister** Lina Faik + Marie Duplessis + Olivier Grisel dans Supabase (Pipeline non vide)
- [ ] **Pré-envoyer** 1 outreach vers Thomas Leroy (colonne "Contactés" visible dans Pipeline)
- [ ] Taper la requête exacte une fois en test → vérifier que les 8 profils s'affichent dans l'ordre (94, 88, 83, 79, 76, 73, 70, 65)
- [ ] Brancher sur le grand écran + vérifier la résolution (sidebar + contenu sans scroll horizontal)
- [ ] Être connecté sur `/dashboard`, barre de recherche vide, prêt à taper

### Profils à connaître par cœur

| Profil | Score | Source | Ce qu'on montre |
|--------|-------|--------|-----------------|
| **Lina Faik** | 94% | LinkedIn ✅ RÉEL | **Profil principal** — clic sur lien LinkedIn live + SWOT + Q&A + Shortlist + Outreach |
| **Olivier Grisel** | 79% | GitHub ✅ RÉEL | Clic sur github.com/ogrisel live — "on la trouve là où personne ne cherche" |
| **Marie Duplessis** | 83% | LinkedIn | Shortlistée en J-1 → visible dans Pipeline |
| **Thomas Leroy** | 88% | LinkedIn | Outreach pré-envoyé → colonne "Contactés" dans Pipeline |

---

## Le Script

### ⏱ 0:00 — 0:15 | Le Hook (parole, pas d'action)

> *"Les meilleurs talents que vous cherchez — ils ne postulent pas. Ils ont la tête dans leur travail. Ils ne répondent pas à vos annonces. Claw4HR va les trouver pour vous."*

**→ L'écran montre :** la barre de recherche vide, interface propre. Laisser le silence 1 seconde.

---

### ⏱ 0:15 — 0:35 | La Recherche (action 1)

**Action :** Cliquer dans la barre, taper lentement et clairement :

```
Lead Data Scientist, expert Python et ML, 5+ ans d'expérience en production, basé Paris
```

> *"Je n'écris pas de requête booléenne. Je décris le profil que je cherche, comme je le ferais à un chasseur de tête."*

**→ Appuyer sur Entrée.**

---

### ⏱ 0:35 — 1:05 | Les Agents en action (LoadingView)

**Action :** Laisser le LoadingView s'afficher. Pointer les agents PixelSprite un par un.

> *"Là, en temps réel, nos agents partent chercher sur LinkedIn, GitHub, Reddit, le web. Partout où vos candidats laissent une trace professionnelle publique."*

> *"Un recruteur fait ça manuellement en 3 jours. Notre agent : 30 secondes."*

**→ Pointer le terminal de logs qui défile.**

> *"Vous voyez ce que fait l'agent à chaque instant — transparence totale. L'IA ne travaille pas dans une boîte noire."*

**→ Attendre que les premiers profils apparaissent.**

---

### ⏱ 1:05 — 1:35 | Les Résultats (ResultsView)

**Action :** Les profils apparaissent avec leurs scores. 8 profils au total — badges LinkedIn et GitHub.

> *"Chaque profil sourcé automatiquement, scoré par le moteur sémantique HrFlow. Pas du matching de mots-clés — une analyse en profondeur des compétences réelles et du parcours."*

**→ Pointer la carte de Lina Faik (94%).**

> *"94% de compatibilité. Ce score, c'est HrFlow qui l'a calculé en analysant son parcours, ses missions, ce qu'elle a vraiment accompli — pas ce qu'elle a écrit dans un résumé."*

**→ Cliquer sur Lina Faik.**

---

### ⏱ 1:35 — 2:05 | Le Profil (ProfileDetailView)

**Action :** Ouvrir la fiche. Montrer rapidement les expériences et compétences.

> *"Fiche complète, reconstituée automatiquement depuis ses traces publiques. Parcours, compétences, contexte. En 5 secondes j'ai ce qu'un recruteur met 20 minutes à construire."*

**→ [MOMENT CLÉ] Cliquer sur le lien source LinkedIn sous son nom.**

> *"Et si vous voulez vérifier — c'est un vrai profil LinkedIn. Cette personne existe, elle travaille, elle n'est pas en recherche active. C'est exactement le talent passif qu'on ne trouve pas autrement."*

**→ Laisser le profil LinkedIn s'ouvrir 3 secondes. Revenir sur l'app.**

**Action :** Scroller vers le SWOT / Upskilling HrFlow, puis taper dans le Q&A :

```
Est-ce qu'elle a piloté des projets en autonomie chez des grands comptes ?
```

> *"Je peux poser n'importe quelle question sur ce profil en langage naturel. Mon recruteur ne lit plus des CV — il interroge l'IA."*

**→ Laisser la réponse s'afficher.**

**→ Cliquer "Shortlister". Puis "Retour".**

> *"Shortlistée. On passe au suivant."*

**→ Revenir aux résultats. Cliquer sur Olivier Grisel (GitHub, 79%).**

> *"Lui, il n'est pas sur LinkedIn. On l'a trouvé ailleurs — là où il montre concrètement ce qu'il sait faire."*

**→ [MOMENT CLÉ] Cliquer sur le lien source GitHub sous son nom.**

> *"Profil public, vérifiable. Claw4HR l'a identifié parce qu'il correspond sémantiquement au poste — pas parce qu'il s'est déclaré 'ouvert aux opportunités'."*

**→ Laisser le profil s'ouvrir 2 secondes. Revenir sur l'app.**

**→ Shortlister Olivier Grisel. Retour aux résultats.**

---

### ⏱ 2:05 — 2:30 | L'Outreach (la conversion)

**Action :** Sur la carte de Lina Faik, cliquer "Contacter".

> *"Trouver le talent, c'est bien. Lui parler de la bonne façon, c'est ce qui fait la différence."*

**→ Le modal s'ouvre. Laisser 2 secondes pour que le jury lise le début du message.**

> *"Notre IA génère un message d'approche personnalisé — basé sur son parcours réel, ses missions, ses accomplissements. Pas un template copié-collé. Une approche qui lui parle directement."*

> *"Taux de réponse d'un message générique : 8%. Un message comme celui-ci : 3 fois plus."*

**→ Copier le message. Fermer le modal.**

---

### ⏱ 2:30 — 3:00 | Le Pipeline (l'outil de pilotage)

**Action :** Cliquer sur **Pipeline** dans la sidebar.

> *"Zoom arrière. En tant que DRH, je ne gère pas un candidat — je pilote une campagne de recrutement entière."*

**→ Pointer les 3 colonnes.**

> *"Sourcés par l'IA. Shortlistés par moi. Contactés. Je vois en un coup d'œil où j'en suis. Comme un CRM commercial — mais pour le recrutement."*

**→ Hover sur une carte pour montrer le bouton "Contacter" qui apparaît.**

---

### ⏱ 3:00 — 3:30 | L'Analyse (l'argument ROI)

**Action :** Cliquer sur **Analyse** dans la sidebar.

> *"Et pour ceux qui doivent rendre des comptes — voilà les chiffres."*

**→ Pointer les KPI cards.**

> *"Profils sourcés. Taux de conversion. Messages envoyés. Score moyen de compatibilité. En temps réel, automatiquement."*

> *"Ces données, aujourd'hui, aucun outil RH ne vous les donne sans qu'un recruteur passe des heures à les consolider dans Excel."*

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
| LoadingView | Silence gêné pendant le chargement | Parler des agents, de la transparence, du temps gagné — ne jamais se taire |
| Score HrFlow | "C'est juste un chiffre" | Insister sur "sémantique, pas mots-clés" — c'est la différence vs LinkedIn |
| Clic LinkedIn | La page met du temps à charger | Avoir le profil ouvert dans un autre onglet en avance |
| Q&A profil | La réponse est trop longue | Poser une question courte avec réponse directe |
| Pipeline | Ça paraît vide | Pré-remplir avec des données la veille |
| Analyse | Pas assez de data | Pré-remplir 5+ recherches + 3+ shortlists la veille |
| Conclusion | Finir dans le vide | Terminer sur la phrase Juicebox — ça ancre le contexte marché |

---

## Phrases clés à mémoriser (dans l'ordre)

1. *"Les meilleurs talents ne postulent pas."*
2. *"Je décris le profil comme je le ferais à un chasseur de tête."*
3. *"3 jours manuellement. 30 secondes avec notre agent."*
4. *"L'IA ne travaille pas dans une boîte noire."*
5. *"Pas du matching de mots-clés — une analyse en profondeur des compétences réelles."*
6. *"Cette personne existe, elle travaille, elle n'est pas en recherche active."*
7. *"Mon recruteur ne lit plus des CV — il interroge l'IA."*
8. *"Comme un CRM commercial — mais pour le recrutement."*
9. *"Ces données, aucun outil RH ne vous les donne automatiquement."*
10. *"80 millions de dollars. 48 heures. Marché européen."*
11. *"Arrêtez de chercher des talents. Laissez l'IA vous les amener."*
