#!/bin/sh
set -e

echo "==> Building site from /app/docs..."
cd /app
npm run docs:build

echo "==> Copying built files to Nginx..."
mkdir -p /usr/share/nginx/html
cp -r /app/docs/.vitepress/dist/* /usr/share/nginx/html/

echo "==> Starting Nginx..."
exec nginx -g "daemon off;"
