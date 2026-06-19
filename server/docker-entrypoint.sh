#!/bin/sh
set -e

echo "[entrypoint] Applying Prisma schema..."
npx prisma db push --skip-generate

echo "[entrypoint] Starting process: $*"
exec "$@"
