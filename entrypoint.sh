#!/bin/sh
set -e

echo "==> Syncing server content into docs..."

# Check if mounted content has actual files
if [ -n "$(find /app/content -name '*.md' -print -quit 2>/dev/null)" ] \
  || [ -n "$(find /app/content/mindmaps -name '*.md' -print -quit 2>/dev/null)" ]; then
  echo "==> Mounted content found, using custom content"
  USE_DEFAULT=false
else
  echo "==> Mounted content empty, using default content"
  USE_DEFAULT=true
fi

src() {
  if $USE_DEFAULT; then
    echo "/app/default-content${1:+/$1}"
  else
    echo "/app/content${1:+/$1}"
  fi
}

SRC=$(src)

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
cp -r "$(src mindmaps)"/* /app/docs/mindmaps/
echo "==> Synced mindmaps from $(src mindmaps)"

# Downloadable files
FILES_SRC=$(src files)
if [ -n "$(find "$FILES_SRC" -type f -print -quit 2>/dev/null)" ]; then
  cp -r "$FILES_SRC"/* /app/docs/public/
  echo "==> Synced files from $FILES_SRC"
fi

# Site config overrides (prefer mounted, fallback to default)
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
