// src/scripts/sync_outline_to_devdocs.mjs
// Outline → repo (one-way) for Dev Docs + TAK Wiki with attachments + internal-link rewriting.
//
// Dev collections → docs/dev/{contributing|specs|roadmap|setupguide}
// TAK Wiki:
//   top "en" → docs/wiki/**
//   top "fi" → i18n/fi/docusaurus-plugin-content-docs/current/wiki/**
//
// Features:
// - MDX hardening
// - Downloads Outline attachments to ./_media and rewrites to local paths (fallback to pathname://ABS_URL)
// - Rewrites internal Outline links (/doc/*-<docId> and mention://…/document/<docId>) to relative links
// - Safer slugify (slashes → dashes)
// - GC of removed docs, with _orphaned/ preservation for edited files
//
// Required env: OUTLINE_URL, OUTLINE_TOKEN

import fs from "fs";
import path from "path";
import crypto from "crypto";

const REPO_ROOT = path.resolve(process.cwd());

// Roots
const DEV_ROOT        = path.join(REPO_ROOT, "docs", "dev");
const DEV_ORPHAN_DIR  = path.join(DEV_ROOT, "_orphaned");
const WIKI_EN_ROOT    = path.join(REPO_ROOT, "docs", "wiki");
const WIKI_EN_ORPHAN  = path.join(WIKI_EN_ROOT, "_orphaned");
const WIKI_FI_ROOT    = path.join(REPO_ROOT, "i18n", "fi", "docusaurus-plugin-content-docs", "current", "wiki");
const WIKI_FI_ORPHAN  = path.join(WIKI_FI_ROOT, "_orphaned");

const CLEAN_ROOTS = [
  { root: DEV_ROOT,     orphan: DEV_ORPHAN_DIR },
  { root: WIKI_EN_ROOT, orphan: WIKI_EN_ORPHAN },
  { root: WIKI_FI_ROOT, orphan: WIKI_FI_ORPHAN },
];

const SYNC_FILE  = path.join(REPO_ROOT, ".outline-sync.json");

const OUTLINE_URL   = (process.env.OUTLINE_URL || "").replace(/\/+$/, "");
const OUTLINE_TOKEN = process.env.OUTLINE_TOKEN || "";

const COLL_CONTRIB     = process.env.OUTLINE_COLL_CONTRIBUTING || "Contributing";
const COLL_SPECS       = process.env.OUTLINE_COLL_SPECS        || "Specs";
const COLL_ROADMAP     = process.env.OUTLINE_COLL_ROADMAP      || "Roadmap";
const COLL_SETUPGUIDE  = process.env.OUTLINE_COLL_SETUPGUIDE   || "Setup Guide";
const COLL_WIKI        = process.env.OUTLINE_COLL_WIKI         || "TAK Wiki";

const STRICT_DELETE    = String(process.env.OUTLINE_STRICT_DELETE || "false").toLowerCase() === "true";

const MAP_DEV = [
  { name: COLL_CONTRIB,    dest: "contributing" },
  { name: COLL_SPECS,      dest: "specs" },
  { name: COLL_ROADMAP,    dest: "roadmap" },
  { name: COLL_SETUPGUIDE, dest: "setupguide" },
];

// ---------- utils ----------
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
    .replace(/[\/\\]+/g, "-")
    .replace(/['"’`]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function fm(title){ return `---\ntitle: ${JSON.stringify(title || "")}\n---\n\n`; }
function sanitizeFilename(name){
  return String(name || "")
    .replace(/[\\/:*?"<>|\x00-\x1F]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}
function guessExtFromContentType(ct){
  if (!ct) return "bin";
  const c = ct.toLowerCase();
  if (c.includes("image/png")) return "png";
  if (c.includes("image/jpeg") || c.includes("image/jpg")) return "jpg";
  if (c.includes("image/webp")) return "webp";
  if (c.includes("image/gif")) return "gif";
  if (c.includes("image/svg")) return "svg";
  if (c.includes("image/avif")) return "avif";
  if (c.includes("application/pdf")) return "pdf";
  return "bin";
}
function parseNameParamFromUrl(url){
  try {
    const u = new URL(url, OUTLINE_URL || "http://dummy.local");
    const name = u.searchParams.get("name");
    if (name) return sanitizeFilename(name);
  } catch {}
  return null;
}
function writeRootCategory(dir, label){
  writeJsonIfChanged(path.join(dir, "_category_.json"), { label, collapsed: true });
}
function writeIndexMd(dir, title, body){
  const p = path.join(dir, "index.md");
  const out = fm(title) + body.trim() + "\n";
  return { path: p, updated: writeIfChanged(p, out), sha: sha1(out) };
}

// ---------- MDX sanitizer ----------
function sanitizeMarkdownForMdxFromOutline(md) {
  if (!md) return "";
  const NL = "\n";
  let s = normEOL(md);

  // normalize <br>
  s = s.replace(/<\s*br(\s+[^<>/]*?)?\s*\/?\s*>/gi, (_m, attrs="") => `<br${attrs || ""} />`);

  const fenceRe = /^(\s*)(`{3,}|~{3,})(.*)$/;
  const VOID = ["area","base","br","col","embed","hr","img","input","keygen","link","meta","param","source","track","wbr"];
  const voidTagRe = new RegExp(`<\\s*(${VOID.join("|")})(\\s[^<>]*?)?>`, "gi");
  const alreadyClosedRe = /\/\s*>$/;
  const htmlCommentRe = /<!--([\s\S]*?)-->/g;

  // also catch Outline's mention:// autolinks
  const angleLinkRe = /<(?:https?:\/\/|mention:\/\/)[^>\s]+>/g;

  const attrAfterLinkImgRe = /((?:!\[[^\]]*\]|\[[^\]]*\])\([^)]+?\))\{[^}]*\}/g;
  const loneAttrLineRe = /^\s*\{\:[^}]*\}\s*$/gm;
  const headingIdRe = /^(\s{0,3}#{1,6}\s+[^\n]+?)\s*\{#[^}]+\}\s*$/gm;
  const braceTraps = [
    /\{\{\s*<[\s\S]*?>\s*\}\}/g, /\{\{\s*%[\s\S]*?%\s*\}\}/g,
    /\{\{[\s\S]*?\}\}/g, /\{\%[\s\S]*?\%\}/g,
    /\{\/\*[\s\S]*?\*\/\}/g, /\{\@[^\}]*\}/g, /\{\=[^\}]*\}/g,
  ];

  // Remove empty images early
  s = s.replace(/!\[([^\]]*)\]\(\s*\)/g, (_m, alt) => {
    const txt = String(alt || "").trim();
    return txt ? `*${txt}*` : "";
  });
  s = s.replace(/<img\s+([^>]*?)src=(['"])\s*\2([^>]*)>/gi, (_m, pre, q, post) => {
    const altMatch = /alt=(['"])(.*?)\1/i.exec(`${pre} ${post}`);
    const alt = altMatch ? altMatch[2].trim() : "";
    return alt ? `*${alt}*` : "";
  });

  const escapeCurlyOutsideInlineCode = (line) => {
    const parts = line.split(/(`[^`]*`)/g);
    for (let i=0; i<parts.length; i++) {
      if (/^`[^`]*`$/.test(parts[i])) continue;
      parts[i] = parts[i].replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
    }
    return parts.join("");
  };

  const lines = s.split(NL);
  let out = [];
  let inFence = false;

  for (let raw of lines) {
    const m = raw.match(fenceRe);
    if (m) { inFence = !inFence; out.push(raw); continue; }
    if (inFence) { out.push(raw); continue; }

    let line = raw;

    line = line.replace(htmlCommentRe, (_m, body) => `{/*${body}*/}`);
    line = line.replace(angleLinkRe, (m) => {
      const url = m.slice(1, -1);
      return `[${url}](${url})`;
    });
    line = line.replace(attrAfterLinkImgRe, "$1");
    line = line.replace(voidTagRe, (match, tag, attrs="") => {
      if (alreadyClosedRe.test(match)) return match;
      return `<${tag}${attrs || ""} />`;
    });

    out.push(line);
  }

  s = out.join(NL);
  s = s.replace(loneAttrLineRe, "");
  s = s.replace(headingIdRe, "$1");
  for (const re of braceTraps) {
    s = s.replace(re, (m) => m.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;"));
  }

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

// ---------- Outline API ----------
async function rpc(method, body={}){
  const res = await fetch(`${OUTLINE_URL}/api/${method}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${OUTLINE_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${res.status}: ${await res.text().catch(()=>res.statusText)}`);
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

// ---------- Attachment helpers (images) ----------
function splitMarkdownImageDest(destRaw) {
  let dest = String(destRaw || "").trim();
  let m = dest.match(/^<([^>]+)>(?:\s+(['"])([\s\S]*?)\2)?\s*$/);
  if (m) return { url: m[1].trim(), title: (m[3]||"").trim() };
  m = dest.match(/^(\S+)(?:\s+(['"])([\s\S]*?)\2)?\s*$/);
  if (m) {
    let url = m[1].trim();
    let title = (m[3]||"").trim();
    if (/^=\d+x\d+$/i.test(title)) title = "";
    url = url.replace(/\s*=\d+x\d+\s*$/i, "");
    return { url, title };
  }
  return { url: dest.replace(/\s*=\d+x\d+\s*$/i, ""), title: "" };
}
function rebuildMarkdownImage(alt, url, title) {
  const t = title ? ` "${title.replace(/"/g, '\\"')}"` : "";
  return `![${alt}](${url}${t})`;
}
function normalizeAttachmentKey(u){
  try {
    const abs = new URL(u, OUTLINE_URL || "http://dummy.local");
    const search = new URLSearchParams(abs.search);
    const sorted = new URLSearchParams();
    Array.from(search.keys()).sort().forEach(k => sorted.set(k, search.get(k)));
    return `${abs.pathname}?${sorted.toString()}`;
  } catch {
    return u;
  }
}
function isOutlineAttachmentUrl(u){
  return typeof u === "string" && /\/api\/attachments\.redirect/i.test(u);
}
function toAbsoluteOutlineUrl(u){
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${OUTLINE_URL}${u}`;
  return `${OUTLINE_URL}/${u}`;
}
function filenameFromContentDisposition(cd){
  const m = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(cd || "");
  const raw = decodeURIComponent(m?.[1] || m?.[2] || m?.[3] || "");
  return raw ? sanitizeFilename(raw) : null;
}

async function rewriteAndDownloadAttachments(markdown, contextDir){
  if (!markdown) return { markdown, downloaded: [] };

  const mediaDir = path.join(contextDir, "_media");
  ensureDir(mediaDir);

  const imgMdRe   = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const imgHtmlRe = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;

  const toProcess = new Map(); // key → { rawUrlSet:Set<string> }

  let mm;
  while ((mm = imgMdRe.exec(markdown))) {
    const { url } = splitMarkdownImageDest(mm[2]);
    if (!url) continue;
    if (isOutlineAttachmentUrl(url)) {
      const key = normalizeAttachmentKey(url);
      if (!toProcess.has(key)) toProcess.set(key, { rawUrlSet: new Set() });
      toProcess.get(key).rawUrlSet.add(url);
    }
  }
  while ((mm = imgHtmlRe.exec(markdown))) {
    const raw = (mm[1] || "").trim();
    if (!raw) continue;
    if (isOutlineAttachmentUrl(raw)) {
      const key = normalizeAttachmentKey(raw);
      if (!toProcess.has(key)) toProcess.set(key, { rawUrlSet: new Set() });
      toProcess.get(key).rawUrlSet.add(raw);
    }
  }

  const keyToLocal = new Map(); // key → { localRel, abs, ok, absUrl }

  for (const [key, meta] of toProcess.entries()) {
    const anyRaw = [...meta.rawUrlSet][0];
    const absUrl = toAbsoluteOutlineUrl(anyRaw);

    try {
      const res = await fetch(absUrl, {
        method: "GET",
        headers: { "Authorization": `Bearer ${OUTLINE_TOKEN}` },
        redirect: "follow",
      });
      if (!res.ok) throw new Error(`${res.status}`);

      const buf = new Uint8Array(await res.arrayBuffer());
      const ct  = res.headers.get("content-type") || "";
      const cd  = res.headers.get("content-disposition") || "";

      let fname = parseNameParamFromUrl(anyRaw) || filenameFromContentDisposition(cd);
      if (!fname) {
        const idMatch = /[?&]id=([0-9a-fA-F-]+)/.exec(anyRaw);
        const id = idMatch ? idMatch[1] : sha1(absUrl).slice(0,12);
        const ext = guessExtFromContentType(ct);
        fname = `${id}.${ext}`;
      }
      fname = sanitizeFilename(fname);

      const targetAbs = path.join(mediaDir, fname);
      ensureDir(path.dirname(targetAbs));
      fs.writeFileSync(targetAbs, buf);

      const ok = exists(targetAbs);
      const localRel = `./_media/${fname}`;
      console.log(`SYNC_IMG: ${ok ? "saved" : "FAILED"} ${path.relative(REPO_ROOT, targetAbs)}  ← ${absUrl}`);
      keyToLocal.set(key, { localRel, abs: targetAbs, ok, absUrl });
    } catch (e) {
      console.warn(`SYNC_IMG: download FAIL ${absUrl}: ${e.message || e}`);
      keyToLocal.set(key, { localRel: null, abs: null, ok: false, absUrl });
    }
  }

  const mdOut = markdown
    .replace(imgMdRe, (full, alt, dest) => {
      const { url, title } = splitMarkdownImageDest(dest);
      if (!url) {
        const txt = String(alt || "").trim();
        return txt ? `*${txt}*` : "";
      }
      if (!isOutlineAttachmentUrl(url)) return full;
      const key = normalizeAttachmentKey(url);
      const hit = keyToLocal.get(key);
      if (hit && hit.ok && hit.localRel) return rebuildMarkdownImage(alt, hit.localRel, title);
      if (hit && hit.absUrl) return rebuildMarkdownImage(alt, `pathname://${hit.absUrl}`, title);
      return full;
    })
    .replace(imgHtmlRe, (full, url) => {
      const clean = (url || "").trim();
      if (!clean || !isOutlineAttachmentUrl(clean)) return full;
      const key = normalizeAttachmentKey(clean);
      const hit = keyToLocal.get(key);
      if (hit && hit.ok && hit.localRel) return full.replace(url, hit.localRel);
      if (hit && hit.absUrl) return full.replace(url, `pathname://${hit.absUrl}`);
      return full;
    });

  return { markdown: mdOut, downloaded: Array.from(keyToLocal.values()) };
}

// ---------- INTERNAL LINK REWRITE ----------
const reMdLink = /\[([^\]]+)\]\(([^)]+)\)/g;
const reHtmlLink = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;

// extract final doc UUID from:
//  - /doc/some-slug-<uuid>#anchor   (absolute or relative)
//  - /doc/<uuid>#anchor
//  - mention://<workspace>/document/<uuid>[#anchor]
function extractOutlineDocId(u) {
  if (!u) return null;

  if (String(u).startsWith("mention://")) {
    try {
      const m = String(u).match(
        /mention:\/\/[^/]+\/document\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(#[\w.-]+)?$/i
      );
      if (m) {
        return { id: m[1], hash: m[2] || "" };
      }
    } catch {}
    return null;
  }

  try {
    const abs = new URL(u, OUTLINE_URL || "http://dummy.local");
    if (!/\/doc\/.+/i.test(abs.pathname)) return null;
    const last = abs.pathname.split("/").pop() || "";
    const m =
      last.match(/-([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i) ||
      last.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i);
    if (!m) return null;
    const id = m[1];
    const hash = abs.hash || "";
    return { id, hash };
  } catch {
    return null;
  }
}

// Given a target absolute md file path, return a relative href from currentDir, removing ".md"
function toRelativeDocHref(currentDir, targetAbs, hash = "") {
  let rel = path.relative(currentDir, targetAbs).replace(/\\/g, "/");
  rel = rel.replace(/\.md$/i, "");
  rel = rel.replace(/\/index$/i, "/");

  // normalize to a relative-ish form for non-root cases
  if (!rel.startsWith("./") && !rel.startsWith("../")) rel = "./" + rel;
  if (rel === "./") rel = ".";

  // --- HARD ANCHOR: if linking *from* wiki root index, always prefix "wiki/"
  const isWikiRoot = currentDir === WIKI_EN_ROOT || currentDir === WIKI_FI_ROOT;
  if (isWikiRoot) {
    // strip any leading "./" or "../" segments so we can hard-anchor under wiki/
    let core = rel.replace(/^(\.\/)+/, "").replace(/^(\.\.\/)+/, "");
    if (!core.startsWith("wiki/")) core = "wiki/" + core;
    rel = core; // intentionally *no* leading "./" so browser treats it as under the current "folder" route
  }
  // -------------------------------------------------------------------------

  return hash ? `${rel}${hash}` : rel;
}



// Rewrite internal links inside markdown
function rewriteInternalDocLinks(markdown, currentDir, docPathMap) {
  if (!markdown) return markdown;

  const replaceOne = (urlRaw) => {
    const u = String(urlRaw || "").trim();
    if (!u) return null;
    const parsed = extractOutlineDocId(u);
    if (!parsed) return null;
    const hit = docPathMap.get(parsed.id);
    if (!hit) return null;
    return toRelativeDocHref(currentDir, hit.absFile, parsed.hash || "");
  };

  const out1 = markdown.replace(reMdLink, (full, text, dest) => {
    const repl = replaceOne(dest);
    if (!repl) return full;
    return `[${text}](${repl})`;
  });

  const out2 = out1.replace(reHtmlLink, (full, href) => {
    const repl = replaceOne(href);
    if (!repl) return full;
    return full.replace(href, repl);
  });

  return out2;
}

// ---------- Build doc → path map ----------
function buildDocPathMapForTree(tree, baseDir) {
  const map = new Map();

  function walk(node, parts=[]) {
    const title = node.title || "untitled";
    const slug  = slugify(title) || "untitled";
    const hasChildren = !!(node.children && node.children.length > 0);

    if (hasChildren) {
      const folder = path.join(baseDir, ...parts, slug);
      const file = path.join(folder, "index.md");
      if (node.id) map.set(node.id, { absFile: file, isIndex: true });
      for (const child of node.children) walk(child, [...parts, slug]);
    } else {
      const file = path.join(baseDir, ...parts, `${slug}.md`);
      if (node.id) map.set(node.id, { absFile: file, isIndex: false });
    }
  }

  for (const n of (tree || [])) walk(n, []);
  return map;
}
function mergePathMaps(...maps) {
  const out = new Map();
  for (const m of maps) for (const [k,v] of m.entries()) out.set(k, v);
  return out;
}

// ---------- visit & write ----------
async function visitNodeWrite(node, baseDir, acc, docPathMap, parts = []){
  const title = node.title || "untitled";
  const slug  = slugify(title) || "untitled";
  const hasChildren = !!(node.children && node.children.length > 0);

  const folder = path.join(baseDir, ...parts, slug);

  if (hasChildren) {
    ensureDir(folder);
    writeRootCategory(folder, title);

    const info = await getDocInfo(node.id);
    const contentRaw = (info?.text || "").trim();
    if (contentRaw) {
      const safe = sanitizeMarkdownForMdxFromOutline(contentRaw);
      const withLinks = rewriteInternalDocLinks(safe, folder, docPathMap);
      const { markdown: withImages } = await rewriteAndDownloadAttachments(withLinks, folder);
      const { path: p, updated, sha } = writeIndexMd(folder, title, withImages);
      if (updated) console.log("  ✎", path.relative(REPO_ROOT, p));
      acc.current[p] = sha;
    }

    for (const child of node.children) {
      await visitNodeWrite(child, baseDir, acc, docPathMap, [...parts, slug]);
    }
  } else {
    const info = await getDocInfo(node.id);
    const contentRaw = (info?.text || "").trim();
    const safe = sanitizeMarkdownForMdxFromOutline(contentRaw);
    const parentDir = path.join(baseDir, ...parts);
    ensureDir(parentDir);

    const withLinks = rewriteInternalDocLinks(safe, parentDir, docPathMap);
    const { markdown: withImages } = await rewriteAndDownloadAttachments(withLinks, parentDir);

    const file = path.join(parentDir, `${slug}.md`);
    const body = fm(title) + withImages + "\n";
    if (writeIfChanged(file, body)) console.log("  ✎", path.relative(REPO_ROOT, file));
    acc.current[file] = sha1(body);
  }
}

// ---------- syncs ----------
async function syncDevCollections(acc){
  // Build path maps for all dev collections first
  const perColl = [];
  for (const entry of MAP_DEV) {
    try {
      const id = await getCollectionIdByName(entry.name);
      const tree = await getCollectionTree(id);
      const baseDir = path.join(DEV_ROOT, entry.dest);
      ensureDir(baseDir);
      writeRootCategory(baseDir, entry.name);
      perColl.push({ entry, tree, baseDir, map: buildDocPathMapForTree(tree, baseDir) });
    } catch (e) {
      console.warn(`⚠️  Skipped "${entry.name}": ${e.message}`);
    }
  }
  // Merge maps so cross-collection links also resolve
  const mergedMap = mergePathMaps(...perColl.map(x => x.map));

  // Now write with link rewriting
  for (const { entry, tree, baseDir } of perColl) {
    console.log(`→ Syncing Outline collection "${entry.name}" → ${path.relative(REPO_ROOT, baseDir)}`);
    for (const n of tree) await visitNodeWrite(n, baseDir, acc, mergedMap, []);
  }
}

async function syncTakWiki(acc){
  console.log(`→ Syncing Outline collection "${COLL_WIKI}" → wiki (en + fi)`);
  const collectionId = await getCollectionIdByName(COLL_WIKI);
  const tree = await getCollectionTree(collectionId);

  // Split top-level en/fi
  const enNode = (tree || []).find(n => (n.title || "").trim().toLowerCase() === "en");
  const fiNode = (tree || []).find(n => (n.title || "").trim().toLowerCase() === "fi");

  ensureDir(WIKI_EN_ROOT);
  ensureDir(WIKI_FI_ROOT);
  writeRootCategory(WIKI_EN_ROOT, "Wiki");
  writeRootCategory(WIKI_FI_ROOT, "Wiki");

  // Build maps for each language
  const enTree = enNode ? enNode.children || [] : [];
  const fiTree = fiNode ? fiNode.children || [] : [];

  const enMap = buildDocPathMapForTree(enTree, WIKI_EN_ROOT);
  const fiMap = buildDocPathMapForTree(fiTree, WIKI_FI_ROOT);

  // Merge across both langs (in case someone links en↔fi—optional but harmless)
  const mergedWikiMap = mergePathMaps(enMap, fiMap);

  // Optional: write the language root index bodies
  if (enNode) {
    const info = await getDocInfo(enNode.id);
    const contentRaw = (info?.text || "").trim();
    if (contentRaw) {
      const safe = sanitizeMarkdownForMdxFromOutline(contentRaw);
      const withLinks = rewriteInternalDocLinks(safe, WIKI_EN_ROOT, mergedWikiMap);
      const { markdown: withImages } = await rewriteAndDownloadAttachments(withLinks, WIKI_EN_ROOT);
      const { path: p, updated, sha } = writeIndexMd(WIKI_EN_ROOT, "Wiki", withImages);
      if (updated) console.log("  ✎", path.relative(REPO_ROOT, p));
      acc.current[p] = sha;
    }
  }
  if (fiNode) {
    const info = await getDocInfo(fiNode.id);
    const contentRaw = (info?.text || "").trim();
    if (contentRaw) {
      const safe = sanitizeMarkdownForMdxFromOutline(contentRaw);
      const withLinks = rewriteInternalDocLinks(safe, WIKI_FI_ROOT, mergedWikiMap);
      const { markdown: withImages } = await rewriteAndDownloadAttachments(withLinks, WIKI_FI_ROOT);
      const { path: p, updated, sha } = writeIndexMd(WIKI_FI_ROOT, "Wiki", withImages);
      if (updated) console.log("  ✎", path.relative(REPO_ROOT, p));
      acc.current[p] = sha;
    }
  }

  // Write trees
  for (const n of enTree) await visitNodeWrite(n, WIKI_EN_ROOT, acc, mergedWikiMap, []);
  for (const n of fiTree) await visitNodeWrite(n, WIKI_FI_ROOT, acc, mergedWikiMap, []);
}

// ---------- GC helpers ----------
function findRootForPath(p){
  for (const r of CLEAN_ROOTS) {
    const rootWithSep = r.root + path.sep;
    if (p === r.root || p.startsWith(rootWithSep)) return r;
  }
  return null;
}
function cleanupEmptyDirsUpward(startDir, stopAtDir){
  let dir = startDir;
  while (dir.startsWith(stopAtDir) && dir !== stopAtDir) {
    try { fs.rmdirSync(dir); } catch { break; }
    dir = path.dirname(dir);
  }
}

// ---------- main ----------
async function main(){
  if (!OUTLINE_URL || !OUTLINE_TOKEN) {
    console.error("⛔ OUTLINE_URL / OUTLINE_TOKEN not set.");
    process.exit(1);
  }

  for (const r of CLEAN_ROOTS) ensureDir(r.root);
  ensureDir(DEV_ORPHAN_DIR);
  ensureDir(WIKI_EN_ORPHAN);
  ensureDir(WIKI_FI_ORPHAN);

  const syncState = loadSync();
  const prevMap   = { ...syncState.outlineDocs };
  const acc       = { current: {} };

  await syncDevCollections(acc);
  try { await syncTakWiki(acc); }
  catch (e) { console.warn(`⚠️  Skipped "${COLL_WIKI}": ${e.message}`); }

  // GC orphans
  const previousPaths = Object.keys(prevMap);
  const currentPaths  = new Set(Object.keys(acc.current));
  for (const prevPath of previousPaths) {
    const rootInfo = findRootForPath(prevPath);
    if (!rootInfo) continue;
    if (currentPaths.has(prevPath)) continue;
    if (!exists(prevPath)) { delete prevMap[prevPath]; continue; }

    if (STRICT_DELETE) {
      fs.unlinkSync(prevPath);
      cleanupEmptyDirsUpward(path.dirname(prevPath), rootInfo.root);
      delete prevMap[prevPath];
      console.log("  🗑️  removed (strict)", path.relative(REPO_ROOT, prevPath));
      continue;
    }

    const prevSha = prevMap[prevPath];
    const nowBody = fs.readFileSync(prevPath, "utf8");
    const nowSha  = sha1(nowBody);

    if (nowSha === prevSha) {
      fs.unlinkSync(prevPath);
      cleanupEmptyDirsUpward(path.dirname(prevPath), rootInfo.root);
      delete prevMap[prevPath];
      console.log("  🗑️  removed", path.relative(REPO_ROOT, prevPath));
    } else {
      const rel = path.relative(rootInfo.root, prevPath);
      const target = path.join(rootInfo.orphan, rel);
      ensureDir(path.dirname(target));
      fs.renameSync(prevPath, target);
      delete prevMap[prevPath];
      console.log("  📦 moved modified orphan →", path.relative(REPO_ROOT, target));
    }
  }

  const nextMap = { ...prevMap };
  for (const [p, sha] of Object.entries(acc.current)) nextMap[p] = sha;
  saveSync({ outlineDocs: nextMap });

  console.log("✅ outline → devdocs + wiki sync complete");
}

main().catch(e => { console.error(e); process.exit(1); });
