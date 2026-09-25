"use client";

import { forwardRef, type ImgHTMLAttributes, type SyntheticEvent, type VideoHTMLAttributes } from "react";
import Image, { type ImageProps } from "next/image";

function blockAction(event: SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

/**
 * ============================================================================
 * NINA KURAIN PROTECTED VIDEO
 * PATH: /security/ProtectedMedia.tsx
 * 
 * Enforces Chrome & Safari media hardening:
 * - Disables download controls in Chrome
 * - Disables Picture-in-Picture
 * - Disables Remote Playback / Casting
 * - Disables right-click and dragging
 * ============================================================================
 */
export const ProtectedVideo = forwardRef<HTMLVideoElement, VideoHTMLAttributes<HTMLVideoElement>>(
  function ProtectedVideo(props, ref) {
    return (
      <div className="nk-protected-wrapper" style={{ width: "100%", height: "100%", position: "relative" }}>
        <video
          ref={ref}
          {...props}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          draggable={false}
          onContextMenu={blockAction}
          onDragStart={blockAction}
          style={{ ...props.style, pointerEvents: "auto" }}
        />
      </div>
    );
  }
);

/**
 * ============================================================================
 * NINA KURAIN PROTECTED IMAGE (HTML IMG)
 * ============================================================================
 */
export const ProtectedImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  function ProtectedImage(props, ref) {
    return (
      <div className="nk-protected-wrapper" style={{ width: "100%", height: "100%", position: "relative" }}>
        <img
          ref={ref}
          {...props}
          draggable={false}
          onContextMenu={blockAction}
          onDragStart={blockAction}
        />
        {/* Invisible protective overlay shield */}
        <div
          className="nk-media-shield"
          aria-hidden="true"
          onContextMenu={blockAction}
          onDragStart={blockAction}
        />
      </div>
    );
  }
);

/**
 * ============================================================================
 * NINA KURAIN PROTECTED NEXT IMAGE (Next.js Image)
 * ============================================================================
 */
export function ProtectedNextImage(props: ImageProps) {
  const { className, style, ...rest } = props;
  return (
    <div className={`nk-protected-wrapper ${className || ""}`} style={{ position: "relative", ...style }}>
      <Image
        {...rest}
        draggable={false}
        onContextMenu={blockAction}
        onDragStart={blockAction}
      />
      <div
        className="nk-media-shield"
        aria-hidden="true"
        onContextMenu={blockAction}
        onDragStart={blockAction}
      />
    </div>
  );
}

/**
 * Member watermark mark
 */
export function PrivateMediaMark() {
  return (
    <span className="private-media-mark" aria-hidden="true">
      NINA KURAIN · PROTECTED SECURE ASSET
    </span>
  );
}
