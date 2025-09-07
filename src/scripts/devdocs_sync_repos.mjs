// Repo READMEs → Dev Docs (multi-version) with submodules
// - Builds docs/dev/integrationrepo/v/<tag>/index.md (+ README pages)
// - Orders tags newest → oldest via sidebar positions
// - Converts .rst via pandoc when available
// - Makes Markdown MDX-safe (no imports/exports breakage)
// - Uses GitHub API; set GITHUB_TOKEN for better rate limits

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { spawnSync } from "child_process";

const REPO_ROOT = path.resolve(process.cwd());
const OUT_DIR   = path.join(REPO_ROOT, "docs", "dev", "integrationrepo");
const V_DIR     = path.join(OUT_DIR, "v");

const OWNER = process.env.INTEGRATION_OWNER || "pvarki";
const REPO  = process.env.INTEGRATION_REPO  || "docker-rasenmaeher-integration";
// "latest" | "all" | CSV of tags; default show up to MAX_TAGS latest
const INTEGRATION_TAGS = (process.env.INTEGRATION_TAGS || "latest").trim();
const MAX_TAGS = Number(process.env.MAX_TAGS || 7);

const GH_TOKEN = process.env.GITHUB_TOKEN || "";

// Debug: DOCUSAURUS_SYNC_DEBUG=1 …
const DEBUG = process.env.DOCUSAURUS_SYNC_DEBUG === "1";
function debug(...a){ if (DEBUG) console.log("[SYNC]", ...a); }

// ---------- utils ----------
function ensureDir(p){ fs.mkdirSync(p, {recursive:true}); }
function exists(p){ try{ fs.accessSync(p); return true; } catch{ return false; } }
function writeIfChanged(abs, s){
  ensureDir(path.dirname(abs));
  const next = s.endsWith("\n") ? s : s + "\n";
  if (exists(abs)) {
    const prev = fs.readFileSync(abs, "utf8");
    if (prev === next) return false;
  }
  fs.writeFileSync(abs, next);
  return true;
}
function writeJsonIfChanged(abs, obj){
  return writeIfChanged(abs, JSON.stringify(obj, null, 2));
}
function sha1(s){ return crypto.createHash("sha1").update(s).digest("hex"); }

// ---------- Semver sorting ----------
function semverKey(t){
  const m = String(t).replace(/^v/,"").split(".").map(n=>parseInt(n,10));
  return [m[0]||0, m[1]||0, m[2]||0];
}
function sortTagsDesc(tags){
  return [...tags].sort((a,b)=>{
    const A = semverKey(a.name);
    const B = semverKey(b.name);
    if (A[0]!==B[0]) return B[0]-A[0];
    if (A[1]!==B[1]) return B[1]-A[1];
    if (A[2]!==B[2]) return B[2]-A[2];
    return String(b.name).localeCompare(String(a.name));
  });
}

// ---------- GitHub API ----------
function ghHeaders(extra={}){
  const h = { "User-Agent":"pvarki-docs-sync", "Accept":"application/vnd.github.v3+json", ...extra };
  if (GH_TOKEN) h["Authorization"] = `token ${GH_TOKEN}`;
  return h;
}
async function ghJson(url){
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) {
    const body = await res.text().catch(()=> "");
    throw new Error(`${res.status} ${url} :: ${body}`);
  }
  return res.json();
}
async function ghText(url, acceptRaw=false){
  const res = await fetch(url, { headers: ghHeaders(acceptRaw?{"Accept":"application/vnd.github.raw"}:{}) });
  if (!res.ok) return null;
  return res.text();
}

async function getTagsDetailed(){
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/tags?per_page=100`;
  const list = await ghJson(url);
  return list.map(t => ({ name: t.name, commitSha: t.commit?.sha || null }));
}
async function getCommitShaForRef(tag){
  const refUrl = `https://api.github.com/repos/${OWNER}/${REPO}/git/ref/tags/${encodeURIComponent(tag)}`;
  const ref = await ghJson(refUrl).catch(()=> null);
  if (!ref) return null;
  if (ref.object?.type === "commit") return ref.object.sha;
  if (ref.object?.type === "tag") {
    const tagObjUrl = `https://api.github.com/repos/${OWNER}/${REPO}/git/tags/${ref.object.sha}`;
    const tagObj = await ghJson(tagObjUrl);
    return tagObj.object?.sha || null;
  }
  return null;
}
async function listRootContents(owner, repo, ref){
  const url = `https://api.github.com/repos/${owner}/${repo}/contents?ref=${encodeURIComponent(ref)}`;
  const j = await ghJson(url).catch(()=> null);
  return Array.isArray(j) ? j : [];
}
function pickReadmeEntry(contents){
  const by = new Map(contents.map(x => [String(x.name).toLowerCase(), x]));
  const order = ["readme.mdx","readme.md","readme.rst","readme","readme.txt","readme.markdown","readme.mdown"];
  for (const k of order) if (by.has(k)) return by.get(k);
  return contents.find(x => /^readme(\.|$)/i.test(x.name)) || null;
}
async function downloadRaw(url){
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) return null;
  return res.text();
}
async function getFileAt({owner, repo, ref, pathRel}){
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(pathRel)}?ref=${encodeURIComponent(ref)}`;
  return ghText(url, /*raw*/true); // authenticated, works for private + commit SHAs
}
async function getRepoTree(owner, repo, refSha){
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${refSha}?recursive=1`;
  return ghJson(url);
}
function parseGitmodules(text){
  const out = []; let current = null;
  for (const raw of (text||"").split("\n")){
    const line = raw.trim();
    const sec = line.match(/^\[submodule\s+"(.+?)"\]$/); if (sec){ current={name:sec[1]}; out.push(current); continue; }
    const kv  = line.match(/^(\w+)\s*=\s*(.+)$/);       if (kv && current) current[kv[1]] = kv[2];
  }
  out.forEach(s=>{ s.path = s.path || ""; s.url = s.url || ""; });
  return out;
}

// ---------- RST → MD ----------
function havePandoc(){ return spawnSync("pandoc", ["-v"], {stdio:"ignore"}).status === 0; }
function rstToMd(rst){
  if (!rst) return "";
  if (havePandoc()) {
    const r = spawnSync("pandoc", ["-f","rst","-t","gfm"], { input: rst, encoding: "utf8" });
    if (r.status === 0) return r.stdout;
  }
  // fallback minimal conversion
  let md = String(rst).replace(/\r\n/g,"\n");
  md = md.replace(/(^|\n)([^\n]+)\n(=+|-+|~+|\^+|"+|\++)\n/g,
    (_m, pfx, title, under) => `${pfx}${'#'.repeat(under[0]==='='?1:under[0]==='-'?2:under[0]==='~'?3:under[0]==='^'?4:under[0]==='"'?5:6)} ${title}\n`);
  md = md.replace(/^\s*\.\.\s+image::\s+(\S+)\s*(\n(?:\s+:[a-z]+:.*\n)*)?/gmi, (m, url, opts) => {
    let alt = ''; if (opts){ const a = opts.match(/^\s*:alt:\s*(.+)$/mi); if (a) alt = a[1].trim(); }
    return `![${alt}](${url})\n`;
  });
  md = md.replace(/^\s*\.\.\s+code-block::\s*([a-z0-9_\-]+)\s*\n([\s\S]*?)(?=\n\S|\n\.\.|$)/gmi,
    (_m, lang, rest) => {
      const body = rest.split('\n').map(ln => ln.replace(/^\s{2}/,'')).join('\n').replace(/\n+$/,'');
      return `\n\`\`\`${lang}\n${body}\n\`\`\`\n`;
    });
  md = md.replace(/``([^`]+)``/g, '`$1`');
  md = md.replace(/`([^`]+)\s*<([^>]+)>`_/g, '[$1]($2)');
  md = md.replace(/^\s*\.\.\s+note::\s*(.+)$/gmi, '> **Note:** $1');
  return md;
}

// ---------- MDX sanitizer ----------
function sanitizeMarkdownForMdx(md) {
  if (!md) return "";
  let s = md.replace(/\r\n/g, "\n");

  // Normalize code-fence headers: ```{.bash} or ```{language=bash}
  s = s.split('\n').map(line => {
    const m = line.match(/^(\s*)(`{3,}|~{3,})\s*(.*)$/);
    if (!m) return line;
    const [, indent, fence, restRaw] = m;
    let rest = (restRaw || '').trim();
    const m1 = rest.match(/^\{\.?([a-z0-9_\-]+)(?:[^}]*)\}$/i);
    const m2 = rest.match(/^\{ *language *= *([a-z0-9_\-]+) *\}$/i);
    if (m1) rest = m1[1];
    else if (m2) rest = m2[1];
    else if (rest.startsWith('{') && rest.endsWith('}')) rest = '';
    return `${indent}${fence}${rest ? rest.replace(/[^\w\-+.#]/g,'') : ''}`;
  }).join('\n');

  // Angle autolinks
  s = s.replace(/<https?:\/\/[^>\s]+>/g, m => {
    const url = m.slice(1, -1);
    return `[${url}](${url})`;
  });

  // Strip attribute lists and heading IDs
  s = s.replace(/(!\[[^\]]*\]\([^)]+\))\{[^}]*\}/g, '$1');
  s = s.replace(/(\[[^\]]*\]\([^)]+\))\{[^}]*\}/g, '$1');
  s = s.replace(/^\s*\{\:[^}]*\}\s*$/gm, '');
  s = s.replace(/^(\s{0,3}#{1,6}\s+[^\n]+?)\s*\{#[^}]+\}\s*$/gm, '$1');

  // Neutralize templating / JSX comment blocks
  const traps = [
    /\{\{\s*<[\s\S]*?>\s*\}\}/g,
    /\{\{\s*%[\s\S]*?%\s*\}\}/g,
    /\{\{[\s\S]*?\}\}/g,
    /\{\%[\s\S]*?\%\}/g,
    /\{\/\*[\s\S]*?\*\/\}/g,
    /\{\@[^\}]*\}/g,
    /\{\=[^\}]*\}/g
  ];
  for (const re of traps) {
    s = s.replace(re, m => m.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;"));
  }

  // Escape braces outside fences & inline code
  const lines = s.split("\n");
  let out = [];
  let inFence = false;
  for (let line of lines) {
    const f = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (f) { inFence = !inFence; out.push(line); continue; }
    if (inFence) { out.push(line); continue; }
    const parts = line.split(/(`[^`]*`)/g);
    for (let i=0;i<parts.length;i++){
      if (/^`[^`]*`$/.test(parts[i])) continue;
      parts[i] = parts[i].replace(/\{/g,"&#123;").replace(/\}/g,"&#125;");
    }
    out.push(parts.join(""));
  }
  return out.join("\n");
}

// ---------- Markdown page ----------
function mdPage({ title, header, body }){
  return `---\ntitle: ${JSON.stringify(title)}\n---\n\n${header ? header+"\n\n" : ""}${body}\n`;
}

// ---------- Robust README fetching ----------
async function fetchReadmeMarkdown({ owner, repo, ref, altRef }) {
  debug("fetchReadmeMarkdown", { owner, repo, ref, altRef });

  // Try raw filenames first (works for public; private raw may fail)
  const candidates = [
    "README.mdx","Readme.mdx","readme.mdx",
    "README.md","Readme.md","readme.md",
    "README.rst","Readme.rst","readme.rst",
    "README","Readme","readme"
  ];

  async function tryRaw(r) {
    if (!r) return null;
    for (const name of candidates) {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${r}/${name}`;
      const body = await downloadRaw(rawUrl);
      if (body != null) {
        debug("README via RAW", { ref: r, name });
        return name.toLowerCase().endsWith(".rst") ? rstToMd(body) : body;
      }
    }
    return null;
  }

  let body = await tryRaw(altRef);
  if (body == null) body = await tryRaw(ref);
  if (body != null) return body;

  // Contents API (authenticated) — works for private and specific commit SHAs.
  async function listAndPick(r){
    if (!r) return null;
    const contents = await listRootContents(owner, repo, r);
    const entry = pickReadmeEntry(contents || []);
    if (!entry) return null;

    // Use Contents API with Accept: raw (download_url may be null)
    const pathRel = entry.path || entry.name;
    const raw = await getFileAt({ owner, repo, ref: r, pathRel });
    if (raw == null) return null;

    debug("README via CONTENTS", { ref: r, name: entry.name });
    return entry.name.toLowerCase().endsWith(".rst") ? rstToMd(raw) : raw;
  }

  body = await listAndPick(altRef);
  if (body == null) body = await listAndPick(ref);
  return body; // may be null
}

async function buildReadmePage({ title, owner, repo, ref, altRef, subHeader, destFile }){
  const raw = await fetchReadmeMarkdown({ owner, repo, ref, altRef });
  const header = subHeader || "";
  if (raw == null) {
    writeIfChanged(destFile, mdPage({ title, header, body: "_No README found for this ref._" }));
    return;
  }
  const safe = sanitizeMarkdownForMdx(raw);
  writeIfChanged(destFile, mdPage({ title, header, body: safe }));
}

// ---------- Writing helpers ----------
function writeTagCategory(tag, position){
  const dir = path.join(V_DIR, tag);
  ensureDir(dir);
  writeJsonIfChanged(path.join(dir, "_category_.json"), { label: tag, position });
}
function writeEmptyTagIndex(tag){
  const p = path.join(V_DIR, tag, "index.md");
  const md = `---\ntitle: ${JSON.stringify(tag)}\n---\n\n`; // placeholder
  writeIfChanged(p, md);
}
function writeIntegrationIndex(tags){
  const links = tags.map(t => `- [${t.name}](./v/${encodeURIComponent(t.name)}/index.md)`).join("\n");
  const md = `---\ntitle: "Repositories & README’s"\n---\n\nBelow are the integration repo versions:\n\n${links}\n`;
  writeIfChanged(path.join(OUT_DIR, "index.md"), md);
}

// ---------- Per-tag build ----------
async function buildForTag(tagObj, position){
  const tag = tagObj.name;
  const refSha = tagObj.commitSha || await getCommitShaForRef(tag);
  if (!refSha) throw new Error(`Cannot resolve commit for tag ${tag}`);

  // ensure version folder + ordering in sidebar
  writeTagCategory(tag, position);
  writeEmptyTagIndex(tag);

  // 1) Integration repo README page (prefer tag for listing; refSha for exactness)
  const integHeader =
`> **Integration tag:** \`${tag}\`  
> **Repo:** https://github.com/${OWNER}/${REPO}`;
  await buildReadmePage({
    title: `${OWNER}/${REPO} – README`,
    owner: OWNER, repo: REPO,
    ref: refSha, altRef: tag,
    subHeader: integHeader,
    destFile: path.join(V_DIR, tag, "integration.md"),
  });

  // 2) Submodules
  const gitmodules = await getFileAt({ owner: OWNER, repo: REPO, ref: tag, pathRel: ".gitmodules" });
  if (!gitmodules) return;
  const subs = parseGitmodules(gitmodules);
  if (!subs.length) return;

  const tree = await getRepoTree(OWNER, REPO, refSha);
  const entries = Object.create(null);
  (tree.tree || []).forEach(e => { entries[e.path] = e; });

  const SUBDIR = path.join(V_DIR, tag, "submodules");
  ensureDir(SUBDIR);

  for (const s of subs){
    const gitlink = entries[s.path];
    const subSha  = (gitlink && gitlink.type === "commit") ? gitlink.sha : null;

    // derive {subOwner, subRepo}
    let subOwner="", subRepo="";
    if (/github\.com[:/]/i.test(s.url)) {
      const m = s.url.replace(/\.git$/,"").match(/github\.com[:/](.+?)\/(.+?)$/i);
      if (m) { subOwner = m[1]; subRepo = m[2]; }
    }
    const title = (subOwner && subRepo) ? `${subOwner}/${subRepo} – README` : `${s.name} – README`;
    const header =
`> **Integration tag:** \`${tag}\` · **Submodule commit:** \`${subSha || "unknown"}\`  
> **Repo:** ${s.url || "(unknown)"}${(subOwner && subRepo) ? `  
> **Browse at this commit:** https://github.com/${subOwner}/${subRepo}/tree/${subSha || "HEAD"}` : ""}`;

    const dest = path.join(SUBDIR, `${s.name}.md`);

    if (subOwner && subRepo && subSha) {
      // Try exact commit; fallback to default branch if README missing at that commit
      await buildReadmePage({
        title,
        owner: subOwner, repo: subRepo,
        ref: subSha, altRef: "HEAD",
        subHeader: header,
        destFile: dest,
      });
    } else {
      writeIfChanged(dest, mdPage({ title, header, body: "_Could not resolve submodule README._" }));
    }
  }
}

// ---------- Main ----------
async function main(){
  ensureDir(OUT_DIR);
  ensureDir(V_DIR);

  // parent categories
  writeJsonIfChanged(path.join(OUT_DIR, "_category_.json"), {
    label: "Repositories & README’s",
    collapsed: true
  });
  // label the /v folder nicely
  writeJsonIfChanged(path.join(V_DIR, "_category_.json"), {
    label: "Version Tags",
    collapsed: true,
    link: { type: "generated-index", title: "Version Tags" }
  });

  // fetch & select tags
  let tags = await getTagsDetailed();
  tags = sortTagsDesc(tags);

  if (INTEGRATION_TAGS && INTEGRATION_TAGS !== "all" && INTEGRATION_TAGS !== "latest") {
    const allow = new Set(INTEGRATION_TAGS.split(",").map(s=>s.trim()).filter(Boolean));
    tags = tags.filter(t => allow.has(t.name));
  } else if (INTEGRATION_TAGS === "latest") {
    tags = tags.slice(0, 1);
  } else {
    tags = tags.slice(0, MAX_TAGS);
  }

  // Build each version, set sidebar positions 1..N
  for (let i=0; i<tags.length; i++){
    const t = tags[i];
    const pos = i+1; // newest first (sorted desc already)
    console.log(`→ Building integration docs for tag ${t.name}`);
    await buildForTag(t, pos);
  }

  // versions landing page
  writeIntegrationIndex(tags);

  console.log("✅ integration READMEs synced");
}

main().catch(e => { console.error(e); process.exit(1); });
