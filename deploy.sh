#!/usr/bin/env bash
# Despliegue completo: ./deploy.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
source scripts/lib.sh
load_env

START=$(date +%s)

run_step() {
  bash "scripts/$1" || { printf '\n\033[1;31m DESPLIEGUE FALLIDO en el paso: %s\033[0m\n' "$1" >&2; exit 1; }
}

run_step check-prereqs.sh
export EXPECTED_COMMIT="$(git rev-parse HEAD)"
run_step build.sh
run_step migrate.sh
run_step deploy-backend.sh
run_step deploy-frontend.sh
run_step health-check.sh

printf '\n\033[1;32m DESPLIEGUE COMPLETADO en %ss\033[0m\n' "$(( $(date +%s) - START ))"
printf ' Frontend: %s\n Backend:  %s/health\n' "$FRONTEND_PUBLIC_URL" "$BACKEND_URL"