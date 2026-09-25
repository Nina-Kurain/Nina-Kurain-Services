/**
 * ============================================================================
 * NINA KURAIN PERMANENT HIGH-SECURITY, MOBILE & ANTI-CAMERA SHIELD ENGINE
 * PATH: /security/anti-copy.ts
 * 
 * CRITICAL DIRECTIVE:
 * THIS MODULE IS PERMANENT APPLICATION SECURITY INFRASTRUCTURE.
 * DO NOT REMOVE, OVERRIDE, OR WEAKEN IN ANY APPLICATION UPDATE.
 * ============================================================================
 */

export interface SecurityEventDetail {
  type: "contextmenu" | "screenshot" | "devtools" | "drag" | "copy" | "print" | "mobile_capture";
  message: string;
}

type SecurityListener = (detail: SecurityEventDetail) => void;

class SecurityEngine {
  private static instance: SecurityEngine | null = null;
  private listeners: Set<SecurityListener> = new Set();
  private initialized = false;
  private observer: MutationObserver | null = null;
  private curtainTimer: any = null;
  private devtoolsCheckInterval: any = null;

  private constructor() {}

  public static getInstance(): SecurityEngine {
    if (!SecurityEngine.instance) {
      SecurityEngine.instance = new SecurityEngine();
    }
    return SecurityEngine.instance;
  }

  public subscribe(listener: SecurityListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(detail: SecurityEventDetail) {
    this.listeners.forEach((fn) => {
      try {
        fn(detail);
      } catch (err) {
        console.warn("[Security] Listener notification failed", err);
      }
    });
  }

  public init(): () => void {
    if (typeof window === "undefined" || this.initialized) {
      return () => {};
    }

    this.initialized = true;

    // 1. Console Warning & Security Declaration
    this.emitConsoleSecurityNotice();

    // 2. Block Screen Recording APIs
    this.blockScreenCaptureAPIs();

    // 3. Initialize Hardware Secure Surface (Triggers Android FLAG_SECURE on Chromium via EME)
    this.initHardwareSecureSurface();

    // 3. Event Listeners for Desktop & Mobile Comprehensive Protection
    const onContextMenu = (e: MouseEvent) => this.handleContextMenu(e);
    const onDragStart = (e: DragEvent) => this.handleDragStart(e);
    const onKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
    const onKeyUp = (e: KeyboardEvent) => this.handleKeyUp(e);
    const onCopy = (e: ClipboardEvent) => this.handleCopy(e);
    const onWindowBlur = () => this.handleWindowBlur();
    const onWindowFocus = () => this.handleWindowFocus();
    const onVisibilityChange = () => this.handleVisibilityChange();
    const onPageHide = () => this.handlePageHide();

    // Mobile Multi-Touch & Gesture Interception
    const onTouchStart = (e: TouchEvent) => this.handleTouchStart(e);
    const onTouchMove = (e: TouchEvent) => this.handleTouchMove(e);

    // Selection Interception
    const onSelectionChange = () => this.handleSelectionChange();

    window.addEventListener("contextmenu", onContextMenu, { capture: true, passive: false });
    window.addEventListener("dragstart", onDragStart, { capture: true, passive: false });
    window.addEventListener("keydown", onKeyDown, { capture: true, passive: false });
    window.addEventListener("keyup", onKeyUp, { capture: true, passive: false });
    window.addEventListener("copy", onCopy, { capture: true, passive: false });
    window.addEventListener("blur", onWindowBlur);
    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Mobile gesture listeners
    window.addEventListener("touchstart", onTouchStart, { capture: true, passive: false });
    window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
    document.addEventListener("selectionchange", onSelectionChange);

    // 4. Dynamic Media Hardening Observer (Videos & Images)
    this.hardenAllMedia();
    this.setupMutationObserver();

    // 5. Periodic DevTools Inspection Trap
    this.devtoolsCheckInterval = setInterval(() => {
      this.detectDevTools();
    }, 2000);

    // Cleanup method
    return () => {
      window.removeEventListener("contextmenu", onContextMenu, { capture: true });
      window.removeEventListener("dragstart", onDragStart, { capture: true });
      window.removeEventListener("keydown", onKeyDown, { capture: true });
      window.removeEventListener("keyup", onKeyUp, { capture: true });
      window.removeEventListener("copy", onCopy, { capture: true });
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("touchmove", onTouchMove, { capture: true });
      document.removeEventListener("selectionchange", onSelectionChange);

      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      if (this.devtoolsCheckInterval) {
        clearInterval(this.devtoolsCheckInterval);
        this.devtoolsCheckInterval = null;
      }
      this.initialized = false;
    };
  }

  /**
   * Blocks screen recording extensions and tab sharing APIs.
   */
  private blockScreenCaptureAPIs() {
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        (navigator.mediaDevices as any).getDisplayMedia = async () => {
          throw new DOMException(
            "Screen capture and tab recording are strictly prohibited on this secure platform.",
            "NotAllowedError"
          );
        };
      }

      if (typeof HTMLMediaElement !== "undefined" && (HTMLMediaElement.prototype as any).captureStream) {
        (HTMLMediaElement.prototype as any).captureStream = () => {
          throw new DOMException("Stream capture disabled for protected media.", "SecurityError");
        };
      }
      if (typeof HTMLCanvasElement !== "undefined" && (HTMLCanvasElement.prototype as any).captureStream) {
        (HTMLCanvasElement.prototype as any).captureStream = () => {
          throw new DOMException("Stream capture disabled for protected media.", "SecurityError");
        };
      }
    } catch (_) {}
  }

  /**
   * Initializes Encrypted Media Extensions (EME / Widevine / ClearKey)
   * On Chromium Android, creating a MediaKey session on a video surface
   * signals Android's RenderWidgetHostView to set WindowManager.LayoutParams.FLAG_SECURE.
   */
  private initHardwareSecureSurface() {
    if (typeof window === "undefined" || !navigator.requestMediaKeySystemAccess) return;

    const widevineConfig = [
      {
        initDataTypes: ["cenc"],
        videoCapabilities: [
          {
            contentType: 'video/mp4; codecs="avc1.42E01E"',
            robustness: "SW_SECURE_CRYPTO",
          },
        ],
      },
    ];

    navigator
      .requestMediaKeySystemAccess("com.widevine.alpha", widevineConfig)
      .then((keySystemAccess) => keySystemAccess.createMediaKeys())
      .then((mediaKeys) => {
        const v = document.createElement("video");
        v.setAttribute("playsinline", "true");
        v.muted = true;
        v.style.position = "fixed";
        v.style.bottom = "0";
        v.style.right = "0";
        v.style.width = "1px";
        v.style.height = "1px";
        v.style.opacity = "0.001";
        v.style.pointerEvents = "none";
        v.style.zIndex = "-9999";
        document.body.appendChild(v);
        return v.setMediaKeys(mediaKeys);
      })
      .catch(() => {
        navigator
          .requestMediaKeySystemAccess("org.w3.clearkey", [
            {
              initDataTypes: ["cenc"],
              videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
            },
          ])
          .then((ks) => ks.createMediaKeys())
          .then((mk) => {
            const v = document.createElement("video");
            v.setAttribute("playsinline", "true");
            v.muted = true;
            v.style.position = "fixed";
            v.style.bottom = "0";
            v.style.right = "0";
            v.style.width = "1px";
            v.style.height = "1px";
            v.style.opacity = "0.001";
            v.style.pointerEvents = "none";
            v.style.zIndex = "-9999";
            document.body.appendChild(v);
            return v.setMediaKeys(mk);
          })
          .catch(() => {
            // iOS Safari Apple FairPlay Streaming DRM Check
            if (navigator.requestMediaKeySystemAccess) {
              navigator
                .requestMediaKeySystemAccess("com.apple.fps", [
                  {
                    initDataTypes: ["sinf"],
                    videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
                  },
                ])
                .then((fps) => fps.createMediaKeys())
                .then((fpsKeys) => {
                  const v = document.createElement("video");
                  v.setAttribute("playsinline", "true");
                  v.muted = true;
                  v.style.position = "fixed";
                  v.style.bottom = "0";
                  v.style.right = "0";
                  v.style.width = "1px";
                  v.style.height = "1px";
                  v.style.opacity = "0.001";
                  v.style.pointerEvents = "none";
                  v.style.zIndex = "-9999";
                  document.body.appendChild(v);
                  return v.setMediaKeys(fpsKeys);
                })
                .catch(() => {});
            }
          });
      });
  }

  /**
   * Intercepts mobile multi-touch gestures (e.g. 3-finger swipe screenshot on Android).
   */
  private handleTouchStart(e: TouchEvent) {
    if (e.touches && e.touches.length >= 3) {
      e.preventDefault();
      e.stopPropagation();
      this.triggerScreenshotDefense();
      this.notify({
        type: "mobile_capture",
        message: "Can't take screenshot due to security policy",
      });
      return false;
    }
  }

  /**
   * Intercepts mobile 3-finger swipe movements during screenshot attempt.
   */
  private handleTouchMove(e: TouchEvent) {
    if (e.touches && e.touches.length >= 3) {
      e.preventDefault();
      e.stopPropagation();
      this.triggerScreenshotDefense();
      return false;
    }
  }

  /**
   * Prevents text/media selection outside explicit form controls.
   */
  private handleSelectionChange() {
    if (typeof window === "undefined") return;
    const activeEl = document.activeElement;
    const isInput =
      activeEl &&
      (activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        (activeEl as HTMLElement).isContentEditable);

    if (!isInput) {
      const sel = window.getSelection();
      if (sel && sel.toString().length > 0) {
        sel.removeAllRanges();
      }
    }
  }

  /**
   * Blocks context menu globally except in input/textarea.
   */
  private handleContextMenu(e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
    if (isInput) return;

    e.preventDefault();
    e.stopPropagation();

    this.notify({
      type: "contextmenu",
      message: "Right-click and media saving are restricted on this private platform.",
    });

    return false;
  }

  /**
   * Blocks dragging of images, videos, canvas, and links to desktop or tabs.
   */
  private handleDragStart(e: DragEvent) {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    this.notify({
      type: "drag",
      message: "Direct media dragging and downloads are disabled.",
    });

    return false;
  }

  /**
   * Blocks shortcut combinations: DevTools, View Source, Print, Save, Screenshots.
   */
  private handleKeyDown(e: KeyboardEvent) {
    const key = e.key;
    const code = e.keyCode || e.which;
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // 1. PrintScreen key detection (PrtScn, Alt+PrtScn, Ctrl+PrtScn)
    if (key === "PrintScreen" || code === 44) {
      e.preventDefault();
      this.triggerScreenshotDefense();
      return false;
    }

    // 1b. Mobile Hardware Button Capture (Android Volume Down + Power / Volume Up)
    if (
      key === "VolumeDown" ||
      key === "AudioVolumeDown" ||
      e.code === "VolumeDown" ||
      code === 174 ||
      code === 25 ||
      key === "VolumeUp" ||
      key === "AudioVolumeUp" ||
      e.code === "VolumeUp" ||
      code === 175 ||
      code === 24
    ) {
      this.triggerScreenshotDefense();
      this.notify({
        type: "mobile_capture",
        message: "Can't take screenshot due to security policy",
      });
    }

    // 2. Windows Snipping Tool (Win + Shift + S) or Mac Screenshot (Cmd + Shift + 3 / 4 / 5)
    if (
      (e.metaKey || e.ctrlKey) &&
      e.shiftKey &&
      (key === "S" ||
        key === "s" ||
        key === "3" ||
        key === "4" ||
        key === "5" ||
        e.code === "Digit3" ||
        e.code === "Digit4" ||
        e.code === "Digit5")
    ) {
      e.preventDefault();
      e.stopPropagation();
      this.triggerScreenshotDefense();
      return false;
    }

    // 3. F12 DevTools
    if (key === "F12" || code === 123) {
      e.preventDefault();
      e.stopPropagation();
      this.triggerDevToolsDefense();
      return false;
    }

    // 4. Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
    // 5. Ctrl+Shift+J / Cmd+Option+J (Console)
    // 6. Ctrl+Shift+C / Cmd+Option+C (Element Inspector)
    if (
      isCtrlOrMeta &&
      e.shiftKey &&
      (key === "I" || key === "i" || key === "J" || key === "j" || key === "C" || key === "c")
    ) {
      e.preventDefault();
      e.stopPropagation();
      this.triggerDevToolsDefense();
      return false;
    }

    // 7. Ctrl+U / Cmd+Option+U (View Source)
    if (isCtrlOrMeta && (key === "u" || key === "U")) {
      e.preventDefault();
      e.stopPropagation();
      this.notify({
        type: "devtools",
        message: "Source view is disabled for intellectual property security.",
      });
      return false;
    }

    // 8. Ctrl+S / Cmd+S (Save Web Page / Media)
    if (isCtrlOrMeta && (key === "s" || key === "S")) {
      e.preventDefault();
      e.stopPropagation();
      this.notify({
        type: "copy",
        message: "Page and media saving are disabled.",
      });
      return false;
    }

    // 9. Ctrl+P / Cmd+P (Print Page)
    if (isCtrlOrMeta && (key === "p" || key === "P")) {
      e.preventDefault();
      e.stopPropagation();
      this.notify({
        type: "print",
        message: "Printing and PDF export of this platform are prohibited.",
      });
      return false;
    }
  }

  /**
   * Intercepts PrintScreen keyup to clear clipboard immediately.
   */
  private handleKeyUp(e: KeyboardEvent) {
    if (e.key === "PrintScreen" || (e.keyCode || e.which) === 44) {
      this.triggerScreenshotDefense();
    }
  }

  /**
   * Overwrite clipboard if someone attempts to copy sensitive content.
   */
  private handleCopy(e: ClipboardEvent) {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
      return;
    }

    try {
      if (e.clipboardData) {
        e.clipboardData.setData(
          "text/plain",
          "🔒 NINA KURAIN CONFIDENTIAL · All media and text are protected by copyright. Unauthorized reproduction is strictly prohibited."
        );
        e.preventDefault();
      }
    } catch (_) {}

    this.notify({
      type: "copy",
      message: "Copying protected content is not permitted.",
    });
  }

  /**
   * Triggers the Anti-Screenshot defense: Clears clipboard & engages instant blackout.
   */
  public triggerScreenshotDefense() {
    this.setBlackoutActive(true);
    this.poisonClipboard();

    this.notify({
      type: "screenshot",
      message: "Can't take screenshot due to security policy",
    });

    if (this.curtainTimer) clearTimeout(this.curtainTimer);
    this.curtainTimer = setTimeout(() => {
      if (document.hasFocus()) {
        this.setBlackoutActive(false);
      }
    }, 2200);
  }

  /**
   * Triggers DevTools defense when inspection shortcuts or tools are detected.
   */
  private triggerDevToolsDefense() {
    this.setBlackoutActive(true);
    this.notify({
      type: "devtools",
      message: "Developer inspection tools are disabled on this secure platform.",
    });

    if (this.curtainTimer) clearTimeout(this.curtainTimer);
    this.curtainTimer = setTimeout(() => {
      if (document.hasFocus()) {
        this.setBlackoutActive(false);
      }
    }, 1800);
  }

  /**
   * Detects docked DevTools window based on outer/inner dimension discrepancy.
   */
  private detectDevTools() {
    if (typeof window === "undefined") return;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    if (widthDiff > 170 || heightDiff > 170) {
      this.triggerDevToolsDefense();
    }
  }

  /**
   * Replaces clipboard with copyright notice and black image if available.
   */
  private poisonClipboard() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(
          "Can't take screenshot due to security policy"
        );
      }

      if (typeof window !== "undefined" && typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        const canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, 100, 100);
          canvas.toBlob((blob) => {
            if (blob) {
              const item = new ClipboardItem({ "image/png": blob });
              navigator.clipboard.write([item]).catch(() => {});
            }
          });
        }
      }
    } catch (_) {}
  }

  /**
   * When window loses focus (Snipping Tool, external screen grabber, Alt+Tab, mobile screenshot).
   */
  private handleWindowBlur() {
    this.setBlackoutActive(true);
    this.notify({
      type: "screenshot",
      message: "Can't take screenshot due to security policy",
    });
  }

  /**
   * When window regains focus.
   */
  private handleWindowFocus() {
    setTimeout(() => {
      if (document.hasFocus()) {
        this.setBlackoutActive(false);
      }
    }, 120);
  }

  /**
   * Mobile app switcher / navigation away.
   */
  private handlePageHide() {
    this.setBlackoutActive(true);
  }

  /**
   * Tab visibility changes (mobile backgrounding, desktop tab change).
   */
  private handleVisibilityChange() {
    if (document.visibilityState === "hidden") {
      this.setBlackoutActive(true);
    } else {
      setTimeout(() => {
        if (document.hasFocus()) {
          this.setBlackoutActive(false);
        }
      }, 120);
    }
  }

  /**
   * Activates or deactivates the zero-delay blackout shield at the root HTML level.
   */
  public setBlackoutActive(active: boolean) {
    if (typeof document === "undefined") return;

    if (active) {
      document.documentElement.classList.add("nk-screenshot-shield");
    } else {
      document.documentElement.classList.remove("nk-screenshot-shield");
    }

    const curtain = document.getElementById("nk-permanent-security-curtain");
    if (curtain) {
      if (active) {
        curtain.classList.add("is-active");
      } else {
        curtain.classList.remove("is-active");
      }
    }
  }

  /**
   * Hardens all video elements to prevent download button, PIP, or touch hold in mobile.
   */
  public hardenVideoElement(video: HTMLVideoElement) {
    try {
      video.setAttribute("controlsList", "nodownload nofullscreen noremoteplayback");
      video.setAttribute("disablePictureInPicture", "true");
      video.setAttribute("disableRemotePlayback", "true");
      video.draggable = false;
      (video as any).disablePictureInPicture = true;
      (video as any).disableRemotePlayback = true;

      video.oncontextmenu = (e) => {
        e.preventDefault();
        return false;
      };
      video.ondragstart = (e) => {
        e.preventDefault();
        return false;
      };
    } catch (_) {}
  }

  /**
   * Hardens all image elements to prevent drag/drop, touch hold, or right click save.
   */
  public hardenImageElement(img: HTMLImageElement) {
    try {
      img.draggable = false;
      img.setAttribute("draggable", "false");
      img.oncontextmenu = (e) => {
        e.preventDefault();
        return false;
      };
      img.ondragstart = (e) => {
        e.preventDefault();
        return false;
      };
    } catch (_) {}
  }

  /**
   * Scans and hardens all media currently in the DOM.
   */
  public hardenAllMedia() {
    if (typeof document === "undefined") return;

    document.querySelectorAll<HTMLVideoElement>("video").forEach((v) => this.hardenVideoElement(v));
    document.querySelectorAll<HTMLImageElement>("img").forEach((i) => this.hardenImageElement(i));
  }

  /**
   * Monitors DOM for newly inserted video or image elements and auto-hardens them.
   */
  private setupMutationObserver() {
    if (typeof MutationObserver === "undefined" || typeof document === "undefined") return;

    this.observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const el = node as HTMLElement;
              if (el.tagName === "VIDEO") {
                this.hardenVideoElement(el as HTMLVideoElement);
              } else if (el.tagName === "IMG") {
                this.hardenImageElement(el as HTMLImageElement);
              }

              el.querySelectorAll?.<HTMLVideoElement>("video").forEach((v) => this.hardenVideoElement(v));
              el.querySelectorAll?.<HTMLImageElement>("img").forEach((i) => this.hardenImageElement(i));
            }
          });
        }
      }
    });

    this.observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  private emitConsoleSecurityNotice() {
    try {
      const titleStyle = "color: #ff3366; font-size: 16px; font-weight: bold;";
      const bodyStyle = "color: #e0b0bc; font-size: 11px;";
      console.log("%c🔒 NINA KURAIN ADVANCED MOBILE & ANTI-CAMERA SECURITY PROTOCOL ACTIVE", titleStyle);
      console.log(
        "%cAll digital media, portraiture, cinematics, and site assets are protected by real-time client security guards. Unauthorized capture, inspection, scraping, or distribution is prohibited.",
        bodyStyle
      );
    } catch (_) {}
  }
}

export const securityEngine = SecurityEngine.getInstance();
export const initContentProtection = () => securityEngine.init();
