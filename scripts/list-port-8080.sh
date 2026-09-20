#!/usr/bin/env bash
# List processes/servers listening on a TCP port (default: 8080) and kill them.
# Works on Linux, macOS, and Windows (Git Bash / MSYS).
#
# Usage:
#   ./list-port-8080.sh              # list + prompt before killing on port 8080
#   ./list-port-8080.sh 3000         # same, for port 3000
#   ./list-port-8080.sh -f           # kill without confirmation on port 8080
#   ./list-port-8080.sh -f 3000      # kill without confirmation on port 3000

set -euo pipefail

FORCE=0
PORT="8080"

# Parse args: -f/--force flag and an optional port number, in any order.
for arg in "$@"; do
  case "$arg" in
    -f|--force) FORCE=1 ;;
    ''|*[!0-9]*)
      echo "Error: unrecognized argument '$arg'" >&2
      exit 1
      ;;
    *) PORT="$arg" ;;
  esac
done

echo "Searching for processes listening on port ${PORT}..."
echo

# Detect the OS so we can pick the right tool.
uname_out="$(uname -s 2>/dev/null || echo unknown)"

# Collect listening PIDs into an array, printing details as we go.
pids=()

case "$uname_out" in
  MINGW*|MSYS*|CYGWIN*|Windows_NT)
    # Windows: use netstat + tasklist to resolve PID -> process name.
    if ! command -v netstat >/dev/null 2>&1; then
      echo "netstat not found on this system." >&2
      exit 1
    fi
    # Columns: Proto  Local  Foreign  State  PID
    while read -r line; do
      [[ -z "$line" ]] && continue
      pid="$(echo "$line" | awk '{print $NF}')"
      [[ "$pid" =~ ^[0-9]+$ ]] || continue
      name="$(tasklist //FI "PID eq ${pid}" //FO CSV //NH 2>/dev/null | head -n1 | cut -d',' -f1 | tr -d '"')"
      printf '  PID %-8s %-25s %s\n' "$pid" "${name:-unknown}" "$line"
      pids+=("$pid")
    done < <(netstat -ano | grep -iE "LISTENING" | awk -v p=":${PORT}" '$2 ~ p {print}')
    ;;
  *)
    # Linux / macOS: prefer lsof, fall back to ss, then netstat.
    if command -v lsof >/dev/null 2>&1; then
      lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN || true
      while read -r pid; do
        [[ "$pid" =~ ^[0-9]+$ ]] && pids+=("$pid")
      done < <(lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN -t 2>/dev/null || true)
    elif command -v ss >/dev/null 2>&1; then
      ss -ltnp "sport = :${PORT}" || true
      while read -r pid; do
        [[ "$pid" =~ ^[0-9]+$ ]] && pids+=("$pid")
      done < <(ss -ltnp "sport = :${PORT}" 2>/dev/null | grep -oE 'pid=[0-9]+' | cut -d= -f2 || true)
    elif command -v netstat >/dev/null 2>&1; then
      netstat -ltnp 2>/dev/null | grep -E "[:.]${PORT}[[:space:]]" || true
      while read -r pid; do
        [[ "$pid" =~ ^[0-9]+$ ]] && pids+=("$pid")
      done < <(netstat -ltnp 2>/dev/null | grep -E "[:.]${PORT}[[:space:]]" | grep -oE '[0-9]+/' | cut -d/ -f1 || true)
    else
      echo "No supported tool (lsof, ss, netstat) found." >&2
      exit 1
    fi
    ;;
esac

# De-duplicate PIDs.
if [[ "${#pids[@]}" -gt 0 ]]; then
  mapfile -t pids < <(printf '%s\n' "${pids[@]}" | sort -un)
fi

if [[ "${#pids[@]}" -eq 0 ]]; then
  echo
  echo "No process is listening on port ${PORT}. Nothing to kill."
  exit 0
fi

echo
echo "Found ${#pids[@]} process(es) on port ${PORT}: ${pids[*]}"

if [[ "$FORCE" -ne 1 ]]; then
  read -r -p "Kill these process(es)? [y/N] " answer
  case "$answer" in
    y|Y|yes|YES) ;;
    *) echo "Aborted. No processes killed."; exit 0 ;;
  esac
fi

for pid in "${pids[@]}"; do
  echo "Killing PID ${pid}..."
  case "$uname_out" in
    MINGW*|MSYS*|CYGWIN*|Windows_NT)
      taskkill //F //PID "$pid" >/dev/null 2>&1 \
        && echo "  killed ${pid}" \
        || echo "  failed to kill ${pid}" >&2
      ;;
    *)
      kill -9 "$pid" >/dev/null 2>&1 \
        && echo "  killed ${pid}" \
        || echo "  failed to kill ${pid}" >&2
      ;;
  esac
done

echo "Done."
