import {
  Input,
  Output,
  BlobSource,
  BufferTarget,
  Mp4OutputFormat,
  Conversion,
  ALL_FORMATS,
} from "mediabunny";
import type { VideoTimelineState, ToneAdjustments, EditorTextLayer } from "./editor-types";

export interface VideoMetadata {
  duration: number; // seconds
  width: number;
  height: number;
  hasAudio: boolean;
}

/**
 * Load HTMLVideoElement and read basic metadata (duration, resolution).
 */
export function getVideoMetadata(source: File | Blob | string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    let isRevocable = typeof source !== "string";

    video.onloadedmetadata = () => {
      const metadata: VideoMetadata = {
        duration: video.duration || 0,
        width: video.videoWidth || 1080,
        height: video.videoHeight || 1920,
        hasAudio: (video as any).mozHasAudio || Boolean((video as any).webkitAudioDecodedByteCount) || true,
      };
      if (isRevocable) URL.revokeObjectURL(url);
      resolve(metadata);
    };

    video.onerror = () => {
      if (isRevocable) URL.revokeObjectURL(url);
      reject(new Error("Unable to read video metadata."));
    };

    video.src = url;
  });
}

/**
 * Capture a frame-accurate cover thumbnail at any second timestamp.
 */
export function captureFrameAtTimestamp(
  source: File | Blob | string,
  timestampSec: number,
  targetWidth = 1080,
  targetHeight = 1920
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const isRevocable = typeof source !== "string";

    let hasResolved = false;

    const cleanUp = () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (isRevocable) URL.revokeObjectURL(url);
    };

    video.onloadedmetadata = () => {
      const boundedTime = Math.max(0, Math.min(timestampSec, (video.duration || 1) - 0.05));
      video.currentTime = boundedTime;
    };

    video.onseeked = () => {
      if (hasResolved) return;
      hasResolved = true;

      try {
        const canvas = document.createElement("canvas");
        const vw = video.videoWidth || targetWidth;
        const vh = video.videoHeight || targetHeight;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanUp();
          reject(new Error("Could not create canvas context"));
          return;
        }

        // Draw center cover
        const scale = Math.max(targetWidth / vw, targetHeight / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        const dx = (targetWidth - dw) / 2;
        const dy = (targetHeight - dh) / 2;

        ctx.drawImage(video, dx, dy, dw, dh);

        canvas.toBlob(
          (blob) => {
            cleanUp();
            if (blob) resolve(blob);
            else reject(new Error("Failed to encode frame thumbnail"));
          },
          "image/jpeg",
          0.92
        );
      } catch (err) {
        cleanUp();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanUp();
      reject(new Error("Could not seek video frame"));
    };

    video.src = url;
  });
}

/**
 * Client-side video processing with Mediabunny.
 * Trims, converts, and re-packages into a clean web-ready MP4.
 */
export async function processVideoWithMediabunny(
  file: File,
  timeline: VideoTimelineState,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  onProgress?.(5);

  try {
    const input = new Input({
      source: new BlobSource(file),
      formats: ALL_FORMATS,
    });

    const target = new BufferTarget();
    const output = new Output({
      target,
      format: new Mp4OutputFormat(),
    });

    const conversion = await Conversion.init({
      input,
      output,
    });

    conversion.onProgress = (progress: number) => {
      // progress is 0.0 - 1.0
      const pct = Math.round(progress * 85) + 5;
      onProgress?.(pct);
    };

    await conversion.execute();
    onProgress?.(95);

    const buffer = target.buffer;
    if (!buffer || buffer.byteLength === 0) {
      throw new Error("Mediabunny produced an empty video buffer");
    }

    const outputBlob = new Blob([buffer], { type: "video/mp4" });
    onProgress?.(100);
    return outputBlob;
  } catch (err) {
    console.warn("[Mediabunny] Direct conversion error, falling back to trimmed canvas recording:", err);
    // Fallback: Canvas-based stream rendering
    return processVideoCanvasFallback(file, timeline, onProgress);
  }
}

/**
 * Fallback: Frame-by-frame canvas rendering to MediaRecorder MP4/WebM.
 */
export function processVideoCanvasFallback(
  file: File,
  timeline: VideoTimelineState,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = timeline.muted;
    video.volume = timeline.volume ?? 1;
    video.playbackRate = timeline.playbackRate || 1;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      const startTime = timeline.trimStart || 0;
      const endTime = timeline.trimEnd > startTime ? timeline.trimEnd : video.duration;
      const totalDuration = endTime - startTime;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context creation failed"));
        return;
      }

      const stream = canvas.captureStream(30);

      // Add audio track if available and not muted
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const sourceNode = audioCtx.createMediaElementSource(video);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = timeline.muted ? 0 : (timeline.volume ?? 1);
        const destNode = audioCtx.createMediaStreamDestination();
        sourceNode.connect(gainNode);
        gainNode.connect(destNode);
        const audioTrack = destNode.stream.getAudioTracks()[0];
        if (audioTrack && !timeline.muted) {
          stream.addTrack(audioTrack);
        }
      } catch (e) {
        console.warn("[Video Engine] Could not capture audio track:", e);
      }

      let mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm; codecs=vp9';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6000000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        URL.revokeObjectURL(url);
        const blob = new Blob(chunks, { type: mimeType.split(";")[0] });
        onProgress?.(100);
        resolve(blob);
      };

      let animationId: number;
      const drawFrame = () => {
        if (video.currentTime >= endTime || video.ended) {
          recorder.stop();
          cancelAnimationFrame(animationId);
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const elapsed = Math.max(0, video.currentTime - startTime);
        const progress = Math.min(100, Math.round((elapsed / totalDuration) * 90));
        onProgress?.(progress);

        animationId = requestAnimationFrame(drawFrame);
      };

      video.currentTime = startTime;
      video.onseeked = () => {
        recorder.start(100);
        video.play().then(() => {
          animationId = requestAnimationFrame(drawFrame);
        }).catch(reject);
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Video playback error during export"));
    };
  });
}
