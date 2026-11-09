#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env

log "5/6 Publicando frontend en Vercel"
export VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID
cd "$ROOT_DIR"
vercel deploy --prod --yes >/dev/null || fail "Fallo el despliegue en Vercel. Revisa VERCEL_TOKEN y los IDs."
ok "Frontend publicado"