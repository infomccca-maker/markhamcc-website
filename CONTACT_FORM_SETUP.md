# MCC contact form — configuration and delivery checklist

**October 17, 2026 update:** Protected-preview delivery testing is COMPLETE. Cloudflare Preview is enabled with encrypted secrets, the verified Resend sending domain, and successful Turnstile/send/retrieve checks. MCC confirmed mailbox receipt, Reply-To and a successful test reply. See LAUNCH_READINESS_AUDIT_2026-10-17.md. Production is not configured or approved by this completion; the original preparation checklist below is historical where it says no configuration or real email testing occurred.

Prepared locally on mcc-website-v3. No account, DNS, Microsoft 365, GitHub or Cloudflare configuration has been changed. No real email has been sent or verified.

## Proposed service and cost

The local adapter is prepared for Cloudflare Pages Functions + Turnstile + Resend. It stays disabled until explicitly configured. This is a proposed integration, not an activated subscription. Resend's free tier currently allows 3,000 emails/month with a 100/day limit; do not enable paid upgrades without MCC approval. Cloudflare Functions use Workers quotas, and Turnstile offers a free plan. Review account quotas before activation. Retrieval polling also consumes provider API requests and is subject to rate limits.

Sources checked for this implementation:
- https://resend.com/pricing
- https://resend.com/docs/dashboard/domains/introduction
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/api-reference/emails/retrieve-email
- https://developers.cloudflare.com/pages/functions/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

A hosted-form provider is an alternative if MCC prefers not to maintain a function, but it also requires an approved account, recipient verification, limits/privacy review and delivery testing. No alternative provider has been connected.

## Exact setup steps — still required, not performed

1. MCC must approve the email provider and its handling/retention of enquiry content. The site does not store submissions in a database, but the provider and receiving mailbox retain email according to their policies.
2. An authorized MCC administrator must confirm **info@markhamcc.ca** is an active Microsoft 365 mailbox and that they can inspect inbox, junk/quarantine and delivery evidence. No mailbox or DNS check alone proves successful receipt. This verification is a launch blocker for the form.
3. Create/approve a Resend account and an authenticated sending address. Use an existing verified sender domain if available. Otherwise, sender verification normally requires adding provider-specific DNS records, ideally on a dedicated sending subdomain. That work requires separate authorization and must not overwrite existing MX/SPF/DKIM/DMARC records. This task does not authorize any DNS change. The recipient stays info@markhamcc.ca; it need not be the From address. Do not use visitors' addresses as From, and do not use Resend's testing sender for general public delivery.
4. Create a server-only Resend API key with send **and retrieve-email** permissions. The implementation reads delivery status; a sending-only key cannot do that and will not result in a success confirmation. Use the narrowest available domain/account scope. Keep open/click tracking disabled. Never paste keys into HTML, Git or chat.
5. Create a Turnstile managed widget for the exact approved preview/public hostnames. Obtain the public site key and private secret. Add preview hostname(s) explicitly; localhost/test keys are for testing only. The handler checks the exact hostname and the mcc-contact action, and verifies tokens server-side.
6. After separately approved deployment setup, configure the environment values below in the Pages **preview** environment first. Keep CONTACT_ENABLED=false until sender and mailbox checks are ready. Do not enable this on a public deployment without successful delivery testing.
7. Use a Functions-capable Pages deployment from the existing repository. Keep functions/ and lib/ at repository root; they must be present along with data/programs.json. The static output is dist/. Uploading only static files without compiling the Function will not enable delivery. _routes.json limits Function execution to /api/contact. No database/KV binding is required.
8. Add an appropriate edge rate-limiting rule for POST /api/contact if available on the approved plan. Do not purchase an upgrade automatically. The local handler has a best-effort limit of five attempts per IP per ten minutes per isolate, using short-lived HMAC-derived keys in memory. It is **not a global/distributed rate limit**. Turnstile, the honeypot, field/body limits and origin checks remain mandatory.
9. On an Access-protected preview, run an authorized real test. Confirm the message arrives at info@markhamcc.ca, verify all fields/program/time, test Reply-To, inspect spam/quarantine, and test provider rejection, pending/bounced delivery and retry behaviour. Do not enter real participant-sensitive data for testing. Check that secrets never appear in browser traffic, bundles or logs.
10. Verify the actual Pages Function bundle, routing, CSP/Turnstile rendering, Access and response headers on Cloudflare. Local tests cannot establish these live settings. Obtain separate approval for any commit, push or deployment.

## Environment values

| Name | Scope / value |
|---|---|
| CONTACT_ENABLED | Server variable; true only after approved setup; absent/false disables delivery |
| CONTACT_PROVIDER | Server variable; resend |
| CONTACT_FROM_EMAIL | Approved authenticated sender mailbox; do not assume info@markhamcc.ca is verified as a sender |
| CONTACT_ALLOWED_HOSTNAMES | Comma-separated exact permitted hostnames; no schemes, paths or wildcards |
| RESEND_API_KEY | Secret; send and retrieve-email permission required |
| TURNSTILE_SITE_KEY | Public site key; exposed only by GET /api/contact when configured |
| TURNSTILE_SECRET_KEY | Secret; server-side only |
| SITE_MODE | Existing build variable; preview until separately approved public launch |

No recipient environment variable is used: the destination is fixed server-side to info@markhamcc.ca. Local secret files are ignored by .gitignore. No credential file was created.

## Confirmation and failure behaviour

The server validates fields, program ID, origin, body size and Turnstile before contacting Resend. Visitor input becomes plain-text email; From and To are controlled by MCC, Reply-To is the validated visitor email. A stable request identifier and payload make unchanged retries idempotent during Resend's deduplication period; changing the content intentionally creates a new request. The initial timestamp is client-generated, validated within a bounded window and retained across unchanged retries; the receiving email also has provider-generated mail timestamps.

Provider API acceptance alone is **not** displayed as success. The handler briefly polls for last_event=delivered, meaning the provider reports acceptance by the recipient's mail server. This still does not prove inbox placement or that MCC has read the message. Pending, bounced, rejected, timed-out or unconfirmed delivery shows an error and retains the visitor's input. An unchanged retry reuses the same request identifier and timestamp. Delivery can arrive later after an unconfirmed response; advise the visitor to retry unchanged. No automatic visitor email is sent.

No enquiry body, email address or phone number is put into URL parameters or browser storage. Program URLs contain only subject=registration and a public catalogue ID. Backend code does not log message bodies, provider responses or secrets.

## Local testing

- node scripts/build.mjs
- node scripts/check.mjs
- node scripts/test-contact-service.mjs
- node scripts/check-contact-form.cjs (installed Playwright/Edge runtime required)

The local preview endpoint deliberately uses empty configuration and cannot send mail. Automated tests simulate both Turnstile and the provider, including delivered, pending, bounced, rejected, network and rate-limit cases. They do not verify real mailbox delivery.
