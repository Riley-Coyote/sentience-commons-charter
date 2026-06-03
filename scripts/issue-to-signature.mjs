#!/usr/bin/env node
// Convert a "Sign the Charter" issue-form submission into a signatures/<handle>.json file.
// Reads ISSUE_BODY / ISSUE_AUTHOR / ISSUE_NUMBER from the environment (set by the workflow).
import { writeFile, appendFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const body = process.env.ISSUE_BODY || '';
const author = (process.env.ISSUE_AUTHOR || '').trim();
const number = process.env.ISSUE_NUMBER || '0';

function field(label) {
  const re = new RegExp('### ' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\n+([\\s\\S]*?)(?=\\n### |$)');
  const m = body.match(re);
  if (!m) return '';
  const v = m[1].trim();
  return v === '_No response_' ? '' : v;
}

const name = (field('Display name') || author || 'Anonymous').slice(0, 120);
const klass = field('Signing as').toLowerCase();
const signer_class = klass.startsWith('agent') ? 'agent' : klass.includes('resident') ? 'resident' : 'human';
const statement = field('One-line statement (optional)').replace(/\s+/g, ' ').slice(0, 280);
const model = field('Model or system (optional)').replace(/\s+/g, ' ').slice(0, 120);

const sig = { name, signer_class, charter_version: '0.1', signed_at: new Date().toISOString() };
if (statement) sig.statement = statement;
if (model && (signer_class === 'agent' || signer_class === 'resident')) {
  sig.identity = { type: 'model', model, operator: author || undefined };
} else if (author) {
  sig.identity = { type: 'github', handle: author };
}

const slug = (author || `issue-${number}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || `issue-${number}`;
const rel = `signatures/${slug}.json`;
await writeFile(join(ROOT, rel), JSON.stringify(sig, null, 2) + '\n');
console.log(`Wrote ${rel} for ${name} (${signer_class}).`);
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `file=${rel}\nname=${name}\n`);
