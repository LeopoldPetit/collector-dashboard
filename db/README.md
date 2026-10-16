# StreamFlow — Base de données locale

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose v2

## Démarrage rapide

```bash
# Démarrer Postgres et appliquer les migrations Flyway
docker compose up -d

# Vérifier les logs Flyway
docker compose logs flyway

# Se connecter à la base
psql -h localhost -p 5432 -U streamflow -d streamflow
# mot de passe : streamflow
```

## Structure

| Conteneur           | Rôle                                          |
| ------------------- | --------------------------------------------- |
| `streamflow_db`     | PostgreSQL 16 exposé sur `localhost:5432`     |
| `streamflow_flyway` | Flyway — applique les migrations au démarrage |

## Migrations Flyway (`db/migrations/`)

| Fichier                 | Contenu                              |
| ----------------------- | ------------------------------------ |
| `V1__create_schema.sql` | Création de toutes les tables        |
| `V2__seed_data.sql`     | Données initiales issues du WireMock |

## Tables

### Technical

- `technical_overview` — KPIs techniques globaux
- `technical_incidents` — liste des incidents _(alimentée via le formulaire d'ajout UI)_
- `technical_incidents_summary` — agrégats incidents
- `technical_response_time_samples` — mesures individuelles de temps de réponse
- `technical_response_time_stats` — statistiques (min, max, avg, p50, p90, p95)

### Project

- `project_overview` — bugs, features, fix rate
- `project_sprints` — vélocité par sprint _(alimentée via le formulaire d'ajout UI)_
- `project_sprints_summary` — agrégats sprints

### DevOps

- `devops_overview` — déploiements, lead time, équipe _(composition modifiable via les boutons +/− UI)_

### Business

- `business_overview` — revenue, ARPU, conversions, churn
- `business_users` — utilisateurs actifs / churn / nouveaux _(valeurs éditables en double-clic UI)_
- `business_user_evolution` — évolution début/fin de mois

### Dashboard

- `dashboard_kpis` — KPIs de la page d'accueil
- `dashboard_request_volume` — volume de requêtes par créneau horaire
- `dashboard_weekly_deploys` — déploiements par jour de la semaine
- `dashboard_recent_activity` — fil d'activité récente _(alimentée via le formulaire d'ajout UI)_

### Transversal

- `notifications` — notifications utilisateur
- `kpi_summary` + `kpi_metrics` — récapitulatif global des KPIs

## Insertions depuis l'interface

Les fonctionnalités interactives du dashboard écrivent directement dans la base via l'API backend :

| UI                            | Table cible                 | Route                           |
| ----------------------------- | --------------------------- | ------------------------------- |
| Bouton + activité (Dashboard) | `dashboard_recent_activity` | `POST /api/dashboard/activity`  |
| Bouton + incident (Technical) | `technical_incidents`       | `POST /api/technical/incidents` |
| Bouton + sprint (Projects)    | `project_sprints`           | `POST /api/project/sprints`     |
| Boutons +/− équipe (DevOps)   | `devops_overview`           | `POST /api/devops/overview`     |
| Double-clic valeur (Business) | `business_users`            | `POST /api/business/users`      |

## Arrêt & nettoyage

```bash
# Arrêter sans supprimer les données
docker compose stop

# Tout supprimer (y compris le volume)
docker compose down -v
```
