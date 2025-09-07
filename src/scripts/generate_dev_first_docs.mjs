// Finds the first real doc (not just a category index) inside each dev section
// and writes prefix-stripped routes to src/generated/devFirstDocs.json
import fs from "fs";
import path from "path";

const REPO = process.cwd();
const DOCS_ROOT = path.join(REPO, "docs");
const OUT = path.join(REPO, "src", "generated", "devFirstDocs.json");

// sections to scan (folder names under docs/dev/*)
const SECTIONS = ["contributing", "specs", "roadmap", "setupguide"];

function isDocFile(name) {
  return /\.(md|mdx)$/i.test(name);
}
function isCategoryMeta(name) {
  return name === "_category_.json";
}

// Strip "NN-" or "NN_" number prefixes on every path segment
function stripNumPrefix(seg) {
  return seg.replace(/^\d+[-_]/, "");
}

// Convert a docs id like "dev/contributing/00-who-are-we"
// into a route-ish path "dev/contributing/who-are-we"
// Also turn ".../index" into "..."
function idToRoute(id) {
  // drop trailing /index
  id = id.replace(/\/index$/i, "");
  return id
    .split("/")
    .map(stripNumPrefix)
    .join("/");
}

function findFirstDocIn(dirAbs, relFromDocs) {
  if (!fs.existsSync(dirAbs)) return null;
  const entries = fs.readdirSync(dirAbs);

  // Sort for stable results
  entries.sort((a, b) => a.localeCompare(b, "en"));

  // 1) pick first non-index *.md(x) file
  for (const name of entries) {
    if (isCategoryMeta(name)) continue;
    if (isDocFile(name) && !/^index\.mdx?$/i.test(name)) {
      const id = path.posix
        .join(relFromDocs, name.replace(/\.(md|mdx)$/i, ""))
        .replace(/\\/g, "/");
      return idToRoute(id);
    }
  }

  // 2) dive into first subfolder that contains a doc
  for (const name of entries) {
    const abs = path.join(dirAbs, name);
    if (fs.statSync(abs).isDirectory()) {
      const nested = findFirstDocIn(abs, path.posix.join(relFromDocs, name));
      if (nested) return nested;
    }
  }

  // 3) fallback to index.md(x) if present
  for (const name of entries) {
    if (/^index\.mdx?$/i.test(name)) {
      const id = path.posix
        .join(relFromDocs, name.replace(/\.(md|mdx)$/i, ""))
        .replace(/\\/g, "/");
      return idToRoute(id);
    }
  }

  return null;
}

function main() {
  const result = {};
  for (const key of SECTIONS) {
    const abs = path.join(DOCS_ROOT, "dev", key);
    const rel = path.posix.join("dev", key);
    const route = findFirstDocIn(abs, rel) || rel; // fallback: section root
    result[key] = route;
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");
  console.log("✓ wrote", path.relative(REPO, OUT), "→", result);
}

main();
