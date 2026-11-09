#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env

log "4/6 Publicando backend en Render"
curl -fsS -X POST "$RENDER_DEPLOY_HOOK" -o /dev/null \
  || fail "Render rechazo el deploy hook. Revisa RENDER_DEPLOY_HOOK."
ok "Despliegue del backend solicitado"