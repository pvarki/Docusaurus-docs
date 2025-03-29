# Using Docusaurus for Automatic Documentation

## Introduction

Docusaurus is a modern static site generator that helps you build optimized websites quickly. In this project, Docusaurus is used to generate and host the documentation for the Rasenmaeher project. The documentation is automatically fetched, built, and deployed using a combination of scripts and GitHub Actions.

## Project Structure

The project is organized as follows:

```plaintext
MainDocs/
    docs/               # Documentation source files
    docusaurus.config.js # Docusaurus configuration
    sidebar.js          # Sidebar configuration
    src/
        css/            # Custom CSS
            custom.css
package.json            # Project dependencies and scripts
scripts/
    fetch_docs.sh       # Script to fetch documentation
dockerfile              # Dockerfile for building the Docker image
```

## Fetching Documentation

The `fetch_docs.sh` script is responsible for fetching the latest documentation from the main repository and its submodules. This script is executed as part of the GitHub Actions workflow.

### Script: `fetch_docs.sh`

```sh
#!/bin/sh
set -e

# Force Git to use HTTPS instead of SSH (so submodules clone via HTTPS)
git config --global url."https://github.com/".insteadOf "git@github.com:"

# Define absolute paths
REPO_URL="https://github.com/pvarki/docker-rasenmaeher-integration.git"
WORKSPACE="${GITHUB_WORKSPACE:-$(pwd)}"
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
```

## Building and Deploying Documentation

The documentation is built and deployed using GitHub Actions. The workflow is defined in `.github/workflows/docs.yml`.

### Workflow: `docs.yml`

```yml
name: Build Docusaurus Docs

on:
  push:
    branches:
      - main
  pull_request:
    branches-ignore:
      - release-please--branches--main
  workflow_dispatch:

jobs:
  pull-docs:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout Main Repository
        uses: actions/checkout@v4
        with:
          submodules: true
          fetch-depth: 0

      - name: Make fetch_docs.sh Executable
        run: chmod +x ${{ github.workspace fetch_docs.sh

      - name: Fetch All Docs
        run: ${{ github.workspace fetch_docs.sh

      - name: Upload Docs Artifact
        uses: actions/upload-artifact@v4
        with:
          name: docs-raw
          path: ${{ github.workspace }}/MainDocs/docs/

  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    needs: pull-docs
    steps:
      - name: Checkout Documentation Repo
        uses: actions/checkout@v4

      - name: Build Docker Image
        run: |
          docker build -t pvarki/pvarkidocs:latest -f dockerfile .

      - name: Log in to Docker Hub
        run: echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" --password-stdin

      - name: Push Docker Image to Docker Hub
        run: |
          docker push pvarki/pvarkidocs:latest

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          persist-credentials: false
          fetch-depth: 0

      - name: Download Built Docs Artifact
        uses: actions/download-artifact@v4
        with:
          name: docs-raw
          path: ${{ github.workspace }}/MainDocs/build

      - name: Install Dependencies
        run: npm install
        working-directory: ${{ github.workspace }}/MainDocs

      - name: Build Docusaurus Site
        run: npm run build
        working-directory: ${{ github.workspace }}/MainDocs

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ${{ github.workspace }}/MainDocs/build
```

## Customizing the Sidebar

The sidebar is automatically generated based on the directory structure of the `docs` folder. The configuration is defined in `sidebar.js`.

### Script: `sidebar.js`

```js
const fs = require('fs');
const path = require('path');

const docsDir = 'docs';

function getSidebarItems(dir) {
  const entries = fs.readdirSync(dir).sort((a, b) => a.localeCompare(b));
  const items = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      const childItems = getSidebarItems(fullPath);
      const readmePath = path.join(fullPath, 'README.md');
      if (fs.existsSync(readmePath)) {
        const readmeId = path
          .relative(docsDir, readmePath)
          .replace(/\\/g, '/')
          .replace(/\.md$/, '');

        items.push({
          type: 'category',
          label: entry,
          link: {
            type: 'doc',
            id: readmeId,
          },
          items: childItems.filter((item) => item !== readmeId),
        });
      } else if (childItems.length > 0) {
        items.push({
          type: 'category',
          label: entry,
          items: childItems,
        });
      }
    } else if (stats.isFile() && entry.toLowerCase().endsWith('.md')) {
      const docId = path
        .relative(docsDir, fullPath)
        .replace(/\\/g, '/')
        .replace(/\.md$/, '');

      if (entry.toLowerCase() === 'readme.md') {
        items.unshift(docId);
      } else {
        items.push(docId);
      }
    }
  }

  return items;
}

module.exports = {
  docs: getSidebarItems(docsDir),
};
```

## Configuration

The Docusaurus configuration is defined in `docusaurus.config.js`.

### Configuration: `docusaurus.config.js`

```js
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    title: 'Static docs',
    tagline: 'documentation for rasenmaher',
    url: 'https://example.com',
    baseUrl: '/',
    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'PVarki',
    projectName: 'Rasenmaeher',
    themeConfig: {
        navbar: {
            title: 'Rasenmaeher',
            logo: {
                alt: 'Site Logo',
                src: 'img/logo.svg',
            },
            items: [
                {
                    to: '/docs',
                    activeBasePath: '/docs',
                    label: 'Docs',
                    position: 'left',
                },
                {
                    href: 'https://github.com/your-org/your-project',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        devServer: {
            host: '0.0.0.0',
          },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Getting Started',
                            to: '/docs',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Your Project, Inc. Built with Docusaurus.`,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    path: path.resolve(__dirname, 'docs'),
                    sidebarPath: path.resolve(__dirname, 'sidebar.js'),
                    editUrl: 'https://github.com/your-org/your-project/edit/main/website/',
                },
                theme: {
                    customCss: path.resolve(__dirname, 'src/css/custom.css'),
                },
            },
        ],
    ],
};
```

## Conclusion

By following the above steps and configurations, you can effectively use Docusaurus to automatically generate and deploy documentation for the Rasenmaeher project. The combination of scripts and GitHub Actions ensures that the documentation is always up-to-date and easily accessible.