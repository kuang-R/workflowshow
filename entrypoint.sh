#!/bin/sh
set -e

echo "==> Syncing server content into docs..."
cp -r /app/content/mindmaps/* /app/docs/mindmaps/ 2>/dev/null || true
cp -r /app/content/files/* /app/docs/public/ 2>/dev/null || true

echo "==> Building site from /app/docs..."
cd /app
npx vitepress build docs --base /

echo "==> Copying built files to Nginx..."
mkdir -p /usr/share/nginx/html
cp -r /app/docs/.vitepress/dist/* /usr/share/nginx/html/

echo "==> Starting Nginx..."
exec nginx -g "daemon off;"
