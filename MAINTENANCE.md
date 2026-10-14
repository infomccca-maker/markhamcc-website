# MCC administrator maintenance guide

## Ramadan Connect 2027: update the page without rebuilding its design

Permanent page: `/ramadan-connect/2027/`. The older `/ramadan-2027.html` still works. Keep both addresses. The RC 2027 configuration is **data/programs.json**, inside the record with `"id": "ramadan-2027"`, under **eventDetails**. It uses the existing program registration rules. Do not edit generated HTML.

Only add facts confirmed by MCC. Empty arrays (`[]`) are intentional: no dates, activities, sponsors, fees or capacities are invented. Each item has `approved: false` until MCC approves displaying it. That flag controls this local design; photo publication consent is still required before publishing.

| Update | What to edit inside eventDetails |
|---|---|
| Public announcement | Add to `announcements`: `text` and `approved`. Only approved text is shown. |
| Confirmed date/venue | Add to `schedule`: `title`, `date` in YYYY-MM-DD, verified `time` (or empty string), `location`, and `approved`. Dates appear only from approved entries. |
| Activity | Add an object to `activities` using the fields below. Choose its section; do not advertise draft categories. |
| Open/close registration | Set that activity's `status`. Open also requires a real provider-matched response/ticketing URL, `approved: true` and `registrationApproved: true`. Closed, Completed, blank links or unapproved registrations never show Register Now. |
| Sponsor/partner | Add to `sponsors`: approved `name`, `role`, `logo` (existing local path such as assets/images/filename.png, or null), and `approved`. Do not copy sponsors from prior years. Ask for help preparing a new official logo. |
| Photo | Add to `photos`: existing prepared `asset` filename stem, `alt`, verified `caption`, `section` (RC27.1, RC27.5 or highlights), and `approved`. Always label historical photos with their actual year; keep image consent records. |
| Video | Add to `videos`: verified `title`, official HTTPS YouTube/Vimeo `url`, and `approved`. It appears as a video link; no autoplay or third-party player loads. |
| Highlights, results or impact | Add approved `title`, `text` and `approved` to `highlights`, `results` or `impact`. Do not invent attendance, awards or outcomes. |

An activity requires these fields (start with an empty record and fill it only after confirmation):

```json
{
  "id": "unique-activity-id",
  "name": "",
  "description": "",
  "section": "RC27.3",
  "status": "Coming Soon",
  "startDate": null,
  "endDate": null,
  "ageEligibility": null,
  "registrationFee": null,
  "capacity": null,
  "registrationProvider": null,
  "registrationUrl": "",
  "approved": false,
  "registrationApproved": false
}
```

This is an editing template, not a real activity or registration URL; enter its approved name/description before building. Choose RC27.3 (activities), RC27.4 (rounds/finale), RC27.5 (bazaar), RC27.6 (gatherings), or RC27.8 (volunteering). Keep unconfirmed fields null. Do not put internal potential registration categories into approved public entries.

For registration, use `Microsoft Forms` or `Zeffy` exactly. Paste the actual participant response link or paid-event ticketing link; the general MCC donation URL is rejected. Link validation checks format/provider, not ownership, remaining spaces or whether responses are enabled. Verify the destination before approving it.

To archive RC 2027 after completion, change the parent record's `status` to `Completed`, retain `detailPageUrl: "/ramadan-connect/2027/"`, and add approved photos, videos, highlights/results/impact. The page changes to Past Event and blocks all registrations, even if old activity URLs remain. Parent Closed also blocks activity registration. Approved historical content and schedules remain visible. Update the draft `pastIntroduction` as needed and review the whole page.

After each update: run `node scripts/build.mjs`, `node scripts/check.mjs`, and `node scripts/test-rc2027.mjs`. Preview http://127.0.0.1:4173/ramadan-connect/2027/ and review RC2027_REVIEW_CHECKLIST.md. The public sharing controls are prepared for https://markhamcc.ca/ramadan-connect/2027/; that address will become available only after an approved publication. These local steps do not publish, send messages, change DNS or alter Microsoft 365.

The site uses plain HTML output, shared CSS and minimal JavaScript. No package installation or paid dependency is needed. Program/event records are in **data/programs.json**. Other page content is in scripts/build.mjs; styles in src/site.css; mobile navigation in src/site.js. All output is in dist/. Rebuild after source edits; direct dist edits would be overwritten.

## Open registration in five steps

1. Open **data/programs.json** and find the program by its `name`. Keep its `id`, page URL and section references unchanged.
2. Confirm with MCC that registration is open. Change `"status": "Coming Soon"` to `"status": "Open"`. For currently unverified programs, change `"status": null` only after confirmation.
3. Paste the real participant response link into `registrationUrl` and set `registrationProvider` to exactly `Microsoft Forms` or `Zeffy`. Use the Forms response link, not its editing link; use a Zeffy program/event ticketing link, never the general donation link. Leave the URL empty until it is supplied. Without it, eligible programs offer Contact Us to Register; MCC must confirm availability.
4. Save, then run `node scripts/build.mjs` and `node scripts/check.mjs`. If a validation error names a record, correct that record and rebuild. These commands do not publish anything.
5. Open http://127.0.0.1:4173 (start `node scripts/preview.mjs` if needed). Check the card, program page and relevant event listing. Only then request the separate approval needed for publication.

**Example without a real registration URL:** changing an in-memory example from Coming Soon to Open while `registrationUrl` remains `""` displays “Registration information will be available once confirmed.” It does **not** display Register Now; eligible programs show Contact Us to Register with an availability disclaimer. Run `node scripts/test-program-management.mjs` to see this safe demonstration; it does not change the catalogue or publish. The result is saved in review/registration-status-demo.json.

## What the fields mean

| Field | What to enter |
|---|---|
| name, category, description | Approved program/event wording. Preserve approved text unless a change is authorized. |
| status | Open, Coming Soon, Closed or Completed. Use `null` when MCC has not confirmed availability; it means unknown, not coming soon. |
| startDate, endDate | Verified session dates as YYYY-MM-DD, otherwise `null`. Do not enter project funding dates as session dates. |
| ageEligibility | Verified age wording in quotes, otherwise `null`. |
| registrationFee | Verified participant fee wording in quotes (including “Free” only if verified), otherwise `null`. |
| registrationUrl | Exact verified public Forms response or Zeffy ticketing URL, in quotes. Empty `""` means missing. |
| registrationProvider | Microsoft Forms, Zeffy, or `null` when no link is known. Must match the URL. |
| approvedPhotograph | `null` keeps existing approved placement, or a clean text-only layout when no photograph is mapped. To add a prepared approved image, use an object with `asset` (prepared filename stem) and `alt` (description); ask for help preparing a new image. This field controls catalogue cards and program detail imagery; homepage photography remains mapped in photo-map.mjs. |
| detailPageUrl | Existing local page (for example soccer.html); event records may point to a section. |

Keep JSON commas and quotation marks intact. Unknown facts should remain `null`; an empty date or a guessed fee is not a substitute. Build validation rejects malformed dates, duplicate IDs, unsupported providers and wrong or donation URLs. Technical URL validation does not prove that a form belongs to MCC or is accepting responses: check the real destination as a visitor before opening registration.

Coming Soon programs retain their status message and offer a contact enquiry. Ramadan Connect is excluded from contact registration. Closed shows registration closed. Completed shows registration ended and retains information/highlight links. Open with no URL stays inactive. An Open record does not automatically close on its end date; review it and set Closed or Completed when confirmed. Upcoming/open Community Events move into the Upcoming Events section; unknown/closed/completed records stay in their configured historical/information section.

The ten existing programs, Ramadan year records, Aaniin and four community event categories are centralized. Broad themes such as healthy aging are not invented as separate enrollments. Volunteer enquiry buttons now link to Contact; an approved volunteer Forms link can be added later. To add a new program page or change section references, ask for a guided update; editing an existing program's status/URL requires only this JSON file.

For guided updates, provide the page/section ID from WEBSITE_REVIEW_CHECKLIST.md, revised text and any verified links or approved photographs. A helper can make the source change, rebuild and show the local preview. Independent editing of the generator requires care; this is not a visual CMS.

Events: supply title, date, time, venue, status and verified registration/payment URLs. Never infer a session is open from a project funding period. Move completed events into verified historical records.

Programs: confirm eligibility, session dates and whether sessions are open, upcoming or completed. Update the central data record once; shared registration output updates at build time. Keep historical records and original materials.

Photographs: use genuine approved MCC assets. Retain originals outside deployment output. Obtain publication approval for identifiable children; optimize web copies and provide meaningful descriptions. The approved mapping is in scripts/photo-map.mjs. Full-frame responsive images prevent additional face cropping. Original photos and the official TIFF/PNG remain in approved-assets; responsive derivatives are in src/images. Additional photos need placement approval before adding them to text-only sections.

Links: copy exact Microsoft Forms response links and Zeffy campaign URLs. Test as a visitor on desktop and mobile. Do not embed credentials. Link buttons are the simplest initial approach; embeds are optional and require their own accessibility checks.

Run `node scripts/build.mjs`, then `node scripts/check.mjs`. Start preview with `node scripts/preview.mjs` and visit http://127.0.0.1:4173. Review every page, keyboard navigation and mobile layout.

Privacy, Terms & Conditions and Accessibility content was supplied and approved by MCC on October 12, 2026. Edit src/policies.json to maintain this content. Do not claim tax receipt eligibility. Verify all facts and permissions in the review checklist.

Nothing is committed, pushed or deployed automatically by these scripts. Obtain explicit approval for those actions. Do not change DNS, Cloudflare configuration or Microsoft 365 settings.

## Preview and public launch settings

Default builds use SITE_MODE=preview: robots.txt disallows crawling and _headers sends noindex/nofollow. This is not access control. A genuinely private Cloudflare preview needs an Access policy protecting every shared preview URL. Do not deploy until separately approved.

For an approved public launch, set SITE_MODE=public in the production build environment. This generates Allow: / and the sitemap declaration; preview builds must retain SITE_MODE=preview. The sitemap excludes 404 and the duplicate RC2027 legacy alias. The _headers file contains static security headers; external provider links remain ordinary new-tab navigation, with no embedded form or payment collection.

Cloudflare build: node scripts/build.mjs; output: dist; framework: None; root: repository root; tested Node: 24.19.0. Keep main as the recommended production branch and mcc-website-v3 as a preview branch, subject to approval. These are proposed settings, not inspected or changed Cloudflare configuration. All required source and prepared images must eventually be committed/pushed only with approval.

## Website contact form

The Contact page now has an on-site message form. See CONTACT_FORM_SETUP.md for the proposed Pages Functions/Turnstile/Resend integration and required approvals. It remains disabled without server configuration; local preview never sends mail. The 24 Contact Us to Register links carry only a public program ID and prefill an editable enquiry. RC2027 remains Coming Soon. No real mailbox delivery has been verified. The static build still needs no package install, but future deployment must also compile the root functions/ directory.
