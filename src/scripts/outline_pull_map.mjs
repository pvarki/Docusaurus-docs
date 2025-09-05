// src/scripts/outline_pull_map.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {spawnSync} from 'child_process';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const REPO_ROOT      = path.resolve(__dirname, '../../..');
const EXPORT_DIR     = process.env.OUTLINE_EXPORT_DIR || 'tmp/outline-export';
const SYNC_MAP_FILE  = path.join(REPO_ROOT, '.outline-sync.json');

const DOCS_DIR       = path.join(REPO_ROOT, 'docs');
const DECKS_DIR      = path.join(REPO_ROOT, 'src/decks');
const STATIC_DECKS   = path.join(REPO_ROOT, 'static/decks');

const COLLECTION_NAME   = process.env.OUTLINE_COLLECTION_NAME || 'Docusaurus';
const ROOT_PATH         = (process.env.OUTLINE_ROOT_PATH || 'wiki').replace(/^\/|\/$/g, '');
const DEFAULT_LOCALE    = process.env.DEFAULT_LOCALE || 'en';
const OUTLINE_URL       = process.env.OUTLINE_URL || '';
const OUTLINE_TOKEN     = process.env.OUTLINE_TOKEN || '';

function ensureDir(p){ fs.mkdirSync(p, {recursive:true}); }
function sha(s){ return crypto.createHash('sha1').update(s).digest('hex'); }
function walk(dir){
  const out=[]; if(!fs.existsSync(dir)) return out;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory()) out.push(...walk(p));
    else if(e.isFile()) out.push(p);
  } return out;
}
function normalizeMd(s){ return s.replace(/\r\n/g, '\n'); }
function save(file, content){ ensureDir(path.dirname(file)); fs.writeFileSync(file, content); console.log('→ wrote', path.relative(REPO_ROOT,file)); }
function loadSyncMap(){ try { return JSON.parse(fs.readFileSync(SYNC_MAP_FILE,'utf8')); } catch { return { docs:{} }; } }
function saveSyncMap(m){ fs.writeFileSync(SYNC_MAP_FILE, JSON.stringify(m,null,2)+'\n'); }

function autoExportIfNeeded() {
  const exists = fs.existsSync(EXPORT_DIR);
  const hasFiles = exists && walk(EXPORT_DIR).length > 0;

  if (hasFiles) return; // all good

  console.log(`ℹ️  Outline export dir missing/empty: ${EXPORT_DIR}`);

  if (!OUTLINE_URL || !OUTLINE_TOKEN) {
    console.error('⛔ OUTLINE_URL / OUTLINE_TOKEN not set. Set them and re-run: npm run outline:pull');
    process.exit(1);
  }

  // Try Docker exporter (same image we use in CI)
  const docker = spawnSync('docker', ['--version'], {stdio: 'ignore'});
  if (docker.status !== 0) {
    console.error('⛔ Docker is not available. Install Docker or pre-create the export via CI, then retry.');
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

function main(){
  autoExportIfNeeded();

  ensureDir(DOCS_DIR); ensureDir(DECKS_DIR); ensureDir(STATIC_DECKS);
  const sync = loadSyncMap();

  // Locate our collection folder inside export
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
    const parts = relFromRoot.split('/');
    const contentRaw = fs.readFileSync(abs,'utf8');
    const content = normalizeMd(contentRaw);
    const hash = sha(content);

    // static/decks/**: copy sibling assets (images) alongside
    if (relFromRoot.startsWith('static/decks/')) {
      const dir = path.dirname(abs);
      const baseRel = path.relative(path.join(ROOT_DIR,'static/decks'), dir);
      const assets = fs.readdirSync(dir).filter(n => !/\.mdx?$/i.test(n));
      for(const f of assets){
        const src = path.join(dir,f);
        const tgt = path.join(STATIC_DECKS, baseRel, f);
        ensureDir(path.dirname(tgt));
        fs.copyFileSync(src, tgt);
        console.log('→ asset', path.relative(REPO_ROOT,tgt));
      }
      continue;
    }

    // decks/{lang}/… → src/decks/{lang}/….md
    if (relFromRoot.startsWith('decks/')) {
      const after = relFromRoot.replace(/^decks\//,'');
      const dest = path.join(DECKS_DIR, after).replace(/\.mdx?$/i, '.md');
      save(dest, content);
      const key = relFromRoot.replace(/\.mdx?$/i,'');
      sync.docs[key] = { repoPath: path.relative(REPO_ROOT,dest), sha: hash };
      continue;
    }

    // language split: en/** → docs/** ; fi/** → docs/fi/**
    const lang = parts[0];
    if (lang === 'en' || lang === 'fi') {
      const dest = (lang === 'en')
        ? path.join(DOCS_DIR, parts.slice(1).join('/'))
        : path.join(DOCS_DIR, 'fi', parts.slice(1).join('/'));
      const destMd = dest.replace(/\.mdx?$/i, '.md');
      save(destMd, content);
      const key = relFromRoot.replace(/\.mdx?$/i,'');
      sync.docs[key] = { repoPath: path.relative(REPO_ROOT,destMd), sha: hash };
      continue;
    }

    // fallback: treat as default-locale doc
    const dest = path.join(DOCS_DIR, relFromRoot).replace(/\.mdx?$/i, '.md');
    save(dest, content);
    const key = relFromRoot.replace(/\.mdx?$/i,'');
    sync.docs[key] = { repoPath: path.relative(REPO_ROOT,dest), sha: hash };
  }

  saveSyncMap(sync);
  console.log('✅ outline pull complete');
}

main();
