#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# StreamFlow — Lancement complet en une commande
#   - PostgreSQL + Flyway (migrations) + Backend  → Docker Compose
#   - Frontend Vite                               → npm run dev
#
# Usage : ./start.sh
# Arrêt  : Ctrl+C  (le script arrête aussi Docker Compose)
# ─────────────────────────────────────────────────────────────
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Couleurs ──────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${CYAN}[StreamFlow]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; }

# ── Nettoyage à l'arrêt ───────────────────────────────────────
cleanup() {
  echo ""
  log "Arrêt en cours…"
  docker compose -f "$ROOT_DIR/docker-compose.yml" stop postgres flyway backend 2>/dev/null || true
  ok "Docker Compose arrêté."
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── 1. Vérification des prérequis ─────────────────────────────
log "Vérification des prérequis…"

if ! command -v docker &>/dev/null; then
  err "Docker n'est pas installé. Installer Docker Desktop : https://docs.docker.com/get-docker/"
  exit 1
fi

if ! docker info &>/dev/null; then
  err "Docker Desktop n'est pas démarré. Lance Docker Desktop puis relance ce script."
  exit 1
fi

if ! command -v node &>/dev/null; then
  err "Node.js n'est pas installé. https://nodejs.org"
  exit 1
fi

ok "Docker ✓  Node.js $(node --version) ✓"

# ── 2. Installer les dépendances front si besoin ──────────────
if [ ! -d "$ROOT_DIR/node_modules" ]; then
  log "Installation des dépendances frontend…"
  npm install --prefix "$ROOT_DIR" --silent
fi

# ── 3. Démarrer PostgreSQL + Flyway + Backend via Docker Compose ──
log "Démarrage de PostgreSQL, Flyway et du backend…"
docker compose -f "$ROOT_DIR/docker-compose.yml" up -d --build postgres flyway backend

# ── 4. Attendre que le backend soit healthy ───────────────────
log "Attente que le backend soit prêt sur http://localhost:3001…"
MAX_WAIT=60
WAITED=0
until curl -sf http://localhost:3001/health >/dev/null 2>&1; do
  if [ "$WAITED" -ge "$MAX_WAIT" ]; then
    err "Le backend n'a pas démarré après ${MAX_WAIT}s. Vérifie les logs :"
    docker compose -f "$ROOT_DIR/docker-compose.yml" logs --tail=30 backend
    exit 1
  fi
  sleep 2
  WAITED=$((WAITED + 2))
  echo -n "."
done
echo ""
ok "Backend prêt ✓  (http://localhost:3001)"

# ── 5. Créer .env.local si absent ────────────────────────────
if [ ! -f "$ROOT_DIR/.env.local" ]; then
  warn ".env.local absent — création automatique avec VITE_API_URL=http://localhost:3001"
  echo "VITE_API_URL=http://localhost:3001" > "$ROOT_DIR/.env.local"
fi

# ── 6. Lancer le frontend Vite ────────────────────────────────
log "Démarrage du frontend Vite…"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  StreamFlow est prêt !${NC}"
echo -e "  Frontend  →  ${CYAN}http://localhost:5173${NC}"
echo -e "  Backend   →  ${CYAN}http://localhost:3001${NC}"
echo -e "  DB        →  ${CYAN}localhost:5432${NC}  (user: streamflow)"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Lance Vite en foreground (Ctrl+C déclenche cleanup)
npm run dev --prefix "$ROOT_DIR"
