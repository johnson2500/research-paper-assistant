#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/packages/db
uv run alembic upgrade head

echo "Starting API server..."
cd /app/packages/api
exec uv run uvicorn src.main:app --host 0.0.0.0 --port 8080
