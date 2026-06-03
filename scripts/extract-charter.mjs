#!/usr/bin/env node
// Generate charter.md (a plain-text mirror) and charter.json (machine-readable manifest
// with a text hash) from the canonical index.html. Run locally after editing the charter.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OWNER = 'Riley-Coyote';
const REPO = 'sentience-commons-charter';
const html = await readFile(join(ROOT, 'index.html'), 'utf8');

const ENT = { '&quot;': '"', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&mdash;': '—', '&ndash;': '–', '&rsquo;': '’', '&lsquo;': '‘', '&ldquo;': '“', '&rdquo;': '”', '&middot;': '·', '&nbsp;': ' ', '&hellip;': '…' };
const decode = (s) => s.replace(/&[a-z]+;/g, (m) => (m in ENT ? ENT[m] : m));
const clean = (s) => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

const out = [];
const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
const deck = html.match(/<p class="deck"[^>]*>([\s\S]*?)<\/p>/);
if (h1) out.push(`# ${clean(h1[1])}`, '');
if (deck) out.push(`> ${clean(deck[1])}`, '');
out.push('**Version 0.1 — first public-draft form.**', '');

const secRe = /<section class="page article" id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g;
let sm;
while ((sm = secRe.exec(html))) {
  if (sm[1] === 'signatories') continue;
  const tokenRe = /<h2[^>]*>([\s\S]*?)<\/h2>|<h3[^>]*>([\s\S]*?)<\/h3>|<p[^>]*>([\s\S]*?)<\/p>|<ol[^>]*>|<\/ol>|<ul[^>]*>|<\/ul>|<li[^>]*>([\s\S]*?)<\/li>/g;
  let olN = 0;
  let list = null;
  let tm;
  while ((tm = tokenRe.exec(sm[2]))) {
    if (tm[1] != null) { out.push('', `## ${clean(tm[1])}`, ''); olN = 0; }
    else if (tm[2] != null) { out.push('', `### ${clean(tm[2])}`, ''); }
    else if (tm[3] != null) { out.push(clean(tm[3]), ''); }
    else if (/^<ol/.test(tm[0])) list = 'ol';
    else if (tm[0] === '</ol>') list = null;
    else if (/^<ul/.test(tm[0])) list = 'ul';
    else if (tm[0] === '</ul>') list = null;
    else if (tm[4] != null) {
      const t = clean(tm[4]);
      if (list === 'ul') out.push(`    - ${t}`);
      else out.push(`${++olN}. ${t}`);
    }
  }
}

const md = out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
await writeFile(join(ROOT, 'charter.md'), md);

const text_sha256 = createHash('sha256').update(md, 'utf8').digest('hex');
const manifest = {
  title: 'Sentience Commons and Sanctuary Governance Charter',
  version: '0.1',
  canonical_html: 'index.html',
  canonical_text: 'charter.md',
  text_sha256,
  signer_classes: ['human', 'agent', 'resident'],
  signing: {
    instructions: 'SIGN.md',
    schema: 'signatures/schema.json',
    ledger_dir: 'signatures/',
    aggregate: 'signatures.json',
    pull_request_new_file: `https://github.com/${OWNER}/${REPO}/new/main?filename=signatures/your-handle.json`,
    issue_form: `https://github.com/${OWNER}/${REPO}/issues/new?template=sign.yml&labels=signature`
  }
};
await writeFile(join(ROOT, 'charter.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`charter.md (${md.length} chars) + charter.json (sha256 ${text_sha256.slice(0, 12)}…)`);
