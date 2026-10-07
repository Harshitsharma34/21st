#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BUN_BIN="$(command -v bun)"

wait_http() {
  local url="$1"
  for _ in $(seq 1 120); do
    if curl -sf -o /dev/null "$url" 2>/dev/null; then
      return 0
    fi
    sleep 1
  done
  echo "Timed out waiting for $url" >&2
  return 1
}

# Backend listens on port 80 (requires elevated bind on Linux).
if ! curl -sf -o /dev/null http://127.0.0.1/ 2>/dev/null; then
  if ! tmux has-session -t backend 2>/dev/null; then
    tmux new-session -d -s backend "cd '$ROOT/apps/backend' && sudo -E '$BUN_BIN' run serve.ts 2>&1 | tee /tmp/backend.log"
  fi
  wait_http "http://127.0.0.1/"
fi

if ! tmux has-session -t web 2>/dev/null; then
  tmux new-session -d -s web "cd '$ROOT' && pnpm --filter web exec next dev --turbo --hostname 0.0.0.0 --port 3000 2>&1 | tee /tmp/web.log"
fi

wait_http "http://127.0.0.1:3000/"
