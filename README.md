# Nina Kurain — private creator membership

The existing landing sections, imagery and animations are preserved. Member and creator studio pages use real D1 SQL records. Private media can be owned by the creator's Google Drive account; the existing private object store remains a fallback until Drive is connected and as a migration source. This deployment uses the existing site's database rather than PostgreSQL. Passwords use salted scrypt hashes; separate member/admin sessions use revocable HttpOnly cookies. No browser storage is used as a database.

## Setup and admin credentials

Install with pnpm install, build with pnpm build, then pnpm start. Apply committed migrations through the Sites deployment flow. Never rewrite applied migrations. Runtime settings are listed in .env.example; configure hosted secrets in the site's environment settings, not frontend source. APP_ENV=local is only for local HTTP; use testing or production on HTTPS. The production APP_URL is `https://ninakurainservices.in`; `www.ninakurainservices.in` redirects to the root domain.

Run node scripts/hash-admin-password.mjs and enter a password at its hidden prompt. Store the output as secret ADMIN_PASSWORD_HASH and set ADMIN_EMAIL. Set independent random secrets for MEDIA_SIGNING_SECRET and CRON_SECRET. Admin signs in at /admin/login and cannot register through customer signup.

With ENABLE_TEST_ACCOUNTS=true, the first login seeds real development accounts: free@test.com, 299@test.com, 499@test.com, 649@test.com, all using Demo@123. Paid demo access is explicitly complimentary for 30 days with audit records; no payments are fabricated. In Admin Dashboard, prepare sample posts to import copies of the existing sample images into the active private media store and create two posts per access level. These sample images already appear publicly on the landing page; upload new files for genuinely private content. Disable seeding and revoke development accounts before opening to customers.

## Google Drive media ownership

The creator can connect a personal Google account from Admin Settings. Do not send or store the Gmail password in this application. The admin authenticates on Google's own OAuth screen, and the server stores only an encrypted refresh token. The app requests `drive.file`, which allows it to manage files it creates without broad access to unrelated Drive files.

1. In Google Cloud Console, create or select a project and enable the Google Drive API.
2. Configure the OAuth consent screen. While the app is in testing, add the intended Google account as a test user.
3. Create an OAuth client of type Web application.
4. Add the exact authorized redirect URI: `https://ninakurainservices.in/api/integrations/google-drive/callback`.
5. Configure `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, and a long random `GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY` as server environment secrets. Keep `APP_URL` set to the live site origin.
6. Open Admin → Settings → Google Drive media storage, select **Connect intended Google account**, and approve access using the account that should own the media.
7. New uploads will use Google Drive. Select **Move next files to Drive** until the remaining count reaches zero; migration is intentionally batched to avoid request timeouts.

Drive files are not shared publicly. Member requests still pass through signed URLs, login checks, active subscription/grace checks, and post entitlements before the server streams the file. Disconnecting does not delete Drive files, but Drive-hosted content remains unavailable until the same account is reconnected. Remove the old private object store only after the Admin Settings migration count is zero and media has been verified.

## Memberships and content

Initial plans are Free, ₹300, ₹500 and ₹650 monthly. Admin can change names, prices, benefits, badges, order and availability. Server queries only return eligible published content; Free users receive explicitly selected demos. Per-post exact plans override cumulative access. Media requires both a short-lived signature and the current user's session/entitlements, including byte-range requests.

Admin supports drafts, scheduling, publishing, editing, archiving, multiple uploads (JPEG/PNG/WebP/MP4, 25 MB per file), covers, comment permissions, member grants/revocation/extensions, moderation, plans, settings, payments and audit history. A post containing an MP4 is automatically classified as a Reel and appears in the Reels tab and creator studio. Member pages refresh every 15 seconds while visible and on focus. Scheduling and expiration are checked during reads.

## Email delivery

Verify `ninakurainservices.in` in Resend, then configure its API key as secret `MAIL_API_KEY` and set `MAIL_FROM` to `Nina Kurain <members@ninakurainservices.in>`. Reset and verification links use hashed, expiring, one-use tokens. Automated messages cover welcome, payment activation, failed-payment grace, upcoming renewal, expiry/cancellation and admin membership changes. Delivery attempts are persisted with idempotency keys so Razorpay webhook retries cannot send duplicates. Open Admin → Settings and use **Send test email** before enabling verification gating.

The protected `/api/cron/grace` job also sends three-day renewal reminders, expires completed grace periods, sends expiry notices and removes expired auth/OAuth tokens. Schedule it at least daily with `Authorization: Bearer <CRON_SECRET>`.

## Provider sandbox

Set PAYMENT_MODE=test, Razorpay test RAZORPAY_KEY_ID and secret RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET. Plans are created from database settings. Configure /api/webhooks/razorpay for subscription charged, pending, halted, cancelled, completed and payment failed events. Signatures and provider-side verification are required before paid activation. Browser checkout completion never grants access. Existing subscription plan changes are scheduled for cycle end and take effect after verified payment.

Failed renewals retain access until 48 hours after current period end, then fall back to Free. Schedule /api/cron/grace with Authorization: Bearer <CRON_SECRET> for background cleanup; permission checks enforce expiration independently. Missing provider credentials disable checkout explicitly. Complimentary demo access works without Razorpay.

## Razorpay production launch

1. Complete Razorpay account activation/KYC and create Live API keys.
2. Set `PAYMENT_MODE=live`, `RAZORPAY_KEY_ID=rzp_live_...`, and store `RAZORPAY_KEY_SECRET` as a secret.
3. In Razorpay Webhooks, use `https://ninakurainservices.in/api/webhooks/razorpay`, create a unique webhook secret, and store it as secret `RAZORPAY_WEBHOOK_SECRET`.
4. Subscribe to `subscription.charged`, `subscription.pending`, `subscription.halted`, `subscription.cancelled`, `subscription.completed`, and `payment.failed`.
5. Open Admin → Settings. Razorpay must show **LIVE READY** before public launch. Mismatched test/live keys keep checkout disabled.
6. Perform one real low-value subscription with an internal account, confirm the webhook activates access and the email arrives, then refund/cancel it from Razorpay if appropriate.

The application never grants paid access from the browser redirect. Activation requires a valid Razorpay HMAC signature plus a fresh server-to-server subscription/payment verification. Plan records are created against the active Razorpay environment from the editable database prices.

## Direct Cloudflare production deployment

The direct Cloudflare deployment reuses Worker `site-creator-vinext-starter` in account `f1099441759c455eba9318b083112257` and D1 database `65df4e58-5eef-459d-9540-8131a5f5cf9f`. Google Drive is the only permanent media store, so the production preparation step removes the generated R2 binding.

1. Run `pnpm exec wrangler login` and complete Cloudflare authorization in the browser.
2. Run `pnpm run build:cloudflare`.
3. Generate the admin password hash with `node scripts/hash-admin-password.mjs` and keep the output ready.
4. Run `pnpm run sync:cloudflare-env` to automatically sync all secrets and non-secret vars from `.env.production` directly to Cloudflare (or run `pnpm run configure:cloudflare` for interactive prompts). Use only Razorpay Live keys and the matching Live webhook secret.
5. Run `pnpm exec wrangler d1 migrations apply site-creator-d1 --remote --config dist/server/wrangler.json`. Applied migrations are skipped safely.
6. Run `pnpm run deploy:cloudflare`.
7. In Razorpay Live Mode, set the webhook URL to `https://ninakurainservices.in/api/webhooks/razorpay` and subscribe to the documented subscription/payment events.
8. In Google Cloud, keep the authorized redirect URI as `https://ninakurainservices.in/api/integrations/google-drive/callback`.

The non-secret production settings are written during `build:cloudflare`: `APP_ENV=production`, `APP_URL=https://ninakurainservices.in`, `ENABLE_TEST_ACCOUNTS=false`, `PAYMENT_MODE=live`, the verified mail sender, and the Google OAuth client ID. Secret values are never written into source files.

## Creator links

Admin → Settings accepts HTTPS links for Instagram, YouTube, Facebook, X/Twitter and an external website. Empty links remain hidden. Saved links update the public landing footer, creator profile and admin preview without a code change.

## Validation

After building, run node scripts/test-membership.mjs. It exercises the bundled Worker with an isolated D1 database and R2 bucket: authentication, tier isolation, media authorization, admin mutations and expiration. These tests do not prove external email delivery or real Razorpay sandbox transactions. Verify those integrations with actual configured services and review the site's audience before customer launch.
