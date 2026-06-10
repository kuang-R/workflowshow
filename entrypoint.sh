#!/bin/sh
set -e

echo "==> Syncing server content into docs..."

# Seed default content into empty mounted directory so user can modify on host
if [ -d /app/content ] \
  && [ -z "$(find /app/content -mindepth 1 -not -name '.*' -print -quit 2>/dev/null)" ]; then
  echo "==> Seeding default content into mounted directory..."
  cp -r /app/default-content/* /app/content/
fi

# Determine content source
if [ -d /app/content ] && [ -n "$(find /app/content -name '*.md' -print -quit 2>/dev/null)" ]; then
  SRC=/app/content
  echo "==> Using mounted content"
else
  SRC=/app/default-content
  echo "==> Using default content"
fi

MINDMAPS_SRC="$SRC/mindmaps"
FILES_SRC="$SRC/files"

# Copy all content files preserving directory structure
# Excludes: mindmaps/ (mindmap pages), files/ (downloads), site.json (config),
#           hidden files like .DS_Store
find "$SRC" -type f \
  -not -path '*/mindmaps/*' \
  -not -path '*/files/*' \
  -not -name 'site.json' \
  -not -name '.*' \
  -not -path '*/.*' | while IFS= read -r f; do
  rel="${f#$SRC/}"
  mkdir -p "/app/docs/$(dirname "$rel")"
  cp "$f" "/app/docs/$rel"
done
echo "==> Synced pages from $SRC"

# Mindmap pages
cp -r "$MINDMAPS_SRC"/* /app/docs/mindmaps/
echo "==> Synced mindmaps from $MINDMAPS_SRC"

# Downloadable files
if [ -n "$(find "$FILES_SRC" -type f -print -quit 2>/dev/null)" ]; then
  mkdir -p /app/docs/public/files
  cp -r "$FILES_SRC"/* /app/docs/public/files/
  echo "==> Synced files from $FILES_SRC"
fi

# Site config (prefer mounted, fallback to default)
if [ -f /app/content/site.json ]; then
  cp /app/content/site.json /app/docs/.vitepress/site.json
  echo "==> Using mounted site config"
elif [ -f /app/default-content/site.json ]; then
  cp /app/default-content/site.json /app/docs/.vitepress/site.json
  echo "==> Using default site config"
fi

echo "==> Building site from /app/docs..."
cd /app
npx vitepress build docs --base /

echo "==> Copying built files to Nginx..."
mkdir -p /usr/share/nginx/html
cp -r /app/docs/.vitepress/dist/* /usr/share/nginx/html/

echo "==> Starting Nginx..."
exec nginx -g "daemon off;"
