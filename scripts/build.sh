#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env

log "2/6 Construyendo backend y frontend"

(cd "$ROOT_DIR/backend" && npm ci --no-audit --no-fund) || fail "Fallo la instalacion del backend."
(cd "$ROOT_DIR/frontend" && npm ci --no-audit --no-fund) || fail "Fallo la instalacion del frontend."
(cd "$ROOT_DIR/frontend" && VITE_API_URL="$BACKEND_URL" npm run build) || fail "Fallo el build del frontend (revisa errores de TypeScript)."

ok "Build correcto"