---
applyTo: "**"
---

# GitHub Copilot Instructions — StreamFlow Dashboard

## 🏗️ Stack & Versions

- **React 19** avec hooks fonctionnels uniquement (pas de class components)
- **TypeScript ~6** — mode strict activé, pas de `any` implicite
- **Vite 8** — build tool et dev server
- **Tailwind CSS v4** via `@tailwindcss/vite` (pas de `tailwind.config.js`)
- **Recharts 3** pour tous les graphiques
- **Lucide React** pour toutes les icônes
- **React Router DOM** pour la navigation

---

## 📁 Structure du projet

Respecter strictement cette arborescence :

```
src/
├── assets/              # Images, SVG statiques
├── components/          # Composants réutilisables (UI générique)
│   ├── ui/              # Composants atomiques (Button, Badge, Card...)
│   └── layout/          # Composants de mise en page (Sidebar, Header, Footer...)
├── features/            # Domaines métier : chaque feature est autonome
│   └── [feature]/
│       ├── components/  # Composants propres à la feature
│       ├── hooks/       # Hooks propres à la feature
│       └── types.ts     # Types propres à la feature
├── hooks/               # Hooks globaux réutilisables (ex: useMediaQuery)
├── layouts/             # Layouts de page (RootLayout, AuthLayout...)
├── pages/               # Une page = une route (ex: DashboardPage.tsx)
├── services/            # Appels API (fetch / axios) organisés par domaine
│   └── api/
│       ├── technical.ts
│       ├── project.ts
│       ├── devops.ts
│       └── business.ts
├── store/               # État global si besoin (Zustand recommandé)
├── types/               # Types et interfaces globaux
│   └── index.ts
├── utils/               # Fonctions utilitaires pures
├── data/                # Données statiques ou calculs KPI (ex: kpi.ts)
├── App.tsx              # Router principal
├── main.tsx             # Point d'entrée
└── index.css            # @import "tailwindcss" uniquement
```

---

## ✅ Conventions de nommage

| Élément              | Convention                             | Exemple                      |
| -------------------- | -------------------------------------- | ---------------------------- |
| Composants           | PascalCase                             | `KpiCard.tsx`, `Sidebar.tsx` |
| Hooks                | camelCase préfixé `use`                | `useKpiData.ts`              |
| Pages                | PascalCase suffixé `Page`              | `DashboardPage.tsx`          |
| Layouts              | PascalCase suffixé `Layout`            | `RootLayout.tsx`             |
| Services             | camelCase                              | `technicalService.ts`        |
| Types/Interfaces     | PascalCase préfixé `I` pour interfaces | `IKpiCard`, `KpiStatus`      |
| Constantes           | SCREAMING_SNAKE_CASE                   | `API_BASE_URL`               |
| Fichiers utilitaires | camelCase                              | `formatNumber.ts`            |

---

## 🧩 Règles pour les composants React

- **Un seul composant par fichier** — le nom du fichier = le nom du composant
- **Toujours typer les props** avec une `interface` nommée `[ComponentName]Props`
- **Exporter en named export** (pas de default export sauf `App.tsx` et les pages)
- **Pas de logique métier dans les composants UI** — déléguer aux hooks ou services
- **Pas de `useEffect` pour des données synchrones**

```tsx
// ✅ Bon
interface KpiCardProps {
  title: string;
  value: number;
  status: 'ok' | 'warning' | 'critical';
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, status }) => {
  return <div>...</div>;
};

// ❌ Mauvais
export default function kpicard(props: any) { ... }
```

---

## 🎨 Règles Tailwind CSS v4

- Utiliser **exclusivement les classes Tailwind** — pas de CSS inline, pas de fichiers `.css` par composant
- Le fichier `index.css` contient **uniquement** `@import "tailwindcss";`
- Grouper les classes dans cet ordre : layout → spacing → sizing → typography → colors → states
- Utiliser `clsx` ou `cn()` pour les classes conditionnelles

```tsx
// ✅ Bon
<div className="flex items-center gap-4 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:shadow-md">

// ❌ Mauvais
<div style={{ display: 'flex', padding: '8px' }}>
```

---

## 🔌 Règles pour les appels API (WireMock / Backend)

- **Tous les appels API** sont dans `src/services/api/`
- Utiliser la **base URL** via variable d'environnement : `import.meta.env.VITE_API_URL`
- Typer **les retours** de chaque service avec des interfaces dédiées dans `src/types/`
- Gérer systématiquement les états : `loading`, `error`, `data`
- Encapsuler les appels dans des **hooks custom** (`useTechnicalKpis`, `useProjectSprints`...)

```typescript
// src/services/api/technical.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function fetchTechnicalOverview(): Promise<TechnicalOverview> {
  const res = await fetch(`${BASE_URL}/api/technical/overview`);
  if (!res.ok) throw new Error("Failed to fetch technical overview");
  return res.json();
}
```

```tsx
// src/features/technical/hooks/useTechnicalOverview.ts
export function useTechnicalOverview() {
  const [data, setData] = useState<TechnicalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTechnicalOverview()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

---

## 🗂️ Règles pour les pages

- Une page = un fichier dans `src/pages/`
- Les pages **n'ont pas de logique** — elles composent des features/components
- Nommer systématiquement avec le suffixe `Page`

```tsx
// src/pages/DashboardPage.tsx
export const DashboardPage: React.FC = () => {
  return (
    <main className="p-6">
      <TechnicalSection />
      <ProjectSection />
    </main>
  );
};
```

---

## 🗺️ Règles pour le Router (React Router DOM)

- Définir toutes les routes dans `App.tsx` uniquement
- Utiliser des **layouts imbriqués** avec `<Outlet />`
- Les routes privées utilisent un composant `ProtectedRoute`
- Préférer `<Navigate>` à `window.location` pour les redirections

---

## 🪝 Règles pour les hooks

- **Un hook = un fichier** dans `src/hooks/` (global) ou `src/features/[feature]/hooks/` (local)
- Le nom commence toujours par `use`
- Ne pas appeler un hook conditionnellement
- Documenter avec un commentaire JSDoc ce que le hook expose

---

## 🔷 Règles TypeScript

- **Pas de `any`** — utiliser `unknown` puis narrowing si nécessaire
- **Pas d'assertion `as`** sauf cas justifié avec commentaire
- Préférer les `type` pour les unions/intersections, `interface` pour les shapes d'objets
- Exporter tous les types depuis `src/types/index.ts`
- Toujours typer les retours de fonctions

```typescript
// ✅ Bon
type KpiStatus = "ok" | "warning" | "critical";

interface KpiMetric {
  value: number;
  unit: string;
  status: KpiStatus;
  threshold?: number;
}

// ❌ Mauvais
const kpi: any = { value: 4, status: "critical" };
```

---

## 📦 Imports

- Utiliser les **alias de path** — `@/` pointe vers `src/`
- Ordonner les imports : 1) React, 2) librairies externes, 3) composants internes, 4) hooks, 5) types, 6) assets/styles
- Pas d'import par défaut sauf pour `App`, les pages et les librairies externes qui l'exigent

```tsx
// ✅ Ordre correct
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart } from "recharts";

import { KpiCard } from "@/components/ui/KpiCard";
import { useTechnicalKpis } from "@/features/technical/hooks/useTechnicalKpis";
import type { KpiMetric } from "@/types";
```

---

## 🚫 Interdictions

- ❌ Pas de `console.log` en production — utiliser un logger ou supprimer
- ❌ Pas de `useEffect` sans tableau de dépendances
- ❌ Pas de logique métier dans `App.tsx`
- ❌ Pas de styles inline (`style={{}}`) sauf exception documentée
- ❌ Pas de fichier de plus de **200 lignes** — diviser en sous-composants
- ❌ Pas de mutation directe du state (`state.push(...)`) — toujours immutable
- ❌ Pas de `react-router-dom` `<Link>` dans les composants UI génériques

---

## 🌐 Variables d'environnement

Toutes les variables dans `.env.local` (non commité) :

```env
VITE_API_URL=http://localhost:8080
```

Accès dans le code : `import.meta.env.VITE_API_URL`  
Toujours préfixer par `VITE_` pour les exposer au client.

---

## ✔️ Checklist avant chaque PR

- [ ] Pas de `any` TypeScript
- [ ] Props typées avec interface
- [ ] Composants < 200 lignes
- [ ] Aucun `console.log`
- [ ] Variables d'env utilisées pour les URLs
- [ ] Imports triés et alias utilisés
- [ ] Nom des fichiers respecte les conventions
