# Spec — Démo Finale Hackathon Claw4HR

**Date :** 2026-04-06  
**Contexte :** Présentation finale hackathon HrFlow. 4 minutes de démo live devant des DRH. Vote public.  
**Scénario choisi :** Hybrid Choreography (Telegram vocal → pré-remplit la barre → clic manuel pour lancer)

---

## Script minute par minute

| Temps | Action | Parole |
|---|---|---|
| 0:00–0:20 | Dashboard ouvert sur SearchView. Header affiche "3 shortlistés · 2 contactés" | *"Voici Claw4HR. Un recruteur tape ce qu'il cherche — ou il parle."* |
| 0:20–0:50 | Envoyer le vocal sur Telegram → OpenClaw transcrit → barre de recherche se remplit toute seule → tu cliques "Chercher" → 4 agents PixelSprite s'animent | *"Je parle à l'agent — et la requête apparaît."* |
| 0:50–1:40 | Profils streamaient un par un avec scores (91%, 89%, 85%...) | *"Chaque profil est scoré sémantiquement par HrFlow — pas du matching de mots-clés."* |
| 1:40–2:30 | Clic sur Thomas Rémy (Hugging Face, 91%). ProfileDetailView. Q&A : *"Est-il disponible pour du management ?"* | Lire la réponse IA à voix haute |
| 2:30–3:20 | Clic "✉ Contacter". OutreachModal → Claude génère message personnalisé. Shortlister Thomas Rémy. | Lire une phrase du message générés |
| 3:20–3:45 | Clic "Mon compte" → AccountDropdown → shortlist + recherches récentes + historique outreach | *"Tout l'historique du recruteur, prêt pour son équipe."* |
| 3:45–4:00 | Retour SearchView | *"Du vocal au candidat contacté, en moins de 4 minutes."* |

**Fallback Telegram :** Si OpenClaw est down → taper la même requête manuellement sans pause. Phrase : *"En production ça arrive directement depuis Telegram — je vous montre manuellement."*

**Ce que tu vas dire dans le vocal :**
> *"Trouve-moi des Data Scientists NLP avec minimum 5 ans d'expérience, Python, Paris"*

---

## Données à préparer

### Scores dans `demoProfiles.ts`

Tous les `hrflow_score: -1` remplacés par :

| Profil | Entreprise | Score |
|---|---|---|
| Thomas Rémy | Hugging Face | 91 |
| Marie Lambert | Meta FAIR | 89 |
| Julien Moreau | Mistral AI | 85 |
| Sophie Benali | Criteo | 82 |
| Nicolas Henriot | Thales | 78 |
| Lucas Petit | Doctolib | 74 |
| Emma Rousseau | Shift Technology | 71 |
| Antoine Dupont | Ubisoft | 68 |
| Hugo Fontaine | Alan | 62 |
| Clara Martin | Datadog | 57 |

### Supabase pré-remplissage

**session_id démo :** `6843ccab-f8b4-4306-93de-92356aaf7c4f`

**shortlist** — 3 entrées (Marie Lambert, Julien Moreau, Sophie Benali)  
**outreach** — 2 entrées (Marie Lambert + Nicolas Henriot avec messages personnalisés)  
**searches** — remplacer les 5 doublons par des requêtes variées : "Lead ML Engineer fintech Paris", "NLP Research Scientist défense", "Senior Python Engineer LLM startup", "Data Scientist Computer Vision Paris", "AI Engineer NLP santé Paris"

---

## Tâches à implémenter

### T1 — Hardcoder les scores (critique, ~5 min)
Dans `app/lib/demoProfiles.ts` : remplacer les 10 `hrflow_score: -1` par les valeurs ci-dessus.

### T2 — Handler `channel: "chat"` dans Dashboard (critique, ~10 lignes)
Dans `app/components/Dashboard.tsx` : ajouter un state `pendingQuery` et un handler dans `es.onmessage` :
```
if (event.channel === "chat" && event.payload?.query) {
  setPendingQuery(event.payload.query); // pré-remplit la SearchView
}
```
La SearchView reçoit `pendingQuery` en prop et l'affiche dans la barre. L'utilisateur clique "Chercher" manuellement pour lancer.

Quand OpenClaw envoie `{"channel":"chat","payload":{"query":"..."}}` au webhook → SSE → barre pré-remplie → clic manuel → recherche lancée.

### T3 — Pré-remplir Supabase (important, ~10 min)
INSERTs SQL via MCP Supabase : shortlist (3 profils) + outreach (2 messages) + mise à jour des 5 searches.

### T4 — Configurer OpenClaw (important)
Dans le prompt/skill OpenClaw : après transcription du vocal Telegram, envoyer `{"channel":"chat","payload":{"query":"<transcription>"}}` au webhook `https://hrflowhackathon2026.vercel.app/api/openclaw/webhook`.

### T5 — Variété des searches (nice-to-have, ~5 min)
UPDATE SQL sur les 5 recherches existantes pour varier les queries.

---

## Risques et mitigations

| Risque | Mitigation |
|---|---|
| OpenClaw down le jour J | Fallback manuel — même phrase, même effet |
| Internet instable en salle | Démo sur Vercel — fallback demoProfiles local si webhook down |
| Session_id différent sur démo machine | Vérifier localStorage avant la présentation |
| HrFlow API lente | Scores pré-hardcodés — pas d'appel API pour les demo profiles |
| OutreachModal lente (Claude API) | Préparer le message à l'avance, l'afficher "en train de générer" |
