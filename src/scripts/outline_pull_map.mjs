// src/scripts/outline_pull_map.mjs
// Outline → Repo using export in tmp/outline-export:
// - i18n docs: wiki/<lang>/** → docs/** (default) or src/i18n/<lang>/docusaurus-plugin-content-docs/current/**
//   Prefer markers in body; otherwise derive from path. Writes only when changed.
// - decks markdown: wiki/decks/{lang}/... → src/decks/{lang}/...
// - images under wiki/decks/img/** → src/decks/img/** and mirror to static/decks/img/** and static/img/**
// - sidebars under wiki/sidebars/** →
//     * wiki/sidebars/sidebar.js              → ./sidebar.js
//     * wiki/sidebars/<tree>/** (code docs)   → ./src/sidebars/<tree>/** (extract fenced code)

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {spawnSync} from 'child_process';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const REPO_ROOT      = path.resolve(__dirname, '../..');
const EXPORT_DIR     = process.env.OUTLINE_EXPORT_DIR || 'tmp/outline-export';
const SYNC_MAP_FILE  = path.join(REPO_ROOT, '.outline-sync.json');

const DOCS_DIR       = path.join(REPO_ROOT, 'docs');
const I18N_DIR       = path.join(REPO_ROOT, 'src/i18n');
const DECKS_DIR      = path.join(REPO_ROOT, 'src/decks');

const STATIC_IMG_DECKS = path.join(REPO_ROOT, 'static/decks/img');
const STATIC_IMG_ROOT  = path.join(REPO_ROOT, 'static/img');

const SIDEBARS_ROOT   = path.join(REPO_ROOT, 'src/sidebars');
const SIDEBARS_SINGLE = path.join(REPO_ROOT, 'sidebar.js');

const COLLECTION_NAME   = process.env.OUTLINE_COLLECTION_NAME || 'Docusaurus';
const ROOT_PATH         = (process.env.OUTLINE_ROOT_PATH || 'wiki').replace(/^\/|\/$/g, '');
const DEFAULT_LOCALE    = process.env.DEFAULT_LOCALE || 'en';
const OUTLINE_URL       = process.env.OUTLINE_URL || '';
const OUTLINE_TOKEN     = process.env.OUTLINE_TOKEN || '';

// Utils
function ensureDir(p){ fs.mkdirSync(p, {recursive:true}); }
function shaBuf(b){ return crypto.createHash('sha1').update(b).digest('hex'); }
function walk(dir){
  const out=[]; if(!fs.existsSync(dir)) return out;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory()) out.push(...walk(p));
    else if(e.isFile()) out.push(p);
  } return out;
}
function normalizeMd(s){
  const eol = s.replace(/\r\n/g,"\n").replace(/[ \t]+$/gm,"");
  return eol.endsWith("\n") ? eol : eol + "\n";
}
function readIfExists(file){
  try { return fs.readFileSync(file); } catch { return null; }
}
function saveIfChanged(file, contentStr){
  const next = Buffer.from(normalizeMd(contentStr), "utf8");
  const prev = readIfExists(file);
  if (prev && shaBuf(prev) === shaBuf(next)) {
    console.log('↔ unchanged', path.relative(REPO_ROOT,file));
    return false;
  }
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, next);
  console.log('↓ updated', path.relative(REPO_ROOT,file));
  return true;
}
function copyIfChanged(src, dest){
  const prev = readIfExists(dest);
  const next = fs.readFileSync(src);
  if (prev && shaBuf(prev) === shaBuf(next)) {
    console.log('↔ unchanged', path.relative(REPO_ROOT,dest));
    return false;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log('↓ updated', path.relative(REPO_ROOT,dest));
  return true;
}
function loadSyncMap(){ try { return JSON.parse(fs.readFileSync(SYNC_MAP_FILE,'utf8')); } catch { return { docs:{}, images:{} }; } }
function saveSyncMap(m){ fs.writeFileSync(SYNC_MAP_FILE, JSON.stringify(m,null,2)+'\n'); }

function autoExportIfNeeded() {
  const exists = fs.existsSync(EXPORT_DIR);
  const hasFiles = exists && walk(EXPORT_DIR).length > 0;
  if (hasFiles) return;

  console.log(`ℹ️  Outline export dir missing/empty: ${EXPORT_DIR}`);
  if (!OUTLINE_URL || !OUTLINE_TOKEN) {
    console.error('⛔ OUTLINE_URL / OUTLINE_TOKEN not set. Use dotenv or export vars.');
    process.exit(1);
  }
  const docker = spawnSync('docker', ['--version'], {stdio: 'ignore'});
  if (docker.status !== 0) {
    console.error('⛔ Docker is not available. Install Docker or pre-create the export via CI.');
    process.exit(1);
  }
  ensureDir(EXPORT_DIR);
  console.log('🐳 Running Outline Docker exporter to populate export dir...');
  const args = [
    'run','--rm',
    '-e', `TOKEN=${OUTLINE_TOKEN}`,
    '-v', `${path.resolve(REPO_ROOT, EXPORT_DIR)}:/out`,
    'ghcr.io/lrstanley/outline-export:latest',
    '--url', OUTLINE_URL,
    '--export-path', '/out/',
    '--extract',
    '--format', 'markdown'
  ];
  const res = spawnSync('docker', args, {stdio: 'inherit'});
  if (res.status !== 0) {
    console.error('⛔ Outline export failed. Check OUTLINE_URL / OUTLINE_TOKEN and try again.');
    process.exit(res.status || 1);
  }
}

function firstMatch(rx, s){ const m=s.match(rx); return m? m[1].trim(): null; }
function toRepoDocPath(lang, relUnderLocale){
  if (lang === DEFAULT_LOCALE) return path.join('docs', relUnderLocale);
  return path.join('src/i18n', lang, 'docusaurus-plugin-content-docs', 'current', relUnderLocale);
}
function sanitizeFilename(s){ return s.replace(/[^\w.-]+/g,'-'); }
function extractFirstCodeFence(md){
  // returns inner code if a fence is present; else null
  const m = md.match(/```[\w-]*\n([\s\S]*?)```/);
  return m ? m[1] : null;
}

function main(){
  autoExportIfNeeded();

  ensureDir(DOCS_DIR);
  ensureDir(I18N_DIR);
  ensureDir(DECKS_DIR);
  ensureDir(STATIC_IMG_DECKS);
  ensureDir(STATIC_IMG_ROOT);
  ensureDir(SIDEBARS_ROOT);

  const sync = loadSyncMap();

  const collCandidates = fs.readdirSync(EXPORT_DIR, {withFileTypes:true})
    .filter(d => d.isDirectory()).map(d => d.name);
  const collDirName = collCandidates.find(n => n.toLowerCase().startsWith(COLLECTION_NAME.toLowerCase()));
  if(!collDirName){
    console.warn(`No collection dir for "${COLLECTION_NAME}" found under ${EXPORT_DIR}`);
    process.exit(0);
  }
  const COLL_DIR = path.join(EXPORT_DIR, collDirName);
  const ROOT_DIR = path.join(COLL_DIR, ROOT_PATH);

  const files = walk(ROOT_DIR).filter(p => /\.mdx?$/i.test(p));

  for(const abs of files){
    const relFromRoot = path.relative(ROOT_DIR, abs).replace(/\\/g,'/');
    const contentRaw  = fs.readFileSync(abs,'utf8');
    const content     = normalizeMd(contentRaw);

    // IMAGES: wiki/decks/img/**
    if (relFromRoot.startsWith('decks/img/')) {
      const dir = path.dirname(abs);
      const baseRel = path.relative(path.join(ROOT_DIR, 'decks/img'), dir);
      const assets = fs.readdirSync(dir).filter(n => !/\.mdx?$/i.test(n));
      for(const f of assets){
        const src = path.join(dir,f);

        const tgtSrc = path.join(REPO_ROOT, 'src/decks/img', baseRel, f);
        copyIfChanged(src, tgtSrc);

        const tgt1 = path.join(STATIC_IMG_DECKS, baseRel, f);
        const tgt2 = path.join(STATIC_IMG_ROOT,  baseRel, f);
        copyIfChanged(src, tgt1);
        copyIfChanged(src, tgt2);
      }
      continue;
    }

    // DECK sources: wiki/decks/{lang}/… → src/decks/{lang}/…
    if (relFromRoot.startsWith('decks/')) {
      if (relFromRoot.startsWith('decks/img/')) continue;
      const after = relFromRoot.replace(/^decks\//,'');
      const dest  = path.join(DECKS_DIR, after).replace(/\.mdx?$/i, '.md');
      saveIfChanged(dest, content);
      const key = relFromRoot.replace(/\.mdx?$/i,'');
      const b = readIfExists(dest);
      if (b) sync.docs[key] = { repoPath: path.relative(REPO_ROOT,dest), sha: shaBuf(b) };
      continue;
    }

    // SIDEBARS: wiki/sidebars/**
    if (relFromRoot.startsWith('sidebars/')) {
      // default target path
      let outPath;
      if (relFromRoot === 'sidebars/sidebar.js' || path.basename(abs).toLowerCase().startsWith('sidebar.js')) {
        outPath = SIDEBARS_SINGLE;
      } else {
        // preserve tree
        const sub = relFromRoot.replace(/^sidebars\//,''); // e.g. android/sidebar.deployapp.mdx
        // exporter may append ".md" suffix; prefer repoPath marker if present
        const markRepoPath = firstMatch(/<!--\s*repoPath:\s*([^\n]+?)\s*-->/i, content);
        if (markRepoPath) {
          outPath = path.join(REPO_ROOT, markRepoPath);
        } else {
          const base = sub.replace(/\.mdx?$/i,''); // drop .md/.mdx from export filename
          // keep original extension if we can guess; default .js
          const guessed = base.endsWith('.json') ? base : (base.endsWith('.js') ? base : base + '.js');
          outPath = path.join(SIDEBARS_ROOT, guessed);
        }
      }
      // extract fenced code if present; otherwise dump whole doc
      const code = extractFirstCodeFence(content) || content;
      saveIfChanged(outPath, code);
      continue;
    }

    // DOCS (i18n): wiki/<lang>/**
    const parts = relFromRoot.split('/');
    if (parts.length >= 2) {
      const lang = parts[0];
      const restSegments = parts.slice(1);
      const fileTitle = path.basename(abs).replace(/\.mdx?$/i,''); // exporter uses titles

      const markLang = firstMatch(/<!--\s*repoLang:\s*([^\s]+)\s*-->/i, content) || lang;
      const markPath = firstMatch(/<!--\s*repoPath:\s*([^\n]+?)\s*-->/i, content);

      let relUnderLocale;
      if (markPath) {
        relUnderLocale = markPath;
      } else {
        const folderPath = restSegments.slice(0, -1);
        const leaf = sanitizeFilename(fileTitle) + '.md';
        relUnderLocale = path.join(...folderPath, leaf);
      }

      const destRepo = toRepoDocPath(markLang, relUnderLocale).replace(/\.mdx?$/i, '.md');
      const absRepo  = path.join(REPO_ROOT, destRepo);
      saveIfChanged(absRepo, content);

      const b = readIfExists(absRepo);
      if (b) {
        const key = `doc:${markLang}:${relUnderLocale.replace(/\\/g,'/')}`;
        sync.docs[key] = { repoPath: path.relative(REPO_ROOT,absRepo), sha: shaBuf(b) };
      }
      continue;
    }

    // Fallback
    const fallback = path.join(DOCS_DIR, relFromRoot).replace(/\.mdx?$/i, '.md');
    saveIfChanged(fallback, content);
    const b = readIfExists(fallback);
    if (b) {
      const key = relFromRoot.replace(/\.mdx?$/i,'');
      sync.docs[key] = { repoPath: path.relative(REPO_ROOT,fallback), sha: shaBuf(b) };
    }
  }

  saveSyncMap(sync);
  console.log('✅ outline pull complete');
}

main();
