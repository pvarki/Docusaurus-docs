// src/scripts/sync_outline_to_devdocs.mjs
// Outline → repo (one-way) for Dev Docs categories.
//
// Defaults (override with env):
//   OUTLINE_COLL_CONTRIBUTING = "Contributing"
//   OUTLINE_COLL_SPECS        = "Specs"
//   OUTLINE_COLL_ROADMAP      = "Roadmap"
//   OUTLINE_COLL_SETUPGUIDE   = "Setup Guide"
//
// Required env:
//   OUTLINE_URL, OUTLINE_TOKEN
//
// What this does:
// - Mirrors the 4 Outline collections into docs/dev/{contributing|specs|roadmap|setupguide}
// - For nodes with children: creates a folder + _category_.json, and (if body exists) an index.md
// - For leaf docs: writes a single .md in parent folder
// - Sanitizes MDX-hostile content (HTML void tags, autolinks, comments, attr lists, IDs, stray braces)
// - Tracks written files in .outline-sync.json
// - Removes stale files we wrote previously but which are no longer in Outline
//   • If unchanged → delete
//   • If locally edited → move to docs/dev/_orphaned/**

import fs from "fs";
import path from "path";
import crypto from "crypto";

const REPO_ROOT = path.resolve(process.cwd());
const OUT_DIR    = path.join(REPO_ROOT, "docs", "dev");
const ORPHAN_DIR = path.join(OUT_DIR, "_orphaned");
const SYNC_FILE  = path.join(REPO_ROOT, ".outline-sync.json");

const OUTLINE_URL   = (process.env.OUTLINE_URL || "").replace(/\/+$/, "");
const OUTLINE_TOKEN = process.env.OUTLINE_TOKEN || "";

const COLL_CONTRIB     = process.env.OUTLINE_COLL_CONTRIBUTING || "Contributing";
const COLL_SPECS       = process.env.OUTLINE_COLL_SPECS        || "Specs";
const COLL_ROADMAP     = process.env.OUTLINE_COLL_ROADMAP      || "Roadmap";
const COLL_SETUPGUIDE  = process.env.OUTLINE_COLL_SETUPGUIDE   || "Setup Guide";
const STRICT_DELETE    = String(process.env.OUTLINE_STRICT_DELETE || "false").toLowerCase() === "true";

const MAP = [
  { name: COLL_CONTRIB,    dest: "contributing" },
  { name: COLL_SPECS,      dest: "specs" },
  { name: COLL_ROADMAP,    dest: "roadmap" },
  { name: COLL_SETUPGUIDE, dest: "setupguide" },
];

// ------------- utils -------------
function ensureDir(p){ fs.mkdirSync(p, {recursive:true}); }
function exists(p){ try{ fs.accessSync(p); return true; } catch { return false; } }
function sha1(s){ return crypto.createHash("sha1").update(s).digest("hex"); }
function normEOL(s){ return s.replace(/\r\n/g, "\n"); }
function writeIfChanged(abs, content){
  ensureDir(path.dirname(abs));
  const next = content.endsWith("\n") ? content : content + "\n";
  if (exists(abs)) {
    const prev = fs.readFileSync(abs, "utf8");
    if (prev === next) return false;
  }
  fs.writeFileSync(abs, next);
  return true;
}
function writeJsonIfChanged(abs, obj){
  const next = JSON.stringify(obj, null, 2) + "\n";
  if (exists(abs)) {
    const prev = fs.readFileSync(abs, "utf8");
    if (prev === next) return false;
  }
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, next);
  return true;
}
function loadSync(){
  try {
    const j = JSON.parse(fs.readFileSync(SYNC_FILE, "utf8"));
    return { outlineDocs: j.outlineDocs || {} };
  } catch {
    return { outlineDocs: {} };
  }
}
function saveSync(data){
  fs.writeFileSync(SYNC_FILE, JSON.stringify({ outlineDocs: data.outlineDocs }, null, 2) + "\n");
}
function slugify(s){
  return String(s || "")
    .trim().toLowerCase()
    .replace(/['"’`]/g, "")
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function fm(title){
  return `---\ntitle: ${JSON.stringify(title || "")}\n---\n\n`;
}

// ------------- MDX sanitizer (Outline) -------------
function sanitizeMarkdownForMdxFromOutline(md) {
  if (!md) return "";
  const NL = "\n";
  let s = normEOL(md);

  const fenceRe = /^(\s*)(`{3,}|~{3,})(.*)$/;
  const VOID = [
    "area","base","br","col","embed","hr","img","input","keygen",
    "link","meta","param","source","track","wbr"
  ];
  const voidTagRe = new RegExp(`<\\s*(${VOID.join("|")})(\\s[^<>]*?)?>`, "gi");
  const alreadyClosedRe = /\/\s*>$/;
  const htmlCommentRe = /<!--([\s\S]*?)-->/g;
  const angleLinkRe = /<https?:\/\/[^>\s]+>/g;
  const attrAfterLinkImgRe = /((?:!\[[^\]]*\]|\[[^\]]*\])\([^)]+\))\{[^}]*\}/g;
  const loneAttrLineRe = /^\s*\{\:[^}]*\}\s*$/gm;
  const headingIdRe = /^(\s{0,3}#{1,6}\s+[^\n]+?)\s*\{#[^}]+\}\s*$/gm;
  const braceTraps = [
    /\{\{\s*<[\s\S]*?>\s*\}\}/g, // {{< ... >}}
    /\{\{\s*%[\s\S]*?%\s*\}\}/g, // {{% ... %}}
    /\{\{[\s\S]*?\}\}/g,         // {{ ... }}
    /\{\%[\s\S]*?\%\}/g,         // {% ... %}
    /\{\/\*[\s\S]*?\*\/\}/g,     // {/* ... */}
    /\{\@[^\}]*\}/g,             // {@...}
    /\{\=[^\}]*\}/g              // {=...}
  ];

  const escapeCurlyOutsideInlineCode = (line) => {
    const parts = line.split(/(`[^`]*`)/g);
    for (let i=0; i<parts.length; i++) {
      if (/^`[^`]*`$/.test(parts[i])) continue;
      parts[i] = parts[i].replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
    }
    return parts.join("");
  };

  // First pass: per line transforms outside fenced code
  const lines = s.split(NL);
  let out = [];
  let inFence = false;

  for (let raw of lines) {
    const m = raw.match(fenceRe);
    if (m) {
      inFence = !inFence;
      out.push(raw);
      continue;
    }
    if (inFence) { out.push(raw); continue; }

    let line = raw;

    // 1) Self-close void tags for JSX/MDX
    line = line.replace(voidTagRe, (match, tag, attrs="") => {
      if (alreadyClosedRe.test(match)) return match;
      return `<${tag}${attrs || ""} />`;
    });

    // 2) HTML comments → JSX comments
    line = line.replace(htmlCommentRe, (_m, body) => `{/*${body}*/}`);

    // 3) Angle autolinks → markdown links
    line = line.replace(angleLinkRe, (m) => {
      const url = m.slice(1, -1);
      return `[${url}](${url})`;
    });

    // 4) Strip kramdown-style attr lists after links/images
    line = line.replace(attrAfterLinkImgRe, "$1");

    out.push(line);
  }

  s = out.join(NL);

  // Multi-line transforms
  s = s.replace(loneAttrLineRe, "");
  s = s.replace(headingIdRe, "$1");

  // Neutralize brace-based templating
  for (const re of braceTraps) {
    s = s.replace(re, (m) => m.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;"));
  }

  // Escape any remaining { } outside code fences & inline code
  const finalLines = s.split(NL);
  out = [];
  inFence = false;
  for (let raw of finalLines) {
    const m = raw.match(fenceRe);
    if (m) { inFence = !inFence; out.push(raw); continue; }
    if (inFence) { out.push(raw); continue; }
    out.push(escapeCurlyOutsideInlineCode(raw));
  }

  return out.join(NL);
}

// ------------- Outline API -------------
async function rpc(method, body={}){
  const res = await fetch(`${OUTLINE_URL}/api/${method}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OUTLINE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=> "");
    throw new Error(`${method} ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
}
async function getCollectionIdByName(name){
  const r = await rpc("collections.list", { limit: 100 });
  const hit = (r?.data || []).find(c => (c.name || "").trim() === name);
  if (!hit) throw new Error(`Collection "${name}" not found`);
  return hit.id;
}
async function getCollectionTree(collectionId){
  const r = await rpc("collections.documents", { id: collectionId });
  return r?.data || [];
}
async function getDocInfo(id){
  const r = await rpc("documents.info", { id });
  return r?.data || null;
}

// ------------- sync -------------
async function syncCollection({ name, dest }, acc){
  console.log(`→ Syncing Outline collection "${name}" → docs/dev/${dest}`);
  ensureDir(path.join(OUT_DIR, dest));

  const collectionId = await getCollectionIdByName(name);
  const tree = await getCollectionTree(collectionId);

  // root category label
  writeJsonIfChanged(path.join(OUT_DIR, dest, "_category_.json"), {
    label: name,
    collapsed: true,
  });

  async function visit(node, parts){
    const title = node.title || "untitled";
    const slug  = slugify(title) || "untitled";
    const hasChildren = (node.children && node.children.length > 0);

    const folder = path.join(OUT_DIR, dest, ...parts, slug);

    if (hasChildren) {
      ensureDir(folder);
      writeJsonIfChanged(path.join(folder, "_category_.json"), {
        label: title, collapsed: true,
      });

      const info = await getDocInfo(node.id);
      const contentRaw = (info?.text || "").trim();
      const content = sanitizeMarkdownForMdxFromOutline(contentRaw);
      if (content) {
        const p = path.join(folder, "index.md");
        const body = fm(title) + content + "\n";
        if (writeIfChanged(p, body)) console.log("  ✎", path.relative(REPO_ROOT, p));
        acc.current[p] = sha1(body);
      }

      for (const child of node.children) {
        await visit(child, [...parts, slug]);
      }
    } else {
      const info = await getDocInfo(node.id);
      const contentRaw = (info?.text || "").trim();
      const content = sanitizeMarkdownForMdxFromOutline(contentRaw);
      const parentDir = path.join(OUT_DIR, dest, ...parts);
      ensureDir(parentDir);

      const file = path.join(parentDir, `${slug}.md`);
      const body = fm(title) + content + "\n";
      if (writeIfChanged(file, body)) console.log("  ✎", path.relative(REPO_ROOT, file));
      acc.current[file] = sha1(body);
    }
  }

  for (const n of tree) {
    await visit(n, []);
  }
}

async function main(){
  if (!OUTLINE_URL || !OUTLINE_TOKEN) {
    console.error("⛔ OUTLINE_URL / OUTLINE_TOKEN not set.");
    process.exit(1);
  }

  ensureDir(OUT_DIR);
  ensureDir(ORPHAN_DIR);

  const syncState = loadSync();
  const prevMap   = { ...syncState.outlineDocs };  // filepath → sha (from last run)
  const acc       = { current: {} };               // paths written this run

  for (const entry of MAP) {
    try {
      await syncCollection(entry, acc);
    } catch (e) {
      console.warn(`⚠️  Skipped "${entry.name}": ${e.message}`);
    }
  }

  // Garbage-collect orphans: previously tracked but not rewritten this run
  const previousPaths = Object.keys(prevMap);
  const currentPaths  = new Set(Object.keys(acc.current));
  const baseDev       = path.join(REPO_ROOT, "docs", "dev") + path.sep;

  for (const prevPath of previousPaths) {
    if (!prevPath.startsWith(baseDev)) continue;  // only our area
    if (currentPaths.has(prevPath)) continue;     // still present

    if (!exists(prevPath)) {
      delete prevMap[prevPath];
      continue;
    }

    if (STRICT_DELETE) {
      fs.unlinkSync(prevPath);
      // cleanup empty folders upward
      let dir = path.dirname(prevPath);
      const limit = path.join(REPO_ROOT, "docs", "dev");
      while (dir.startsWith(limit) && dir !== limit) {
        try { fs.rmdirSync(dir); } catch { break; }
        dir = path.dirname(dir);
      }
      delete prevMap[prevPath];
      console.log("  🗑️  removed (strict)", path.relative(REPO_ROOT, prevPath));
      continue;
    }

    // Non-strict: delete if unchanged; move to _orphaned if modified
    const prevSha = prevMap[prevPath];
    const nowBody = fs.readFileSync(prevPath, "utf8");
    const nowSha  = sha1(nowBody);

    if (nowSha === prevSha) {
      fs.unlinkSync(prevPath);
      let dir = path.dirname(prevPath);
      const limit = path.join(REPO_ROOT, "docs", "dev");
      while (dir.startsWith(limit) && dir !== limit) {
        try { fs.rmdirSync(dir); } catch { break; }
        dir = path.dirname(dir);
      }
      delete prevMap[prevPath];
      console.log("  🗑️  removed", path.relative(REPO_ROOT, prevPath));
    } else {
      const rel = path.relative(path.join(REPO_ROOT, "docs", "dev"), prevPath);
      const target = path.join(ORPHAN_DIR, rel);
      ensureDir(path.dirname(target));
      fs.renameSync(prevPath, target);
      delete prevMap[prevPath];
      console.log("  📦 moved modified orphan →", path.relative(REPO_ROOT, target));
    }
  }

  // Update sync map
  const nextMap = { ...prevMap };
  for (const [p, sha] of Object.entries(acc.current)) nextMap[p] = sha;
  saveSync({ outlineDocs: nextMap });

  console.log("✅ outline → devdocs sync complete");
}

main().catch(e => { console.error(e); process.exit(1); });
