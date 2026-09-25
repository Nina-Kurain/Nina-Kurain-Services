# 🔒 vip.ninakurainservices.in (VIP Members Portal)

This folder defines all pages, assets, and routes belonging to the **VIP member subdomain** (`https://vip.ninakurainservices.in`).

---

## 📁 VIP Portal Scope & Responsibilities

1. **Member Authentication & Privacy**:
   - `app/login/` & `app/auth-form.tsx` (VIP member sign in with mobile app download prompt)
   - `app/complete-profile/` & `app/signup/` (VIP account onboarding)
   - Mobile gate (`security/MobileAppGate.tsx`): Users on mobile visiting any VIP section are invited to download Nina's app with OS-specific buttons. Admin portal (`/admin`) is strictly exempt.

2. **VIP Member Exclusives**:
   - `app/feed/` (Private posts, stories, uncensored drops, audio confessions)
   - `app/reels/` (Vertical video reels player with member comments)
   - `app/profile/` (Creator profile with Feed, Exclusives, and Reels tabs)
   - `app/api/content/media/[id]` (Signed token media streaming directly from Google Drive)

3. **Member Management & Billing**:
   - `app/account/` & `app/account/membership/` (Subscription management, billing invoices)

4. **Creator Studio (Admin Only)**:
   - `app/admin/` & `app/admin/live-studio.tsx` (Drop creator, payment QR generator, user metrics)
   - `components/media-editor/` (Nina Studio Editor & Video Engine with frame trimming)
