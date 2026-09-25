# 🔒 Nina Kurain Permanent Security Module

> **CRITICAL ARCHITECTURAL DIRECTIVE:**  
> This directory (`/security/`) is the **permanent application security infrastructure** for the Nina Kurain website.  
> **DO NOT REMOVE, OVERRIDE, OR WEAKEN** any part of this module during future updates, migrations, or refactoring.

---

## 🛡️ Overview

This module provides multi-layered client and asset protection for all photography, motion films, studio portraits, and copyrighted content across the entire website.

### Protections Enforced:

1. **Anti-Copy & Right-Click Prevention:**
   - Global interception of `contextmenu` across all images, videos, canvas, svg, and content containers.
   - Global interception of `copy` and `cut` events (clears/overwrites clipboard with copyright notice outside inputs).
   - Touch callout disabled (`-webkit-touch-callout: none !important`) to block mobile "Save Image" / "Share" prompts.
   - Text and media selection disabled (`user-select: none !important`), preserving selection strictly for user input fields.

2. **Anti-Download for Chrome & Modern Browsers:**
   - Chrome media download controls stripped (`controlsList="nodownload nofullscreen noremoteplayback"`).
   - Picture-in-Picture (`disablePictureInPicture`) and remote casting disabled.
   - Real-time `MutationObserver` automatically intercepts and hardens any dynamically mounted `<video>` or `<img>` element in the DOM.
   - Drag-and-drop blocked (`dragstart`, `draggable="false"`) so media cannot be dragged to the desktop or into new browser tabs.

3. **Anti-Screenshot & Snipping Tool Deterrent:**
   - **`PrintScreen` Keyboard Interception:** Overwrites system clipboard with a legal copyright security notice immediately and engages a blackout security curtain.
   - **Window Focus Protection:** When external screen capture utilities (like Windows Snipping Tool `Win + Shift + S`, macOS grab tools, or screen recorders) cause the window to lose focus (`window.onblur`), the high-blur Security Curtain (`.nk-security-curtain`) obscures the viewport until focus returns.
   - **Print / PDF Obfuscation:** Standard `@media print` rules completely obliterate page content, rendering an opaque security warning instead.

4. **DevTools & View Source Deterrent:**
   - Blocks keyboard combinations: `F12`, `Ctrl+Shift+I`, `Cmd+Option+I`, `Ctrl+Shift+J`, `Cmd+Option+J`, `Ctrl+Shift+C`, `Cmd+Option+C`, `Ctrl+U`, `Cmd+Option+U`, `Ctrl+S`, `Cmd+S`, and `Ctrl+P`.
   - Displays authoritative cyber-security notices in the browser console.
   - Triggers stylish floating alerts (`.nk-security-toast`) notifying users that content inspection is restricted.

---

## 📂 File Structure

| File | Purpose |
| :--- | :--- |
| [`security.css`](file:///c:/Users/sarha/Downloads/Nina-Kurain-Cloudflare-Production%20%281%29/nina-kurain-membership/security/security.css) | Core CSS disabling selections, callouts, drag-and-drop, print styles, and styling the Security Curtain & Alert Toasts. |
| [`anti-copy.ts`](file:///c:/Users/sarha/Downloads/Nina-Kurain-Cloudflare-Production%20%281%29/nina-kurain-membership/security/anti-copy.ts) | Pure TypeScript singleton engine attaching global event listeners, clipboard protection, and DOM mutation observers. |
| [`SecurityGuard.tsx`](file:///c:/Users/sarha/Downloads/Nina-Kurain-Cloudflare-Production%20%281%29/nina-kurain-membership/security/SecurityGuard.tsx) | React client component mounted in `app/layout.tsx` rendering the Security Curtain and Toast notifications. |
| [`ProtectedMedia.tsx`](file:///c:/Users/sarha/Downloads/Nina-Kurain-Cloudflare-Production%20%281%29/nina-kurain-membership/security/ProtectedMedia.tsx) | Hardened image & video wrapper components with transparent click/drag shields. |
| [`index.ts`](file:///c:/Users/sarha/Downloads/Nina-Kurain-Cloudflare-Production%20%281%29/nina-kurain-membership/security/index.ts) | Public module exports. |

---

## 🚀 How Updates Should Be Handled

- **Adding new features:** You may expand this module (e.g., adding dynamic watermarks or server-side DRM tokens), but **never delete existing event handlers or styles**.
- **Integration:** The module is loaded globally at the root in `app/layout.tsx` via `import "@/security/security.css"` and `<SecurityGuard />`.
