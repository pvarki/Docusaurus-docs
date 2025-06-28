#!/bin/bash
set -e

echo "🚩 ENABLE_TINA_ADMIN: $ENABLE_TINA_ADMIN"

if [ "$ENABLE_TINA_ADMIN" = "true" ]; then
  echo "📦 Building Tina admin UI..."
  npx @tinacms/cli build

  echo "🧼 Copying Tina admin to static/admin..."
  rm -rf static/admin
  cp -r public/admin static/admin
else
  echo "⏭️ Skipping Tina admin build (ENABLE_TINA_ADMIN is not true)"
fi

# Ensure sidebar index exists
if [ ! -f "src/sidebars/index.json" ]; then
  echo '{"items": []}' > src/sidebars/index.json
fi

PROJECT_ROOT="$(pwd)"
SRC_DIR="$PROJECT_ROOT/src/decks/prebuilds"
OUT_DIR="$PROJECT_ROOT/static/decks"

echo "🎞️ Inlining Reveal.js HTML decks..."
find "$SRC_DIR" -name 'index.html' | while read -r html; do
  rel_path="${html#$SRC_DIR/}"
  out_path="$OUT_DIR/$rel_path"
  out_dir="$(dirname "$out_path")"

  mkdir -p "$out_dir"
  echo "✨ Inlining: $rel_path"
  npx html-inline --nocompress --inlinemin --root "$PROJECT_ROOT" "$html" > "$out_path"
done

echo "✅ All slide decks inlined to: $OUT_DIR"
