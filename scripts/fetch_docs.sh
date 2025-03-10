#!/bin/sh
set -e

# Force Git to use HTTPS instead of SSH (so submodules clone via HTTPS)
git config --global url."https://github.com/".insteadOf "git@github.com:"

# Define absolute paths
REPO_URL="https://github.com/pvarki/docker-rasenmaeher-integration.git"
WORKSPACE="${GITHUB_WORKSPACE:-$(pwd)}"
# We want our final output to be in $GITHUB_WORKSPACE/MainDocs/docs
DEST_PARENT="$WORKSPACE/MainDocs"
DEST_DIR="$DEST_PARENT/docs"
TEMP_DIR="$WORKSPACE/repo_temp"

# Clean any previous directories to ensure a clean slate
rm -rf "$DEST_PARENT" "$TEMP_DIR"
mkdir -p "$DEST_DIR"

# Clone the main repository (using HTTPS) into TEMP_DIR
git clone "$REPO_URL" "$TEMP_DIR"
cd "$TEMP_DIR"

# Update submodules recursively (they’ll be cloned via HTTPS thanks to our global config)
git submodule update --init --recursive

# Copy only Markdown files (case-insensitive) while preserving the directory structure
find . -iname "*.md" -exec rsync -R {} "$DEST_DIR" \;

# Remove empty directories
find "$DEST_DIR" -type d -empty -delete

# Clean up temporary clone
rm -rf "$TEMP_DIR"

echo "Markdown files and folder structure copied to $DEST_DIR"