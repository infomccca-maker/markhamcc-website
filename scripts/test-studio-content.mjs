// Tests for the Studio content renderer. Synthetic fixtures only. Run: node scripts/test-studio-content.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {loadStudioContent, studioPages, eventsSection, fundersSection, applySeo, fileForPath, mediaName, eventCard} from './studio-content.mjs';

const fixtures = path.resolve('scripts/fixtures/studio');
const withRoot = (fn) => { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-')); fs.cpSync(fixtures, path.join(root, 'content/studio'), {recursive: true}); try { return fn(root); } finally { fs.rmSync(root, {recursive: true, force: true}); } };
const now = new Date('2026-11-24T15:00:00Z');
const mk = (root, rel, o) => { fs.mkdirSync(path.dirname(path.join(root, 'content/studio', rel)), {recursive: true}); fs.writeFileSync(path.join(root, 'content/studio', rel), JSON.stringify(o)); };
const errorsFor = (root) => loadStudioContent({root, now}).errors.join('\n');
const section = (id, title, body) => `<section id="${id}"><h2>${title}</h2>${body}</section>`;
const intro = (e, h, p) => `<h1>${h}</h1><p>${p}</p>`;

// 1. valid synthetic content loads and renders
withRoot((root) => {
  const c = loadStudioContent({root, now});
  assert.deepEqual(c.errors, []);
  assert.equal(c.news.length, 1); assert.equal(c.events.length, 2); assert.equal(c.gallery.length, 1); assert.equal(c.funders.length, 2); assert.equal(c.seo.length, 1); assert.equal(c.pages.length, 1);
  const pages = studioPages(c, {intro, section, now}).map((p) => p.file).sort();
  assert.deepEqual(pages, ['gallery.html', 'info-synthetic-info.html', 'news-synthetic-garden-update.html', 'news.html']);
  const all = studioPages(c, {intro, section, now}).map((p) => p.body).join('');
  assert.ok(all.includes('Second paragraph &amp; an ampersand.'), 'text is escaped');
  assert.ok(all.includes('alt="A single synthetic test pixel"'));
  assert.ok(all.includes('src="/assets/studio/synthetic-photo.png"'));
  // events: upcoming listed with registration; past event labelled and without a register button
  const ev = eventsSection(c, section, now);
  assert.match(ev, /Synthetic workshop/); assert.match(ev, /Past event/);
  assert.ok(ev.includes('This synthetic event is supported by Synthetic Funder.'), 'event acknowledgement drawn verbatim');
  assert.ok(all.includes('This synthetic event is supported by Synthetic Funder.'), 'news acknowledgement drawn verbatim');
  assert.ok(ev.includes('https://example.org/register')); assert.ok(!ev.includes('https://example.org/old'), 'no registration link on past events');
  assert.match(ev, /application\/ld\+json/);
  // funders: only in-force record, exact wording
  const fs2 = fundersSection(c, section);
  assert.ok(fs2.includes('This synthetic project is supported by Synthetic Funder.')); assert.ok(!fs2.includes('Expired'));
  // SEO
  const seo = c.seo[0]; assert.equal(fileForPath(seo.path, ['about.html', 'index.html']), 'about.html');
  const html = applySeo('<head><title>About | X</title><meta name="description" content="old"><meta property="og:title" content="old"><meta property="og:description" content="old"><link rel="canonical" href="https://markhamcc.ca/about.html"><meta property="og:url" content="https://markhamcc.ca/about.html"></head>', seo);
  assert.match(html, /<title>Synthetic SEO title<\/title>/); assert.match(html, /og:image" content="https:\/\/markhamcc\.ca\/assets\/studio\/synthetic-photo\.png"/);
  assert.ok(html.includes('rel="canonical" href="https://markhamcc.ca/about"'));
});

// 2. safety rejections (each must produce a build error)
const bad = [
  ['news/x-future.json', {_kind: 'news', title: 'Future', date: '2026-12-25', summary: 's', body: ['p']}, /future/],
  ['news/x-html.json', {_kind: 'news', title: '<b>x</b>', date: '2026-11-01', summary: 's', body: ['p']}, /title required/],
  ['news/x-link.json', {_kind: 'news', title: 'T', date: '2026-11-01', summary: 's', body: ['p'], link: 'http://insecure.example'}, /https/],
  ['events/x-unconfirmed.json', {_kind: 'event', title: 'T', starts_at: '2027-01-01T10:00:00Z', timezone: 'America/Toronto', status: 'tentative'}, /confirmed/],
  ['events/x-tz.json', {_kind: 'event', title: 'T', starts_at: '2027-01-01T10:00:00Z', timezone: 'UTC'}, /timezone/],
  ['gallery/x-noalt.json', {_kind: 'gallery', title: 'G', items: [{src: 'media/synthetic-photo.png', width: 1, height: 1, caption: 'c', alt: ''}]}, /alt text/],
  ['gallery/x-private.json', {_kind: 'gallery', title: 'G', items: [{src: 'https://studio.example/v1/assets/abc.png', width: 1, height: 1, caption: 'c', alt: 'a'}]}, /committed under/],
  ['gallery/x-traversal.json', {_kind: 'gallery', title: 'G', items: [{src: 'media/../../secret.png', width: 1, height: 1, caption: 'c', alt: 'a'}]}, /committed under/],
  ['funders/x-status.json', {_kind: 'funder', organisation: 'F', wording: 'w', status: 'applied'}, /status/],
  ['funders/x-nowording.json', {_kind: 'funder', organisation: 'F', wording: ''}, /wording/],
  ['seo/x-canon.json', {_kind: 'seo', path: '/about', title: 'T', description: 'd'.repeat(60), canonical: 'https://evil.example/about'}, /canonical/],
  ['news/x-ack.json', {_kind: 'news', title: 'T', date: '2026-11-01', summary: 's', body: ['p'], acknowledgements: [{organisation: 'F', wording: '<b>x</b>'}]}, /acknowledgements/],
  ['pages/about.json', {_kind: 'page', title: 'T', sections: [{heading: 'h', paragraphs: ['p']}]}, /collides/],
];
for (const [rel, body, re] of bad) withRoot((root) => { mk(root, rel, {_source: 's', ...body}); assert.match(errorsFor(root), re, rel); });

// 3. drafts / foreign kinds are skipped, never rendered
withRoot((root) => {
  mk(root, 'news/x-draft.json', {_kind: 'news', draft: true, title: 'Draft', date: '2026-11-01', summary: 's', body: ['p']});
  mk(root, 'news/x-wrongkind.json', {_kind: 'event', title: 'x'});
  const c = loadStudioContent({root, now}); assert.equal(c.news.length, 1); assert.equal(c.skipped.length, 2);
});
// 4. empty / missing folder renders nothing
const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-empty-'));
const ce = loadStudioContent({root: empty, now});
assert.deepEqual([studioPages(ce, {intro, section}).length, eventsSection(ce, section), fundersSection(ce, section)], [0, '', '']);
assert.equal(mediaName('media/nope.png', empty), null);

// 5. end-to-end build of a copy of this site with the synthetic content: passes the site check; invalid content fails the build
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-site-'));
for (const e of fs.readdirSync('.')) if (!['.git', 'dist', 'review', 'archive', 'node_modules', 'content'].includes(e)) fs.cpSync(e, path.join(tmp, e), {recursive: true});
fs.cpSync(fixtures, path.join(tmp, 'content/studio'), {recursive: true});
const run = (script) => execFileSync('node', [script], {cwd: tmp, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
run('scripts/build.mjs'); assert.match(run('scripts/check.mjs'), /PASS/);
const d = (f) => fs.readFileSync(path.join(tmp, 'dist', f), 'utf8');
assert.match(d('news.html'), /Synthetic garden update/); assert.match(d('index.html'), /href="news\.html"/);
assert.match(d('events.html'), /Synthetic workshop/); assert.match(d('impact.html'), /supported by Synthetic Funder/); assert.ok(!d('impact.html').includes('Expired acknowledgement'));
assert.match(d('about.html'), /<title>Synthetic SEO title<\/title>/);
assert.ok(fs.existsSync(path.join(tmp, 'dist/assets/studio/synthetic-photo.png')) && fs.existsSync(path.join(tmp, 'dist/assets/studio.css')));
assert.match(d('sitemap.xml'), /markhamcc\.ca\/news-synthetic-garden-update/);
mk(tmp, 'news/zz-broken.json', {_kind: 'news', title: 'T', date: '2099-01-01', summary: 's', body: ['p']});
assert.throws(() => run('scripts/build.mjs'), /Studio content errors/);
fs.rmSync(tmp, {recursive: true, force: true});
console.log('PASS: Studio content renderer (valid render, 13 rejection cases, drafts skipped, empty site unchanged, end-to-end build + site check).');
