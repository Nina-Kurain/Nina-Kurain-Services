import {
  Input,
  Output,
  BlobSource,
  BufferTarget,
  Mp4OutputFormat,
  Conversion,
  ALL_FORMATS,
} from "mediabunny";
import type { VideoTimelineState, ToneAdjustments, EditorTextLayer, TransformState } from "./editor-types";
import { FILTER_PRESETS } from "./filter-presets";

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
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const isRevocable = typeof source !== "string";
    let hasResolved = false;

    const finish = (metadata: VideoMetadata) => {
      if (hasResolved) return;
      hasResolved = true;
      if (isRevocable) URL.revokeObjectURL(url);
      resolve(metadata);
    };

    video.onloadedmetadata = () => {
      const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 15;
      finish({
        duration: dur,
        width: video.videoWidth || 1080,
        height: video.videoHeight || 1920,
        hasAudio: true,
      });
    };

    video.onloadeddata = () => {
      const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 15;
      finish({
        duration: dur,
        width: video.videoWidth || 1080,
        height: video.videoHeight || 1920,
        hasAudio: true,
      });
    };

    video.onerror = () => {
      finish({
        duration: 15,
        width: 1080,
        height: 1920,
        hasAudio: true,
      });
    };

    // 2.5s safety timeout - guarantee resolve so editor never freezes
    setTimeout(() => {
      if (!hasResolved) {
        finish({
          duration: Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 15,
          width: video.videoWidth || 1080,
          height: video.videoHeight || 1920,
          hasAudio: true,
        });
      }
    }, 2500);

    video.src = url;
    try {
      video.load();
    } catch (_) {}
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

    const renderFrame = () => {
      if (hasResolved) return;
      if (!video.videoWidth || !video.videoHeight) return;
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
            if (blob && blob.size > 0) resolve(blob);
            else reject(new Error("Failed to encode frame thumbnail"));
          },
          "image/jpeg",
          0.9
        );
      } catch (err) {
        cleanUp();
        reject(err);
      }
    };

    video.onseeked = () => {
      renderFrame();
    };

    video.onloadeddata = () => {
      if (video.readyState >= 2 && !hasResolved) {
        renderFrame();
      }
    };

    video.onloadedmetadata = () => {
      const seekTarget = Math.max(0.05, Math.min(timestampSec || 0.1, (video.duration || 1) - 0.05));
      video.currentTime = seekTarget;
    };

    video.onerror = () => {
      cleanUp();
      reject(new Error("Could not seek video frame"));
    };

    // Safety timeout so video frame extraction never hangs permanently
    setTimeout(() => {
      if (!hasResolved) {
        if (video.videoWidth > 0) {
          renderFrame();
        } else {
          cleanUp();
          reject(new Error("Video thumbnail capture timed out"));
        }
      }
    }, 4000);

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

  // 1. Tone Adjustments (brightness, contrast, saturation, warmth, fade)
  if (adjustments) {
    const totalBrightness = (adjustments.brightness || 0) + (adjustments.exposure || 0);
    if (totalBrightness !== 0) {
      parts.push(`brightness(${1 + totalBrightness / 100})`);
    }
    if (adjustments.contrast) {
      parts.push(`contrast(${1 + adjustments.contrast / 100})`);
    }
    if (adjustments.saturation) {
      parts.push(`saturate(${1 + adjustments.saturation / 100})`);
    }
    if (adjustments.warmth) {
      if (adjustments.warmth > 0) {
        parts.push(`sepia(${adjustments.warmth / 200}) saturate(${1 + adjustments.warmth / 300})`);
      } else {
        parts.push(`hue-rotate(${adjustments.warmth * 0.4}deg) saturate(${1 + Math.abs(adjustments.warmth) / 400})`);
      }
    }
    if (adjustments.fade) {
      parts.push(`contrast(${Math.max(0.2, 1 - adjustments.fade / 250)}) brightness(${1 + adjustments.fade / 350})`);
    }
  }

  // 2. Filter Presets (Lookup from FILTER_PRESETS array)
  if (filterId && filterId !== "normal" && filterId !== "original") {
    const preset = FILTER_PRESETS.find((p) => p.id === filterId);
    if (preset && typeof preset.cssFilter === "function") {
      const css = preset.cssFilter((filterIntensity ?? 100) / 100);
      if (css && css !== "none") {
        parts.push(css);
      }
    } else {
      // Fallback for custom filter tags
      if (filterId === "bw" || filterId === "noir" || filterId === "monochrome" || filterId === "inkwell" || filterId === "moon") {
        parts.push(`grayscale(${(filterIntensity ?? 100) / 100}) contrast(1.15)`);
      } else if (filterId === "sepia" || filterId === "vintage") {
        parts.push(`sepia(${(filterIntensity ?? 100) / 100})`);
      } else if (filterId === "warm" || filterId === "golden") {
        parts.push(`sepia(${((filterIntensity ?? 100) / 100) * 0.4}) saturate(${1 + ((filterIntensity ?? 100) / 100) * 0.3})`);
      } else if (filterId === "cool" || filterId === "moody") {
        parts.push(`hue-rotate(190deg) contrast(${1 + ((filterIntensity ?? 100) / 100) * 0.2})`);
      } else if (filterId === "vibrant" || filterId === "boost") {
        parts.push(`saturate(${1 + ((filterIntensity ?? 100) / 100) * 0.6}) contrast(1.1)`);
      }
    }
  }

  return parts.length ? parts.join(" ") : "none";
}

/**
 * Client-side video processing with Mediabunny or Canvas Fallback.
 * Trims, crops, applies tone adjustments and filters, and re-packages into a clean web-ready MP4.
 */
export async function processVideoWithMediabunny(
  file: File,
  timeline: VideoTimelineState,
  onProgress?: (pct: number) => void,
  adjustments?: ToneAdjustments,
  filterId?: string,
  filterIntensity?: number,
  transform?: TransformState
): Promise<Blob> {
  onProgress?.(5);

  const hasFilters = Boolean(filterId && filterId !== "normal" && filterId !== "original") ||
    Boolean(adjustments && (
      Math.abs((adjustments.brightness || 0) + (adjustments.exposure || 0)) > 1 ||
      Math.abs(adjustments.contrast || 0) > 1 ||
      Math.abs(adjustments.saturation || 0) > 1 ||
      Math.abs(adjustments.warmth || 0) > 1 ||
      Math.abs(adjustments.fade || 0) > 1
    ));

  const hasTrim = Boolean(
    (timeline.trimStart && timeline.trimStart > 0.1) ||
    (timeline.duration > 0 && timeline.trimEnd > 0 && (timeline.duration - timeline.trimEnd) > 0.3)
  );

  const hasAudioMod = Boolean(timeline.muted || (timeline.volume !== undefined && timeline.volume !== 1));
  const hasSpeedMod = Boolean(timeline.playbackRate !== undefined && timeline.playbackRate !== 1);

  const hasTransform = Boolean(
    transform && (
      (transform.aspectRatio && transform.aspectRatio !== "original") ||
      (transform.zoom && transform.zoom > 1.02) ||
      (transform.rotation && transform.rotation !== 0) ||
      (transform.straighten && Math.abs(transform.straighten) > 0.5) ||
      transform.flipH ||
      transform.flipV ||
      (transform.x && Math.abs(transform.x) > 0.02) ||
      (transform.y && Math.abs(transform.y) > 0.02)
    )
  );

  // If untrimmed, no filters, standard speed, no audio modification, and no transforms:
  // Return the raw video file directly.
  if (!hasFilters && !hasTrim && !hasAudioMod && !hasSpeedMod && !hasTransform) {
    onProgress?.(100);
    return file;
  }

  // Render video with edits and aspect crop applied
  return await processVideoCanvasFallback(file, timeline, onProgress, adjustments, filterId, filterIntensity, transform);
}

/**
 * Frame-by-frame canvas rendering to MediaRecorder MP4/WebM with live filters, aspect ratio cropping & trim.
 * Safely falls back to returning the source file if client environment lacks MediaRecorder / captureStream.
 */
export function processVideoCanvasFallback(
  file: File,
  timeline: VideoTimelineState,
  onProgress?: (pct: number) => void,
  adjustments?: ToneAdjustments,
  filterId?: string,
  filterIntensity?: number,
  transform?: TransformState
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If running in SSR or headless environment, resolve raw file
    if (typeof window === "undefined" || typeof document === "undefined") {
      onProgress?.(100);
      resolve(file);
      return;
    }

    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const filterString = buildVideoFilterString(adjustments, filterId, filterIntensity);

    let isFinished = false;
    let audioCtx: AudioContext | null = null;
    let watchdogTimer: any = null;
    let loadWatchdog: any = null;

    const safeCleanUp = () => {
      if (loadWatchdog) {
        clearTimeout(loadWatchdog);
        loadWatchdog = null;
      }
      if (watchdogTimer) {
        clearInterval(watchdogTimer);
        watchdogTimer = null;
      }
      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch (_) {}
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
      if (audioCtx) {
        try {
          audioCtx.close().catch(() => {});
        } catch (_) {}
      }
    };

    // If metadata fails to load within 7 seconds, reject with error
    loadWatchdog = setTimeout(() => {
      if (!isFinished) {
        console.warn("[Video Engine] Video metadata load timed out");
        isFinished = true;
        safeCleanUp();
        reject(new Error("Video metadata load timed out during export"));
      }
    }, 7000);

    video.onerror = () => {
      if (isFinished) return;
      console.warn("[Video Engine] Video load error during processing");
      isFinished = true;
      safeCleanUp();
      reject(new Error("Video decoding error occurred during export processing"));
    };

    video.onloadedmetadata = async () => {
      if (isFinished) return;
      if (loadWatchdog) {
        clearTimeout(loadWatchdog);
        loadWatchdog = null;
      }

      const startTime = Math.max(0, timeline.trimStart || 0);
      const endTime = (timeline.trimEnd > startTime && timeline.trimEnd <= video.duration) ? timeline.trimEnd : video.duration;
      const totalDuration = Math.max(0.1, endTime - startTime);

      const canvas = document.createElement("canvas");
      let targetW = video.videoWidth || 1080;
      let targetH = video.videoHeight || 1920;
      if (transform?.aspectRatio && transform.aspectRatio !== "original") {
        let r = 9 / 16;
        if (transform.aspectRatio === "1:1") r = 1;
        else if (transform.aspectRatio === "4:5") r = 4 / 5;
        else if (transform.aspectRatio === "16:9") r = 16 / 9;
        else if (transform.aspectRatio === "9:16") r = 9 / 16;

        if (r <= 1) {
          targetH = Math.max(1080, video.videoHeight || 1080);
          targetW = Math.round(targetH * r);
        } else {
          targetW = Math.max(1080, video.videoWidth || 1080);
          targetH = Math.round(targetW / r);
        }
      }
      if (targetW % 2 !== 0) targetW += 1;
      if (targetH % 2 !== 0) targetH += 1;
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // Check for canvas stream capture capability (iOS Safari / mobile WebKit support check)
      const captureStreamFn = (canvas as any).captureStream || (canvas as any).webkitCaptureStream;
      if (!ctx || typeof captureStreamFn !== "function" || typeof MediaRecorder === "undefined") {
        console.warn("[Video Engine] Canvas captureStream or MediaRecorder not supported on this platform, returning original file");
        isFinished = true;
        safeCleanUp();
        onProgress?.(100);
        resolve(file);
        return;
      }

      let stream: MediaStream | null = null;
      try {
        stream = captureStreamFn.call(canvas, 30);
      } catch (err) {
        console.warn("[Video Engine] Failed to obtain canvas stream:", err);
        isFinished = true;
        safeCleanUp();
        onProgress?.(100);
        resolve(file);
        return;
      }

      if (!stream) {
        isFinished = true;
        safeCleanUp();
        onProgress?.(100);
        resolve(file);
        return;
      }

      // Preserve audio via AudioContext destination if unmuted
      try {
        if (!timeline.muted && (window.AudioContext || (window as any).webkitAudioContext)) {
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
        console.warn("[Video Engine] Audio track capture not supported in this context, continuing with visual:", e);
      }

      // Negotiate best supported container / codec
      let mimeType = "";
      const candidates = [
        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
        "video/mp4",
        "video/webm; codecs=vp9,opus",
        "video/webm; codecs=vp8,opus",
        "video/webm",
      ];
      for (const c of candidates) {
        try {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) {
            mimeType = c;
            break;
          }
        } catch (_) {}
      }

      let recorder: MediaRecorder;
      try {
        const recorderOptions: MediaRecorderOptions = { videoBitsPerSecond: 6000000 };
        if (mimeType) {
          recorderOptions.mimeType = mimeType;
        }
        recorder = new MediaRecorder(stream, recorderOptions);
      } catch (err) {
        console.warn("[Video Engine] MediaRecorder constructor failed, using original file:", err);
        isFinished = true;
        safeCleanUp();
        onProgress?.(100);
        resolve(file);
        return;
      }

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const finishExport = () => {
        if (isFinished) return;
        isFinished = true;
        try {
          if (recorder.state === "recording") {
            recorder.stop();
          } else {
            handleStop();
          }
        } catch (_) {
          handleStop();
        }
      };

      const handleStop = () => {
        safeCleanUp();
        if (chunks.length === 0) {
          console.warn("[Video Engine] Empty recorded chunks");
          reject(new Error("Video recording produced empty output. Check video format or browser codec support."));
          return;
        }

        const totalBytes = chunks.reduce((acc, c) => acc + c.size, 0);
        if (totalBytes === 0) {
          console.warn("[Video Engine] 0 byte recording");
          reject(new Error("Video recording produced 0 bytes output."));
          return;
        }

        const effectiveType = mimeType ? mimeType.split(";")[0] : "video/mp4";
        const blob = new Blob(chunks, { type: effectiveType });
        onProgress?.(100);
        resolve(blob);
      };

      recorder.onstop = handleStop;
      recorder.onerror = (e) => {
        console.warn("[Video Engine] MediaRecorder runtime error:", e);
        finishExport();
      };

      let animationId: number;
      const drawFrame = () => {
        if (isFinished) return;

        if (video.currentTime >= (endTime - 0.05) || video.ended) {
          cancelAnimationFrame(animationId);
          finishExport();
          return;
        }

        ctx.save();
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply filters directly to canvas frame
        if (filterString !== "none") {
          ctx.filter = filterString;
        } else {
          ctx.filter = "none";
        }

        try {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          const rot = (((transform?.rotation || 0) + (transform?.straighten || 0)) * Math.PI) / 180;
          if (rot !== 0) ctx.rotate(rot);

          const zoom = Math.max(0.2, transform?.zoom || 1);
          const scaleX = (transform?.flipH ? -1 : 1) * zoom;
          const scaleY = (transform?.flipV ? -1 : 1) * zoom;
          ctx.scale(scaleX, scaleY);

          const panX = (transform?.x || 0) * canvas.width;
          const panY = (transform?.y || 0) * canvas.height;

          const vidW = video.videoWidth || canvas.width;
          const vidH = video.videoHeight || canvas.height;
          const videoRatio = vidW / vidH;
          const canvasRatio = canvas.width / canvas.height;
          let drawW = canvas.width;
          let drawH = canvas.height;
          if (videoRatio > canvasRatio) {
            drawH = canvas.height;
            drawW = drawH * videoRatio;
          } else {
            drawW = canvas.width;
            drawH = drawW / videoRatio;
          }

          ctx.drawImage(video, -drawW / 2 + panX, -drawH / 2 + panY, drawW, drawH);
        } catch (_) {}
        ctx.restore();

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
          try {
            if (timeline.playbackRate && Number.isFinite(timeline.playbackRate) && timeline.playbackRate > 0) {
              video.playbackRate = timeline.playbackRate;
            }
          } catch (_) {}
          video.play()
            .then(() => {
              animationId = requestAnimationFrame(drawFrame);
              // Watchdog in case requestAnimationFrame is throttled in inactive background tab
              watchdogTimer = setInterval(() => {
                if (isFinished) {
                  if (watchdogTimer) clearInterval(watchdogTimer);
                  return;
                }
                if (video.ended || video.currentTime >= endTime - 0.05) {
                  if (watchdogTimer) clearInterval(watchdogTimer);
                  cancelAnimationFrame(animationId);
                  finishExport();
                }
              }, 250);
            })
            .catch((err) => {
              console.warn("[Video Engine] Playback failed during recording, rendering static frame fallback:", err);
              try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              } catch (_) {}
              finishExport();
            });
        } catch (err) {
          console.warn("[Video Engine] recorder.start() failed, falling back to original file:", err);
          finishExport();
        }
      };

      video.onseeked = startRecording;

      if (startTime > 0.05) {
        try {
          video.currentTime = startTime;
        } catch (_) {
          startRecording();
        }
      } else {
        startRecording();
      }

      // Hard safety timeout so export never hangs permanently
      setTimeout(() => {
        if (!isFinished) {
          console.warn("[Video Engine] Export timed out, finalizing buffer");
          finishExport();
        }
      }, Math.max(8000, totalDuration * 2500));
    };
  });
}
