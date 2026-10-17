# MCC Website V3 — review tomorrow

## Current status — October 17, 2026

**Comprehensive review update (supersedes earlier timing clearance):** MCC confirms all selected photographs, Soccer/NextGen/Aaniin schedules and enquiry-only registration. MCC explicitly states Service Canada has NOT been notified about this website launch; NHSP communication timing remains NEEDS CONFIRMATION, not conclusively cleared. The new audit and PRODUCTION_LAUNCH_PLAN.md contain the full consolidated decisions. Local privacy/contact wording and canonical/sitemap corrections are complete; no deployment/push included.

NHSP update: MCC's approved, project-specific acknowledgement is implemented locally across Home, About, Our Impact and Seniors in Bloom. MCC confirms no explicit Government of Canada logo or $24,600 publication requirement. Section 19's 60-day initial announcement allowance and 20-calendar-day advance notification requirement for subsequent project communication activities are recorded in the current audit. MCC later clarified that Service Canada has not been notified; wording is resolved but communication timing remains unconfirmed. No deployment.

Protected-preview contact delivery testing is **COMPLETE**. The controlled submission passed Turnstile and Resend delivery verification; MCC confirmed receipt at info@markhamcc.ca, correct Reply-To, and a successful sent-and-received test reply. Preview deployment e628503e (mcc-website-v3, commit 4c0fef1) is successful and Access-protected; CONTACT_ENABLED=true in Preview only. This supersedes the historical disabled/unverified contact and undeployed-preview statements below. It does not establish production readiness or complete every live failure-mode test.

Photo-permission blocker RESOLVED: on October 17, MCC explicitly confirmed public-use permission for all currently selected website photographs, including Khurshid Chishti, children, seniors, volunteers and community participants. Keep all selected photographs. This supersedes permission-pending statements below for this selected set.

See LAUNCH_READINESS_AUDIT_2026-10-17.md for the current audit, remaining blockers, verification limits and recommended next action. Public launch remains on hold for funding acknowledgement review, program sign-off, contact-processing wording and separately approved production configuration. No public launch, domain, DNS or Microsoft 365 changes were made.

Scope: protected preview on `mcc-website-v3`. This is not public launch approval.

## Completed

- Shared internal-page typography, compact spacing, cards, full-frame photographs and responsive layouts across 29 generated pages. Homepage identity, palette, navigation and footer credit retained.
- About P2.1–P2.7: preserved the 2024 founding story and the founding team's combined experience; improved story layout and partner recognition. The supplied 2024 photo is preview-only, excluded from public-mode page output pending permission confirmation.
- Soccer P3.5/P3.15: permanent MCC & ISM program presentation, teamwork/fitness/sportsmanship, verified Saturday age-group timetable and venue.
- NextGen P3.12/P3.22: permanent MCC & ISM presentation, supplied Fall 2026 dates, schedule, venue, age eligibility and activity themes. No tutoring promise, invented fees or availability.
- Verified schedules stored in `data/programs.json` and reused on program and Events pages. Unknown availability remains unknown; no status was changed to Open.
- Contact P9.1–P9.3: compact contact/sidebar and form layout; all fields and security retained. Volunteer, partnership, sponsorship and events enquiry prefills added. Partnerships is a fixed, server-allowlisted subject. No provider configuration changed.
- Get Involved P8.1–P8.4: four clear volunteer, partnership, sponsorship and donation opportunities. Volunteer uses a contact fallback; donation destination is unchanged.
- Aaniin P6.1/P6.2: Monday schedule, Youth Room, partnership period and varied activity categories. One Ask About Joining CTA uses the existing program enquiry flow.
- Ramadan P5.1/P5.2/P5.7/P5.8: signature-program story, evidence-based 2024–2026 timeline, inactive 2027 feature and support enquiries. No dedicated campaign URLs invented. Historical 2024 and 2025 pages now contain useful verified summaries.
- Events P4.1–P4.4: upcoming planning information, weekly/seasonal listings, celebration summaries and historical links. Program Information links lead to meaningful Soccer, NextGen and Aaniin pages rather than looping to the same Events section.
- Homepage P1.10 and About P2.6: text-only recognition distinguishes City/ISM collaboration, NHSP project support and the independent Pet Plant initiative. Aaniin is described as a City facility, not a funder. Khurshid Chishti's role is retained.

## Pages changed

All 29 pages load the shared internal-page refinement stylesheet. Content/layout improvements: Home, About, Soccer, NextGen, Contact, Get Involved, Aaniin, Events, Ramadan overview, Ramadan 2024 and Ramadan 2025. Programs and other program detail pages retain existing factual content. Pet Plant content, gallery, logo and image references are unchanged.

## Preview and screenshots

Build: `SITE_MODE=preview CONTACT_ENABLED=false node scripts/build.mjs` (set variables using your shell's syntax). Preview: `node scripts/preview.mjs`; open `http://127.0.0.1:4173/`.

Local screenshots are excluded from Git: `review/prelaunch-{index,about,soccer,nextgen,contact,get-involved,aaniin,ramadan,events}-{1440,390}.png`. Regenerate with `node scripts/check-prelaunch-improvements.cjs` using the project's Playwright runtime. Review Contact on mobile, the About story, Soccer age groups, NextGen dates and Events buttons first.

## Pending verification — MCC decisions

| Item | Required action |
|---|---|
| Volunteer application | Supply the verified Microsoft Forms URL if an application form should replace the contact fallback. No verified URL was located in project source/documents. |
| Ramadan/Iftar campaigns | Supply dedicated verified Zeffy campaign URLs and intended purposes. Current buttons are support enquiries, not earmarked payment links. General donations remain unchanged. |
| Funding acknowledgement | Check the NHSP agreement for required wording/assets and any publication obligations. Existing restrained acknowledgement retained; no grant amount added. |
| Canada Day funders | Supply verified names, funding relationship, acknowledgement wording and authorized logos. None invented. |
| MWC | Confirm full identity and relationship before adding a partner listing. The archived Family Charity Challenge mentions Muslim Welfare Canada; this alone does not establish MWC's identity or partner status. |
| Partner logos | Official authorized ISM, City and funding logos were not located. Text-only recognition is used. |
| Photo permissions | Confirm public use of the About 2024 photograph and review the asset guide's outstanding publication-permission notes, especially for children. Existing Pet Plant approval remains recorded. |
| Soccer | Confirm current season, start/end dates, fees, available spaces and participation arrangements. No coach qualifications or certifications claimed. |
| NextGen | Review the supplied October 17–December 5, 2026 schedule, age eligibility and venue before launch; confirm fee/space availability separately. |
| Aaniin | Confirm participation arrangements and continuation after December 14, 2026. Activities vary; the page does not promise each activity weekly. |
| Community celebrations | Supply dates, venues, evidence and details for Family Picnics, Mango Festival, Cultural Celebrations and volunteer recognition. Current summaries do not announce new events or claim verified Mango Festival history. |
| Historical evidence | Supply further 2024–2026 event records/results, participant counts and volunteer figures if desired. Photographs do not establish counts or prove all advertised activities happened. |

## Testing and safeguards

- 29 HTML pages; internal link/asset, metadata, heading/ID, canonical and sitemap checks.
- Existing unit suites cover registration rules, contact validation/security, RC2027, launch files and preview safeguards.
- Browser regression coverage includes all 29 pages at 320, 390 and 1440 pixels, plus a tablet sweep at 768; homepage also checked at 700 and 1024.
- Contact tests use simulated Turnstile/Resend responses: no real message sent. New subject-prefill tests cover volunteering, partnership, sponsorship and events.
- Existing 62 donation links retained (61 Donate-labelled buttons plus Support Our Community); 24 program enquiry buttons retained, including Aaniin's Ask About Joining.
- Preview robots/noindex and security headers retained. `CONTACT_ENABLED=false` and `SITE_MODE=preview` used locally; Cloudflare environment settings were not changed.
- Wrangler 3.114.17 compilation is checked locally without deployment. Browser and build reports/screenshots remain local under ignored `review/` and `.cache/`.

## Not started / remaining launch blockers

- Real contact delivery setup and end-to-end testing against the MCC mailbox: remains disabled. Provider sender approval, Turnstile keys/allowed hostname, Resend permissions and delivery/error verification still needed; see CONTACT_FORM_SETUP.md.
- Independent verification of protected-preview access settings and deployed build result after this push. No Cloudflare account settings are modified here.
- Public launch approval, public indexing switch and production routing/canonical behavior verification. No DNS, Microsoft 365, Resend settings or main-branch changes.
- New dedicated event pages without enough verified evidence; missing dates/fees/figures are deliberately not invented.

## Recommended next actions

1. Review the protected preview and supplied program facts, plus the desktop/mobile screenshots.
2. Resolve publication permissions and funding acknowledgement requirements; confirm logos and partner identities.
3. Supply missing volunteer/campaign URLs and current participation details where available.
4. Configure and verify real contact delivery separately before enabling the form.
5. Confirm the new Cloudflare preview succeeded and remains access-protected. Approve public launch only after blockers and production URL/indexing checks are resolved.

Recommendation: continue protected preview review; do not claim public launch readiness yet.
