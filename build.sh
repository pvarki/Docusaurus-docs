#!/usr/bin/env bash
set -eu
if (set -o | grep -q pipefail) 2>/dev/null; then set -o pipefail; fi

echo "▶ DOCS_BASEURL = ${DOCS_BASEURL:-/}"

PROJECT_ROOT="$(pwd)"
SRC_DIR="$PROJECT_ROOT/src/decks/prebuilds"
OUT_DIR="$PROJECT_ROOT/static/decks"

# 0) Mirror the canonical deck images:
#    src/decks/img/**  →  static/decks/img/**  AND  static/img/**
if [ -d "$PROJECT_ROOT/src/decks/img" ]; then
  echo "🖼️  Mirroring src/decks/img → static/decks/img & static/img"
  mkdir -p "$OUT_DIR/img" "$PROJECT_ROOT/static/img"
  rsync -a "$PROJECT_ROOT/src/decks/img/" "$OUT_DIR/img/"
  rsync -a "$PROJECT_ROOT/src/decks/img/" "$PROJECT_ROOT/static/img/"
fi


# Also mirror any scattered 'img' folders under src/decks/**/img/**
find "$PROJECT_ROOT/src/decks" -type d -name img ! -path "$PROJECT_ROOT/src/decks/img" | while IFS= read -r imgdir; do
  rel="${imgdir#"$PROJECT_ROOT/src/decks/"}"   # e.g. ios/deployapp/xyz/img
  dest="$OUT_DIR/$rel"                         # static/decks/ios/deployapp/xyz/img
  mkdir -p "$dest"
  rsync -a "$imgdir/" "$dest/"
  echo "   → $imgdir → $dest"
done

# 1) Inline Reveal.js HTML decks to static/decks/**/index.html
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
