#!/usr/bin/env bash
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env

log "ROLLBACK: restaurando la version anterior del frontend"
prev="$(cat "$ROOT_DIR/.deploy-state/frontend_prev" 2>/dev/null || true)"
[ -n "$prev" ] || fail "No hay una version anterior registrada para restaurar."

export VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID
cd "$ROOT_DIR"
vercel rollback "https://$prev" --scope gaboiouus-projects --token "$VERCEL_TOKEN" || fail "Fallo el rollback del frontend. Restauralo a mano desde el panel de Vercel."ok "Frontend restaurado a https://$prev"