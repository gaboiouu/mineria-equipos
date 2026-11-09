#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env

log "1/6 Verificando prerrequisitos"

missing=()
for cmd in git node npm curl vercel; do
  command -v "$cmd" >/dev/null 2>&1 || missing+=("$cmd")
done
[ ${#missing[@]} -eq 0 ] || fail "Faltan herramientas: ${missing[*]}. Instalalas y vuelve a intentar."

missing=()
for var in DATABASE_URL RENDER_DEPLOY_HOOK VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID BACKEND_URL FRONTEND_PUBLIC_URL; do
  [ -n "${!var:-}" ] || missing+=("$var")
done
[ ${#missing[@]} -eq 0 ] || fail "Faltan variables de entorno: ${missing[*]}. Revisa tu .env (ver .env.example)."

cd "$ROOT_DIR"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "No estas dentro de un repositorio git."
git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1 || fail "La rama actual no tiene remoto. Haz 'git push -u origin main'."
[ -z "$(git status --porcelain)" ] || fail "Hay cambios sin commit. Haz commit y push antes de desplegar."
[ "$(git rev-list --count '@{u}..HEAD')" = "0" ] || fail "Hay commits sin subir. Haz 'git push' antes de desplegar."

ok "Herramientas, variables y repositorio listos"