# Outline Sync Scripts

This directory contains scripts for synchronizing documentation between a local Docusaurus project and an Outline knowledge base. The scripts allow you to export your local Docusaurus docs to Outline, import Outline docs back into your project, and manage Outline collections.

## Usage

### Exporting to Outline

To synchronize your local Docusaurus docs with Outline, use:

```bash
./outlineExport.sh sync-collections
```
Creates Outline collections (folders) matching your local folder structure.

```bash
./outlineExport.sh sync-documents
```
Uploads all Markdown files from your local project to the corresponding Outline collections.

```bash
./outlineExport.sh wipe-collections
```
Deletes all collections (and their documents) from Outline. **Use with caution! Mainly for testing only!**

### Importing from Outline

To import all documents from Outline into your local project, use:

```bash
./outlineImport.sh
```

This will:
- Download all Outline documents as Markdown files, but will not preserve the folder structure everything will be copied into a single folder. This needs to be improved in the future. It should get everything based on the folder structure of Docusaurus. This should be relatively easily adaptable from the export script.

> **Note:** The import script is currently a separate file (`outlineImport.sh`). In the future, it will be merged into a single script (`sync.sh`) that handles both import and export operations.

## How the Scripts Work

- **Export (outlineExport.sh):**
  - Scans your local project for Markdown files and folders.
  - Creates matching collections in Outline if they do not exist.
  - Uploads each Markdown file as a document to the appropriate Outline collection.
  - Maintains a mapping file (`.outline_map.json`) to track which local files correspond to which Outline documents (This is problematic seem kinda unintuitive to add files via this system I recomend looking into a new way to handle this).

- **Import (outlineImport.sh):**
  - Fetches all documents from Outline.
  - Saves the documents and attachments into a local `imported_documents` directory.

## Future Plans

- The import functionality will be integrated into the main sync script, and the scripts will be renamed/merged for clarity (`sync.sh`).
- The import script will be improved to preserve the folder structure of Docusaurus when importing documents.
- Additional improvements and error handling will be added as the scripts evolve.

---

**Note:** These scripts are a work in progress and may require adjustments for your specific environment or Outline instance. Always review and test before running destructive operations like `wipe-collections`.
