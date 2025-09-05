#!/usr/bin/env bash
set -eu
if (set -o | grep -q pipefail) 2>/dev/null; then set -o pipefail; fi

echo "▶ DOCS_BASEURL = ${DOCS_BASEURL:-/}"

mkdir -p static/decks
mkdir -p src/sidebars

PROJECT_ROOT="$(pwd)"
SRC_DIR="$PROJECT_ROOT/src/decks/prebuilds"
OUT_DIR="$PROJECT_ROOT/static/decks"

if [ -d "$SRC_DIR" ]; then
  echo "🎞️ Inlining Reveal.js HTML decks..."
  find "$SRC_DIR" -type f -name 'index.html' | while IFS= read -r html; do
    rel_path="${html#$SRC_DIR/}"
    out_path="$OUT_DIR/$rel_path"
    out_dir="$(dirname "$out_path")"
    mkdir -p "$out_dir"
    echo "✨ Inlining: $rel_path"
    npx html-inline --nocompress --inlinemin --root "$PROJECT_ROOT" "$html" > "$out_path"
  done
  echo "✅ All slide decks inlined to: $OUT_DIR"
else
  echo "ℹ️  No prebuilt decks found at $SRC_DIR (skipping inlining)."
fi

echo "🛠️ Pre-build tasks complete; Docusaurus build will run next."
