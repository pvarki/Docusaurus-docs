// Sync "Repositories & Readme's":
//  - Remote integration repo README (MD/MDX/RST) via GitHub
//  - Remote submodules (from that integration repo's .gitmodules) READMEs
//
// ENV (defaults safe):
//   INTEGRATION_REPO_SLUG = pvarki/docker-rasenmaeher-integration
//   INTEGRATION_REPO_REF  = HEAD
//   GITHUB_TOKEN          = <token> (optional; increases rate limits)
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const REPO_ROOT = path.resolve(process.cwd());
const OUT_DIR   = path.join(REPO_ROOT, 'docs', 'dev', 'integrationrepo');

const INTEGRATION_REPO_SLUG = process.env.INTEGRATION_REPO_SLUG || 'pvarki/docker-rasenmaeher-integration';
const INTEGRATION_REPO_REF  = process.env.INTEGRATION_REPO_REF  || 'HEAD';
const GITHUB_TOKEN          = process.env.GITHUB_TOKEN || '';

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }
function exists(p){ try { fs.accessSync(p); return true; } catch { return false; } }
function writeIfChanged(abs, content){
  ensureDir(path.dirname(abs));
  const next = content.endsWith('\n') ? content : content + '\n';
  if (exists(abs)) {
    const prev = fs.readFileSync(abs, 'utf8');
    if (prev === next) return false;
  }
  fs.writeFileSync(abs, next);
  return true;
}
function writeJsonIfChanged(abs, obj){
  const next = JSON.stringify(obj, null, 2) + '\n';
  if (exists(abs)) {
    const prev = fs.readFileSync(abs, 'utf8');
    if (prev === next) return false;
  }
  ensureDir(path.dirname(abs));
  fs.writeFileSync(abs, next);
  return true;
}
function frontmatter(title){ return `---\ntitle: ${JSON.stringify(title || '')}\n---\n\n`; }

// ── GitHub helpers ────────────────────────────────────────────
async function ghFetch(url, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`;
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res;
}

/** Prefer README.mdx → README.md → README.rst */
async function findRepoReadme(slug, ref) {
  const url = `https://api.github.com/repos/${slug}/contents?ref=${encodeURIComponent(ref)}`;
  const res = await ghFetch(url, { headers: { Accept: 'application/vnd.github.v3+json' }});
  const list = await res.json();
  const by = Object.fromEntries(list.map(x => [String(x.name).toLowerCase(), x]));
  const pick = by['readme.mdx'] || by['readme.md'] || by['readme.rst'] || by['readme'];
  if (!pick) return null;
  return { name: pick.name, download_url: pick.download_url || pick.html_url };
}
async function fetchText(url){ const r = await ghFetch(url); return r.text(); }

// ── RST → MD ─────────────────────────────────────────────────
function rstToMd(rst) {
  const hasPandoc = spawnSync('pandoc', ['-v'], { stdio: 'ignore' }).status === 0;
  if (hasPandoc) {
    const r = spawnSync('pandoc', ['-f','rst','-t','gfm'], { input: rst, encoding: 'utf8' });
    if (r.status === 0) return r.stdout;
  }
  // Lightweight fallback: headings, images, code-blocks, literals, links, notes
  let md = rst.replace(/\r\n/g, '\n');

  md = md.replace(/(^|\n)([^\n]+)\n(=+|-+|~+|\^+|"+|\++)\n/g,
    (_m, pfx, title, under) => `${pfx}${'#'.repeat(
      under[0]==='='?1:under[0]==='-'?2:under[0]==='~'?3:under[0]==='^'?4:under[0]==='"'?5:6
    )} ${title}\n`);

  md = md.replace(/^\s*\.\.\s+image::\s+(\S+)\s*(\n(?:\s+:[a-z]+:.*\n)*)?/gmi, (m, url, opts) => {
    let alt = '';
    if (opts) {
      const a = opts.match(/^\s*:alt:\s*(.+)$/mi);
      if (a) alt = a[1].trim();
    }
    return `![${alt}](${url})\n`;
  });

  md = md.replace(/^\s*\.\.\s+code-block::\s*([a-z0-9_\-]+)\s*\n([\s\S]*?)(?=\n\S|\n\.\.|$)/gmi,
    (_m, lang, rest) => {
      const lines = rest.split('\n');
      const picked = [];
      for (const ln of lines) {
        if (/^\s{2,}\S/.test(ln) || ln.trim()==='') picked.push(ln.replace(/^\s{2}/,''));
        else break;
      }
      const body = picked.join('\n').replace(/\n+$/,'');
      return `\n\`\`\`${lang}\n${body}\n\`\`\`\n`;
    });

  md = md.replace(/``([^`]+)``/g, '`$1`');
  md = md.replace(/`([^`]+)\s*<([^>]+)>`_/g, '[$1]($2)');
  md = md.replace(/^\s*\.\.\s+note::\s*(.+)$/gmi, '> **Note:** $1');

  return md;
}

// ── MDX sanitization ─────────────────────────────────────────
// 1) Normalize fences like ```{language=bash} → ```bash
// 2) Strip attribute lists:  ![](...){...}  and  [](…){...}  and  {: .class}
// 3) Strip heading IDs:  ### Title {#id}
// 4) Escape ALL { / } outside code fences and inline code.
function sanitizeMarkdownForMdx(md) {
  let s = md.replace(/\r\n/g, '\n');

  // Strip attribute blocks after images/links
  s = s.replace(/(!\[[^\]]*\]\([^)]+\))\{[^}]*\}/g, '$1');
  s = s.replace(/(\[[^\]]*\]\([^)]+\))\{[^}]*\}/g, '$1');
  s = s.replace(/^\s*\{\:[^}]*\}\s*$/gm, ''); // lines like "{: .class}"

  // Strip heading IDs at line end: "### Title {#id}"
  s = s.replace(/^(\s{0,3}#{1,6}\s+[^\n]+?)\s*\{#[^}]+\}\s*$/gm, '$1');

  // Normalize odd code fences (e.g. ```{.bash} / ```{language=bash})
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

  // Escape braces outside fences and inline code
  const lines = s.split('\n');
  let out = [];
  let inFence = false;
  let fenceMarker = null;

  for (let line of lines) {
    const f = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (f) {
      const [, indent, marker, rest] = f;
      if (!inFence) { inFence = true; fenceMarker = marker; out.push(line); continue; }
      else { inFence = false; fenceMarker = null; out.push(line); continue; }
    }
    if (inFence) { out.push(line); continue; }

    // split by backticks to find inline-code spans; escape braces only in non-code segments
    const parts = line.split(/(`[^`]*`)/g);
    for (let i=0; i<parts.length; i++) {
      if (/^`[^`]*`$/.test(parts[i])) continue; // inside inline code
      // escape all bare { }
      parts[i] = parts[i].replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
    }
    out.push(parts.join(''));
  }

  return out.join('\n');
}

// ── Integration repo + submodules ────────────────────────────
async function fetchRepoReadme(slug, ref) {
  const entry = await findRepoReadme(slug, ref);
  if (!entry) throw new Error(`No README found in ${slug}@${ref}`);
  const raw = await fetchText(entry.download_url);
  const name = (entry.name || '').toLowerCase();
  const md = name.endsWith('.rst') ? rstToMd(raw) : raw;
  return { title: `${slug} – README`, markdown: md };
}

async function listIntegrationSubmodules(slug, ref) {
  const url = `https://api.github.com/repos/${slug}/contents/.gitmodules?ref=${encodeURIComponent(ref)}`;
  try {
    const res = await ghFetch(url, { headers: { Accept: 'application/vnd.github.raw' }});
    const ini = await res.text();
    const blocks = [];
    let current = null;
    for (const rawLine of ini.split('\n')) {
      const line = rawLine.trim();
      const header = line.match(/^\[submodule\s+"([^"]+)"\]/i);
      if (header) { if (current) blocks.push(current); current = { name: header[1] }; continue; }
      if (!current) continue;
      const kv = line.match(/^([a-z]+)\s*=\s*(.+)$/i);
      if (kv) current[kv[1].toLowerCase()] = kv[2].trim();
    }
    if (current) blocks.push(current);

    return blocks
      .filter(b => b.url)
      .map(b => {
        let s = b.url
          .replace(/^git@github\.com:/,'https://github.com/')
          .replace(/^ssh:\/\//,'https://')
          .replace(/\.git$/,'')
          .replace(/^https?:\/\/github\.com\//,''); // owner/repo
        const pathSlug = (b.path || b.name || s).replace(/[^\w.-/]/g,'').replace(/\//g,'-');
        return { pathSlug, repoSlug: s };
      });
  } catch {
    return [];
  }
}

function fileNameForSubmodule(pathSlug) { return `${pathSlug}.md`; }

// ── Main ─────────────────────────────────────────────────────
async function main(){
  ensureDir(OUT_DIR);
  writeJsonIfChanged(path.join(OUT_DIR, '_category_.json'), {
    label: "Repositories & Readme's",
    collapsed: true
  });

  // Integration README
  try {
    console.log(`→ Fetching integration README from ${INTEGRATION_REPO_SLUG} (${INTEGRATION_REPO_REF})`);
    const { title, markdown } = await fetchRepoReadme(INTEGRATION_REPO_SLUG, INTEGRATION_REPO_REF);
    const safe = sanitizeMarkdownForMdx(markdown);
    const out  = path.join(OUT_DIR, 'README.md');
    if (writeIfChanged(out, frontmatter(title) + safe)) console.log('  ✎', path.relative(REPO_ROOT, out));
    else console.log('  • up-to-date:', path.relative(REPO_ROOT, out));
  } catch (e) {
    console.warn('⚠ integration README fetch failed:', e.message);
  }

  // Submodule READMEs
  let updated = 0;
  try {
    const subs = await listIntegrationSubmodules(INTEGRATION_REPO_SLUG, INTEGRATION_REPO_REF);
    for (const s of subs) {
      try {
        const { title, markdown } = await fetchRepoReadme(s.repoSlug, 'HEAD');
        const safe = sanitizeMarkdownForMdx(markdown);
        const out  = path.join(OUT_DIR, fileNameForSubmodule(s.pathSlug));
        if (writeIfChanged(out, frontmatter(title) + safe)) {
          console.log('  ✎', path.relative(REPO_ROOT, out));
          updated++;
        }
      } catch (e) {
        console.warn(`  ⚠ submodule ${s.repoSlug}: ${e.message}`);
      }
    }
  } catch (e) {
    console.warn('⚠ submodules listing failed:', e.message);
  }
  console.log(`  ✅ READMEs: ${updated} submodule file(s) updated`);
}

main().catch(e => { console.error(e); process.exit(1); });
