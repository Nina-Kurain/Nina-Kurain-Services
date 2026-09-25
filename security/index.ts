/**
 * ============================================================================
 * NINA KURAIN PERMANENT SECURITY MODULE
 * PATH: /security/index.ts
 * 
 * CRITICAL DIRECTIVE:
 * THIS FOLDER AND MODULE ARE PERMANENT APPLICATION SECURITY INFRASTRUCTURE.
 * DO NOT REMOVE, OVERRIDE, OR WEAKEN IN ANY FUTURE APPLICATION UPDATE.
 * ============================================================================
 */

export { SecurityGuard, default } from "./SecurityGuard";
export { securityEngine, initContentProtection, type SecurityEventDetail } from "./anti-copy";
export {
  ProtectedImage,
  ProtectedVideo,
  ProtectedNextImage,
  PrivateMediaMark,
} from "./ProtectedMedia";
export { MobileAppGate } from "./MobileAppGate";
