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

if [[ "${ENABLE_TINA_ADMIN:-}" == "true" ]]; then
  BASE="${DOCS_BASEURL:-/}"
  BASE="${BASE#/}" ; BASE="${BASE%/}"     # trim slashes

  dest="build"
  [[ -n "$BASE" ]] && dest="${dest}/${BASE}"
  dest="${dest}/admin"

  echo "🚚  Copying  public/admin → ${dest}"
  mkdir -p "${dest}"
  cp -a public/admin/. "${dest}/"
fi

echo "✅ All slide decks inlined to: $OUT_DIR"