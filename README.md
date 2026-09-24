<div align="center">

# ✦ NINA KURAIN — VIP CREATOR SUITE ✦
### *Next-Gen Edge-Native Creator Membership Platform*

<br/>

<a href="https://ninakurainservices.in">
  <img src="https://readme-typing-svg.demolab.com?font=Cinzel&weight=700&size=26&duration=2500&pause=1000&color=E56B83&center=true&vCenter=true&multiline=true&width=800&height=90&lines=PRIVATE+CREATOR+MEMBERSHIP+VAULT;CLOUDFLARE+WORKERS+%E2%80%A2+D1+SQLITE+%E2%80%A2+GOOGLE+DRIVE;CUSTOM+UPI+QR+ENGINE+%E2%80%A2+LIVE+STUDIO+SUITE" alt="Typing Banner" />
</a>

<br/>

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Edge_Runtime-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare_D1-SQLite_Database-F38020?style=for-the-badge&logo=sqlite&logoColor=white)](https://developers.cloudflare.com/d1/)
[![Next.js](https://img.shields.io/badge/Next.js-16.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Live_Gateway-0C2340?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![Google Drive](https://img.shields.io/badge/Google_Drive-OAuth_Storage-4285F4?style=for-the-badge&logo=googledrive&logoColor=white)](https://developers.google.com/drive)

<br/>

```
  ★ 100% Edge Rendered   ★ 0ms Cold Start   ★ Direct UPI & Razorpay   ★ Pure TypeScript QR Engine
```

---

</div>

<br/>

## 💎 Platform Architecture & Highlights

<table>
<tr>
<td width="50%" valign="top">

### 🔞 VIP Member Lounge
* **Tiered Access Gating**: Free Demo, Tier 1 (*Private Access*), Tier 2 (*Closer Access*), and Tier 3 (*Inner Circle*).
* **Immersive Reel & Photo Feed**: Ultra-fast media delivery with signed token verification and byte-range streaming.
* **Member Community**: Threaded discussions, verified reactions, bookmarks, and private direct feedback inbox.
* **Auto-Refreshing Feed**: Live updates every 15 seconds with intelligent tab-focus detection.

</td>
<td width="50%" valign="top">

### 💳 Dynamic Payment & QR Engine
* **Instant Custom Payment QR**: Enter any custom amount (e.g. ₹500, ₹1,200, ₹15,000) on PC or mobile.
* **Dual Gateway Modes**:
  * 🟢 **Direct UPI (0% Fee)**: Standard NPCI URI opening directly into Google Pay, PhonePe, Paytm, or BHIM.
  * 🔴 **Razorpay Live Gateway**: Dynamic hosted links supporting Credit/Debit Cards & Netbanking.
* **Branded Receipt Generator**: Canvas-rendered luxury payment card with watermark, badges, and QR export.
* **1-Click WhatsApp & Phone Share**: Instant native sharing via `navigator.share` or WhatsApp chat.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🎨 Nina Studio Suite
* **Integrated Creative Editor**: Edit photos and videos directly in the admin dashboard.
* **18 Editorial Filters**: Tailored tone presets (Seductive, Golden Hour, Noir Velvet, Film 35mm, Boudoir Luxe).
* **Fabric.js Canvas Engine**: Custom aspect-ratio cropping (1:1, 4:5, 9:16), text layers, stickers, and brand watermarks.
* **Reel Video Cutter**: In-browser MP4 frame timeline scrubbing and sub-clip video trimming.

</td>
<td width="50%" valign="top">

### 💾 D1 Storage & Maintenance
* **Live Database Telemetry**: Exact SQLite byte measurement (`page_count * page_size`) against 500 MB D1 quota.
* **Table Row Statistics**: Live count breakdown for media assets, members, payments, activity logs, and tokens.
* **1-Click Safe Storage Cleaner**: Purges expired OAuth tokens, stale sessions, and pruned activity logs without touching content.
* **Google Drive Quota**: Real-time Drive usage telemetry, available capacity, and 1-click trash purge.

</td>
</tr>
</table>

---

## 🎁 7-Day Referral Program

The platform includes a 7-day qualification referral engine:

```
[Member Shares Link] ──> [First Friend Signs Up] ──> ⏳ 7-Day Window Starts!
                                                              │
                     ┌────────────────────────────────────────┴────────────────────────────────────────┐
                     ▼                                                                                 ▼
      Within 7 Days of 1st Referral                                                      After 7 Days Expired
   • Counted toward active milestones                                            • Recorded in "Total Refers" (All-Time)
   • 1 Sub: 7-Day Tier 1 Trial                                                   • Milestone rewards closed
   • 3 Subs: 7-Day Tier 2 Trial                                                  • Transparent status banner on card
   • 5 Subs: 7-Day Tier 3 Trial
```

* **All-Time Total Refers**: Always visible to the member so their cumulative impact is permanently recognized.
* **Strict 7-Day Eligibility**: Automatically locks milestone unlocks to referrals created within 7 days of the member's first referral.

---

## ⚡ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Compute** | [Cloudflare Workers](https://workers.cloudflare.com/) | Edge-native V8 serverless execution with 0ms cold starts |
| **Database** | [Cloudflare D1](https://developers.cloudflare.com/d1/) | Distributed serverless SQLite with Drizzle ORM |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) + [Vinext](https://github.com/cloudflare/vinext) | Hybrid RSC & client rendering optimized for Workers |
| **Styling** | Vanilla CSS + Radix UI + Lucide Icons | Dark luxury aesthetic (`#100610`, rose-wine gradients, glassmorphism) |
| **Media Storage** | Google Drive API (OAuth 2.0) | Creator-owned private storage with signed streaming proxy |
| **Payments** | Razorpay Live + Pure TS QR Engine | Dual-channel payments with signed webhook verification |
| **Email Delivery** | Resend API | Transactional emails with idempotency keys & token hashing |

---

## 🚀 Quick Start Guide

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Nina-Kurain/Nina-Kurain-Services.git
cd Nina-Kurain-Services
pnpm install
```

### 2. Configure Environment
Create `.env` (or use `.env.production`):
```env
APP_ENV=production
APP_URL=https://ninakurainservices.in
ADMIN_EMAIL=insta.ninak12@gmail.com
ADMIN_PASSWORD_HASH=scrypt$...

# Payment Gateways
PAYMENT_MODE=live
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Cloudflare & Storage
CLOUDFLARE_D1_DATABASE_NAME=site-creator-d1
CLOUDFLARE_D1_DATABASE_ID=65df4e58-5eef-459d-9540-8131a5f5cf9f
GOOGLE_DRIVE_CLIENT_ID=...
GOOGLE_DRIVE_CLIENT_SECRET=...
```

### 3. Run Locally
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Deploy to Cloudflare Edge
```bash
pnpm run deploy:cloudflare
```

---

<details>
<summary><b>🛡️ Security & Privacy Engineering</b></summary>

<br/>

* **Zero Plaintext Passwords**: Uses salted `scrypt` hashing with constant-time equality checks.
* **Signed Streaming URLs**: Media assets require short-lived HMAC signatures and member entitlement verification.
* **Webhook Signature Verification**: Razorpay payment confirmations require cryptographic HMAC-SHA256 signatures before activating subscriptions.
* **Encrypted OAuth Tokens**: Google Drive refresh tokens are encrypted at rest using AES-GCM-256 with key derivation.
* **Rate-Limiting**: Edge sliding-window rate limiting on authentication and sensitive endpoints.

</details>

<details>
<summary><b>📁 Project Structure</b></summary>

```
nina-kurain-membership/
├── app/                        # Next.js App Router pages & edge API endpoints
│   ├── admin/                  # Creator Studio & Live Admin dashboard
│   ├── api/                    # Studio, Auth, Webhooks, Integrations & Media proxy
│   ├── feed/                   # Member VIP exclusive feed & reels
│   └── globals.css             # Luxury dark-mode design system
├── components/                 # Reusable UI & admin components
│   ├── admin/                  # PaymentQrGenerator & DatabaseStorageManager
│   ├── media-editor/           # NinaStudioEditor & Fabric photo canvas
│   ├── post-viewer/            # Fullscreen reel & post viewers
│   └── referrals/              # MemberReferralCard & 7-day qualification tracker
├── db/                         # Drizzle schema definitions & SQL bindings
├── lib/                        # Core utilities & server services
│   ├── qr-code.ts              # Pure TypeScript ISO/IEC 18004 QR engine
│   └── server/                 # Auth, Billing, D1 DB, Email, Drive, & Storage stats
└── public/                     # High-res portraits, logos, icons, & sitemaps
```

</details>

---

<div align="center">

### ✦ Engineered for Nina Kurain Private Creator Club ✦
*Crafted with precision for private subscriptions, edge performance, and luxury aesthetics.*

<br/>

[![Status](https://img.shields.io/badge/SYSTEM-ONLINE_%E2%80%A2_PRODUCTION_DEPLOYED-22c55e?style=for-the-badge)](https://ninakurainservices.in)

</div>
