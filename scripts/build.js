#!/usr/bin/env node
/**
 * Bakes the published Sanity content into index.html at build time.
 *
 * Runs as `vercel-build`, so every Vercel deploy — including the ones a Sanity
 * webhook triggers on publish — serves HTML containing the current copy. That
 * is what makes the content crawlable and removes any dependency on the
 * visitor's browser reaching Sanity.
 *
 * Deliberately never fails the build: if Sanity is unreachable, index.html is
 * left exactly as committed and the deploy proceeds with the previous copy.
 */

const fs = require('fs');
const path = require('path');
const {parse} = require('node-html-parser');
const {applyContent, GROQ} = require('../content-apply.js');

const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'a11lv153';
const DATASET = process.env.SANITY_DATASET || 'production';
const API_VERSION = 'v2024-01-01';

const HTML_PATH = path.join(__dirname, '..', 'index.html');

async function main() {
  const url = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/` +
    `${DATASET}?query=${encodeURIComponent(GROQ)}`;

  const res = await fetch(url, {headers: {Accept: 'application/json'}});
  if (!res.ok) throw new Error(`Sanity responded ${res.status}`);

  const {result} = await res.json();
  if (!result) throw new Error('no published "site" document found');

  const html = fs.readFileSync(HTML_PATH, 'utf8');

  // `script`/`style` must stay untouched — the page's own JS lives inline.
  const root = parse(html, {
    blockTextElements: {script: false, style: false, pre: true},
  });

  let failures = 0;
  applyContent(root, result, {
    projectId: PROJECT_ID,
    dataset: DATASET,
    warn: (name, err) => {
      failures++;
      console.warn(`  ! ${name}: ${err.message}`);
    },
  });

  if (failures) throw new Error(`${failures} section(s) failed to apply`);

  fs.writeFileSync(HTML_PATH, root.toString(), 'utf8');
  console.log(`✓ Baked Sanity content into index.html (revision ${result._rev})`);
}

main().catch((err) => {
  console.warn(`! Skipped content bake: ${err.message}`);
  console.warn('  index.html left as committed; the deploy will use that copy.');
  process.exit(0);
});
