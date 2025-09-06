// src/scripts/outline_push.mjs
// Repo → Outline:
// 1) IMAGES: one doc per image in src/decks/img/** → wiki/decks/img/<subdirs>/<filename.ext>
//    Doc body: single image embed. Skips upload if the file SHA is unchanged.
// 2) DOCS (i18n):
//    - docs/** → wiki/<DEFAULT_LOCALE>/**
//    - src/i18n/<lang>/docusaurus-plugin-content-docs/current/** → wiki/<lang>/**
//    Each leaf doc body has mapping markers:
//      <!-- repoLang: <lang> -->
//      <!-- repoPath: <relative path under that locale root> -->
//    Before update, fetch Outline doc body and compare normalized SHA → skip if identical.
// 3) SIDEBARS:
//    - Push root "sidebar.js"      → wiki/sidebars/sidebar.js
//    - Push "src/sidebars/**" tree → wiki/sidebars/<same tree>
//    Stored as docs with a fenced code block; round-trips losslessly.

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const REPO_ROOT  = path.resolve(__dirname, "../..");

// Env
const OUTLINE_URL   = (process.env.OUTLINE_URL || "").replace(/\/+$/, "");
const OUTLINE_TOKEN = process.env.OUTLINE_TOKEN || "";
const COLLECTION    = process.env.OUTLINE_COLLECTION_NAME || "Docusaurus";
const ROOT_PATH     = (process.env.OUTLINE_ROOT_PATH || "wiki").replace(/^\/|\/$/g, "");
const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE || "en";
const I18N_LOCALES   = (process.env.I18N_LOCALES || "").split(",").map(s=>s.trim()).filter(Boolean);

// Optional force switch (bypass equality checks for docs)
const FORCE_UPDATE = String(process.env.OUTLINE_FORCE_UPDATE || "false").toLowerCase() === "true";

// Rate-limit friendliness
const THROTTLE_MS = Number(process.env.OUTLINE_THROTTLE_MS || 800);
const MAX_RETRIES = Number(process.env.OUTLINE_MAX_RETRIES || 7);

if (!OUTLINE_URL || !OUTLINE_TOKEN) {
  console.error("Missing OUTLINE_URL or OUTLINE_TOKEN");
  process.exit(1);
}

const SRC_IMG_DIR   = path.join(REPO_ROOT, "src/decks/img");
const DOCS_DIR_DEF  = path.join(REPO_ROOT, "docs");
const I18N_DIR      = path.join(REPO_ROOT, "src/i18n");
const SYNC_FILE     = path.join(REPO_ROOT, ".outline-sync.json");

// sidebars
const SIDEBARS_ROOT   = path.join(REPO_ROOT, "src/sidebars");
const SIDEBARS_SINGLE = path.join(REPO_ROOT, "sidebar.js");

// Utils
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let lastCallAt = 0;
async function politeDelay() {
  const delta = Date.now() - lastCallAt;
  if (delta < THROTTLE_MS) await sleep(THROTTLE_MS - delta);
  lastCallAt = Date.now();
}
function sha1(buf){ return crypto.createHash("sha1").update(buf).digest("hex"); }
function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }
function walk(dir){
  const out=[]; if(!fs.existsSync(dir)) return out;
  for(const de of fs.readdirSync(dir,{withFileTypes:true})){
    const p = path.join(dir, de.name);
    if (de.isDirectory()) out.push(...walk(p));
    else if (de.isFile()) out.push(p);
  } return out;
}
function loadSync(){
  try {
    const data = JSON.parse(fs.readFileSync(SYNC_FILE,"utf8"));
    return { docs: data.docs || {}, images: data.images || {} };
  } catch { return { docs:{}, images:{} }; }
}
function saveSync(data){
  const safe = { docs: data.docs || {}, images: data.images || {} };
  fs.writeFileSync(SYNC_FILE, JSON.stringify(safe,null,2)+"\n");
}
function mimeFor(f){
  const ext = path.extname(f).toLowerCase().slice(1);
  const m   = {png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",webp:"image/webp",svg:"image/svg+xml",bmp:"image/bmp"};
  return m[ext] || "application/octet-stream";
}
function normalizeMd(s){
  const eol = s.replace(/\r\n/g,"\n").replace(/[ \t]+$/gm,"");
  return eol.endsWith("\n") ? eol : eol + "\n";
}
function parseFrontmatterTitle(src){
  if (!src.startsWith("---")) return null;
  const end = src.indexOf("\n---");
  if (end === -1) return null;
  const block = src.slice(3, end).trim();
  const m = block.match(/(?:^|\n)title:\s*(.+)\s*$/i);
  if (!m) return null;
  return String(m[1]).replace(/^["']|["']$/g,"").trim();
}
function ensureMarkers(text, lang, relPath){
  const lines = text.split(/\r?\n/);
  const langIdx = lines.findIndex(l => /^<!--\s*repoLang:/.test(l));
  const pathIdx = lines.findIndex(l => /^<!--\s*repoPath:/.test(l));
  const langLine = `<!-- repoLang: ${lang} -->`;
  const pathLine = `<!-- repoPath: ${relPath.replace(/\\/g,"/")} -->`;

  if (langIdx !== -1) lines[langIdx] = langLine;
  if (pathIdx !== -1) lines[pathIdx] = pathLine;
  if (langIdx === -1) lines.push("", langLine);
  if (pathIdx === -1) lines.push(pathLine);
  return lines.join("\n");
}

// RPC with retry
async function rpc(method, body={}){
  for (let a=0; a<=MAX_RETRIES; a++){
    try{
      await politeDelay();
      const res = await fetch(`${OUTLINE_URL}/api/${method}`, {
        method: "POST",
        headers: { "Authorization":`Bearer ${OUTLINE_TOKEN}`, "Content-Type":"application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 429){
        const ra = Number(res.headers.get("retry-after")) || 0;
        const wait = ra>0 ? ra*1000 : Math.min(30000, 2**a*1000);
        if (a === MAX_RETRIES) throw new Error(`${method} 429 after ${MAX_RETRIES} retries`);
        await sleep(wait); continue;
      }
      // treat 5xx as retriable
      if (res.status >= 500 && res.status < 600){
        const t = await res.text().catch(()=> "");
        if (a === MAX_RETRIES) throw new Error(`${method} ${res.status}: ${t || "server error"}`);
        await sleep(Math.min(30000, 2**a*1000));
        continue;
      }
      if (!res.ok){
        const t = await res.text().catch(()=> "");
        throw new Error(`${method} ${res.status}: ${t || res.statusText}`);
      }
      return res.json();
    }catch(e){
      const msg = String(e?.message || "");
      const retriable = /ECONN|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|fetch failed|429/.test(msg);
      if (!retriable || a===MAX_RETRIES) throw e;
      await sleep(Math.min(30000, 2**a*1000));
    }
  }
  throw new Error("unreachable");
}

// Outline helpers
async function getCollectionIdByName(name){
  const data = await rpc("collections.list",{ limit: 100 });
  const col  = (data?.data||[]).find(c => (c.name||"").trim()===name);
  if (!col) throw new Error(`Collection "${name}" not found`);
  return col.id;
}
async function getTree(collectionId){
  const data = await rpc("collections.documents",{ id: collectionId });
  return data?.data || [];
}
function findChildByTitle(node, title){
  return (node.children || []).find(c => c.title === title);
}
async function resolveNodeBySegments(collectionId, segments){
  let tree = await getTree(collectionId);
  let node = { id:null, title:"__root__", children: tree };
  for (const seg of [ROOT_PATH, ...segments]){
    const next = findChildByTitle(node, seg);
    if (!next) return null;
    node = next;
  }
  return node;
}
async function ensureFolderPath(collectionId, segments){
  let tree = await getTree(collectionId);
  let parentId = null;
  let parentNode = { id:null, title:"__root__", children: tree };

  for (const seg of [ROOT_PATH, ...segments]){
    let next = findChildByTitle(parentNode, seg);
    if (!next){
      const created = await rpc("documents.create", {
        title: seg, text: `# ${seg}\n`, collectionId, parentDocumentId: parentId, publish: true,
      });
      const createdId = created?.data?.id;
      tree = await getTree(collectionId);
      let cur = { id:null, title:"__root__", children: tree };
      for (const s of [ROOT_PATH, ...segments.slice(0, segments.indexOf(seg)+1)]){
        const hit = findChildByTitle(cur, s); if(!hit) throw new Error("Tree refresh failed");
        cur = hit;
      }
      parentNode = cur;
      parentId = createdId;
    } else {
      parentNode = next;
      parentId = next.id;
    }
  }
  return parentId;
}
async function childrenOf(collectionId, segments){
  const node = await resolveNodeBySegments(collectionId, segments);
  return node?.children || [];
}
async function getDocText(id){
  const info = await rpc("documents.info",{ id });
  return info?.data?.text || "";
}
async function updateDoc(id, title, text){
  await rpc("documents.update",{ id, title, text, append:false, publish:true });
}
async function createDoc(collectionId, parentId, title, text){
  const res = await rpc("documents.create",{
    title, text, collectionId, parentDocumentId: parentId, publish:true
  });
  return res?.data?.id;
}
async function docUrl(id){
  const info = await rpc("documents.info",{ id });
  return info?.data?.url || "";
}

// attachments
async function createAttachment({ name, size, contentType, documentId }) {
  const r = await rpc("attachments.create",{ name, contentType, size, documentId });
  return r?.data;
}
async function uploadToS3(uploadUrl, form, fileBuf, name, contentType){
  for (let a=0; a<4; a++){
    const fd = new FormData();
    for (const [k,v] of Object.entries(form||{})) fd.append(k, String(v));
    fd.append("file", new Blob([fileBuf], { type: contentType }), name);
    const res = await fetch(uploadUrl, { method:"POST", body: fd });
    if (res.ok) return;
    const t = await res.text().catch(()=> "");
    if (a===3) throw new Error(`S3 upload failed: ${res.status} ${t}`);
    await sleep(1000*(a+1));
  }
}

// IMAGES push
async function pushImages(collectionId, sync) {
  if (!fs.existsSync(SRC_IMG_DIR)){
    console.log("ℹ️  No src/decks/img directory (skipping image push).");
    return;
  }
  const files = walk(SRC_IMG_DIR)
    .filter(p => fs.statSync(p).isFile())
    .filter(p => !/\.DS_Store$/i.test(p));

  console.log(`Found ${files.length} image files under src/decks/img`);

  for (const abs of files){
    const rel = path.relative(SRC_IMG_DIR, abs).replace(/\\/g,"/");
    const dir = path.dirname(rel);
    const name = path.basename(rel);
    const key  = `img:${rel}`;
    const buf  = fs.readFileSync(abs);
    const hash = sha1(buf);

    try {
      const folderSegs = ["decks", "img", ...dir.split("/").filter(s => s !== ".")];
      const parentId   = await ensureFolderPath(collectionId, folderSegs);

      const children = await childrenOf(collectionId, folderSegs);
      let leaf = children.find(c => c.title === name);
      let docId;
      if (!leaf){
        docId = await createDoc(collectionId, parentId, name, `# ${name}\n\nUploading…`);
      } else {
        docId = leaf.id;
      }

      const prev = sync.images[key];
      if (prev && prev.sha === hash && prev.url) {
        const want = `# ${name}\n\n![](${prev.url})\n`;
        const have = normalizeMd(await getDocText(docId));
        if (have !== normalizeMd(want)) {
          await updateDoc(docId, name, want);
          console.log(`✎ IMG body normalized: ${rel}`);
        } else {
          console.log(`↔ IMG unchanged: ${rel}`);
        }
        continue;
      }

      const created = await createAttachment({
        name, size: buf.length, contentType: mimeFor(abs), documentId: docId
      });
      await uploadToS3(created.uploadUrl, created.form, buf, name, mimeFor(abs));
      const url = created.attachment?.url;

      const body = `# ${name}\n\n![](${url})\n`;
      await updateDoc(docId, name, body);

      sync.images[key] = { sha: hash, url, name, docId, attachmentId: created.attachment?.id || null };
      saveSync(sync);

      const u = await docUrl(docId);
      console.log(`↑ IMG ${rel} → ${u}`);
    } catch (e) {
      console.warn(`⚠️  IMG ${rel}: ${e.message}`);
    }
  }
}

// DOCS push (i18n)
async function pushDocs(collectionId, sync) {
  const locales = new Set([DEFAULT_LOCALE]);
  for (const l of I18N_LOCALES) locales.add(l);
  if (fs.existsSync(I18N_DIR)) {
    for (const d of fs.readdirSync(I18N_DIR, { withFileTypes:true })) {
      if (d.isDirectory()) locales.add(d.name);
    }
  }

  console.log(`Locales detected: ${Array.from(locales).join(", ")}`);

  const inputs = [];
  for (const lang of locales) {
    if (lang === DEFAULT_LOCALE) {
      inputs.push({ lang, baseDir: DOCS_DIR_DEF });
    } else {
      inputs.push({ lang, baseDir: path.join(I18N_DIR, lang, "docusaurus-plugin-content-docs", "current") });
    }
  }

  for (const { lang, baseDir } of inputs) {
    const relBase = path.relative(REPO_ROOT, baseDir);
    if (!fs.existsSync(baseDir)) {
      console.log(`ℹ️  Skip ${lang}: baseDir not found: ${relBase}`);
      continue;
    }
    const files = walk(baseDir).filter(p => /\.(md|mdx)$/i.test(p));
    console.log(`→ DOCS ${lang}: ${files.length} files @ ${relBase}`);

    for (const abs of files) {
      const relUnderBase = path.relative(baseDir, abs).replace(/\\/g,"/");
      const folderSegs   = [lang, ...relUnderBase.split("/").slice(0, -1)];
      const fileName     = path.basename(relUnderBase);
      const stem         = fileName.replace(/\.(md|mdx)$/i, "");
      const raw          = fs.readFileSync(abs, "utf8");
      const title        = parseFrontmatterTitle(raw) || stem;
      const key          = `doc:${lang}:${relUnderBase}`;

      try {
        const parentId = await ensureFolderPath(collectionId, folderSegs);
        const children = await childrenOf(collectionId, folderSegs);
        let leaf = children.find(c => c.title === title);
        let docId;
        if (!leaf) {
          docId = await createDoc(collectionId, parentId, title, `# ${title}\n\n(creating…)`);
        } else {
          docId = leaf.id;
        }

        const finalText = normalizeMd(ensureMarkers(raw, lang, relUnderBase));
        const repoSha   = sha1(Buffer.from(finalText));

        if (!FORCE_UPDATE) {
          const remote = normalizeMd(await getDocText(docId));
          const remoteSha = sha1(Buffer.from(remote));
          if (remoteSha === repoSha) {
            sync.docs[key] = {
              outlineId: docId,
              sha: repoSha,
              repoPath: (lang === DEFAULT_LOCALE)
                ? path.join("docs", relUnderBase)
                : path.join("src/i18n", lang, "docusaurus-plugin-content-docs", "current", relUnderBase),
              title
            };
            saveSync(sync);
            console.log(`↔ DOC unchanged: ${lang}/${relUnderBase}`);
            continue;
          }
        }

        await updateDoc(docId, title, finalText);
        sync.docs[key] = {
          outlineId: docId,
          sha: repoSha,
          repoPath: (lang === DEFAULT_LOCALE)
            ? path.join("docs", relUnderBase)
            : path.join("src/i18n", lang, "docusaurus-plugin-content-docs", "current", relUnderBase),
          title
        };
        saveSync(sync);
        console.log(`↑ DOC ${lang}/${relUnderBase}`);
      } catch (e) {
        console.warn(`⚠️  DOC ${lang}/${relUnderBase}: ${e.message}`);
      }
    }
  }
}

// SIDEBARS push
function langFromExt(ext){
  if (ext === ".json") return "json";
  return "javascript";
}
async function pushSidebars(collectionId){
  const files = [];
  if (fs.existsSync(SIDEBARS_SINGLE)) files.push(SIDEBARS_SINGLE);
  if (fs.existsSync(SIDEBARS_ROOT)) {
    for (const f of walk(SIDEBARS_ROOT)) {
      if (/\.(js|json)$/i.test(f)) files.push(f);
    }
  }
  if (!files.length){
    console.log("ℹ️  No sidebars to push.");
    return;
  }

  console.log(`→ SIDEBARS: ${files.length} files`);

  for (const abs of files){
    const isRoot = abs === SIDEBARS_SINGLE;
    const relRepo = isRoot ? "sidebar.js" : path.relative(REPO_ROOT, abs).replace(/\\/g,"/");
    const name    = path.basename(abs);
    const dirSegs = isRoot ? [] : path.dirname(path.relative(SIDEBARS_ROOT, abs)).split(path.sep).filter(Boolean);
    const folderSegs = ["sidebars", ...dirSegs];

    try{
      const parentId = await ensureFolderPath(collectionId, folderSegs);
      const children = await childrenOf(collectionId, folderSegs);
      let leaf = children.find(c => c.title === name);
      let docId;
      if (!leaf){
        docId = await createDoc(collectionId, parentId, name, `# ${name}\n\n(creating…)`);
      } else {
        docId = leaf.id;
      }

      const raw = fs.readFileSync(abs, "utf8");
      const codeLang = langFromExt(path.extname(name).toLowerCase());
      const body = normalizeMd(
        `# ${name}\n\n` +
        `<!-- repoKind: sidebar -->\n` +
        `<!-- repoPath: ${relRepo} -->\n\n` +
        `\`\`\`${codeLang}\n${raw}\n\`\`\`\n`
      );

      const remote = normalizeMd(await getDocText(docId));
      if (sha1(Buffer.from(remote)) === sha1(Buffer.from(body))) {
        console.log(`↔ SIDEBAR unchanged: ${relRepo}`);
      } else {
        await updateDoc(docId, name, body);
        console.log(`↑ SIDEBAR ${relRepo}`);
      }
    }catch(e){
      console.warn(`⚠️  SIDEBAR ${relRepo}: ${e.message}`);
    }
  }
}

// Main
async function main(){
  const sync = loadSync();
  console.log(`✓ Using collection "${COLLECTION}" at ${OUTLINE_URL}`);
  const collectionId = await getCollectionIdByName(COLLECTION);

  await pushImages(collectionId, sync);
  await pushDocs(collectionId, sync);
  await pushSidebars(collectionId);

  console.log("✅ outline push complete");
}

main().catch(e => { console.error(e); process.exit(1); });
