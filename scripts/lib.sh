ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m OK: %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m AVISO: %s\033[0m\n' "$*" >&2; }
fail() { printf '\033[1;31m ERROR: %s\033[0m\n' "$*" >&2; exit 1; }

load_env() {
  local file="$ROOT_DIR/.env" line key value
  [ -f "$file" ] || return 0
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    case "$line" in ''|'#'*) continue ;; esac
    key="${line%%=*}"
    value="${line#*=}"
    key="${key//[[:space:]]/}"
    value="${value%"${value##*[![:space:]]}"}"
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    if [ -z "${!key+x}" ]; then export "$key=$value"; fi
  done < "$file"
}