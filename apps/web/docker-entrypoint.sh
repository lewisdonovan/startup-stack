#!/bin/sh
set -e
cd /app/apps/web
echo "Running database migrations..."
npx tsx src/db/migrate.ts || true
echo "Starting Next.js..."
exec npm run start
