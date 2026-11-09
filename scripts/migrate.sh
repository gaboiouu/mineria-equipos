#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
load_env

log "3/6 Aplicando migraciones en la base de datos"
(cd "$ROOT_DIR/backend" && npm run migrate) || fail "Fallo la migracion de la base de datos."
ok "Migraciones al dia"