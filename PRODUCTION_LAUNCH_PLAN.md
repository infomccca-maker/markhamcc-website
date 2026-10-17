# MCC V3 — production launch plan (prepared, NOT executed)

October 17, 2026. Working branch: mcc-website-v3. The user authorizes local preparation and a local commit, but a push that automatically deploys Preview, a main merge, production deployment/settings change, DNS/domain connection, public indexing activation and Microsoft 365 changes require separate approval.

## READY — reviewed source and protected testing

29 pages, approved photographs and Soccer/NextGen/Aaniin facts; enquiry-only registration; approved project-specific NHSP acknowledgement; contact-processing privacy text; consistent extensionless canonical/share/sitemap URLs. Existing .html links keep working via Pages defaults. No production redirects have been added or changed. Preview email/Reply-To round-trip is verified. Static site output is dist; Functions, catalogue and source stay at repository root for Cloudflare bundling. No credentials are committed.

## Current account / DNS snapshot (read-only)

- Cloudflare project markhamcc-website: build command `node scripts/build.mjs`, output `dist`, repository root; production branch `main`; automatic production deployments disabled. No custom domains attached.
- Production currently has only CONTACT_ENABLED=false, SITE_MODE=preview and NODE_VERSION=24.19.0. No Resend/Turnstile secrets are configured there. These are safe inactive starting values, not launch-ready settings.
- Preview builds all non-production branches on push. It retains SITE_MODE=preview, CONTACT_ENABLED=true, encrypted Resend/Turnstile secrets, and Access restriction. Do not broaden its allowlist or remove Access when configuring production.
- Authoritative nameservers: curitiba.ns.porkbun.com, fortaleza.ns.porkbun.com, maceio.ns.porkbun.com, salvador.ns.porkbun.com.
- Apex A answers: 207.207.210.229 and 207.207.210.107. www CNAME currently answers pixie.porkbun.com.
- Microsoft 365 MX: markhamcc-ca.mail.protection.outlook.com, priority 0. Apex SPF: `v=spf1 include:spf.protection.outlook.com -all`. autodiscover CNAME: autodiscover.outlook.com. Preserve Microsoft domain-verification TXT records as well.
- Queries for selector1/selector2._domainkey and _dmarc answered pixie.porkbun.com, as did a deliberately nonexistent hostname. These appear to be wildcard answers; they are NOT evidence of configured Microsoft DKIM or a valid DMARC policy. Public lookup is not a complete authoritative-zone export or a Microsoft 365 configuration audit. Do not silently add, change or proxy mail records.
- mail.markhamcc.ca is the previously verified Resend sending domain; preserve all of its existing sender-verification, DKIM, SPF/return-path records separately from the apex Microsoft 365 records. Mailbox receipt/reply works; no Microsoft 365 setting needs to change for this site release.

## NEEDS CONFIRMATION — grouped release decisions

1. **NHSP notice:** MCC's latest explicit statement is that Service Canada has not been notified of this launch. Retain the approved acknowledgement; no official Canada logo or funding amount is expressly required per MCC's agreement review. Obtain MCC/Service Canada communication clearance or complete the required notice and confirm the launch date, taking account of the reported 60-day allowance from signing and at least 20-calendar-day notice for subsequent project communications. The signing date and applicability/clearance are not independently verified. Do not send a notice without MCC's explicit instruction.
2. **Preview push:** approve pushing the tested local commit to mcc-website-v3, knowing it triggers an Access-protected Preview build with Preview contact sending enabled. No main merge or production release is included in this approval. Smoke-test the corrected copy, canonical URLs and contact configuration on the new Preview; no extra mail test without the chosen test scope.
3. **Domain route:** recommended full apex site is https://markhamcc.ca with www redirecting to apex, consistent with the prepared metadata. Cloudflare Pages' standard apex setup requires a Cloudflare DNS zone/nameserver transition. This is not a single safe CNAME edit at Porkbun. Alternative: retain Porkbun DNS, serve Pages at www via CNAME and use a supported HTTPS apex redirect; choose www as canonical and update/retest metadata before release. Confirm the route before any domain settings change.
4. **Production release scope:** approve the final commit/main merge, production settings/secrets setup, hostnames and DNS steps, intended public indexing, and one controlled production email/rollback validation. Secret creation/entry may require a user security handoff; never expose values in chat, screenshots or files. Approve whether public contact sending is enabled at launch or held disabled with phone/email alternatives.

## Exact safe execution sequence after the applicable approvals

1. Complete the NHSP release decision. Push only the approved mcc-website-v3 commit after Preview permission; verify build success, Access on the preview hostname, updated contact/privacy wording, extensionless canonicals, retained photographs and enquiry prefills.
2. Obtain a full registrar DNS-zone export and current DNSSEC/DS state before migration. Inventory ALL MX/TXT/CNAME/SRV and existing subdomains, including Microsoft verification, autodiscover, intended DKIM/DMARC, Resend mail-domain records and other services. Public queries are insufficient. Save exact old web records/nameservers and an approved rollback baseline. This is preparation, not permission to change Microsoft 365 or mail-authentication policy.
3. For the approved apex route, prepare the Cloudflare zone by copying all existing required records byte-for-byte, preserving TTLs/targets, with mail-related hostnames DNS-only. Compare the old/new zones before switching nameservers; coordinate existing DNSSEC safely if present. Never enable Cloudflare Email Routing or replace MX/SPF records. If choosing www-first, document and approve only the necessary www web CNAME/apex HTTPS forwarding changes and corresponding canonical update; keep nameservers/mail records intact.
4. Configure production-only build/runtime values (table below), initially CONTACT_ENABLED=false. Do not reuse a Preview value implicitly. Add exact public hostname(s) to the approved Turnstile production widget and server allowlist; keep Preview widget/Access behavior working. Use a valid server-only Resend key with send and retrieve-email capability; the current handler polls delivery status, so a send-only key is insufficient. Keep tracking configuration unchanged and do not buy an upgrade.
5. After separate release approval, merge the reviewed commit into main and deliberately start the production build. Keep automatic production deployments paused unless separately requested. Verify the compiled Function route /api/contact, static assets, 404/legacy RC2027 routes, headers and disabled contact API before enabling public sending. Production pages.dev is not protected merely because Preview Access exists; use an explicitly approved staging/protection arrangement if required before domain cutover. No unrestricted staging exposure should be assumed approved.
6. Attach the approved custom domain(s) in Pages, apply only the approved web/DNS/nameserver change after the record comparison, wait for active certificates, and verify apex/www HTTPS and redirects without a security-warning bypass. Preserve preview Access. Verify final canonical/share URLs, sitemap and robots on the public host; production SITE_MODE=public intentionally enables indexing and is part of the release approval, not local QA. Consider the production pages.dev indexing/redirect policy separately from protected Preview; do not blanket-redirect preview hostnames.
7. Verify public MX/SPF/autodiscover and the complete saved zone after any DNS transition, then make an approved Microsoft 365 inbound/outbound mailbox check without settings changes. Check actual website contact, donation/social destinations, mobile navigation and policy links. If public contact is approved, set production CONTACT_ENABLED=true, redeploy to apply it, complete Turnstile and submit one agreed non-sensitive test; confirm provider delivery, mailbox placement and Reply-To. Restore disabled contact state/redeploy if delivery fails, preserving phone/email alternatives.
8. Record the released commit, deployment ID, public URLs, DNS snapshot, certificate/header/robots results and mail test evidence. Keep the previous known-good records/commit available. Do not submit a sitemap or launch announcement before the agreed NHSP and public-release gates are met.

## Production values — plan only

| Variable | Required final setting | Current production |
|---|---|---|
| SITE_MODE | public only for approved release | preview |
| NODE_VERSION | 24.19.0, matching tested build | 24.19.0 |
| CONTACT_ENABLED | false during setup; true only for approved public delivery | false |
| CONTACT_PROVIDER | resend | absent |
| CONTACT_FROM_EMAIL | website@mail.markhamcc.ca | absent |
| CONTACT_ALLOWED_HOSTNAMES | markhamcc.ca,www.markhamcc.ca if using approved apex/www route; exact chosen hosts only | absent |
| TURNSTILE_SITE_KEY | Public key of widget permitting chosen production hosts | absent |
| TURNSTILE_SECRET_KEY | Encrypted server secret matching that widget | absent |
| RESEND_API_KEY | Encrypted server secret with send/retrieve capability | absent |

Recipient remains fixed server-side to info@markhamcc.ca; do not add a visitor-controlled recipient/From. A public site key is not a secret. Do not copy either secret into source, a report or a tool log.

## Rollback

- Before first production release there is no known-good V3 production deployment. Preserve the current live-domain route; do not claim a one-click Pages rollback exists for the first launch. If the initial release fails, hold/revert web routing to its recorded baseline after approval, or serve the last tested release/maintenance contact fallback according to the agreed rollback plan.
- For later releases, redeploy/promote the recorded prior known-good production commit/deployment; ensure it has correct production environment values. Roll back code and environment together when needed. Do not promote an Access-preview hostname to production as a shortcut.
- Contact failure: disable only production CONTACT_ENABLED and redeploy; keep telephone/email links. DNS incident: compare against saved exact records, restore only affected approved web records, and preserve mail records. Nameserver rollback is a separate high-impact step requiring review of propagation and DNSSEC; it is not an automatic fix.

## Estimate and limits

After all decisions, account access and required notices are cleared: approximately 1–2 hours of hands-on production setup, record comparison and verification for a straightforward zone, plus provider certificate/DNS propagation (often minutes, potentially 24–48 hours or longer). This is an estimate, not a guarantee. If Section 19's reported 20-day notice applies and notice has not been sent, plan no earlier than the applicable 20-calendar-day window, and also satisfy the initial 60-day allowance as applicable. No signing date/launch deadline is invented.

Primary references checked October 17:

- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Pages serving/HTML redirects](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [www-to-apex routing](https://developers.cloudflare.com/pages/how-to/www-redirect/)
- [Email DNS records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/email-records/)
- [DNS-only email hosts](https://developers.cloudflare.com/dns/proxy-status/use-cases/)
