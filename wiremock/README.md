# WireMock — StreamFlow Mock API

Serveur de mock HTTP **GET uniquement** pour simuler le backend de lecture de l'application StreamFlow sans base de données.

> ⚠️ **Limitation** : WireMock ne supporte que les requêtes GET. Les fonctionnalités d'écriture de l'interface (ajout d'incidents, de sprints, d'activités, mise à jour de l'équipe et des stats utilisateurs) nécessitent le **backend réel** (`backend/` + PostgreSQL via `docker compose up -d`).

---

## 📁 Structure

```text
wiremock/
├── mappings/
│   └── all-mappings.json      # Déclaration de toutes les routes
├── __files/
│   ├── technical/
│   │   ├── overview.json      # Métriques techniques globales
│   │   ├── response-times.json# Échantillon temps de réponse API
│   │   └── incidents.json     # Liste des incidents du mois
│   ├── project/
│   │   ├── overview.json      # Vue globale projet (bugs, features)
│   │   └── sprints.json       # Données des 3 derniers sprints
│   ├── devops/
│   │   └── overview.json      # Déploiements, lead time, équipe
│   ├── business/
│   │   ├── overview.json      # Revenus, churn, conversion
│   │   └── users.json         # Évolution des utilisateurs
│   └── kpis/
│       └── summary.json       # Résumé calculé de tous les KPI
└── wiremock.config.json        # Configuration du serveur
```

---

## 🚀 Lancement

### Option 1 — Docker (recommandé)

```bash
docker run -it --rm \
  -p 8080:8080 \
  -v $PWD/wiremock:/home/wiremock \
  wiremock/wiremock:latest \
  --root-dir /home/wiremock \
  --port 8080
```

### Option 2 — JAR

```bash
# Télécharger le JAR
curl -o wiremock.jar https://repo1.maven.org/maven2/org/wiremock/wiremock-standalone/3.5.4/wiremock-standalone-3.5.4.jar

# Lancer depuis le dossier wiremock/
cd wiremock
java -jar wiremock.jar --port 8080
```

---

## 📡 Endpoints disponibles

| Méthode | URL                             | Description                                     |
| ------- | ------------------------------- | ----------------------------------------------- |
| `GET`   | `/api/technical/overview`       | Métriques techniques (error rate, uptime, MTTR) |
| `GET`   | `/api/technical/response-times` | Échantillon + stats temps de réponse            |
| `GET`   | `/api/technical/incidents`      | Liste des incidents du mois                     |
| `GET`   | `/api/project/overview`         | Bugs détectés/corrigés, features                |
| `GET`   | `/api/project/sprints`          | Vélocité des 3 sprints                          |
| `GET`   | `/api/devops/overview`          | Déploiements, CFR, lead time                    |
| `GET`   | `/api/business/overview`        | Revenus, churn, conversion                      |
| `GET`   | `/api/business/users`           | Évolution utilisateurs actifs                   |
| `GET`   | `/api/kpis/summary`             | Résumé complet de tous les KPI avec statuts     |

---

## 🧪 Test rapide

```bash
# Vérifier que WireMock tourne
curl http://localhost:8080/api/kpis/summary | jq .

# Récupérer les données des sprints
curl http://localhost:8080/api/project/sprints | jq .
```

## ⚙️ Configuration frontend

Pour pointer le frontend vers WireMock, créer `.env.local` à la racine :

```env
VITE_API_URL=http://localhost:8080
```

## 🔄 Vs Backend réel

| Capacité                                | WireMock | Backend réel |
| --------------------------------------- | :------: | :----------: |
| Lecture des données (GET)               |    ✅    |      ✅      |
| Ajout d'incidents / sprints / activités |    ❌    |      ✅      |
| Modification de l'équipe (DevOps)       |    ❌    |      ✅      |
| Édition inline des stats Business       |    ❌    |      ✅      |
| Persistance des données                 |    ❌    |      ✅      |

Pour activer toutes les fonctionnalités interactives, utiliser le backend réel :

```bash
docker compose up -d        # PostgreSQL + Flyway
cd backend && npm run dev   # API sur http://localhost:3001
```
