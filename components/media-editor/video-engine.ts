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
export function buildVideoFilterString(
  adjustments?: ToneAdjustments,
  filterId?: string,
  filterIntensity = 100
): string {
  const parts: string[] = [];
  if (adjustments) {
    if (adjustments.exposure) parts.push(`brightness(${1 + adjustments.exposure / 100})`);
    if (adjustments.contrast) parts.push(`contrast(${1 + adjustments.contrast / 100})`);
    if (adjustments.saturation) parts.push(`saturate(${1 + adjustments.saturation / 100})`);
    if (adjustments.warmth) parts.push(`sepia(${Math.max(0, adjustments.warmth) / 200})`);
  }
  if (filterId && filterId !== "normal" && filterId !== "original") {
    if (filterId === "bw" || filterId === "noir" || filterId === "monochrome") {
      parts.push(`grayscale(${filterIntensity / 100})`);
    } else if (filterId === "sepia" || filterId === "vintage") {
      parts.push(`sepia(${filterIntensity / 100})`);
    } else if (filterId === "warm" || filterId === "golden") {
      parts.push(`sepia(${(filterIntensity / 100) * 0.4}) saturate(${1 + (filterIntensity / 100) * 0.3})`);
    } else if (filterId === "cool" || filterId === "moody") {
      parts.push(`hue-rotate(190deg) contrast(${1 + (filterIntensity / 100) * 0.2})`);
    } else if (filterId === "vibrant" || filterId === "boost") {
      parts.push(`saturate(${1 + (filterIntensity / 100) * 0.6}) contrast(1.1)`);
    }
  }
  return parts.length ? parts.join(" ") : "none";
}

/**
 * Client-side video processing with Mediabunny or Canvas Fallback.
 * Trims, applies tone adjustments, and re-packages into a clean web-ready MP4.
 */
export async function processVideoWithMediabunny(
  file: File,
  timeline: VideoTimelineState,
  onProgress?: (pct: number) => void,
  adjustments?: ToneAdjustments,
  filterId?: string,
  filterIntensity?: number
): Promise<Blob> {
  onProgress?.(5);

  const hasFilters = Boolean(filterId && filterId !== "normal") || Boolean(adjustments && (adjustments.exposure || adjustments.contrast || adjustments.saturation || adjustments.warmth));
  const hasTrim = Boolean(timeline.trimStart > 0 || (timeline.trimEnd > 0 && timeline.trimEnd < 99999));

  // If there are filters or trims, use the frame-accurate canvas renderer with audio preservation
  if (hasFilters || hasTrim) {
    return processVideoCanvasFallback(file, timeline, onProgress, adjustments, filterId, filterIntensity);
  }

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
    return processVideoCanvasFallback(file, timeline, onProgress, adjustments, filterId, filterIntensity);
  }
}

/**
 * Frame-by-frame canvas rendering to MediaRecorder MP4/WebM with live filters & trim.
 */
export function processVideoCanvasFallback(
  file: File,
  timeline: VideoTimelineState,
  onProgress?: (pct: number) => void,
  adjustments?: ToneAdjustments,
  filterId?: string,
  filterIntensity?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.src = url;
    // Always mute element to guarantee playback is never blocked by browser autoplay policy
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const filterString = buildVideoFilterString(adjustments, filterId, filterIntensity);

    video.onloadedmetadata = async () => {
      const startTime = Math.max(0, timeline.trimStart || 0);
      const endTime = (timeline.trimEnd > startTime && timeline.trimEnd <= video.duration) ? timeline.trimEnd : video.duration;
      const totalDuration = Math.max(0.1, endTime - startTime);

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1920;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context creation failed"));
        return;
      }

      const stream = canvas.captureStream(30);

      // Preserve audio via AudioContext destination
      let audioCtx: AudioContext | null = null;
      try {
        if (!timeline.muted) {
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const sourceNode = audioCtx.createMediaElementSource(video);
          const gainNode = audioCtx.createGain();
          gainNode.gain.value = timeline.volume ?? 1;
          const destNode = audioCtx.createMediaStreamDestination();
          sourceNode.connect(gainNode);
          gainNode.connect(destNode);
          const audioTrack = destNode.stream.getAudioTracks()[0];
          if (audioTrack) {
            stream.addTrack(audioTrack);
          }
        }
      } catch (e) {
        console.warn("[Video Engine] Audio track capture not supported in this context, exporting visual:", e);
      }

      let mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm; codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6000000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      let isFinished = false;
      const finishExport = () => {
        if (isFinished) return;
        isFinished = true;
        try {
          if (recorder.state === "recording") recorder.stop();
        } catch (_) {}
      };

      recorder.onstop = () => {
        URL.revokeObjectURL(url);
        if (audioCtx) {
          audioCtx.close().catch(() => {});
        }
        const blob = new Blob(chunks, { type: mimeType.split(";")[0] });
        onProgress?.(100);
        resolve(blob);
      };

      let animationId: number;
      const drawFrame = () => {
        if (isFinished) return;

        if (video.currentTime >= endTime || video.ended) {
          cancelAnimationFrame(animationId);
          finishExport();
          return;
        }

        // Apply filters directly to canvas frame
        if (filterString !== "none") {
          ctx.filter = filterString;
        } else {
          ctx.filter = "none";
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const elapsed = Math.max(0, video.currentTime - startTime);
        const progress = Math.min(96, Math.round((elapsed / totalDuration) * 90) + 5);
        onProgress?.(progress);

        animationId = requestAnimationFrame(drawFrame);
      };

      let hasStarted = false;
      const startRecording = () => {
        if (hasStarted || isFinished) return;
        hasStarted = true;
        try {
          recorder.start(100);
          video.play().then(() => {
            animationId = requestAnimationFrame(drawFrame);
          }).catch((err) => {
            console.warn("[Video Engine] Playback failed, rendering single frame fallback:", err);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            finishExport();
          });
        } catch (err) {
          finishExport();
        }
      };

      video.onseeked = startRecording;

      if (startTime > 0.05) {
        video.currentTime = startTime;
      } else {
        // If start time is 0, start immediately as seeked won't fire
        startRecording();
      }

      // Fallback timeout in case video stalls
      setTimeout(() => {
        if (!isFinished) {
          console.warn("[Video Engine] Export timed out, finalizing buffer");
          finishExport();
        }
      }, Math.max(10000, totalDuration * 3000));
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Video playback error during export"));
    };
  });
}
