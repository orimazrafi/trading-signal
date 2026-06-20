#!/bin/sh
set -e

echo "[entrypoint] Applying Prisma schema..."
npx prisma db push --skip-generate --accept-data-loss

echo "[entrypoint] Starting process: $*"
exec "$@"
