// src/scripts/outline_push.mjs
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {fileURLToPath} from 'url';
import dns from 'dns/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// repo root = two dirs up from src/scripts
const REPO_ROOT   = path.resolve(__dirname, '../..');
const SYNC_FILE   = path.join(REPO_ROOT, '.outline-sync.json');

const DOCS_DIR    = path.join(REPO_ROOT, 'docs');
const DECKS_DIR   = path.join(REPO_ROOT, 'src/decks');

const OUTLINE_URL    = (process.env.OUTLINE_URL || '').replace(/\/+$/,'');
const TOKEN          = process.env.OUTLINE_TOKEN || '';
const COLLECTION     = process.env.OUTLINE_COLLECTION_NAME || 'Docusaurus';
const ROOT_PATH      = (process.env.OUTLINE_ROOT_PATH || 'wiki').replace(/^\/|\/$/g, '');
const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE || 'en';

// publish placeholder “folders” so tree shows up
const PUBLISH_PLACEHOLDERS = String(process.env.OUTLINE_PUBLISH_PLACEHOLDERS || 'true').toLowerCase() !== 'false';

// throttle + retries
const BASE_DELAY_MS   = Number(process.env.OUTLINE_RATE_MS || 400);  // gap between requests
const MAX_RETRIES     = Number(process.env.OUTLINE_MAX_RETRIES || 6);
let lastCallAt = 0;

function sha(s){ return crypto.createHash('sha1').update(s).digest('hex'); }
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function walk(dir){
  const out=[]; if(!fs.existsSync(dir)) return out;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p = path.join(dir,e.name);
    if(e.isDirectory()) out.push(...walk(p));
    else if(e.isFile()) out.push(p);
  } return out;
}
function readFileUtf8(p){ return fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n'); }

function loadSync(){ try { return JSON.parse(fs.readFileSync(SYNC_FILE,'utf8')); } catch { return { docs:{} }; } }
function saveSync(m){ fs.writeFileSync(SYNC_FILE, JSON.stringify(m,null,2)+'\n'); }

async function preflightUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error(`OUTLINE_URL is missing or invalid: "${url}". Example: https://your-team.getoutline.com`);
  }
  const {hostname} = new URL(url);
  await dns.lookup(hostname).catch(() => {
    throw new Error(`Cannot resolve hostname "${hostname}" from OUTLINE_URL.`);
  });
}

// polite RPC with throttling + retry on 429 (and network hiccups)
async function rpc(method, payload){
  // throttle
  const now = Date.now();
  const since = now - lastCallAt;
  if (since < BASE_DELAY_MS) await sleep(BASE_DELAY_MS - since);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${OUTLINE_URL}/api/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(payload || {})
      });
      lastCallAt = Date.now();

      if (res.status === 429) {
        // backoff
        const ra = Number(res.headers.get('retry-after')) || 0;
        const jitter = Math.floor(Math.random() * 250);
        const wait = ra > 0 ? ra * 1000 : Math.min(16000, (2 ** attempt) * 1000) + jitter;
        if (attempt === MAX_RETRIES) throw new Error(`429 rate_limit_exceeded after ${MAX_RETRIES} retries`);
        console.warn(`Rate limited on ${method}. Backing off ${wait}ms…`);
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`${method} ${res.status}: ${t}`);
      }
      return res.json();
    } catch (e) {
      // network-level retry (ENOTFOUND/ECONNRESET/etc.)
      const msg = String(e?.message || '');
      const retriable = /ECONN|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|fetch failed/i.test(msg);
      if (!retriable || attempt === MAX_RETRIES) throw e;
      const wait = Math.min(16000, (2 ** attempt) * 1000) + Math.floor(Math.random()*250);
      console.warn(`Network error on ${method}: ${msg}. Retry in ${wait}ms…`);
      await sleep(wait);
    }
  }
  throw new Error('unreachable');
}

async function getCollectionIdByName(name){
  const data = await rpc('collections.list', { limit: 100 });
  const c = (data?.data || []).find(c => (c.name||'').trim().toLowerCase() === name.toLowerCase());
  if(!c) throw new Error(`Collection "${name}" not found on ${OUTLINE_URL}`);
  console.log(`✓ Using collection "${c.name}" (${c.id}) at ${OUTLINE_URL}`);
  return c.id;
}

// cache for children per parent id: { "<parentId|null>": Map<titleLower, doc> }
const childrenCache = new Map();
async function listChildren(collectionId, parentDocumentId){
  const key = String(parentDocumentId || 'root');
  if (childrenCache.has(key)) return childrenCache.get(key);

  // Note: simple single-page list; increase limit if your tree is huge
  const resp = await rpc('documents.list', {
    collectionId,
    parentDocumentId,
    limit: 100
  });
  const arr = resp?.data || [];
  const map = new Map(arr.map(d => [String((d.title||'').trim().toLowerCase()), d]));
  childrenCache.set(key, map);
  return map;
}

/**
 * Ensure a nested path of “folders” exists; publish placeholders so the tree is visible.
 * Returns id of the last segment.
 */
async function ensurePath(collectionId, pathSegs){
  let parentDocId = undefined;

  for (const seg of pathSegs) {
    const segKey = String(seg || '').trim().toLowerCase();
    const childMap = await listChildren(collectionId, parentDocId);
    const existing = childMap.get(segKey);

    if (existing) {
      // publish existing placeholder if needed
      if (PUBLISH_PLACEHOLDERS && existing.publishedAt == null) {
        const updated = await rpc('documents.update', { id: existing.id, publish: true, title: existing.title, text: existing.text || '' });
        // update cache (roughly)
        childMap.set(segKey, updated?.data || existing);
        console.log(`  • published placeholder "${seg}" (${existing.id})`);
      }
      parentDocId = existing.id;
      continue;
    }

    // create placeholder (published so children are visible)
    const created = await rpc('documents.create', {
      collectionId,
      parentDocumentId: parentDocId,
      title: seg,
      text: `# ${seg}\n`,
      publish: PUBLISH_PLACEHOLDERS
    });
    const createdDoc = created?.data;
    const createdId  = createdDoc?.id;
    const url        = createdDoc?.url || `${OUTLINE_URL}/doc/${createdId}`;
    console.log(`  • created placeholder "${seg}" → ${url}`);

    // update cache
    childMap.set(segKey, createdDoc);
    // also warm next-level cache key present, but we’ll list on next loop
    parentDocId = createdId;
  }
  return parentDocId;
}

async function upsertDoc({collectionId, parentId, title, md, knownId}){
  const contentSha = sha(md);
  if (knownId) {
    const resp = await rpc('documents.update', { id: knownId, text: md, title, publish: true });
    const url = resp?.data?.url || `${OUTLINE_URL}/doc/${knownId}`;
    return { id: knownId, sha: contentSha, url };
  }
  const created = await rpc('documents.create', {
    collectionId, parentDocumentId: parentId, title, text: md, publish: true
  });
  const id  = created?.data?.id;
  const url = created?.data?.url || `${OUTLINE_URL}/doc/${id}`;
  return { id, sha: contentSha, url };
}

function relWithoutExt(p){ return p.replace(/\.(md|mdx)$/i,''); }
function pathSegs(s){ return s.split('/').filter(Boolean); }

async function main(){
  if (!OUTLINE_URL || !TOKEN) { console.error('Missing OUTLINE_URL or OUTLINE_TOKEN'); process.exit(1); }
  await preflightUrl(OUTLINE_URL);

  const sync = loadSync();
  const collectionId = await getCollectionIdByName(COLLECTION);

  console.log(`REPO_ROOT=${REPO_ROOT}`);
  console.log(`DOCS_DIR=${DOCS_DIR}`);
  console.log(`DECKS_DIR=${DECKS_DIR}`);

  const deckFiles = walk(DECKS_DIR).filter(p => /\.mdx?$/i.test(p) || /\.md$/i.test(p));
  const docFiles  = walk(DOCS_DIR).filter(p => /\.mdx?$/i.test(p) || /\.md$/i.test(p));

  console.log(`Found ${deckFiles.length} deck files, ${docFiles.length} doc files.`);

  // Precompute all parent paths we will need, to amortize ensurePath calls (benefits from cache)
  const neededPaths = new Set();

  // decks → wiki/decks/{lang}/…/<leaf>
  for (const file of deckFiles) {
    const rel = path.relative(DECKS_DIR, file).replace(/\\/g,'/'); // lang/ios/…
    const segs = [ROOT_PATH, 'decks', ...pathSegs(relWithoutExt(rel))];
    for (let i=1; i<segs.length; i++) neededPaths.add(segs.slice(0,i).join('/'));
  }
  // docs → wiki/en/** or wiki/fi/**
  for (const file of docFiles) {
    const relDocs = path.relative(DOCS_DIR, file).replace(/\\/g,'/');
    const isFi = relDocs.startsWith('fi/');
    const outlineRel = isFi ? `fi/${relDocs.slice(3)}` : `en/${relDocs}`;
    const segs = [ROOT_PATH, ...pathSegs(relWithoutExt(outlineRel))];
    for (let i=1; i<segs.length; i++) neededPaths.add(segs.slice(0,i).join('/'));
  }

  // Ensure all parent paths sequentially (benefits from childrenCache + throttling)
  for (const p of Array.from(neededPaths)) {
    const segs = p.split('/').filter(Boolean);
    await ensurePath(collectionId, segs);
  }

  // Upsert decks
  for(const file of deckFiles){
    const rel = path.relative(DECKS_DIR, file).replace(/\\/g,'/');
    const segs = [ROOT_PATH, 'decks', ...pathSegs(relWithoutExt(rel))];
    const title = segs.at(-1);
    const md = readFileUtf8(file);
    const parentId = await ensurePath(collectionId, segs.slice(0, -1));
    const key = `decks/${relWithoutExt(rel)}`;
    const knownId = sync.docs[key]?.outlineId;

    const { id, sha: newSha, url } = await upsertDoc({ collectionId, parentId, title, md, knownId });
    sync.docs[key] = { ...(sync.docs[key]||{}), outlineId: id, repoPath: path.relative(REPO_ROOT, file), sha: newSha };
    console.log(`↑ deck ${key} → ${url}`);
  }

  // Upsert docs
  for(const file of docFiles){
    const relDocs = path.relative(DOCS_DIR, file).replace(/\\/g,'/');
    const isFi = relDocs.startsWith('fi/');
    const outlineRel = isFi ? `fi/${relDocs.slice(3)}` : `en/${relDocs}`;
    const segs = [ROOT_PATH, ...pathSegs(relWithoutExt(outlineRel))];
    const title = segs.at(-1);
    const md = readFileUtf8(file);
    const parentId = await ensurePath(collectionId, segs.slice(0,-1));
    const key = relWithoutExt(outlineRel);
    const knownId = sync.docs[key]?.outlineId;

    const { id, sha: newSha, url } = await upsertDoc({ collectionId, parentId, title, md, knownId });
    sync.docs[key] = { ...(sync.docs[key]||{}), outlineId: id, repoPath: path.relative(REPO_ROOT, file), sha: newSha };
    console.log(`↑ doc  ${key} → ${url}`);
  }

  saveSync(sync);
  console.log('✅ outline push complete');
}

main().catch(e=>{ console.error(e); process.exit(1); });
