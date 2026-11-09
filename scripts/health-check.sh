#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env

log "6/6 Comprobando que ambos servicios responden"

EXPECTED_COMMIT="${EXPECTED_COMMIT:-}"
BACKEND_URL="${BACKEND_URL%/}"
FRONTEND_PUBLIC_URL="${FRONTEND_PUBLIC_URL%/}"

attempts="${HEALTH_ATTEMPTS:-40}"
for i in $(seq 1 "$attempts"); do
  body="$(curl -fsS --max-time 25 "$BACKEND_URL/health" 2>/dev/null || true)"
  if echo "$body" | grep -q '"status":"ok"'; then
    if [ -z "$EXPECTED_COMMIT" ] || echo "$body" | grep -q "$EXPECTED_COMMIT"; then
      ok "Backend responde: $BACKEND_URL/health"
      break
    fi
    echo "  [$i/$attempts] Backend responde, pero aun sirve una version anterior..."
  else
    echo "  [$i/$attempts] Backend aun no responde..."
  fi
  [ "$i" -lt "$attempts" ] || fail "El backend no respondio correctamente en $BACKEND_URL/health tras $attempts intentos."
  sleep 15
done

# Frontend
for i in $(seq 1 10); do
  if curl -fsS --max-time 20 -o /dev/null "$FRONTEND_PUBLIC_URL"; then
    ok "Frontend responde: $FRONTEND_PUBLIC_URL"
    exit 0
  fi
  echo "  [$i/10] Frontend aun no responde..."
  sleep 5
done
fail "El frontend no respondio en $FRONTEND_PUBLIC_URL."