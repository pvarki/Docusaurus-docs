#!/usr/bin/env bash
set -euo pipefail

echo "▶ DOCS_BASEURL = ${DOCS_BASEURL:-/}"

# Ensure expected folders exist
mkdir -p static/decks

# 1) Inline Reveal.js HTML decks from src/decks/prebuilds/**/index.html → static/decks/**/index.html
PROJECT_ROOT="$(pwd)"
SRC_DIR="$PROJECT_ROOT/src/decks/prebuilds"
OUT_DIR="$PROJECT_ROOT/static/decks"

if [ -d "$SRC_DIR" ]; then
  echo "🎞️  Inlining Reveal.js HTML decks..."
  find "$SRC_DIR" -name 'index.html' | while read -r html; do
    rel_path="${html#$SRC_DIR/}"
    out_path="$OUT_DIR/$rel_path"
    out_dir="$(dirname "$out_path")"
    mkdir -p "$out_dir"
    echo "✨ Inlining: $rel_path"
    npx html-inline --nocompress --inlinemin --root "$PROJECT_ROOT" "$html" > "$out_path"
  done

  # 2) Rewrite root-absolute /img/... to ${DOCS_BASEURL}/img/... for GitHub Pages
  BASE="${DOCS_BASEURL:-/}"
  if [ "$BASE" != "/" ] && [ -n "$BASE" ]; then
    BASE="${BASE%/}"
    echo "🔗 Rewriting /img → $BASE/img in deck HTML…"
    find "$OUT_DIR" -type f -name '*.html' -print0 \
      | xargs -0 sed -i.bak \
        -e "s|src=\"/img/|src=\"$BASE/img/|g" \
        -e "s|href=\"/img/|href=\"$BASE/img/|g" \
        -e "s|url(/img/|url($BASE/img/|g"
    find "$OUT_DIR" -type f -name '*.bak' -delete
  fi

  echo "✅ All slide decks inlined to: $OUT_DIR"
else
  echo "ℹ️  No prebuilt decks at $SRC_DIR (skipping inlining)."
fi

echo "🛠️  Pre-build steps done. Running Docusaurus next…"
