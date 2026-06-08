#!/bin/sh
set -e

echo "==> Syncing server content into docs..."

# Determine content source: mounted volume takes priority, fallback to defaults
CONTENT_MINDMAPS="/app/content/mindmaps"
CONTENT_FILES="/app/content/files"

if ls "$CONTENT_MINDMAPS"/* >/dev/null 2>&1; then
  echo "==> Using mounted mindmaps content"
else
  echo "==> Mounted content empty, using default mindmaps"
  CONTENT_MINDMAPS="/app/default-content/mindmaps"
fi

if ls "$CONTENT_FILES"/* >/dev/null 2>&1; then
  echo "==> Using mounted files content"
else
  echo "==> Mounted content empty, using default files"
  CONTENT_FILES="/app/default-content/files"
fi

cp -r "$CONTENT_MINDMAPS"/* /app/docs/mindmaps/
if ls "$CONTENT_FILES"/* >/dev/null 2>&1; then
  cp -r "$CONTENT_FILES"/* /app/docs/public/
fi

echo "==> Building site from /app/docs..."
cd /app
npx vitepress build docs --base /

echo "==> Copying built files to Nginx..."
mkdir -p /usr/share/nginx/html
cp -r /app/docs/.vitepress/dist/* /usr/share/nginx/html/

echo "==> Starting Nginx..."
exec nginx -g "daemon off;"
