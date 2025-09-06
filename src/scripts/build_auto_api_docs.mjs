#!/usr/bin/env node
// Build "Auto API Docs" pages that embed Swagger UI inside Docusaurus pages.
// - Fetches OpenAPI JSON from configured URLs
// - Saves under: static/apidocs/<key>/openapi.json
// - Generates MDX page: docs/dev/autoapidocs/<key>.md that renders <Swagger url="..."/>
//
// Env vars (set any that you want to build):
//   RASENMAEHER_OPENAPI_URL   (e.g. https://host/openapi.json)
//   RASENMAEHER_OPENAPI_AUTH  (optional, e.g. "Bearer xyz")
//   TAK_OPENAPI_URL
//   TAK_OPENAPI_AUTH
//   MTX_OPENAPI_URL
//   MTX_OPENAPI_AUTH
//
// You can also provide a JSON map in AUTOAPI_EXTRA like:
//   AUTOAPI_EXTRA='[{"key":"myapi","title":"My API","url":"https://.../openapi.json","auth":"Bearer abc"}]'
//
// Usage:
//   npm run devdocs:build:autoapi
//
// Tip: Your sidebar already autogenerates docs/dev/autoapidocs/*

import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const TARGETS = [
  { key: "rasenmaeher", title: "Rasenmäher API", url: process.env.RASENMAEHER_OPENAPI_URL, auth: process.env.RASENMAEHER_OPENAPI_AUTH },
  { key: "tak",         title: "TAK Server API", url: process.env.TAK_OPENAPI_URL,         auth: process.env.TAK_OPENAPI_AUTH },
  { key: "mtx",         title: "MediaMTX API",   url: process.env.MTX_OPENAPI_URL,         auth: process.env.MTX_OPENAPI_AUTH },
];

// Optionally extend with custom APIs via JSON
try {
  if (process.env.AUTOAPI_EXTRA) {
    const extra = JSON.parse(process.env.AUTOAPI_EXTRA);
    if (Array.isArray(extra)) TARGETS.push(...extra);
  }
} catch (_) { /* ignore */ }

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

async function fetchJson(url, auth) {
  const headers = { Accept: "application/json" };
  if (auth) headers.Authorization = auth;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GET ${url} -> ${res.status} ${txt}`);
  }
  return res.json();
}

function writeJSON(abs, obj) {
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, JSON.stringify(obj, null, 2) + "\n");
  console.log(`  ↳ saved ${path.relative(ROOT, abs)}`);
}

function writeMDX(abs, { title, key }) {
  const mdx = `---
title: ${JSON.stringify(title)}
---

import Swagger from '@site/src/components/Swagger';

<Swagger url={"/apidocs/${key}/openapi.json"} />

`;
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, mdx);
  console.log(`  ↳ wrote ${path.relative(ROOT, abs)}`);
}

async function buildOne({ key, title, url, auth }) {
  if (!url) return false;
  console.log(`→ Building Swagger page for ${title} (${key})`);
  const spec = await fetchJson(url, auth);

  const jsonOut = path.join(ROOT, "static", "apidocs", key, "openapi.json");
  writeJSON(jsonOut, spec);

  const pageOut = path.join(ROOT, "docs", "dev", "autoapidocs", `${key}.md`);
  writeMDX(pageOut, { title, key });
  return true;
}

async function main() {
  const picked = TARGETS.filter(t => t.url);
  if (picked.length === 0) {
    console.log("ℹ️  No API URLs configured; set e.g. RASENMAEHER_OPENAPI_URL");
    return;
  }
  let built = 0;
  for (const t of picked) {
    try {
      const ok = await buildOne(t);
      if (ok) built++;
    } catch (e) {
      console.warn(`  ⚠️  ${t.title}: ${e.message}`);
    }
  }
  if (built > 0) {
    console.log("🎉 Auto API docs updated.");
  } else {
    console.log("ℹ️  Nothing updated.");
  }
}

main().catch(e => { console.error(e); process.exit(1); });
