#!/usr/bin/env bash

set -e

# ─── Config ───────────────────────────────────────────────────────────────────
WIREMOCK_PORT=8080
WIREMOCK_VERSION="3.5.4"
CONTAINER_NAME="streamflow-wiremock"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ─── Couleurs ─────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   StreamFlow — WireMock Mock API     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# ─── Vérifier que Docker est disponible ───────────────────────────────────────
if ! command -v docker &> /dev/null; then
  echo -e "${RED}❌ Docker n'est pas installé ou n'est pas dans le PATH.${NC}"
  echo "   Installe Docker Desktop : https://www.docker.com/products/docker-desktop"
  exit 1
fi

if ! docker info &> /dev/null; then
  echo -e "${RED}❌ Le daemon Docker ne tourne pas. Lance Docker Desktop et réessaie.${NC}"
  exit 1
fi

# ─── Stopper un éventuel conteneur existant ───────────────────────────────────
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo -e "${YELLOW}⚠  Conteneur '${CONTAINER_NAME}' déjà existant → suppression...${NC}"
  docker rm -f "${CONTAINER_NAME}" > /dev/null
fi

# ─── Lancer WireMock ──────────────────────────────────────────────────────────
echo -e "🚀 Démarrage de WireMock ${WIREMOCK_VERSION} sur le port ${WIREMOCK_PORT}..."
echo ""

docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${WIREMOCK_PORT}:8080" \
  -v "${SCRIPT_DIR}:/home/wiremock" \
  "wiremock/wiremock:${WIREMOCK_VERSION}" \
  --root-dir /home/wiremock \
  --port 8080 \
  --verbose

# ─── Attendre que WireMock soit prêt ──────────────────────────────────────────
echo -e "⏳ Attente que WireMock soit prêt..."
MAX_RETRIES=15
COUNT=0
until curl -s "http://localhost:${WIREMOCK_PORT}/__admin/health" | grep -q "healthy" 2>/dev/null || [ $COUNT -ge $MAX_RETRIES ]; do
  sleep 1
  COUNT=$((COUNT + 1))
done

if [ $COUNT -ge $MAX_RETRIES ]; then
  echo -e "${YELLOW}⚠  WireMock met du temps à démarrer. Vérifiez avec : docker logs ${CONTAINER_NAME}${NC}"
else
  echo -e "${GREEN}✅ WireMock est prêt !${NC}"
fi

# ─── Résumé des endpoints ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}📡 Endpoints disponibles :${NC}"
echo "   GET  http://localhost:${WIREMOCK_PORT}/api/technical/overview"
echo "   GET  http://localhost:${WIREMOCK_PORT}/api/technical/response-times"
echo "   GET  http://localhost:${WIREMOCK_PORT}/api/technical/incidents"
echo "   GET  http://localhost:${WIREMOCK_PORT}/api/project/overview"
echo "   GET  http://localhost:${WIREMOCK_PORT}/api/project/sprints"
echo "   GET  http://localhost:${WIREMOCK_PORT}/api/devops/overview"
echo "   GET  http://localhost:${WIREMOCK_PORT}/api/business/overview"
echo "   GET  http://localhost:${WIREMOCK_PORT}/api/business/users"
echo "   GET  http://localhost:${WIREMOCK_PORT}/api/kpis/summary"
echo ""
echo -e "${GREEN}🔧 Commandes utiles :${NC}"
echo "   Logs    → docker logs -f ${CONTAINER_NAME}"
echo "   Stop    → docker stop ${CONTAINER_NAME}"
echo "   Admin   → http://localhost:${WIREMOCK_PORT}/__admin/mappings"
echo ""
