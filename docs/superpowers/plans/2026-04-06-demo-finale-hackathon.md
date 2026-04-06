# Demo Finale Hackathon — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Préparer la démo hackathon : scores hardcodés, auto-fill barre depuis Telegram/OpenClaw, landing page avec boutons "Tester" + "Mon compte", et Supabase pré-rempli.

**Architecture:** 5 tâches indépendantes. T1 et T2 sont critiques (la démo ne marche pas sans). T3 (landing) et T4 (Supabase) sont importants pour l'impression visuelle. T5 (OpenClaw) est documentaire.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase MCP, Tailwind CSS v4.

---

## Fichiers touchés

| Fichier | Action | Raison |
|---|---|---|
| `app/lib/demoProfiles.ts` | Modify | Remplacer les 10 `hrflow_score: -1` par de vrais scores |
| `app/components/SearchView.tsx` | Modify | Ajouter prop `initialQuery?: string` pour pré-remplir depuis Telegram |
| `app/components/Dashboard.tsx` | Modify | Ajouter state `pendingQuery` + handler SSE `channel: "chat"` |
| `app/landing/page.tsx` | Modify | Nav: remplacer boutons par "Tester" + "Mon compte" |
| Supabase SQL (via MCP) | Execute | Pré-remplir shortlist (3), outreach (2), searches (5 variées) |

---

## Task 1 — Hardcoder les scores dans demoProfiles.ts

**Files:**
- Modify: `app/lib/demoProfiles.ts`

- [ ] **Step 1 : Remplacer les 10 scores**

Dans `app/lib/demoProfiles.ts`, remplacer les valeurs `hrflow_score: -1` par ordre d'apparition dans le fichier :

```typescript
// demo-marie-meta
hrflow_score: 89,

// demo-julien-mistral
hrflow_score: 85,

// demo-sophie-criteo
hrflow_score: 82,

// demo-lucas-doctolib
hrflow_score: 74,

// demo-emma-shift
hrflow_score: 71,

// demo-hugo-alan
hrflow_score: 62,

// demo-clara-datadog
hrflow_score: 57,

// demo-thomas-hf
hrflow_score: 91,

// demo-antoine-ubisoft
hrflow_score: 68,

// demo-nicolas-thales
hrflow_score: 78,
```

- [ ] **Step 2 : Vérifier visuellement**

Lancer `npm run dev` et naviguer vers `http://localhost:3000`. Faire une recherche → vérifier que les cartes affichent des scores (91%, 89%, etc.) et non -1 ou vide.

- [ ] **Step 3 : Commit**

```bash
git add app/lib/demoProfiles.ts
git commit -m "feat: hardcode realistic hrflow scores in demo profiles"
```

---

## Task 2 — Auto-fill barre de recherche depuis OpenClaw (channel: "chat")

**Files:**
- Modify: `app/components/SearchView.tsx`
- Modify: `app/components/Dashboard.tsx`

L'objectif : quand OpenClaw envoie `{"channel":"chat","payload":{"query":"..."}}` au webhook, le Dashboard reçoit l'event via SSE, stocke la query dans un state `pendingQuery`, et la passe à `SearchView` qui pré-remplit la barre. L'utilisateur clique "Chercher" manuellement.

- [ ] **Step 1 : Ajouter la prop `initialQuery` à SearchView**

Dans `app/components/SearchView.tsx`, modifier l'interface et le composant :

```typescript
interface SearchViewProps {
  onSearch: (query: string) => void;
  initialQuery?: string;  // ← ajouter
}

export default function SearchView({ onSearch, initialQuery }: SearchViewProps) {
  const [query, setQuery] = useState(initialQuery ?? "");
  // ... reste inchangé
```

Ajouter un `useEffect` pour mettre à jour la barre si `initialQuery` change après le montage (cas où l'event SSE arrive quand SearchView est déjà affichée) :

```typescript
  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);
```

Placer ce `useEffect` juste après le `useState`, avant le `return`.

- [ ] **Step 2 : Ajouter `pendingQuery` state dans Dashboard**

Dans `app/components/Dashboard.tsx`, ajouter le state après les autres states existants (ligne ~50) :

```typescript
const [pendingQuery, setPendingQuery] = useState<string>("");
```

- [ ] **Step 3 : Ajouter le handler `channel: "chat"` dans le SSE**

Dans `Dashboard.tsx`, dans le bloc `es.onmessage`, après le handler `channel: "feed"` existant (ligne ~99), ajouter :

```typescript
        if (event.channel === "chat" && event.payload?.query) {
          setPendingQuery(event.payload.query as string);
        }
```

Le bloc complet `es.onmessage` ressemble alors à :

```typescript
    es.onmessage = (e) => {
      if (searchIdRef.current !== thisSearch) return;
      try {
        const event = JSON.parse(e.data);
        if (event.channel === "profile" && event.payload?.profile) {
          // ... code existant
        }
        if (event.channel === "feed" && event.payload?.source) {
          // ... code existant
        }
        if (event.channel === "chat" && event.payload?.query) {
          setPendingQuery(event.payload.query as string);
        }
      } catch {}
    };
```

- [ ] **Step 4 : Passer `initialQuery` à SearchView dans le render**

Dans `Dashboard.tsx`, modifier la ligne qui rend `SearchView` (ligne ~305) :

```typescript
        {view === "search" && <SearchView onSearch={handleSearch} initialQuery={pendingQuery} />}
```

- [ ] **Step 5 : Initialiser le SSE dès le montage pour recevoir les events chat**

Actuellement, le SSE se connecte uniquement quand `handleSearch` est appelé. Pour recevoir un event `channel: "chat"` avant que l'utilisateur ait cherché, il faut connecter le SSE au montage.

Dans `Dashboard.tsx`, ajouter un `useEffect` après les useEffects existants (après celui qui charge shortlist/outreach, ligne ~75) :

```typescript
  // Connect SSE on mount to receive incoming chat events (Telegram → OpenClaw → webhook)
  useEffect(() => {
    connectSSE(0);
    return () => esRef.current?.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

- [ ] **Step 6 : Tester manuellement**

Envoyer un POST au webhook local pour simuler OpenClaw :

```bash
curl -X POST http://localhost:3000/api/openclaw/webhook \
  -H "Content-Type: application/json" \
  -d '{"channel":"chat","payload":{"query":"Data Scientist NLP Paris senior"}}'
```

Vérifier que la barre de recherche sur `http://localhost:3000` se remplit avec "Data Scientist NLP Paris senior" sans recharger la page.

- [ ] **Step 7 : Commit**

```bash
git add app/components/SearchView.tsx app/components/Dashboard.tsx
git commit -m "feat: auto-fill search bar from OpenClaw chat event via SSE"
```

---

## Task 3 — Landing page : boutons "Tester" et "Mon compte"

**Files:**
- Modify: `app/landing/page.tsx` (fonction `Nav`, ligne 233)

L'objectif : remplacer les boutons actuels "Voir la Démo" et "Accès Dashboard →" dans la navbar par "Tester →" (lien vers `/`) et "Mon compte" (lien vers `/` pour l'instant, futur auth).

- [ ] **Step 1 : Modifier le bloc `<div className="flex items-center gap-3">` dans Nav**

Remplacer les lignes 264-266 :

```typescript
        <div className="flex items-center gap-3">
          <PixelBtn href="#demo" variant="outline" size="sm">Voir la Démo</PixelBtn>
          <PixelBtn href="/" variant="coral" size="sm">Accès Dashboard &rarr;</PixelBtn>
        </div>
```

Par :

```typescript
        <div className="flex items-center gap-3">
          <PixelBtn href="/" variant="outline" size="sm">Mon compte</PixelBtn>
          <PixelBtn href="/" variant="coral" size="sm">Tester &rarr;</PixelBtn>
        </div>
```

- [ ] **Step 2 : Vérifier visuellement**

Naviguer vers `http://localhost:3000/landing`. Vérifier que la navbar affiche "Mon compte" (outline) et "Tester →" (coral) en haut à droite. Vérifier que les deux liens mènent bien vers `/`.

- [ ] **Step 3 : Commit**

```bash
git add app/landing/page.tsx
git commit -m "feat: landing nav — add Tester and Mon compte buttons"
```

---

## Task 4 — Pré-remplir Supabase pour la démo

**Supabase project:** `mqakoanhacizpyjbjvjf`  
**Session ID démo:** `6843ccab-f8b4-4306-93de-92356aaf7c4f`

L'objectif : le header affiche "3 shortlistés · 2 contactés" dès l'ouverture du dashboard.

- [ ] **Step 1 : Pré-remplir la shortlist (3 profils)**

Exécuter via MCP Supabase :

```sql
INSERT INTO shortlist (session_id, profile_key, profile_data) VALUES
(
  '6843ccab-f8b4-4306-93de-92356aaf7c4f',
  'demo-marie-meta',
  '{"key":"demo-marie-meta","name":"Marie Lambert","title":"AI Research Engineer — NLP & GenAI","location":"Paris, France","experience_years":10,"hrflow_score":89,"skills":["Python","NLP","PyTorch","RAG","GenAI","Hugging Face","LangChain"],"sources":[{"type":"github","url":"https://github.com/marie-nmt","label":"github.com/marie-nmt"}]}'
),
(
  '6843ccab-f8b4-4306-93de-92356aaf7c4f',
  'demo-julien-mistral',
  '{"key":"demo-julien-mistral","name":"Julien Moreau","title":"Machine Learning Engineer — LLM","location":"Paris, France","experience_years":6,"hrflow_score":85,"skills":["Python","NLP","LLM","Distributed Training","CUDA","RLHF","PyTorch"],"sources":[{"type":"linkedin","url":"https://fr.linkedin.com/in/julien-mistral","label":"linkedin.com/in/julien-mistral"}]}'
),
(
  '6843ccab-f8b4-4306-93de-92356aaf7c4f',
  'demo-sophie-criteo',
  '{"key":"demo-sophie-criteo","name":"Sophie Benali","title":"Senior Data Scientist — NLP & Recommender","location":"Paris, France","experience_years":7,"hrflow_score":82,"skills":["Python","NLP","Recommender Systems","Spark","TensorFlow","SQL","Scala"],"sources":[{"type":"github","url":"https://github.com/sophie-ml","label":"github.com/sophie-ml"}]}'
);
```

- [ ] **Step 2 : Pré-remplir l'outreach (2 messages)**

```sql
INSERT INTO outreach (session_id, profile_key, profile_name, message) VALUES
(
  '6843ccab-f8b4-4306-93de-92356aaf7c4f',
  'demo-marie-meta',
  'Marie Lambert',
  'Bonjour Marie, j''ai découvert vos travaux sur les pipelines RAG chez Meta FAIR — votre approche de l''extraction d''informations métier est exactement ce que nous recherchons. Nous construisons un agent IA de sourcing de talents passifs et aimerions explorer une collaboration. Seriez-vous ouverte à un échange de 20 minutes cette semaine ?'
),
(
  '6843ccab-f8b4-4306-93de-92356aaf7c4f',
  'demo-nicolas-thales',
  'Nicolas Henriot',
  'Bonjour Nicolas, votre expertise en NLP souverain chez Thales — notamment sur l''extraction d''entités complexes sur des corpus sécurisés — correspond parfaitement à un projet sur lequel nous travaillons. Votre expérience avec des modèles souverains serait un atout précieux. Êtes-vous ouvert à en discuter ?'
);
```

- [ ] **Step 3 : Remplacer les 5 searches par des requêtes variées**

```sql
DELETE FROM searches WHERE session_id = '6843ccab-f8b4-4306-93de-92356aaf7c4f';

INSERT INTO searches (session_id, query, profile_count, created_at) VALUES
('6843ccab-f8b4-4306-93de-92356aaf7c4f', 'Lead ML Engineer fintech Paris', 8, NOW() - INTERVAL '5 days'),
('6843ccab-f8b4-4306-93de-92356aaf7c4f', 'NLP Research Scientist défense souveraine', 6, NOW() - INTERVAL '3 days'),
('6843ccab-f8b4-4306-93de-92356aaf7c4f', 'Senior Python Engineer LLM startup Paris', 10, NOW() - INTERVAL '2 days'),
('6843ccab-f8b4-4306-93de-92356aaf7c4f', 'Data Scientist Computer Vision Paris', 7, NOW() - INTERVAL '1 day'),
('6843ccab-f8b4-4306-93de-92356aaf7c4f', 'AI Engineer NLP santé Paris', 9, NOW() - INTERVAL '4 hours');
```

- [ ] **Step 4 : Vérifier**

```sql
SELECT COUNT(*) FROM shortlist WHERE session_id = '6843ccab-f8b4-4306-93de-92356aaf7c4f';
-- Attendu : 3

SELECT COUNT(*) FROM outreach WHERE session_id = '6843ccab-f8b4-4306-93de-92356aaf7c4f';
-- Attendu : 2

SELECT query, profile_count FROM searches WHERE session_id = '6843ccab-f8b4-4306-93de-92356aaf7c4f' ORDER BY created_at DESC;
-- Attendu : 5 recherches variées
```

- [ ] **Step 5 : Vérifier dans le dashboard**

Ouvrir `https://hrflowhackathon2026.vercel.app` (prod Vercel, même session_id dans le localStorage). Vérifier que le header affiche **"3 shortlistés · 2 contactés"**.

> ⚠️ Si la session_id du navigateur prod est différente de `6843ccab-f8b4-4306-93de-92356aaf7c4f`, ouvrir la console → `localStorage.getItem('claw4hr_session_id')` → utiliser cette valeur pour les INSERTs.

---

## Task 5 — Documentation : format webhook OpenClaw

**Files:** `OPENCLAW_PROMPT.md` ou instructions à donner au bot OpenClaw

Pour que le moment Telegram fonctionne, OpenClaw doit envoyer le bon format après avoir transcrit le vocal :

```bash
# Format exact à envoyer au webhook
POST https://hrflowhackathon2026.vercel.app/api/openclaw/webhook
Content-Type: application/json

{
  "channel": "chat",
  "payload": {
    "query": "<texte transcrit du vocal>"
  }
}
```

- [ ] **Step 1 : Vérifier le format dans OPENCLAW_PROMPT.md**

Lire `OPENCLAW_PROMPT.md` et s'assurer que le skill de transcription Telegram envoie bien ce format. Si pas documenté, l'ajouter.

- [ ] **Step 2 : Test end-to-end**

Envoyer un vocal sur Telegram → vérifier dans les logs OpenClaw que le webhook est bien appelé → vérifier que la barre de recherche se pré-remplit sur `https://hrflowhackathon2026.vercel.app`.
