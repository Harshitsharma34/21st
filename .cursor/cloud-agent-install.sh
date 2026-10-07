#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

corepack enable
pnpm install --frozen-lockfile

if ! command -v bun >/dev/null; then
  curl -fsSL https://bun.sh/install | bash
  sudo ln -sf "${HOME}/.bun/bin/bun" /usr/local/bin/bun
fi

(cd apps/backend && bun install)

if ! command -v ffmpeg >/dev/null; then
  sudo DEBIAN_FRONTEND=noninteractive apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg
fi

# Materialize Next.js env from Cloud Agent secrets when present.
ENV_FILE="apps/web/.env.local"
if [ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ]; then
  cat >"$ENV_FILE" <<EOF
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_KEY=${NEXT_PUBLIC_SUPABASE_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
CLERK_WEBHOOK_SECRET=${CLERK_WEBHOOK_SECRET:-}
R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
NEXT_PUBLIC_R2_ENDPOINT=${NEXT_PUBLIC_R2_ENDPOINT}
NEXT_PUBLIC_CDN_URL=${NEXT_PUBLIC_CDN_URL}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL:-http://localhost:8080}
EOF
fi
