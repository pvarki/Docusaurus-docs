#!/bin/bash

# Config
API_BASE_URL="https://outline.swedencentral.cloudapp.azure.com/api"
AUTH_TOKEN="ol_api_AYcgtJuNtYsdFstxnED42CmawgHT9F3LcHwYtc"
OUTPUT_DIR="./imported_documents"
ATTACHMENTS_DIR="$OUTPUT_DIR/attachments"

# Folders to ignore (add more as needed)
IGNORED_FOLDERS=(node_modules .tmp)

build_find_ignore() {
    local expr=""
    for folder in "${IGNORED_FOLDERS[@]}"; do
        expr="$expr -not -path \"*/$folder/*\""
    done
    echo "$expr"
}



sync-outline-collections() {
    declare -A collection_ids

    # Find all unique folder paths (excluding node_modules) that contain at least one .md file
    docusaurus_collections=$(find ../ -type f -name "*.md" \
        -not -path "*/node_modules/*" \
        -printf '%h\n' | sed 's|../||' | sort -u)

    # Remove empty string (root) if present
    docusaurus_collections=$(echo "$docusaurus_collections" | grep -v '^$')

    # Get Outline collections (names and ids)
    outline_collections_json=$(curl -s "$API_BASE_URL/collections.list" \
        --header "Authorization: Bearer $AUTH_TOKEN" \
        --header "Content-Type: application/json" \
        --data '{"limit":100}')

    if ! echo "$outline_collections_json" | jq . >/dev/null 2>&1; then
        echo "Error: collections.list API did not return valid JSON:"
        echo "$outline_collections_json"
        exit 1
    fi

    outline_collections=$(echo "$outline_collections_json" | jq -r '.data[] | "\(.name):\(.id)"' | sort)

    while IFS=: read -r name id; do
        [[ -z "$name" || -z "$id" ]] && continue
        collection_ids["$name"]="$id"
    done <<< "$outline_collections"

    for collection in $docusaurus_collections; do
        if [[ -n "${collection_ids[$collection]}" ]]; then
            continue
        fi

        response=$(curl -s "$API_BASE_URL/collections.create" \
            --request POST \
            --header "Authorization: Bearer $AUTH_TOKEN" \
            --header "Content-Type: application/json" \
            --data "{\"name\":\"$collection\",\"description\":\"Imported from Docusaurus\",\"permission\":\"read\",\"color\":\"#123123\",\"sharing\":false}")

        new_id=$(echo "$response" | jq -r '.data.id // empty')
        if [[ -n "$new_id" ]]; then
            collection_ids["$collection"]="$new_id"
            echo "Created Outline collection: $collection"
        else
            echo "Failed to create Outline collection: $collection"
            echo "API response: $response"
        fi
    done

    echo "Synchronized nested collections to Outline."
}

sync-outline-documents() {
    local docusaurus_structure
    local missing_documents=()
    local map_file=".outline_map.json"

    # Load or initialize mapping file
    if [[ -f "$map_file" ]]; then
        map_content=$(cat "$map_file")
    else
        map_content="{}"
    fi

    # Get Docusaurus structure (relative paths, excluding node_modules)
    docusaurus_structure=$(find ../ -type f -name "*.md" -not -path "*/node_modules/*" | sed 's|../||' | sort)

    # Get Outline collections (name:id)
    declare -A collection_ids
    outline_collections_json=$(curl -s "$API_BASE_URL/collections.list" \
        --header "Authorization: Bearer $AUTH_TOKEN" \
        --header "Content-Type: application/json" \
        --data '{"limit":100}')
    while IFS=: read -r name id; do
        [[ -z "$name" || -z "$id" ]] && continue
        collection_ids["$name"]="$id"
    done < <(echo "$outline_collections_json" | jq -r '.data[] | "\(.name):\(.id)"')

    echo "Outline collections found:"
    for k in "${!collection_ids[@]}"; do
        echo "  '$k' -> ${collection_ids[$k]}"
    done

    # For each document, upload to Outline and preserve hierarchy
    while IFS= read -r doc; do
        # Ignore node_modules just in case
        if [[ "$doc" == node_modules/* || "$doc" == */node_modules/* ]]; then
            continue
        fi

        file_path="../$doc"
        collection=$(dirname "$doc")
        rel_path="$doc"
        parent_path=""
        parent_id=""

        # Check if collection exists in Outline
        if [[ -z "${collection_ids[$collection]}" ]]; then
            echo "ERROR: No Outline collection found for '$collection'. Skipping document: $doc"
            continue
        fi

        # Prepare JSON payload
        text_json=$(jq -Rs . < "$file_path")
        title_json=$(jq -Rn --arg t "$(basename "$doc" .md)" '$t')
        cat <<EOF > /tmp/doc_payload.json
{
    "collectionId": "${collection_ids[$collection]}",
    "title": $title_json,
    "text": $text_json,
    "publish": true
}
EOF

        # Upload document
        response=$(curl -s "$API_BASE_URL/documents.create" \
            --request POST \
            --header "Authorization: Bearer $AUTH_TOKEN" \
            --header "Content-Type: application/json" \
            --data @/tmp/doc_payload.json)

        doc_id=$(echo "$response" | jq -r '.data.id // empty')
        if [[ -n "$doc_id" ]]; then
            map_content=$(echo "$map_content" | jq --arg path "$rel_path" --arg id "$doc_id" '. + {($path): $id}')
            echo "Created Outline document: $doc"
        else
            echo "Failed to create Outline document: $doc"
            echo "API response: $response"
        fi
    done <<< "$docusaurus_structure"

    # Save mapping file
    echo "$map_content" > "$map_file"
    echo "Synchronized documents to Outline and updated mapping."
}

sync-outline-documents() {
    local docusaurus_structure
    local missing_documents=()
    local map_file=".outline_map.json"

    # Load or initialize mapping file
    if [[ -f "$map_file" ]]; then
        map_content=$(cat "$map_file")
    else
        map_content="{}"
    fi

    # Get Docusaurus structure (relative paths, excluding node_modules)
    docusaurus_structure=$(find ../ -type f -name "*.md" -not -path "*/node_modules/*" | sed 's|../||' | sort)

    # Get Outline collections (name:id)
    declare -A collection_ids
    outline_collections_json=$(curl -s "$API_BASE_URL/collections.list" \
        --header "Authorization: Bearer $AUTH_TOKEN" \
        --header "Content-Type: application/json" \
        --data '{"limit":100}')
    while IFS=: read -r name id; do
        [[ -z "$name" || -z "$id" ]] && continue
        collection_ids["$name"]="$id"
    done < <(echo "$outline_collections_json" | jq -r '.data[] | "\(.name):\(.id)"')

    echo "Outline collections found:"
    for k in "${!collection_ids[@]}"; do
        echo "  '$k' -> ${collection_ids[$k]}"
    done

    # For each document, upload to Outline and preserve hierarchy
    while IFS= read -r doc; do
        # Ignore node_modules just in case
        if [[ "$doc" == node_modules/* || "$doc" == */node_modules/* ]]; then
            continue
        fi

        file_path="../$doc"
        collection=$(dirname "$doc")
        rel_path="$doc"
        parent_path=""
        parent_id=""

        # Check if collection exists in Outline
        if [[ -z "${collection_ids[$collection]}" ]]; then
            echo "ERROR: No Outline collection found for '$collection'. Skipping document: $doc"
            continue
        fi

        # Prepare JSON payload
        text_json=$(jq -Rs . < "$file_path")
        title_json=$(jq -Rn --arg t "$(basename "$doc" .md)" '$t')
        cat <<EOF > /tmp/doc_payload.json
{
    "collectionId": "${collection_ids[$collection]}",
    "title": $title_json,
    "text": $text_json,
    "publish": true
}
EOF

        # Upload document
        response=$(curl -s "$API_BASE_URL/documents.create" \
            --request POST \
            --header "Authorization: Bearer $AUTH_TOKEN" \
            --header "Content-Type: application/json" \
            --data @/tmp/doc_payload.json)

        doc_id=$(echo "$response" | jq -r '.data.id // empty')
        if [[ -n "$doc_id" ]]; then
            map_content=$(echo "$map_content" | jq --arg path "$rel_path" --arg id "$doc_id" '. + {($path): $id}')
            echo "Created Outline document: $doc"
        else
            echo "Failed to create Outline document: $doc"
            echo "API response: $response"
        fi
    done <<< "$docusaurus_structure"

    # Save mapping file
    echo "$map_content" > "$map_file"
    echo "Synchronized documents to Outline and updated mapping."
}

wipe-outline-collections() {
    echo "Fetching all Outline collections..."
    collections_json=$(curl -s "$API_BASE_URL/collections.list" \
        --header "Authorization: Bearer $AUTH_TOKEN" \
        --header "Content-Type: application/json" \
        --data '{"limit":100}')

    collection_ids=$(echo "$collections_json" | jq -r '.data[] | .id')
    for id in $collection_ids; do
        echo "Deleting collection $id..."
        curl -s "$API_BASE_URL/collections.delete" \
            --request POST \
            --header "Authorization: Bearer $AUTH_TOKEN" \
            --header "Content-Type: application/json" \
            --data "{\"id\":\"$id\"}"
    done
    echo "All collections deleted."
}

# Main script execution
case "$1" in
    sync-collections)
        sync-outline-collections
        ;;
    sync-documents)
        sync-outline-documents
        ;;
    wipe-collections)
        wipe-outline-collections
        ;;
    *)
        echo "Usage: $0 {sync-collections|sync-documents|wipe-collections}"
        exit 1
        ;;
esac
