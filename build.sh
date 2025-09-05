#!/usr/bin/env bash
set -eu
# enable pipefail if the current shell supports it
if (set -o | grep -q pipefail) 2>/dev/null; then
  set -o pipefail
fi

echo "▶ ENABLE_TINA_ADMIN = ${ENABLE_TINA_ADMIN:-false}"
echo "▶ DOCS_BASEURL      = ${DOCS_BASEURL:-/}"

# Ensure folders that Docusaurus/Tina expect exist (and are committed if needed)
mkdir -p static/img
mkdir -p static/admin
mkdir -p src/sidebars

#───────────────────────────────────────────────────────────────#
# 0. Ensure Tina-editable sidebars.json exists
#───────────────────────────────────────────────────────────────#
SIDEBAR_JSON="src/sidebars/sidebars.json"
if [ ! -f "$SIDEBAR_JSON" ]; then
  cat > "$SIDEBAR_JSON" <<'JSON'
{
  "daSidebar": [],
  "takSidebar": [],
  "blSidebar": [],
  "iosDaSidebar": [],
  "iosTakSidebar": [],
  "iosBlSidebar": [],
  "winDaSidebar": [],
  "winTakSidebar": [],
  "winBlSidebar": [],
  "devSidebar": []
}
JSON
  echo "🧭 Created empty $SIDEBAR_JSON"
fi

#───────────────────────────────────────────────────────────────#
# 1. Build Tina -> static/admin
#───────────────────────────────────────────────────────────────#
if [ "${ENABLE_TINA_ADMIN:-}" = "true" ]; then
  echo "📦  Building TinaCMS admin …"
  npx tinacms build
fi

#───────────────────────────────────────────────────────────────#
# 2. Mirror existing deck images into static/img/decks/<lang>/
#    So Tina Media Manager shows them for drag&drop selection.
#    (No bash-only process substitution; pure POSIX flow.)
#───────────────────────────────────────────────────────────────#
if [ -d "src/decks" ]; then
  echo "🖼️  Mirroring deck images into static/img/decks/…"
  for langdir in src/decks/*; do
    [ -d "$langdir" ] || continue
    if [ -d "$langdir/img" ]; then
      lang="$(basename "$langdir")"
      dest="static/img/decks/$lang"
      mkdir -p "$dest"
      if command -v rsync >/dev/null 2>&1; then
        rsync -a "$langdir/img/" "$dest/"
      else
        # rsync not available (e.g. some local shells) -> fallback
        cp -R "$langdir/img/." "$dest/" 2>/dev/null || true
      fi
      echo "   → $langdir/img → $dest"
    fi
  done
fi

#───────────────────────────────────────────────────────────────#
# 3. Inline Reveal.js HTML decks to static/decks/**/index.html
#───────────────────────────────────────────────────────────────#
PROJECT_ROOT="$(pwd)"
SRC_DIR="$PROJECT_ROOT/src/decks/prebuilds"
OUT_DIR="$PROJECT_ROOT/static/decks"

if [ -d "$SRC_DIR" ]; then
  echo "🎞️ Inlining Reveal.js HTML decks..."
  # No process substitution; use a simple pipeline
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
