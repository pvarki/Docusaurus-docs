#!/bin/bash

# Config
API_BASE_URL="https://outline.swedencentral.cloudapp.azure.com/api"
AUTH_TOKEN="ol_api_NzJqaK4Ad9WiCaFts9ID5JCFsXEGujnpQ5LUM7"
OUTPUT_DIR="./imported_documents"
ATTACHMENTS_DIR="$OUTPUT_DIR/attachments"

mkdir -p "$ATTACHMENTS_DIR"

# Download attachment, return relative path
download_attachment() {
  local ID="$1"
  local URL=$(curl -s -X POST "$API_BASE_URL/attachments.redirect" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    --data "{\"id\": \"$ID\"}" -D - | grep -i '^location:' | awk '{print $2}' | tr -d '\r')
  [ -z "$URL" ] && echo "" && return
  local FILENAME=$(basename "${URL%%\?*}")
  [ -z "$FILENAME" ] && FILENAME="$ID"
  local LOCAL_PATH="$ATTACHMENTS_DIR/$FILENAME"
  curl -s -L "$URL" -o "$LOCAL_PATH"
  [ -f "$LOCAL_PATH" ] && echo "attachments/$FILENAME" || echo ""
}

# Fetch document content
fetch_document() {
  local ID="$2"
  curl -s "$API_BASE_URL/documents.import" \
    -X POST -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    --data "{\"id\": \"$ID\"}" | jq -r '.data'
}

# Get document path (collection/parent/title.md)
get_document_path() {
  local ID="$1"
  local META=$(curl -s "$API_BASE_URL/documents.info" \
    -X POST -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    --data "{\"id\": \"$ID\"}")
  local COLLECTION=$(echo "$META" | jq -r '.data.collection.name // empty')
  local PARENT=$(echo "$META" | jq -r '.data.parentDocument.title // empty')
  local TITLE=$(echo "$META" | jq -r '.data.title // empty')
  local PARTS=()
  [ -n "$COLLECTION" ] && PARTS+=("$COLLECTION")
  [ -n "$PARENT" ] && PARTS+=("$PARENT")
  [ -n "$TITLE" ] && PARTS+=("$TITLE.md")
  (IFS=/; echo "${PARTS[*]}")
}

# Get all document IDs
DOCUMENT_IDS=$(curl -s "$API_BASE_URL/documents.list" \
  -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  --data '{"offset":0,"limit":100,"sort":"updatedAt","direction":"DESC"}' \
  | jq -r '.data[]?.id' | sort -u)

[ -z "$DOCUMENT_IDS" ] && echo "No document IDs found." && exit 1

echo "importing documents..."
for ID in $DOCUMENT_IDS; do
  DOC_PATH=$(get_document_path "$ID")
  OUT_FILE="$OUTPUT_DIR/$DOC_PATH"
  mkdir -p "$(dirname "$OUT_FILE")"
  MARKDOWN=$(fetch_document "$ID")
  [ -z "$MARKDOWN" ] && echo "Failed to fetch $ID" && continue
  # Download attachments and update links
  ATT_IDS=$(echo "$MARKDOWN" | grep -oP '/api/attachments.redirect\?id=\K([a-f0-9-]+)' | sort -u)
  for ATT_ID in $ATT_IDS; do
    LOCAL_PATH=$(download_attachment "$ATT_ID")
    [ -n "$LOCAL_PATH" ] && MARKDOWN=$(echo "$MARKDOWN" | sed "s|/api/attachments.redirect?id=$ATT_ID|$LOCAL_PATH|g")
  done
  echo "$MARKDOWN" > "$OUT_FILE"
  echo "Saved $OUT_FILE"
done

echo "import complete: $OUTPUT_DIR"
