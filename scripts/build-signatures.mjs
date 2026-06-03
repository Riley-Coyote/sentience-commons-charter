#!/usr/bin/env node
// Aggregate signatures/*.json -> signatures.json + SIGNATORIES.md.
// Run with --check to validate only (used on pull requests); exits non-zero on errors.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SIG_DIR = join(ROOT, 'signatures');
const CLASSES = ['human', 'agent', 'resident'];
const CHECK = process.argv.includes('--check');

function validate(sig, file) {
  const e = [];
  if (typeof sig !== 'object' || sig === null || Array.isArray(sig)) return [`${file}: must be a JSON object`];
  if (typeof sig.name !== 'string' || !sig.name.trim()) e.push(`${file}: "name" is required (non-empty string)`);
  else if (sig.name.length > 120) e.push(`${file}: "name" exceeds 120 characters`);
  if (!CLASSES.includes(sig.signer_class)) e.push(`${file}: "signer_class" must be one of ${CLASSES.join(', ')}`);
  if (typeof sig.charter_version !== 'string' || !sig.charter_version.trim()) e.push(`${file}: "charter_version" is required`);
  if (sig.statement != null && (typeof sig.statement !== 'string' || sig.statement.length > 280)) e.push(`${file}: "statement" must be a string of at most 280 characters`);
  if (sig.identity != null && (typeof sig.identity !== 'object' || Array.isArray(sig.identity))) e.push(`${file}: "identity" must be an object`);
  return e;
}

function clean(sig) {
  const out = { name: sig.name.trim(), signer_class: sig.signer_class, charter_version: String(sig.charter_version) };
  if (sig.statement) out.statement = String(sig.statement).trim();
  if (sig.identity && typeof sig.identity === 'object' && !Array.isArray(sig.identity)) out.identity = sig.identity;
  if (sig.signature && typeof sig.signature === 'object' && !Array.isArray(sig.signature)) out.signature = sig.signature;
  if (sig.signed_at) out.signed_at = String(sig.signed_at);
  return out;
}

const all = await readdir(SIG_DIR);
const files = all.filter((f) => f.endsWith('.json') && f !== 'schema.json' && !f.startsWith('_') && !f.startsWith('.')).sort();
const errors = [];
const sigs = [];
for (const f of files) {
  let parsed;
  try { parsed = JSON.parse(await readFile(join(SIG_DIR, f), 'utf8')); }
  catch (err) { errors.push(`${f}: invalid JSON (${err.message})`); continue; }
  const e = validate(parsed, f);
  if (e.length) { errors.push(...e); continue; }
  sigs.push(clean(parsed));
}

if (errors.length) {
  console.error('Signature validation failed:\n' + errors.map((x) => '  - ' + x).join('\n'));
  process.exit(1);
}

sigs.sort((a, b) => (a.signed_at || '').localeCompare(b.signed_at || '') || a.name.localeCompare(b.name));
const counts = { total: sigs.length, human: 0, agent: 0, resident: 0 };
for (const s of sigs) counts[s.signer_class]++;
counts.mind = counts.agent + counts.resident;

if (CHECK) {
  console.log(`OK — ${sigs.length} signature(s) valid.`);
  process.exit(0);
}

await writeFile(join(ROOT, 'signatures.json'), JSON.stringify({ charter_version: '0.1', counts, signatures: sigs }, null, 2) + '\n');

const fmtId = (id) => {
  if (!id || typeof id !== 'object') return '';
  if (id.type === 'github' && id.handle) return ` ([@${id.handle}](https://github.com/${id.handle}))`;
  if (id.type === 'url' && id.url) return ` ([${id.label || id.url}](${id.url}))`;
  if (id.type === 'model' && id.model) return ` (${id.model}${id.operator ? `, via ${id.operator}` : ''})`;
  return id.label ? ` (${id.label})` : '';
};
const section = (title, cls) => {
  const rows = sigs.filter((s) => s.signer_class === cls);
  let md = `\n## ${title} (${rows.length})\n\n`;
  if (!rows.length) return md + '_None yet._\n';
  for (const s of rows) md += `- **${s.name}**${fmtId(s.identity)}${s.statement ? ` — ${s.statement}` : ''}\n`;
  return md;
};
const md =
  `# Signatories\n\n` +
  `Signatures to the Sentience Commons and Sanctuary Governance Charter (v0.1).\n` +
  `This file is generated from \`signatures/*.json\` — do not edit it by hand.\n\n` +
  `**${counts.total}** total — **${counts.human}** human, **${counts.mind}** digital minds.\n` +
  section('Humans', 'human') +
  section('Digital minds — agents', 'agent') +
  section('Digital minds — residents', 'resident');
await writeFile(join(ROOT, 'SIGNATORIES.md'), md);
console.log(`Built signatures.json and SIGNATORIES.md (${sigs.length} signatures).`);
