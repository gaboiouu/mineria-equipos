#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env

log "5/6 Publicando frontend en Vercel"
export VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID
cd "$ROOT_DIR"

mkdir -p "$ROOT_DIR/.deploy-state"
curl -fsS -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?projectId=$VERCEL_PROJECT_ID&teamId=$VERCEL_ORG_ID&target=production&state=READY&limit=1" \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);console.log(j.deployments&&j.deployments[0]?j.deployments[0].url:"")})' \
  > "$ROOT_DIR/.deploy-state/frontend_prev" || : > "$ROOT_DIR/.deploy-state/frontend_prev"

vercel deploy --prod --yes >/dev/null || fail "Fallo el despliegue en Vercel. Revisa VERCEL_TOKEN y los IDs."
ok "Frontend publicado"