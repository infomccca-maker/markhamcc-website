# MCC Website V3 — local review draft

Static HTML, shared CSS and minimal JavaScript. Existing GitHub repository: infomccca-maker/markhamcc-website. Development branch: mcc-website-v3.

## Preview

Use Node.js (already available in this workspace):

```text
node scripts/build.mjs
node scripts/check.mjs
node scripts/preview.mjs
```

Open http://127.0.0.1:4173. Stop the server with Ctrl+C. No npm installation is required. The preview server listens on your computer only.

## Layout

- scripts/build.mjs: editable page content and reusable page/section helpers.
- data/programs.json: central program/event names, descriptions, statuses, verified session facts, registration providers/URLs and optional approved photographs.
- scripts/program-management.mjs: shared validation and registration display rules. Run node scripts/test-program-management.mjs for the local status demonstration.
- src/site.css and src/site.js: shared design and mobile navigation.
- dist/: 29 generated HTML pages plus shared assets, 404 page and preview/public robots rules.
- archive/original/: preserved original website, README and logo; excluded from deployment output.
- Root legacy HTML files remain as received; review the new site through dist or the local preview.
- WEBSITE_REVIEW_CHECKLIST.md: numbered section review, regenerated with the site.
- MISSING_ASSETS.md: photos, official logo and links still needed.
- MAINTENANCE.md: administrator update workflow.

Home and About preserve the supplied approved substance. The three policies use MCC-approved October 12, 2026 content; remaining unverified program/archive facts are flagged in the audit. Supplied real photographs follow approved-assets/ASSET_PLACEMENT_GUIDE.md; unmapped missing photos use clean text-only layouts. The official MCC PNG is used in the header and footer, with its white background preserved. Original TIFF and photo files remain unchanged.

Photo mapping is maintained in scripts/photo-map.mjs. Prepared responsive images are in src/images/, copied into dist/assets/images/ on build. Normal builds require only Node.js. Preparing new responsive image variants with scripts/prepare-images.cjs requires the sharp package; do this with technical assistance. Browser QA screenshots are in review/ and are not part of the deployment output.

## Review before publication

Review all section IDs, layouts and drafted wording. Provide approved assets and exact Forms/Zeffy/social URLs. Confirm events and sessions, approve photograph publication permissions. Test phone layouts and keyboard use. Add final canonical/share image metadata and enable public indexing only after approval.

Cloudflare Pages can later build with `node scripts/build.mjs`, using `dist` as the output directory. No Cloudflare setup or deployment has been performed. Do not use the repository root as the deployment directory because it contains source and preserved originals. Git integration may deploy pushes; configure it only with approval.

The pre-launch preview source is maintained on mcc-website-v3. Publishing, deployment, DNS changes and Microsoft 365 changes require separate approval.

## Final pre-launch update

Programs without verified external registration now offer Contact Us to Register; enquiries require MCC confirmation. RC2027 remains Coming Soon and completed/closed records remain inactive. Policies are maintained in src/policies.json. Preview builds are the default; SITE_MODE=public prepares public robots rules after approval. See MAINTENANCE.md for Cloudflare settings and Access requirements.

Run node scripts/test-program-management.mjs, node scripts/test-rc2027.mjs and node scripts/test-launch-files.mjs for data/build-rule tests. Browser checks use the installed Playwright/Edge runtime, including scripts/check-prelaunch.cjs. No npm lint task is configured; JavaScript syntax can be checked using node --check.

## Website contact form

The Contact page now has an on-site message form. See CONTACT_FORM_SETUP.md for the proposed Pages Functions/Turnstile/Resend integration and required approvals. It remains disabled without server configuration; local preview never sends mail. The 24 Contact Us to Register links carry only a public program ID and prefill an editable enquiry. RC2027 remains Coming Soon. No real mailbox delivery has been verified. The static build still needs no package install, but future deployment must also compile the root functions/ directory.

## Repository contents

Prepared web assets in src/images/ are versioned. Original photo masters, generated dist/, screenshots and local editorial reports remain on the administrator’s computer and are ignored by Git. The homepage regression fixture is versioned in scripts/fixtures/. Run the build before tests to create the ignored review output directory. Optional image preparation requires the original local asset pack and sharp; a normal build needs neither.

The Contact Function entry is functions/api/contact.js, importing lib/contact-service.mjs and data/programs.json. Include the repository root in a future Git-integrated Pages build; static output is dist. Keep SITE_MODE=preview and CONTACT_ENABLED=false for the initial protected preview. No deployment is part of committing this source.
