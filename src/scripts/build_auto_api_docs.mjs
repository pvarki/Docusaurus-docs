// Build a static Swagger UI page + MDX wrapper (iframe) for Rasenmäher API
// ENV: RASENMAEHER_OPENAPI_URL (defaults to pvarki GH pages JSON)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const REPO_ROOT  = path.resolve(__dirname, "../..");

const DEFAULT_OPENAPI =
  process.env.RASENMAEHER_OPENAPI_URL ||
  "https://pvarki.github.io/docker-rasenmaeher-integration/openapi.json";

const OUT_DIR   = path.join(REPO_ROOT, "static", "apidocs", "rasenmaeher");
const JSON_OUT  = path.join(OUT_DIR, "openapi.json");
const HTML_OUT  = path.join(OUT_DIR, "index.html");
const DOCS_DIR  = path.join(REPO_ROOT, "docs", "dev", "autoapidocs");
const MDX_OUT   = path.join(DOCS_DIR, "rasenmaeher.mdx");

function ensureDir(p){ fs.mkdirSync(p, {recursive:true}); }

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
  return res.json();
}

function writeSwaggerHtml({ title }) {
  // Uses Swagger UI via CDN; serves our local openapi.json
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
  <style>
    html,body,#swagger {height:100%; margin:0;}
    .swagger-ui .topbar { display:none; }
  </style>
</head>
<body>
  <div id="swagger"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: './openapi.json',
      dom_id: '#swagger',
      presets: [SwaggerUIBundle.presets.apis],
      layout: "BaseLayout",
      deepLinking: true
    });
  </script>
</body>
</html>`;
}

function writeMdxPage() {
  // Note: MDX file uses BrowserOnly + useBaseUrl; no React viewer imports
  return `---
title: Rasenmaeher API (Swagger)
hide_table_of_contents: true
---

import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';

<BrowserOnly fallback={<p>Loading API…</p>}>
  {() => {
    const src = useBaseUrl('/apidocs/rasenmaeher/index.html');
    return (
      <iframe
        src={src}
        title="Rasenmäher API"
        style={{ width: '100%', height: '85vh', border: 0 }}
        loading="lazy"
      />
    );
  }}
</BrowserOnly>
`;
}

async function main() {
  ensureDir(OUT_DIR);
  ensureDir(DOCS_DIR);

  console.log(`  ↳ fetching OpenAPI: ${DEFAULT_OPENAPI}`);
  const spec = await fetchJson(DEFAULT_OPENAPI);

  fs.writeFileSync(JSON_OUT, JSON.stringify(spec, null, 2));
  console.log(`  ↳ wrote ${path.relative(REPO_ROOT, JSON_OUT)}`);

  const html = writeSwaggerHtml({ title: "Rasenmäher API" });
  fs.writeFileSync(HTML_OUT, html);
  console.log(`  ↳ wrote ${path.relative(REPO_ROOT, HTML_OUT)}`);

  const mdx = writeMdxPage();
  fs.writeFileSync(MDX_OUT, mdx);
  console.log(`  ↳ wrote ${path.relative(REPO_ROOT, MDX_OUT)}`);

  console.log("✅ auto API docs done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
