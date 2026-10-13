#!/bin/sh
set -e

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Seeding initial master data (Raw Materials, BOMs, Products)..."
python seed_data.py || true

echo "Starting server..."
exec "$@"
