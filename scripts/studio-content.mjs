// Renderer for owner-reviewed content proposed by MCC Marketing Studio (content/studio/<kind>/<slug>.json).
// Contract: the Studio repository's docs/WEBSITE_CONTENT_SCHEMA.md. Everything here is build-time only: no network,
// no runtime scripts, no automatic publication. A merged file becomes public only when the owner merges the PR.
//
// Safety rules enforced at build time (a violation FAILS THE BUILD instead of silently publishing something wrong):
//  - strings are plain text (HTML rejected) and are always HTML-escaped on output
//  - links are https only; images must be committed under content/studio/media/ (never remote or private paths)
//  - gallery photos need alt text; news cannot be future-dated; events need a start time and a valid timezone
//  - funder acknowledgements render ONLY the record's exact wording and only inside their effective dates
//  - files with "draft": true, a non-matching _kind, or a status other than confirmed/active are skipped (and reported)
import fs from 'node:fs';
import path from 'node:path';
import {escapeHtml as esc} from './program-management.mjs';

export const STUDIO_DIR = 'content/studio';
export const MEDIA_DIR = `${STUDIO_DIR}/media`;
export const SITE = 'https://markhamcc.ca';
const KINDS = {news: 'news', events: 'event', gallery: 'gallery', funders: 'funder', seo: 'seo', pages: 'page'};
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const IMG = /\.(webp|jpe?g|png)$/i;
const RESERVED_PAGES = new Set(['index', 'about', 'programs', 'events', 'news', 'gallery', 'contact', 'donate', 'impact', 'ramadan', 'aaniin', 'get-involved']);

export const torontoDate = (d = new Date()) => new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit'}).format(d);
const fmtDate = (iso) => new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Toronto', dateStyle: 'long'}).format(new Date(iso));
const fmtTime = (iso) => new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Toronto', hour: 'numeric', minute: '2-digit'}).format(new Date(iso));

const isText = (v, max = 2000) => typeof v === 'string' && v.trim().length > 0 && v.length <= max && !/[<>]/.test(v);
const optText = (v, max) => v === null || v === undefined || isText(v, max);
const isHttps = (v) => { try { const u = new URL(v); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } };
const isIsoDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
const isInstant = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v) && !Number.isNaN(Date.parse(v));

/** Resolve a gallery/logo/og image reference to a committed media file name, or null. */
export function mediaName(src, root = process.cwd()) {
  if (typeof src !== 'string') return null;
  let name;
  if (isHttps(src)) name = path.posix.basename(new URL(src).pathname); // Studio public derivative URL -> same file name must be committed
  else if (/^(\/?assets\/studio\/|media\/)[A-Za-z0-9._-]+$/.test(src)) name = path.posix.basename(src);
  else return null;
  if (!IMG.test(name) || !/^[A-Za-z0-9._-]+$/.test(name)) return null;
  return fs.existsSync(path.join(root, MEDIA_DIR, name)) ? name : null;
}
export const mediaUrl = (name) => `/assets/studio/${name}`;

export function loadStudioContent({root = process.cwd(), now = new Date(), siteFiles = []} = {}) {
  const today = torontoDate(now);
  const out = {news: [], events: [], gallery: [], funders: [], seo: [], pages: [], errors: [], skipped: [], media: new Set(), today};
  const err = (file, msg) => out.errors.push(`${file}: ${msg}`);
  for (const [dir, kind] of Object.entries(KINDS)) {
    const d = path.join(root, STUDIO_DIR, dir);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).sort()) {
      if (!f.endsWith('.json')) continue;
      const rel = `${STUDIO_DIR}/${dir}/${f}`, slug = f.slice(0, -5);
      let j;
      try { j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); } catch { err(rel, 'invalid JSON'); continue; }
      if (!j || typeof j !== 'object' || Array.isArray(j)) { err(rel, 'must be a JSON object'); continue; }
      if (j._kind !== kind) { out.skipped.push(`${rel}: _kind is not "${kind}" (ignored)`); continue; }
      if (j.draft === true) { out.skipped.push(`${rel}: marked draft (not rendered)`); continue; }
      if (!SLUG.test(slug)) { err(rel, 'file name must be a lowercase slug'); continue; }
      const item = {slug, rel, ...j};
      const before = out.errors.length;
      validators[kind](item, {today, err: (m) => err(rel, m), root, out, siteFiles});
      if (out.errors.length === before) { out[{news: 'news', event: 'events', gallery: 'gallery', funder: 'funders', seo: 'seo', page: 'pages'}[kind]].push(item); }
    }
  }
  out.news.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  out.events.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  return out;
}

/** Optional exact sponsor/grant acknowledgements carried by Studio content (verified by Studio recognition rules). */
function checkAcks(i, err) {
  if (i.acknowledgements == null) return;
  if (!Array.isArray(i.acknowledgements) || i.acknowledgements.length > 10 || !i.acknowledgements.every((a) => a && isText(a.organisation, 200) && isText(a.wording, 800))) err('acknowledgements must be a list of {organisation, wording} plain-text entries (max 10)');
}

const validators = {
  news(i, {today, err}) {
    if (!isText(i.title, 160)) err('title required (plain text)');
    if (!isIsoDate(i.date)) err('date must be YYYY-MM-DD');
    else if (i.date > today) err(`date ${i.date} is in the future; a news item cannot be published ahead of its date`);
    if (!isText(i.summary, 400)) err('summary required (plain text)');
    if (!Array.isArray(i.body) || !i.body.length || !i.body.every((p) => isText(p, 1500))) err('body must be a non-empty list of plain-text paragraphs');
    if (!optText(i.program, 60)) err('program must be plain text');
    if (i.link != null && !isHttps(i.link)) err('link must be https');
    checkAcks(i, err);
  },
  event(i, {err}) {
    if (!isText(i.title, 160)) err('title required');
    if (!isInstant(i.starts_at)) err('starts_at must be an ISO-8601 instant');
    if (i.ends_at != null && (!isInstant(i.ends_at) || Date.parse(i.ends_at) < Date.parse(i.starts_at))) err('ends_at must be an ISO-8601 instant after starts_at');
    if (i.timezone !== 'America/Toronto') err('timezone must be America/Toronto');
    if (i.status != null && i.status !== 'confirmed') err(`status must be "confirmed" (got "${i.status}"); unconfirmed events are never listed`);
    if (!optText(i.venue, 300) || !optText(i.summary, 600) || !optText(i.program, 60)) err('venue, summary and program must be plain text');
    if (i.registration_url != null && !isHttps(i.registration_url)) err('registration_url must be https');
    checkAcks(i, err);
  },
  gallery(i, {err, root, out}) {
    if (!isText(i.title, 160)) err('title required');
    if (!Array.isArray(i.items) || !i.items.length) return err('items required');
    i.items = i.items.map((it, n) => {
      const name = mediaName(it?.src, root);
      if (!name) err(`item ${n + 1}: image must be committed under ${MEDIA_DIR}/ (jpg, png or webp) and referenced by that file name`);
      if (!isText(it?.alt, 250)) err(`item ${n + 1}: alt text is required`);
      if (!optText(it?.caption, 300)) err(`item ${n + 1}: caption must be plain text`);
      if (!Number.isInteger(it?.width) || !Number.isInteger(it?.height) || it.width < 1 || it.height < 1) err(`item ${n + 1}: width and height are required whole numbers`);
      if (name) out.media.add(name);
      return {...it, name};
    });
  },
  funder(i, {today, err, root, out}) {
    if (!isText(i.organisation, 200)) err('organisation required');
    if (!isText(i.wording, 800)) err('wording (the exact required acknowledgement) is required');
    if (!optText(i.intro, 500) || !optText(i.kind, 40)) err('intro and kind must be plain text');
    if (i.status != null && i.status !== 'active') err('status must be "active"');
    for (const k of ['effective_from', 'effective_to']) if (i[k] != null && !isIsoDate(i[k])) err(`${k} must be YYYY-MM-DD or null`);
    if (i.effective_from && i.effective_to && i.effective_to < i.effective_from) err('effective_to is before effective_from');
    if (i.logo != null) { const n = mediaName(i.logo, root); if (!n) err('logo must be committed under content/studio/media/'); else { i.logoName = n; out.media.add(n); } }
    i.inForce = (!i.effective_from || today >= i.effective_from) && (!i.effective_to || today <= i.effective_to);
  },
  seo(i, {err, siteFiles, root}) {
    if (i.og_image != null) { i.ogName = mediaName(i.og_image, root); if (!i.ogName) err('og_image must be committed under content/studio/media/'); }
    if (typeof i.path !== 'string' || !/^\/[a-z0-9\-/]*$/.test(i.path)) return err('path must start with / and use lowercase letters, numbers and hyphens');
    if (!isText(i.title, 60)) err('title required (max 60 characters)');
    if (!isText(i.description, 160) || i.description.length < 50) err('description must be 50-160 characters');
    if (i.canonical !== `${SITE}${i.path}`) err(`canonical must be exactly ${SITE}${i.path}`);
    i.file = fileForPath(i.path, siteFiles);
    if (siteFiles.length && !i.file) err(`path ${i.path} matches no page on the website`);
  },
  page(i, {err}) {
    if (RESERVED_PAGES.has(i.slug)) err(`slug "${i.slug}" collides with an existing page`);
    if (!isText(i.title, 160)) err('title required');
    if (!Array.isArray(i.sections) || !i.sections.length) return err('sections required');
    for (const s of i.sections) if (!isText(s?.heading, 160) || !Array.isArray(s.paragraphs) || !s.paragraphs.length || !s.paragraphs.every((p) => isText(p, 1500))) err('every section needs a plain-text heading and paragraphs');
    checkAcks(i, err);
  },
};

/** '/about' -> 'about.html', '/' -> 'index.html', '/ramadan-connect/2027/' -> 'ramadan-connect/2027/index.html'. */
export function fileForPath(p, files) {
  const clean = p.replace(/\/+$/, '') || '/';
  const cands = clean === '/' ? ['index.html'] : [`${clean.slice(1)}.html`, `${clean.slice(1)}/index.html`];
  return cands.find((c) => files.includes(c)) ?? null;
}

// ------------------------------------------------------------------ rendering
const para = (ps) => ps.map((p) => `<p>${esc(p)}</p>`).join('');
const ldJson = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const acks = (list) => (list?.length ? `<div class="studio-acknowledgements">${list.map((a) => `<p class="studio-acknowledgement">${esc(a.wording)}</p>`).join('')}</div>` : '');
const ext = (url, text) => `<a class="button" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)}<span aria-hidden="true"> ↗</span></a>`;

export function newsArticle(n) {
  return `<article class="studio-article"><p class="studio-meta"><time datetime="${n.date}">${fmtDate(`${n.date}T12:00:00Z`)}</time>${n.program ? ` · ${esc(n.program)}` : ''}</p>${para(n.body)}${n.link ? `<p>${ext(n.link, 'Read more')}</p>` : ''}${acks(n.acknowledgements)}</article>`;
}
const newsCard = (n) => `<article class="card studio-card"><p class="studio-meta"><time datetime="${n.date}">${fmtDate(`${n.date}T12:00:00Z`)}</time></p><h3><a href="news-${n.slug}.html">${esc(n.title)}</a></h3><p>${esc(n.summary)}</p></article>`;

export function eventCard(e, past) {
  const when = `${fmtDate(e.starts_at)}, ${fmtTime(e.starts_at)}${e.ends_at ? `–${fmtTime(e.ends_at)}` : ''}`;
  return `<article class="event-entry studio-event"><h3>${esc(e.title)}</h3>${past ? '<p class="studio-badge">Past event</p>' : ''}<dl class="session-facts"><div><dt>When</dt><dd><time datetime="${esc(e.starts_at)}">${esc(when)}</time> (Toronto time)</dd></div>${e.venue ? `<div><dt>Where</dt><dd>${esc(e.venue)}</dd></div>` : ''}${e.program ? `<div><dt>Program</dt><dd>${esc(e.program)}</dd></div>` : ''}</dl>${e.summary ? `<p>${esc(e.summary)}</p>` : ''}${!past && e.registration_url ? `<p>${ext(e.registration_url, 'Register')}</p>` : ''}${acks(e.acknowledgements)}</article>`;
}
export const eventJsonLd = (e) => ldJson({'@context': 'https://schema.org', '@type': 'Event', name: e.title, startDate: e.starts_at, ...(e.ends_at ? {endDate: e.ends_at} : {}), eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', ...(e.venue ? {location: {'@type': 'Place', name: e.venue}} : {}), organizer: {'@type': 'Organization', name: 'Markham Community Connect', url: SITE}});

export function galleryFigures(g) {
  return `<div class="studio-gallery">${g.items.map((it) => `<figure><img src="${mediaUrl(it.name)}" width="${it.width}" height="${it.height}" alt="${esc(it.alt)}" loading="lazy" decoding="async">${it.caption ? `<figcaption>${esc(it.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`;
}
export function funderCards(list) {
  return `<div class="cards studio-funders">${list.map((f) => `<article class="card studio-funder">${f.logoName ? `<img class="studio-funder-logo" src="${mediaUrl(f.logoName)}" alt="${esc(f.organisation)} logo" loading="lazy">` : ''}<h3>${esc(f.organisation)}</h3>${f.intro ? `<p>${esc(f.intro)}</p>` : ''}<p class="studio-acknowledgement">${esc(f.wording)}</p></article>`).join('')}</div>`;
}

/** Section fragments for pages that already exist (events.html, impact.html). Empty string when there is nothing to show. */
export function eventsSection(c, section, now = new Date()) {
  if (!c.events.length) return '';
  const t = now.getTime();
  const isPast = (e) => Date.parse(e.ends_at ?? e.starts_at) < t;
  const up = c.events.filter((e) => !isPast(e)), past = c.events.filter(isPast).reverse().slice(0, 6);
  return section('S1.1', 'Confirmed events', (up.length ? `<div class="event-list">${up.map((e) => eventCard(e, false)).join('')}</div>` : '<p>No further confirmed events are scheduled right now.</p>') + (past.length ? `<h3>Recent events</h3><div class="event-list">${past.map((e) => eventCard(e, true)).join('')}</div>` : '') + up.map(eventJsonLd).join(''), {status: 'Studio content', decision: 'Owner-reviewed Studio pull request'});
}
export function fundersSection(c, section) {
  const live = c.funders.filter((f) => f.inForce);
  if (!live.length) return '';
  return section('S2.1', 'Our funders and supporters', `<p>MCC gratefully acknowledges the following funders and supporters.</p>${funderCards(live)}`, {status: 'Studio content', decision: 'Exact wording from the active recognition record'});
}

/** New pages: [{file,title,description,body}] */
export function studioPages(c, {intro, section, now = new Date()}) {
  const pages = [];
  const tr = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
  if (c.news.length) {
    pages.push({file: 'news.html', title: 'News & Announcements', description: 'News and community announcements from Markham Community Connect.', body: intro('NEWS', 'News & Announcements', 'Updates from Markham Community Connect.') + section('S3.1', 'Latest news', `<div class="cards studio-news">${c.news.map(newsCard).join('')}</div>`, {status: 'Studio content'})});
    for (const n of c.news) pages.push({file: `news-${n.slug}.html`, title: n.title, description: tr(n.summary, 160), body: intro('NEWS', esc(n.title), esc(n.summary)) + section('S3.2', 'Announcement', newsArticle(n) + '<p><a href="news.html">← All news</a></p>', {status: 'Studio content'})});
  }
  if (c.gallery.length) pages.push({file: 'gallery.html', title: 'Photo Gallery', description: 'Photographs from Markham Community Connect programs and events, shared with consent.', body: intro('GALLERY', 'Photo Gallery', 'Moments from MCC programs and events, shared with permission.') + c.gallery.map((g, n) => section(`S4.${n + 1}`, esc(g.title), galleryFigures(g), {status: 'Studio content'})).join('')});
  for (const p of c.pages) pages.push({file: `info-${p.slug}.html`, title: p.title, description: tr(p.sections[0].paragraphs[0], 160), body: intro('MARKHAM COMMUNITY CONNECT', esc(p.title), '') + p.sections.map((s, n) => section(`S5.${n + 1}`, esc(s.heading), para(s.paragraphs) + (n === p.sections.length - 1 ? acks(p.acknowledgements) : ''), {status: 'Studio content'})).join('')});
  return pages;
}

/** Apply an SEO record to the finished HTML of its page (title, description, canonical, share image). */
export function applySeo(html, rec) {
  const t = esc(rec.title), d = esc(rec.description);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(">)/, `$1${d}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(">)/, `$1${t}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(">)/, `$1${d}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(">)/g, `$1${esc(rec.canonical)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(">)/g, `$1${esc(rec.canonical)}$2`);
  return rec.ogName && !html.includes('property="og:image"') ? html.replace('</head>', `<meta property="og:image" content="${SITE}${mediaUrl(rec.ogName)}"></head>`) : html;
}

export function copyMedia(c, out, root = process.cwd()) {
  if (!c.media.size) return;
  fs.mkdirSync(path.join(out, 'assets/studio'), {recursive: true});
  for (const n of c.media) fs.copyFileSync(path.join(root, MEDIA_DIR, n), path.join(out, 'assets/studio', n));
}
export const STUDIO_CSS = `.studio-meta{font-size:14px;color:#70545a;margin:0 0 8px}.studio-card h3 a{text-decoration:none}.studio-card h3 a:hover,.studio-card h3 a:focus-visible{text-decoration:underline}.studio-article{max-width:850px}.studio-article p{font-size:18px}.studio-badge{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;background:#f1ebe6;color:#4a3a3d;padding:2px 8px;border-radius:3px;margin:6px 0 0}.studio-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;margin:24px 0}.studio-gallery figure{margin:0;background:white;border:1px solid #e4dcd7;border-radius:6px;overflow:hidden}.studio-gallery img{display:block;width:100%;height:auto}.studio-gallery figcaption{padding:12px 14px;font-size:14px;line-height:1.5}.studio-funder-logo{max-width:180px;max-height:80px;width:auto;height:auto;margin-bottom:14px}.studio-acknowledgement{font-weight:700}@media(max-width:700px){.studio-article p{font-size:17px}}`;
