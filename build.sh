#!/usr/bin/env bash
set -e

echo "▶ ENABLE_TINA_ADMIN = ${ENABLE_TINA_ADMIN:-false}"
echo "▶ DOCS_BASEURL      = ${DOCS_BASEURL:-/}"

#───────────────────────────────────────────────────────────────#
# 1. Build Tina -> public/admin
#───────────────────────────────────────────────────────────────#
if [[ "${ENABLE_TINA_ADMIN:-}" == "true" ]]; then
  echo "📦  Building TinaCMS admin …"
  npx tinacms build
fi

# Ensure sidebar index exists
if [ ! -f "src/sidebars/index.json" ]; then
  echo '{"items": []}' > src/sidebars/index.json
fi

# Copy Tina admin to Docusaurus static folder
rm -rf static/admin
cp -r public/admin static/admin

PROJECT_ROOT="$(pwd)"
SRC_DIR="$PROJECT_ROOT/src/decks/prebuilds"
OUT_DIR="$PROJECT_ROOT/static/decks"

echo "📦 Inlining Reveal.js HTML decks..."

find "$SRC_DIR" -name 'index.html' | while read -r html; do
  rel_path="${html#$SRC_DIR/}"
  out_path="$OUT_DIR/$rel_path"
  out_dir="$(dirname "$out_path")"

  mkdir -p "$out_dir"

  echo "✨ Inlining: $rel_path"
  npx html-inline --nocompress --inlinemin --root "$PROJECT_ROOT" "$html" > "$out_path"
done

echo "✅ All slide decks inlined to: $OUT_DIR"

echo "🛠️ Building Docusaurus site..."
npm run build
