const fs = require('fs');
const path = require('path');

// Path to your docs folder
const docsDir = 'docs';

/**
 * Recursively scans a directory to build the sidebar items.
 * - For directories: creates a category with the folder name.
 * - For Markdown files: returns the doc ID (relative path without the .md extension).
 *
 * If a directory contains a README.md, it will be used as the category’s index.
 *
 * @param {string} dir - The directory to scan.
 * @returns {Array} - An array of sidebar items.
 */
function getSidebarItems(dir) {
  const entries = fs.readdirSync(dir).sort((a, b) => a.localeCompare(b));
  const items = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // Recursively build items for the subdirectory
      const childItems = getSidebarItems(fullPath);
      // Look for a README.md to use as the index for this category
      const readmePath = path.join(fullPath, 'README.md');
      if (fs.existsSync(readmePath)) {
        // Compute the doc ID for README.md (relative to docsDir)
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
          items: childItems.filter(
            (item) => item !== readmeId
          ),
        });
      } else if (childItems.length > 0) {
        items.push({
          type: 'category',
          label: entry,
          items: childItems,
        });
      }
    } else if (stats.isFile() && entry.toLowerCase().endsWith('.md')) {
      // Compute the doc ID relative to the docs folder (remove .md extension)
      const docId = path
        .relative(docsDir, fullPath)
        .replace(/\\/g, '/')
        .replace(/\.md$/, '');

      // For a top-level README.md, you might want it to appear first.
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