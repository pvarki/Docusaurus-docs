// src/scripts/outline_pull_images.mjs
// Outline → Repo: walk wiki/decks/img/** and download one image per leaf doc.
// Leaf doc name MUST be a filename with extension. The first image in body wins.
// Write to src/decks/img/<same/subpath>/<docTitle>, and mirror to static/* for runtime.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const REPO_ROOT  = path.resolve(__dirname, "../..");

const OUTLINE_URL   = (process.env.OUTLINE_URL || "").replace(/\/+$/, "");
const OUTLINE_TOKEN = process.env.OUTLINE_TOKEN || "";
const COLLECTION    = process.env.OUTLINE_COLLECTION_NAME || "Docusaurus";
const ROOT_PATH     = (process.env.OUTLINE_ROOT_PATH || "wiki").replace(/^\/|\/$/g, "");

const THROTTLE_MS   = Number(process.env.OUTLINE_THROTTLE_MS || 500);
const MAX_RETRIES   = Number(process.env.OUTLINE_MAX_RETRIES || 6);

if (!OUTLINE_URL || !OUTLINE_TOKEN) {
  console.error("Missing OUTLINE_URL or OUTLINE_TOKEN");
  process.exit(1);
}

const DEST_SRC_IMG   = path.join(REPO_ROOT, "src/decks/img");
const DEST_STATIC_DE = path.join(REPO_ROOT, "static/decks/img");
const DEST_STATIC    = path.join(REPO_ROOT, "static/img");

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }
const sleep = (ms)=> new Promise(r=> setTimeout(r, ms));
let lastCall = 0;
async function polite(){ const d=Date.now()-lastCall; if(d<THROTTLE_MS) await sleep(THROTTLE_MS-d); lastCall=Date.now(); }

async function rpc(method, body={}){
  for(let a=0;a<=MAX_RETRIES;a++){
    try{
      await polite();
      const res = await fetch(`${OUTLINE_URL}/api/${method}`, {
        method:"POST",
        headers:{ "Authorization":`Bearer ${OUTLINE_TOKEN}`,"Content-Type":"application/json" },
        body: JSON.stringify(body)
      });
      if(res.status===429){
        const ra=Number(res.headers.get("retry-after"))||0;
        const wait=ra>0?ra*1000:Math.min(16000,2**a*1000);
        if(a===MAX_RETRIES) throw new Error(`${method} 429`);
        await sleep(wait); continue;
      }
      if(!res.ok){ const t=await res.text().catch(()=> ""); throw new Error(`${method} ${res.status}: ${t||res.statusText}`); }
      return res.json();
    }catch(e){
      const msg=String(e?.message||"");
      const retriable=/ECONN|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|fetch failed|429/.test(msg);
      if(!retriable || a===MAX_RETRIES) throw e;
      await sleep(Math.min(16000, 2**a*1000));
    }
  }
  throw new Error("unreachable");
}

async function getCollectionIdByName(name){
  const data = await rpc("collections.list",{ limit: 100 });
  const col  = (data?.data||[]).find(c => (c.name||"").trim()===name);
  if(!col) throw new Error(`Collection "${name}" not found`);
  return col.id;
}
async function getTree(collectionId){
  const data = await rpc("collections.documents",{ id: collectionId });
  return data?.data || [];
}
function findChildByTitle(node, title){
  return (node.children||[]).find(c => c.title === title);
}

async function findImgRoot(collectionId){
  const tree = await getTree(collectionId);
  const root = { id:null, title:"__root__", children: tree };
  const wiki = findChildByTitle(root, ROOT_PATH); if(!wiki) return null;
  const decks= findChildByTitle(wiki, "decks");  if(!decks) return null;
  const img  = findChildByTitle(decks, "img");   if(!img) return null;
  return img;
}
async function info(id){ const r = await rpc("documents.info",{ id }); return r?.data || {}; }

function extractFirstImageUrl(markdown){
  const rx = /!\[[^\]]*]\((https?:\/\/[^)]+)\)/;
  const m = markdown.match(rx);
  return m ? m[1] : null;
}
function isFilenameTitle(title){
  return /\.[A-Za-z0-9]+$/.test(title); // has extension
}
async function download(url, file){
  for(let a=0;a<=3;a++){
    try{
      await polite();
      const res = await fetch(url);
      if(!res.ok) throw new Error(`GET ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      ensureDir(path.dirname(file));
      fs.writeFileSync(file, buf);
      return;
    }catch(e){
      if(a===3) throw e;
      await sleep(1000*(a+1));
    }
  }
}

async function walk(node, segs=[], out=[]){
  const nextSegs = [...segs, node.title];
  out.push({ id: node.id, title: node.title, children: node.children || [], segs: nextSegs });
  for (const ch of node.children || []) await walk(ch, nextSegs, out);
  return out;
}

async function main(){
  const collectionId = await getCollectionIdByName(COLLECTION);
  const imgRoot = await findImgRoot(collectionId);
  if(!imgRoot){ console.log("No wiki/decks/img tree found."); return; }

  const nodes = await walk(imgRoot, [ROOT_PATH, "decks", "img"]);
  // Leaf docs with filename titles
  for (const n of nodes){
    if ((n.children||[]).length) continue; // folder-ish doc
    if (!isFilenameTitle(n.title)) continue;

    const data = await info(n.id);
    const url  = extractFirstImageUrl(data.text || "");
    if (!url) continue;

    // path under src/decks/img = segments after ".../img/<sub...>/<title>"
    const imgIdx = n.segs.findIndex(s => s === "img");
    const sub    = n.segs.slice(imgIdx+1);        // [..., "<filename.ext>"]
    const fileRel= sub.join("/");

    const fSrc = path.join(DEST_SRC_IMG, fileRel);
    const fDe  = path.join(DEST_STATIC_DE, sub.slice(0,-1).join("/"), n.title);
    const fSt  = path.join(DEST_STATIC,    sub.slice(0,-1).join("/"), n.title);

    await download(url, fSrc);
    ensureDir(path.dirname(fDe)); ensureDir(path.dirname(fSt));
    fs.copyFileSync(fSrc, fDe);
    fs.copyFileSync(fSrc, fSt);
    console.log(`↓ ${path.relative(REPO_ROOT, fSrc)}`);
  }

  console.log("✅ outline pull images complete");
}

main().catch(e => { console.error(e); process.exit(1); });
