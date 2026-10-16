# 📊 Dashboard de Pilotage — StreamFlow

> Tableau de bord opérationnel interactif pour la plateforme SaaS de streaming vidéo **StreamFlow**

---

## 🏢 Contexte

**StreamFlow** est une plateforme SaaS de streaming vidéo (films, séries, documentaires).

| Info                         | Valeur                                       |
| ---------------------------- | -------------------------------------------- |
| Utilisateurs inscrits        | 250 000                                      |
| Utilisateurs actifs mensuels | 120 000                                      |
| Abonnement                   | 9,99 €/mois                                  |
| Équipe                       | 15 devs · 2 DevOps · 1 PO · 1 CTO            |
| Stack                        | React · Node.js · PostgreSQL · AWS · Grafana |

Depuis 2 mois, des problèmes critiques ont été remontés : lenteur des vidéos, erreurs de paiement, augmentation des désabonnements, bugs fréquents en production et retards de livraison.

---

## 🎯 Objectif

Ce dashboard permet de :

- **Comprendre les problèmes** via les KPI calculés
- **Suivre la performance** technique, projet, DevOps et business
- **Prendre des décisions** éclairées en tant que CTO
- **Saisir et mettre à jour les données** directement depuis l'interface

---

## 📐 KPI Calculés

### ⚙️ KPI Techniques

| KPI               | Valeur       | Formule                        |
| ----------------- | ------------ | ------------------------------ |
| Error Rate        | **4%**       | 48 000 / 1 200 000 × 100       |
| Temps moyen API   | **562 ms**   | Moyenne de l'échantillon       |
| P95 Temps réponse | **2 500 ms** | Percentile 95 de l'échantillon |
| Uptime            | **99,1%**    | (720h - 6,5h) / 720h × 100     |
| MTTR              | **1,6 h**    | (2 + 1 + 3 + 0,5) / 4          |

### 📋 KPI Projet

| KPI                | Valeur                 | Formule                |
| ------------------ | ---------------------- | ---------------------- |
| Vélocité S1        | **35 / 40 SP** (87,5%) | Réalisé / Prévu        |
| Vélocité S2        | **30 / 45 SP** (66,7%) | Réalisé / Prévu        |
| Vélocité S3        | **25 / 50 SP** (50%)   | Réalisé / Prévu        |
| Évolution vélocité | **-42% sur 3 sprints** | Tendance baissière     |
| Bug Rate           | **5,3 bugs/feature**   | 320 bugs / 60 features |
| Fix Rate           | **56,3%**              | 180 / 320 × 100        |

### 🚀 KPI DevOps (DORA Metrics)

| KPI                  | Valeur         | Formule                           |
| -------------------- | -------------- | --------------------------------- |
| Deployment Frequency | **1,3 / jour** | 40 déploiements / 30 jours        |
| Change Failure Rate  | **30%**        | 12 échecs / 40 déploiements × 100 |
| Lead Time            | **5 jours**    | Donnée brute                      |

### 💼 KPI Business

| KPI             | Valeur    | Formule                                     |
| --------------- | --------- | ------------------------------------------- |
| Churn Rate      | **33,3%** | 40 000 perdus / 120 000 début × 100         |
| Retention Rate  | **66,7%** | 100% - Churn Rate                           |
| ARPU            | **10 €**  | 1 000 000 € / 100 000 utilisateurs          |
| Conversion Rate | **4%**    | 8 000 abonnements / 200 000 visiteurs × 100 |

---

## ✏️ Fonctionnalités interactives

Le dashboard permet de saisir et persister des données directement depuis l'interface, avec un POST automatique vers le backend.

### 🗂 Dashboard — Recent Activity

- Bouton **+ Ajouter** en haut à droite du fil d'activité
- Champs : label, temps, sévérité (`info` / `ok` / `warning` / `critical`)
- `POST /api/dashboard/activity`

### 🔴 Technical — Incidents

- Bouton **+ Ajouter** en haut à droite du tableau des incidents
- Champs : titre, durée (heures + minutes), sévérité, statut
- `POST /api/technical/incidents`

### 📋 Projects — Sprint Details

- Bouton **+ Nouveau sprint** en haut à droite du tableau des sprints
- Champs : nom, abréviation, points planifiés, points réalisés, statut
- La vélocité (%) est calculée automatiquement
- `POST /api/project/sprints`

### ⚙️ DevOps — Composition de l'équipe

- Boutons **+** et **−** sur chaque ligne (Développeurs, DevOps, Product Owner, CTO)
- Mise à jour immédiate avec refetch
- `POST /api/devops/overview`

### 💼 Business — Statistiques utilisateurs

- **Double-clic** sur une valeur (total inscrits, actifs mensuels, nouveaux, churned)
- La valeur devient un champ éditable — **Entrée** pour valider, **Échap** pour annuler
- `POST /api/business/users`

---

## 🔍 Analyse

### 1. Problèmes majeurs

- **Churn massif** : 40 000 utilisateurs perdus en un mois (−33%) dû aux bugs de paiement et de chargement
- **Instabilité de la prod** : CFR à 30% (seuil DORA Elite : < 5%) — les déploiements introduisent des régressions
- **Effondrement de la vélocité** : de 87,5% à 50% en 3 sprints — l'équipe corrige plus qu'elle ne développe
- **Performance dégradée** : P95 à 2 500 ms, bien au-delà du seuil acceptable de 500 ms

### 2. KPI critiques

| KPI                 | Valeur actuelle | Seuil d'alerte             |
| ------------------- | --------------- | -------------------------- |
| Churn Rate          | 33,3%           | > 5%                       |
| Change Failure Rate | 30%             | > 5%                       |
| P95 Temps réponse   | 2 500 ms        | > 500 ms                   |
| Fix Rate            | 56,3%           | < 80%                      |
| Vélocité (tendance) | −42%            | Toute baisse sur 2 sprints |

### 3. Liens technique ↔ business

```text
Bugs prod (CFR 30%) → Erreurs paiement → Churn +33%
P95 2500ms → "Vidéos ne se lancent pas" → Résiliations
Vélocité -42% → Moins de features → Moins de rétention
```

---

## 🎯 Plan d'action CTO — 5 Priorités

| Priorité | Action                                                                             | KPI ciblés             |
| -------- | ---------------------------------------------------------------------------------- | ---------------------- |
| 🔴 P1    | **Stabiliser la prod** — Feature flags, tests auto, rollback automatique           | CFR, Error Rate        |
| 🔴 P2    | **Réduire le churn** — Corriger bugs paiement + chargement vidéo en urgence        | Churn Rate, Fix Rate   |
| 🟡 P3    | **Améliorer les performances** — CDN vidéo, cache API, profiling Node.js           | P95, Avg Response Time |
| 🟡 P4    | **Restaurer la vélocité** — Limiter bugs ouverts à 50 max, tests unitaires         | Vélocité, Bug Rate     |
| 🟢 P5    | **Réduire le Lead Time** — CI/CD complète, tests de non-régression, cible < 1 jour | Lead Time, Deploy Freq |

---

## 🚀 Installation & Lancement

### Prérequis

- **Node.js 20+**
- **Docker Desktop** (pour le backend et la base de données)
- **Python 3.x** (pour pre-commit)

### ⚡ Lancement en une seule commande

```bash
git clone https://github.com/LeopoldPetit/dashboard-template.git
cd dashboard-template
npm install
./start.sh
```

Ou via npm :

```bash
npm run dev:full
```

Le script `start.sh` :

1. Vérifie que Docker et Node.js sont disponibles
2. Démarre **PostgreSQL + Flyway + Backend** via Docker Compose
3. Attend que le backend soit healthy sur <http://localhost:3001>
4. Crée `.env.local` automatiquement si absent
5. Lance **Vite** (frontend) en foreground
6. **Ctrl+C** arrête tout proprement (frontend + Docker Compose)

| Service  | URL                                 |
| -------- | ----------------------------------- |
| Frontend | <http://localhost:5173>             |
| Backend  | <http://localhost:3001>             |
| Base PG  | `localhost:5432` (user: streamflow) |

### Lancement manuel (par composant)

#### Frontend seul

```bash
# Cloner le projet
git clone https://github.com/LeopoldPetit/dashboard-template.git
cd dashboard-template

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Builder pour la production
npm run build
```

L'application sera disponible sur <http://localhost:5173>

#### Backend (API Node.js + PostgreSQL)

```bash
# Cloner le projet
git clone https://github.com/LeopoldPetit/dashboard-template.git
cd dashboard-template

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Builder pour la production
npm run build
```

L'application sera disponible sur <http://localhost:5173>

#### Backend seul (API Node.js + PostgreSQL)

```bash
# Démarrer PostgreSQL via Docker Compose
docker compose up -d

# Installer les dépendances du backend
cd backend && npm install

# Lancer le serveur de développement
npm run dev
```

L'API sera disponible sur <http://localhost:3001\>

### Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
VITE_API_URL=http://localhost:3001
```

### Alternative — WireMock (mock sans base de données)

```bash
./wiremock/wiremock.sh
```

Le serveur mock démarre sur <http://localhost:8080>. Utiliser `VITE_API_URL=http://localhost:8080`.

---

## 🛡️ Vue Collector — métriques poussées par la CI

La page `/collector` affiche les métriques qualité, sécurité, tests et performance du projet Collector.shop. Les pipelines CI les envoient à l'API, et le backend calcule le statut de chaque métrique.

### Endpoints

| Méthode | Route | Rôle |
|---------|-------|------|
| `POST` | `/api/collector/metrics` | Ingestion (header `X-Ingest-Token` requis) |
| `GET` | `/api/collector/overview` | Dernière valeur de chaque métrique, par service |
| `GET` | `/api/collector/history?service=&name=&limit=` | Série temporelle d'une métrique (défaut 50, max 200) |

Le token est lu dans la variable d'environnement `INGEST_TOKEN`. Si elle n'est pas définie, l'ingestion répond `503`. La valeur `dev-ingest-token` n'est qu'un défaut local de `docker-compose.yml` : ne pas l'utiliser en production.

### Payload d'ingestion

```json
{
  "service": "collector-catalog-api",
  "commitSha": "3f9a88e...",
  "pipelineRun": "123456",
  "metrics": [
    { "name": "coverage.lines", "value": 87.4, "category": "tests", "unit": "%" },
    { "name": "sonar.quality_gate", "value": 1, "category": "quality" },
    { "name": "npm_audit.critical", "value": 0, "category": "security" },
    { "name": "k6.p95_ms", "value": 240, "category": "performance", "unit": "ms" }
  ]
}
```

Limite : 500 métriques par requête. `category` vaut `quality`, `security`, `tests` ou `performance`.

### Seuils par défaut

| Métrique | ok | warning | critical |
|----------|----|---------|----------|
| `coverage.*` | ≥ 80 | ≥ 60 | < 60 |
| `sonar.quality_gate` | = 1 | | autre |
| `sonar.bugs`, `sonar.vulnerabilities`, `npm_audit.critical`, `trivy.critical`, `tests.failed` | = 0 | | > 0 |
| `npm_audit.high`, `trivy.high` | = 0 | > 0 | |
| `k6.p95_ms` | ≤ 500 | ≤ 1000 | > 1000 |
| `k6.error_rate` | < 1 | < 5 | ≥ 5 |

Les autres métriques ont le statut `info`.

### Envoi depuis GitHub Actions

Ajouter ces secrets au dépôt qui exécute le pipeline : `COLLECTOR_INGEST_TOKEN` (même valeur que `INGEST_TOKEN` côté dashboard) et `COLLECTOR_DASHBOARD_URL` (URL de base de l'API).

```yaml
- name: Push metrics to collector dashboard
  env:
    TOKEN: ${{ secrets.COLLECTOR_INGEST_TOKEN }}
    URL: ${{ secrets.COLLECTOR_DASHBOARD_URL }}
  run: |
    curl -fsS -X POST "$URL/api/collector/metrics" \
      -H "Content-Type: application/json" \
      -H "X-Ingest-Token: $TOKEN" \
      -d '{"service":"collector-catalog-api","commitSha":"${{ github.sha }}","pipelineRun":"${{ github.run_id }}","metrics":[{"name":"tests.failed","value":0,"category":"tests"}]}'
```

## 🧪 Tests

### Tests unitaires du backend

```bash
cd backend
npm test                 # Lancer tous les tests
npm run test:coverage    # Avec rapport de couverture
```

Les tests couvrent :

- Tous les endpoints GET et POST (technical, project, devops, business, dashboard, notifications, kpis)
- La fonction utilitaire `requireFields`
- Le pool PostgreSQL est mocké — aucune base de données requise pour les tests

> Résultat actuel : 44 tests, 8 suites — 0 échec

### Pre-commit hooks

```bash
# Installer le virtualenv Python et les hooks
python3 -m venv .venv
source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt
pre-commit install

# Lancer manuellement sur tous les fichiers
pre-commit run --all-files
```

Hooks configurés : trailing whitespace · end-of-file · YAML check · ESLint · Prettier · TypeScript type check

---

## 🛠️ Stack Technique

| Technologie          | Usage                            |
| -------------------- | -------------------------------- |
| **React 19**         | Framework UI                     |
| **TypeScript ~6**    | Typage statique strict           |
| **Vite 8**           | Build tool & Dev server          |
| **Tailwind CSS v4**  | Styles utilitaires               |
| **Recharts 3**       | Graphiques (Area, Bar, Funnel)   |
| **Lucide React**     | Icônes                           |
| **React Router DOM** | Navigation SPA                   |
| **Express**          | Backend API REST                 |
| **PostgreSQL 16**    | Base de données                  |
| **Flyway**           | Migrations de base de données    |
| **Jest + Supertest** | Tests unitaires backend          |
| **WireMock**         | Mock backend alternatif (Docker) |

---

## 📁 Structure du projet

```text
dashboard-template/
├── src/                          # Frontend React
│   ├── components/
│   │   ├── ui/                   # Modal, Card, Badge, KpiCard
│   │   └── layout/               # Sidebar, TopBar
│   ├── features/
│   │   ├── dashboard/            # Activité récente + AddActivityForm
│   │   ├── technical/            # Incidents + AddIncidentForm
│   │   ├── project/              # Sprints + AddSprintForm
│   │   ├── devops/               # Équipe avec boutons +/− interactifs
│   │   └── business/             # Stats utilisateurs éditables (double-clic)
│   ├── pages/                    # DashboardPage, TechnicalPage, ProjectsPage…
│   ├── services/api/             # Fonctions fetch GET + POST par domaine
│   ├── hooks/                    # Hooks globaux (useNotifications)
│   └── types/                    # Interfaces TypeScript globales
├── backend/
│   ├── src/
│   │   ├── routes/               # Express routers (technical, project, devops…)
│   │   ├── __tests__/            # Tests Jest + Supertest (44 tests)
│   │   └── __mocks__/            # Mock du pool PostgreSQL
│   └── package.json
├── db/
│   └── migrations/               # V1__create_schema.sql · V2__seed_data.sql
├── wiremock/                      # Mock HTTP alternatif
├── .pre-commit-config.yaml        # Hooks de qualité de code
├── requirements.txt               # Dépendances Python (pre-commit)
└── docker-compose.yml             # PostgreSQL + Flyway
```

---

## 📡 API REST — Endpoints

### ⚙️ Technique

| Méthode | Endpoint                        | Description                                   |
| ------- | ------------------------------- | --------------------------------------------- |
| `GET`   | `/api/technical/overview`       | Error rate, uptime, MTTR, temps de réponse    |
| `GET`   | `/api/technical/response-times` | Échantillon + stats (min, max, p50, p90, p95) |
| `GET`   | `/api/technical/incidents`      | Liste des incidents + résumé                  |
| `POST`  | `/api/technical/overview`       | Créer un snapshot technique                   |
| `POST`  | `/api/technical/incidents`      | **Ajouter un incident** _(formulaire UI)_     |
| `POST`  | `/api/technical/response-times` | Insérer des mesures de temps de réponse       |

### 📋 Projet

| Méthode | Endpoint                | Description                             |
| ------- | ----------------------- | --------------------------------------- |
| `GET`   | `/api/project/overview` | Bugs, features, fix rate, bug rate      |
| `GET`   | `/api/project/sprints`  | Vélocité des sprints                    |
| `POST`  | `/api/project/overview` | Créer un snapshot projet                |
| `POST`  | `/api/project/sprints`  | **Ajouter un sprint** _(formulaire UI)_ |

### 🚀 DevOps

| Méthode | Endpoint               | Description                                                |
| ------- | ---------------------- | ---------------------------------------------------------- |
| `GET`   | `/api/devops/overview` | Déploiements, lead time, composition équipe                |
| `POST`  | `/api/devops/overview` | **Mettre à jour la composition équipe** _(boutons +/− UI)_ |

### 💼 Business

| Méthode | Endpoint                 | Description                                         |
| ------- | ------------------------ | --------------------------------------------------- |
| `GET`   | `/api/business/overview` | Revenus, ARPU, churn, retention, conversion         |
| `GET`   | `/api/business/users`    | Statistiques utilisateurs + évolution               |
| `POST`  | `/api/business/overview` | Créer un snapshot business                          |
| `POST`  | `/api/business/users`    | **Modifier les stats utilisateurs** _(double-clic)_ |

### 🗂 Dashboard

| Méthode | Endpoint                        | Description                                           |
| ------- | ------------------------------- | ----------------------------------------------------- |
| `GET`   | `/api/dashboard/overview`       | KPIs, volume requêtes, déploiements, activité récente |
| `POST`  | `/api/dashboard/activity`       | **Ajouter une activité** _(formulaire UI)_            |
| `POST`  | `/api/dashboard/kpis`           | Créer un KPI dashboard                                |
| `POST`  | `/api/dashboard/request-volume` | Insérer un point de volume                            |
| `POST`  | `/api/dashboard/weekly-deploys` | Insérer un déploiement hebdomadaire                   |

### 🔔 Notifications

| Méthode | Endpoint             | Description              |
| ------- | -------------------- | ------------------------ |
| `GET`   | `/api/notifications` | Liste + compteur non lus |
| `POST`  | `/api/notifications` | Créer une notification   |

### 📊 KPI Global

| Méthode | Endpoint            | Description                                              |
| ------- | ------------------- | -------------------------------------------------------- |
| `GET`   | `/api/kpis/summary` | Tous les KPI avec statut (`ok` / `warning` / `critical`) |
| `POST`  | `/api/kpis/summary` | Créer un résumé KPI complet avec métriques               |

---

## ✅ Livrables

- [x] **KPI calculés** avec seuils d'alerte et statuts visuels
- [x] **Dashboard interactif** — 5 pages (Dashboard, Technical, Projects, DevOps, Business)
- [x] **Saisie de données** — formulaires modaux, édition inline double-clic, boutons +/−
- [x] **Backend REST** — Express + PostgreSQL, 14 routes GET + POST
- [x] **Tests unitaires** — 44 tests Jest/Supertest, pool DB mocké, 0 dépendance externe
- [x] **Pre-commit hooks** — ESLint, Prettier, TypeScript, whitespace
- [x] **Migrations Flyway** — schéma complet + données de seed
- [x] **WireMock** — mock HTTP alternatif pour développement sans base de données
- [x] **Analyse** et **plan d'action CTO** en 5 priorités justifiées par les KPI
