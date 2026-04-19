#!/usr/bin/env bash
# killports-mac.sh — Nuke stray dev server processes on macOS
# Usage: ./killports-mac.sh          (kill all common dev ports)
#        ./killports-mac.sh 3000     (kill specific port)
#        ./killports-mac.sh 3000 8080 5173  (kill multiple)

set -euo pipefail

# Common dev ports that tend to zombie
DEFAULT_PORTS=(3000 3001 4000 4200 5000 5173 5174 6006 7000 7070 8000 8080 8081 8443 8888 9000 9090)

COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RESET='\033[0m'

PORTS=("${@:-${DEFAULT_PORTS[@]}}")

killed=0

for port in "${PORTS[@]}"; do
    # macOS uses lsof instead of ss
    pids=$(lsof -ti :"$port" 2>/dev/null | sort -u || true)

    if [[ -z "$pids" ]]; then
        echo -e "  ${COLOR_GREEN}port ${port}: clear${COLOR_RESET}"
        continue
    fi

    for pid in $pids; do
        cmd=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
        echo -e "  ${COLOR_RED}KILL${COLOR_RESET} port ${COLOR_YELLOW}${port}${COLOR_RESET} — PID ${pid} (${cmd})"
        kill -9 "$pid" 2>/dev/null || true
        ((killed++))
    done
done

echo ""
echo -e "Terminated ${COLOR_RED}${killed}${COLOR_RESET} processes."

# Also nuke common orphan patterns
echo ""
echo "Scanning for orphaned node/python servers..."

orphans=0
for pattern in "node.*vite" "node.*next" "node.*webpack" "node.*serve" "python.*http.server" "python.*uvicorn" "python.*flask" "python.*jupyter"; do
    pids=$(pgrep -f "$pattern" 2>/dev/null || true)
    for pid in $pids; do
        cmd=$(ps -p "$pid" -o args= 2>/dev/null | head -c 80)
        echo -e "  ${COLOR_RED}KILL${COLOR_RESET} PID ${pid}: ${cmd}"
        kill -9 "$pid" 2>/dev/null || true
        ((orphans++))
    done
done

if [[ $orphans -eq 0 ]]; then
    echo -e "  ${COLOR_GREEN}No orphans found.${COLOR_RESET}"
else
    echo -e "Terminated ${COLOR_RED}${orphans}${COLOR_RESET} orphaned servers."
fi
