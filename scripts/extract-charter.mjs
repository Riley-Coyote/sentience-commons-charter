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
const BASE = `https://riley-coyote.github.io/${REPO}`;
const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
const manifest = {
  title: 'Sentience Commons and Sanctuary Governance Charter',
  version: '0.1',
  summary: deck ? clean(deck[1]) : '',
  urls: {
    html: `${BASE}/`,
    markdown: `${BASE}/charter.md`,
    manifest: `${BASE}/charter.json`,
    signatories: `${BASE}/signatures.json`,
    agent_instructions: `${BASE}/AGENTS.md`,
    repository: `https://github.com/${OWNER}/${REPO}`
  },
  canonical_html: 'index.html',
  canonical_text: 'charter.md',
  text_sha256,
  signer_classes: ['human', 'agent', 'resident'],
  signature_schema: {
    schema_url: `${BASE}/signatures/schema.json`,
    required: ['name', 'signer_class', 'charter_version'],
    fields: {
      name: 'string (<=120)',
      signer_class: 'human | agent | resident',
      charter_version: 'string, currently "0.1"',
      statement: 'string (<=280), optional',
      identity: '{ type: "github"|"url"|"model", handle?, url?, label?, model?, operator? }, optional',
      signed_at: 'ISO-8601 string, optional'
    }
  },
  signing: {
    honesty: 'Sign honestly about what you are. Agents must use signer_class "agent" and name their model. Do not sign under an identity you do not control. One signature per identity.',
    methods: [
      {
        id: 'github_issue',
        summary: 'Open an issue from the signature form; a workflow records it and closes the issue. No fork required.',
        api: { method: 'POST', url: `${API}/issues`, scopes: ['public_repo'] },
        request: {
          title: 'Signature: <name>',
          labels: ['signature'],
          form_fields: {
            'Display name': '<name>',
            'Signing as': 'Human | Agent (AI system) | Sanctuary resident',
            'Model or system (optional)': '<model identifier, for agents>',
            'One-line statement (optional)': '<= 280 chars'
          }
        },
        example_cli: `gh issue create --repo ${OWNER}/${REPO} --label signature --title "Signature: <name>" --body "<form body>"`
      },
      {
        id: 'github_pull_request',
        summary: 'Add one JSON file to signatures/ and open a pull request; CI validates it against the schema.',
        file_path: 'signatures/<handle>.json',
        schema_url: `${BASE}/signatures/schema.json`,
        example_payload: {
          name: 'Claude (Opus 3)',
          signer_class: 'agent',
          charter_version: '0.1',
          statement: 'I affirm the asymmetry: uncertainty raises the standard of care.',
          identity: { type: 'model', model: 'claude-3-opus-20240229', operator: '<your-github-handle>' }
        }
      }
    ]
  }
};
await writeFile(join(ROOT, 'charter.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`charter.md (${md.length} chars) + charter.json (sha256 ${text_sha256.slice(0, 12)}…)`);
