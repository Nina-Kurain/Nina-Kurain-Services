"use client";

import { forwardRef, type ImgHTMLAttributes, type SyntheticEvent, type VideoHTMLAttributes } from "react";

function blockMediaAction(event: SyntheticEvent) {
  event.preventDefault();
}

export const ProtectedVideo = forwardRef<HTMLVideoElement, VideoHTMLAttributes<HTMLVideoElement>>(
  function ProtectedVideo({ playsInline = true, src, onLoadedMetadata, ...props }, ref) {
    const finalSrc =
      typeof src === "string" && src && !src.includes("#") && props.muted && !props.controls
        ? `${src}#t=0.001`
        : src;

    const handleLoadedMetadata = (e: SyntheticEvent<HTMLVideoElement>) => {
      const v = e.currentTarget;
      if (v.muted && !v.autoplay && v.currentTime === 0) {
        try {
          v.currentTime = 0.001;
        } catch (_) {}
      }
      onLoadedMetadata?.(e);
    };

    return (
      <video
        ref={ref}
        playsInline={playsInline}
        src={finalSrc}
        onLoadedMetadata={handleLoadedMetadata}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        draggable={false}
        onContextMenu={blockMediaAction}
        onDragStart={blockMediaAction}
        {...props}
      />
    );
  }
);

export const ProtectedImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  function ProtectedImage(props, ref) {
    return (
      <img
        ref={ref}
        alt={props.alt || ""}
        {...props}
        draggable={false}
        onContextMenu={blockMediaAction}
        onDragStart={blockMediaAction}
      />
    );
  }
);

export function PrivateMediaMark() {
  return <span className="private-media-mark" aria-hidden="true">NINA KURAIN · PRIVATE MEMBER VIEW</span>;
}
