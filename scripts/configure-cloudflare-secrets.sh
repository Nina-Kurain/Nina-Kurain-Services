#!/usr/bin/env bash
set -euo pipefail

CONFIG="dist/server/wrangler.json"

if [[ ! -f "$CONFIG" ]]; then
  echo "Production build not found. Run: pnpm run build:cloudflare"
  exit 1
fi

put_secret() {
  local name="$1"
  local label="$2"
  local value=""
  read -r -s -p "$label: " value
  printf '\n'
  if [[ -z "$value" ]]; then
    echo "$name was empty; nothing was changed."
    return
  fi
  printf '%s' "$value" | pnpm exec wrangler secret put "$name" --config "$CONFIG"
  unset value
}

echo "Values stay hidden and are sent directly to the existing Cloudflare Worker."
echo "Do not paste quotes around values."
put_secret "ADMIN_EMAIL" "Admin login email"
put_secret "ADMIN_PASSWORD_HASH" "Admin password hash"
put_secret "MEDIA_SIGNING_SECRET" "Media signing secret"
put_secret "GOOGLE_DRIVE_CLIENT_SECRET" "Google OAuth client secret"
put_secret "GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY" "Google Drive token encryption key"
put_secret "MAIL_API_KEY" "Resend API key"
put_secret "RAZORPAY_KEY_ID" "Razorpay LIVE Key ID (rzp_live_...)"
put_secret "RAZORPAY_KEY_SECRET" "Razorpay LIVE Key Secret"
put_secret "RAZORPAY_WEBHOOK_SECRET" "Razorpay LIVE webhook secret"
put_secret "CRON_SECRET" "Cron authorization secret"

echo "Cloudflare secrets are configured. Run: pnpm run deploy:cloudflare"
