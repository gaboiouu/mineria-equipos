#!/usr/bin/env bash
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env

log "ROLLBACK: restaurando la version anterior del frontend"
export VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID
cd "$ROOT_DIR"

if vercel rollback --scope gaboiouus-projects --token "$VERCEL_TOKEN" --yes; then
  ok "Frontend restaurado a la version anterior de produccion"
else
  fail "Fallo el rollback del frontend. Restauralo a mano desde el panel de Vercel."
fi