#!/bin/sh
set -e

# Force Git to use HTTPS instead of SSH
git config --global url."https://github.com/".insteadOf "git@github.com:"

# Define absolute paths
REPO_URL="https://github.com/pvarki/docker-rasenmaeher-integration.git"
WORKSPACE="${GITHUB_WORKSPACE:-$(pwd)}"
DEST_DIR="$WORKSPACE/docs"
TEMP_DIR="$WORKSPACE/repo_temp"

# Clean any previous directories to ensure a clean slate
rm -rf "$DEST_DIR" "$TEMP_DIR"
mkdir -p "$DEST_DIR"

# Clone the main repository (using HTTPS) into TEMP_DIR
git clone "$REPO_URL" "$TEMP_DIR"
cd "$TEMP_DIR"

# Update submodules recursively
git submodule update --init --recursive

# Copy only Markdown and rst files while preserving the directory structure
find . -iname "*.md" -exec rsync -R {} "$DEST_DIR" \;
find . -iname "*.rst" -exec rsync -R {} "$DEST_DIR" \;
# convert rst files to markdown
find "$DEST_DIR" -iname "*.rst" | while read -r file; do
    pandoc "$file" -t markdown -o "${file%.rst}.md"
    rm "$file"
done

# Remove empty directories
find "$DEST_DIR" -type d -empty -delete

# Clean up temporary clone
rm -rf "$TEMP_DIR"

echo "Markdown files and folder structure copied to $DEST_DIR"
