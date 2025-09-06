const fs = require('fs');
const path = require('path');

function walkDocs(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let items = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Recursively walk subdirectories
      const subItems = walkDocs(path.join(dir, entry.name), path.join(base, entry.name));
      if (subItems.length > 0) {
        items.push({
          type: 'category',
          label: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
          items: subItems
        });
      }
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      // Remove extension for id
      const id = path.join(base, entry.name).replace(/\\/g, '/').replace(/\.(md|mdx)$/, '');
      items.push({
        type: 'doc',
        id
      });
    }
  }
  return items;
}

const docsDir = path.join(__dirname, '../../docs');
const sidebar = { items: walkDocs(docsDir) };

fs.writeFileSync(
  path.join(__dirname, 'index.json'),
  JSON.stringify(sidebar, null, 4)
);
console.log('Sidebar index.json generated!');