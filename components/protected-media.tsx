"use client";

import { forwardRef, type ImgHTMLAttributes, type SyntheticEvent, type VideoHTMLAttributes } from "react";

function blockMediaAction(event: SyntheticEvent) {
  event.preventDefault();
}

export const ProtectedVideo = forwardRef<HTMLVideoElement, VideoHTMLAttributes<HTMLVideoElement>>(
  function ProtectedVideo(props, ref) {
    return (
      <video
        ref={ref}
        {...props}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        draggable={false}
        onContextMenu={blockMediaAction}
        onDragStart={blockMediaAction}
      />
    );
  }
);

export const ProtectedImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  function ProtectedImage(props, ref) {
    return (
      <img
        ref={ref}
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
