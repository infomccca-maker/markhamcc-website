# content/studio — owner-reviewed content from MCC Marketing Studio

Files here are produced by MCC Marketing Studio and arrive **only through a draft pull request that the owner reviews and merges**. Nothing is published until that merge; reverting the PR is the rollback. The Studio cannot merge, and nothing in this folder is rendered unless it passes the build checks in `scripts/studio-content.mjs`.

| Folder | Becomes |
|---|---|
| `news/<slug>.json` | `news.html` (index) and `news-<slug>.html`; a **News** link appears in the navigation once one exists |
| `events/<slug>.json` | "Confirmed events" section on `events.html` (upcoming first, recent past labelled "Past event"; schema.org Event data) |
| `gallery/<slug>.json` | `gallery.html`, every photo with alt text |
| `funders/<slug>.json` | "Our funders and supporters" section on `impact.html` — the record's exact acknowledgement wording, only while inside its effective dates |
| `seo/<slug>.json` | Title, description, canonical and share image of the existing page at `path` |
| `pages/<slug>.json` | `info-<slug>.html` |
| `media/<file>` | Images referenced above (jpg, png, webp). **Add the consented public derivative here in the same PR**; remote or private image URLs are never rendered |

## Build rules (a violation fails the build)
Plain text only (HTML rejected, output always escaped) · https links only · news not dated in the future · events must be `confirmed`, in `America/Toronto` · gallery photos need alt text and a committed image · funder wording is shown verbatim, never an application, and expires on `effective_to` at the next build · canonical must equal `https://markhamcc.ca` + path · slugs cannot collide with an existing page · `"draft": true` or a non-matching `_kind` is skipped with a warning.

When this folder holds no content, `dist/` is byte-identical to the previous build (verified).

**Date-limited content** (past events, expired funders) changes on the next build only. Trigger a rebuild (a Cloudflare Pages deploy hook on a daily schedule is optional and needs owner approval) if timely expiry matters.

Test: `node scripts/test-studio-content.mjs` (synthetic fixtures in `scripts/fixtures/studio/`).
