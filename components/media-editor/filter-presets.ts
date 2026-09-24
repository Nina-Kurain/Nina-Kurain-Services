export type AspectRatioType = "original" | "1:1" | "4:5" | "16:9" | "9:16";

export interface FilterPreset {
  id: string;
  name: string;
  category: "classic" | "vintage" | "monochrome" | "cinematic" | "creative";
  cssFilter: (intensity: number) => string;
  // Canvas tone adjustments
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  warmth: number; // -100 to 100
  sepia: number; // 0 to 100
  hueRotate: number; // -180 to 180
  vignette: number; // 0 to 100
  fade: number; // 0 to 100
}

export interface Adjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  warmth: number; // -100 to 100
  fade: number; // 0 to 100
  vignette: number; // 0 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  sharpen: number; // 0 to 100
}

export interface TransformState {
  aspectRatio: AspectRatioType;
  zoom: number; // 1 to 3
  x: number; // 0 to 1 (center offset)
  y: number; // 0 to 1 (center offset)
  rotation: number; // 0, 90, 180, 270
  straighten: number; // -45 to 45
  flipH: boolean;
  flipV: boolean;
}

export interface TextOverlay {
  id: string;
  text: string;
  font: "classic" | "modern" | "editorial" | "neon" | "typewriter" | "script";
  color: string;
  backgroundColor: string; // "transparent" or hex/rgba
  size: number; // 16 to 72
  align: "left" | "center" | "right";
  x: number; // 0 to 1 (percent from left)
  y: number; // 0 to 1 (percent from top)
}

export interface VideoMeta {
  duration: number;
  trimStart: number;
  trimEnd: number;
  muted: boolean;
  volume: number;
  coverTimestamp: number;
  coverDataUrl?: string;
}

export interface MediaEditorItem {
  id: string;
  file: File;
  type: "image" | "video";
  url: string;
  name: string;
  filterId: string;
  filterIntensity: number; // 0 to 100
  adjustments: Adjustments;
  transform: TransformState;
  textOverlays: TextOverlay[];
  videoMeta?: VideoMeta;
}

export const ASPECT_RATIOS: Record<AspectRatioType, { label: string; ratio: number | null; icon: string }> = {
  original: { label: "Original", ratio: null, icon: "□" },
  "1:1": { label: "1:1 Square", ratio: 1, icon: "■" },
  "4:5": { label: "4:5 Portrait", ratio: 4 / 5, icon: "▯" },
  "16:9": { label: "16:9 Landscape", ratio: 16 / 9, icon: "▭" },
  "9:16": { label: "9:16 Reel / Story", ratio: 9 / 16, icon: "▯" },
};

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  fade: 0,
  vignette: 0,
  highlights: 0,
  shadows: 0,
  sharpen: 0,
};

export const DEFAULT_TRANSFORM: TransformState = {
  aspectRatio: "original",
  zoom: 1,
  x: 0.5,
  y: 0.5,
  rotation: 0,
  straighten: 0,
  flipH: false,
  flipV: false,
};

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "normal",
    name: "Normal",
    category: "classic",
    cssFilter: () => "none",
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    sepia: 0,
    hueRotate: 0,
    vignette: 0,
    fade: 0,
  },
  {
    id: "clarendon",
    name: "Clarendon",
    category: "classic",
    cssFilter: (i) => `contrast(${1 + 0.25 * i}) brightness(${1 + 0.1 * i}) saturate(${1 + 0.3 * i})`,
    brightness: 10,
    contrast: 25,
    saturation: 30,
    warmth: -5,
    sepia: 0,
    hueRotate: 0,
    vignette: 15,
    fade: 0,
  },
  {
    id: "gingham",
    name: "Gingham",
    category: "vintage",
    cssFilter: (i) => `brightness(${1 + 0.08 * i}) contrast(${1 - 0.1 * i}) sepia(${0.15 * i}) hue-rotate(${-10 * i}deg)`,
    brightness: 8,
    contrast: -10,
    saturation: -12,
    warmth: 15,
    sepia: 15,
    hueRotate: -10,
    vignette: 10,
    fade: 20,
  },
  {
    id: "juno",
    name: "Juno",
    category: "classic",
    cssFilter: (i) => `contrast(${1 + 0.2 * i}) saturate(${1 + 0.35 * i}) brightness(${1 + 0.05 * i})`,
    brightness: 6,
    contrast: 20,
    saturation: 35,
    warmth: 18,
    sepia: 5,
    hueRotate: 0,
    vignette: 10,
    fade: 0,
  },
  {
    id: "lark",
    name: "Lark",
    category: "classic",
    cssFilter: (i) => `brightness(${1 + 0.15 * i}) contrast(${1 - 0.08 * i}) saturate(${1 + 0.1 * i})`,
    brightness: 15,
    contrast: -8,
    saturation: 10,
    warmth: -10,
    sepia: 0,
    hueRotate: 0,
    vignette: 5,
    fade: 5,
  },
  {
    id: "moon",
    name: "Moon",
    category: "monochrome",
    cssFilter: (i) => `grayscale(${1 * i}) contrast(${1 + 0.25 * i}) brightness(${1 + 0.08 * i})`,
    brightness: 8,
    contrast: 25,
    saturation: -100,
    warmth: 0,
    sepia: 0,
    hueRotate: 0,
    vignette: 15,
    fade: 10,
  },
  {
    id: "valencia",
    name: "Valencia",
    category: "vintage",
    cssFilter: (i) => `sepia(${0.3 * i}) contrast(${1 + 0.1 * i}) brightness(${1 + 0.1 * i}) saturate(${1 + 0.15 * i})`,
    brightness: 10,
    contrast: 10,
    saturation: 15,
    warmth: 30,
    sepia: 25,
    hueRotate: 0,
    vignette: 10,
    fade: 15,
  },
  {
    id: "reyes",
    name: "Reyes",
    category: "vintage",
    cssFilter: (i) => `sepia(${0.22 * i}) brightness(${1 + 0.18 * i}) contrast(${1 - 0.15 * i}) saturate(${1 - 0.25 * i})`,
    brightness: 18,
    contrast: -15,
    saturation: -25,
    warmth: 20,
    sepia: 20,
    hueRotate: 0,
    vignette: 5,
    fade: 25,
  },
  {
    id: "slumber",
    name: "Slumber",
    category: "vintage",
    cssFilter: (i) => `saturate(${1 - 0.3 * i}) brightness(${1 + 0.06 * i}) sepia(${0.2 * i})`,
    brightness: 6,
    contrast: -5,
    saturation: -30,
    warmth: 25,
    sepia: 20,
    hueRotate: 0,
    vignette: 15,
    fade: 20,
  },
  {
    id: "crema",
    name: "Crema",
    category: "classic",
    cssFilter: (i) => `contrast(${1 + 0.05 * i}) saturate(${1 - 0.1 * i}) brightness(${1 + 0.12 * i}) sepia(${0.15 * i})`,
    brightness: 12,
    contrast: 5,
    saturation: -10,
    warmth: 15,
    sepia: 15,
    hueRotate: 0,
    vignette: 10,
    fade: 18,
  },
  {
    id: "ludwig",
    name: "Ludwig",
    category: "classic",
    cssFilter: (i) => `contrast(${1 + 0.18 * i}) brightness(${1 + 0.05 * i}) saturate(${1 + 0.2 * i})`,
    brightness: 5,
    contrast: 18,
    saturation: 20,
    warmth: 10,
    sepia: 5,
    hueRotate: 0,
    vignette: 12,
    fade: 0,
  },
  {
    id: "noir",
    name: "Noir",
    category: "monochrome",
    cssFilter: (i) => `grayscale(${1 * i}) contrast(${1 + 0.6 * i}) brightness(${1 - 0.05 * i})`,
    brightness: -5,
    contrast: 60,
    saturation: -100,
    warmth: 0,
    sepia: 0,
    hueRotate: 0,
    vignette: 30,
    fade: 5,
  },
  {
    id: "tokyo",
    name: "Tokyo",
    category: "cinematic",
    cssFilter: (i) => `contrast(${1 + 0.3 * i}) saturate(${1 + 0.25 * i}) hue-rotate(${-15 * i}deg)`,
    brightness: 4,
    contrast: 30,
    saturation: 25,
    warmth: -20,
    sepia: 0,
    hueRotate: -15,
    vignette: 20,
    fade: 0,
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    category: "creative",
    cssFilter: (i) => `contrast(${1 + 0.35 * i}) saturate(${1 + 0.5 * i}) hue-rotate(${30 * i}deg) brightness(${1 + 0.05 * i})`,
    brightness: 5,
    contrast: 35,
    saturation: 50,
    warmth: -10,
    sepia: 0,
    hueRotate: 30,
    vignette: 25,
    fade: 0,
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    category: "cinematic",
    cssFilter: (i) => `sepia(${0.35 * i}) contrast(${1 + 0.2 * i}) saturate(${1 + 0.4 * i}) brightness(${1 + 0.08 * i})`,
    brightness: 8,
    contrast: 20,
    saturation: 40,
    warmth: 40,
    sepia: 30,
    hueRotate: -5,
    vignette: 20,
    fade: 5,
  },
];

export function getFilterPreset(id: string): FilterPreset {
  return FILTER_PRESETS.find((f) => f.id === id) ?? FILTER_PRESETS[0];
}

/**
 * Builds composite CSS filter string combining preset filter and user adjustments.
 */
export function buildCompositeCssFilter(
  preset: FilterPreset,
  intensity: number,
  adjustments: Adjustments
): string {
  const normIntensity = Math.max(0, Math.min(1, intensity / 100));

  // Combine preset and adjustments
  const brightnessVal = 1 + (preset.brightness * normIntensity + adjustments.brightness) / 100;
  const contrastVal = 1 + (preset.contrast * normIntensity + adjustments.contrast) / 100;
  const saturationVal = Math.max(
    0,
    1 + (preset.saturation * normIntensity + adjustments.saturation) / 100
  );
  const sepiaVal = Math.max(
    0,
    Math.min(1, (preset.sepia * normIntensity) / 100)
  );
  const hueRotateVal = preset.hueRotate * normIntensity;

  const filters: string[] = [];
  if (preset.id === "moon" || preset.id === "noir") {
    filters.push(`grayscale(${normIntensity})`);
  }
  if (Math.abs(brightnessVal - 1) > 0.01) filters.push(`brightness(${brightnessVal.toFixed(2)})`);
  if (Math.abs(contrastVal - 1) > 0.01) filters.push(`contrast(${contrastVal.toFixed(2)})`);
  if (Math.abs(saturationVal - 1) > 0.01) filters.push(`saturate(${saturationVal.toFixed(2)})`);
  if (sepiaVal > 0.01) filters.push(`sepia(${sepiaVal.toFixed(2)})`);
  if (Math.abs(hueRotateVal) > 0.5) filters.push(`hue-rotate(${hueRotateVal.toFixed(1)}deg)`);

  return filters.length ? filters.join(" ") : "none";
}

/**
 * Draw complete transformed and filtered image to target canvas.
 */
export function renderCanvasImage({
  targetCanvas,
  sourceImage,
  transform,
  filterPreset,
  filterIntensity,
  adjustments,
  textOverlays = [],
  watermark = false,
}: {
  targetCanvas: HTMLCanvasElement;
  sourceImage: CanvasImageSource;
  transform: TransformState;
  filterPreset: FilterPreset;
  filterIntensity: number;
  adjustments: Adjustments;
  textOverlays?: TextOverlay[];
  watermark?: boolean;
}): boolean {
  const ctx = targetCanvas.getContext("2d");
  if (!ctx) return false;

  const imgW = (sourceImage as HTMLImageElement).naturalWidth || (sourceImage as HTMLVideoElement).videoWidth || targetCanvas.width;
  const imgH = (sourceImage as HTMLImageElement).naturalHeight || (sourceImage as HTMLVideoElement).videoHeight || targetCanvas.height;

  // Determine output aspect ratio
  const ratioSpec = ASPECT_RATIOS[transform.aspectRatio];
  const targetRatio = ratioSpec.ratio ?? imgW / imgH;

  // Set high resolution canvas dimensions
  const maxDimension = 1920;
  let outW = maxDimension;
  let outH = Math.round(maxDimension / targetRatio);
  if (outH > maxDimension) {
    outH = maxDimension;
    outW = Math.round(maxDimension * targetRatio);
  }

  targetCanvas.width = outW;
  targetCanvas.height = outH;

  ctx.clearRect(0, 0, outW, outH);
  ctx.save();

  // Apply CSS filters on context
  const cssFilter = buildCompositeCssFilter(filterPreset, filterIntensity, adjustments);
  if (cssFilter !== "none") {
    ctx.filter = cssFilter;
  }

  // Calculate cropping & source framing
  let cropW: number;
  let cropH: number;
  const sourceRatio = imgW / imgH;

  if (targetRatio > sourceRatio) {
    cropW = imgW / transform.zoom;
    cropH = cropW / targetRatio;
  } else {
    cropH = imgH / transform.zoom;
    cropW = cropH * targetRatio;
  }

  const minX = cropW / 2;
  const maxX = imgW - cropW / 2;
  const minY = cropH / 2;
  const maxY = imgH - cropH / 2;

  const cx = maxX >= minX ? minX + (maxX - minX) * transform.x : imgW / 2;
  const cy = maxY >= minY ? minY + (maxY - minY) * transform.y : imgH / 2;

  const sx = Math.max(0, Math.min(imgW - cropW, cx - cropW / 2));
  const sy = Math.max(0, Math.min(imgH - cropH, cy - cropH / 2));

  // Transform canvas for rotation, straighten, and flips
  ctx.translate(outW / 2, outH / 2);

  const totalAngle = (transform.rotation + transform.straighten) * (Math.PI / 180);
  ctx.rotate(totalAngle);
  ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw the image slice centered
  ctx.drawImage(
    sourceImage,
    sx,
    sy,
    cropW,
    cropH,
    -outW / 2,
    -outH / 2,
    outW,
    outH
  );

  ctx.restore();

  // Reset filter for overlays and custom canvas color effects
  ctx.filter = "none";

  // Apply Warmth color layer if warmth != 0
  const normIntensity = Math.max(0, Math.min(1, filterIntensity / 100));
  const totalWarmth = filterPreset.warmth * normIntensity + adjustments.warmth;
  if (Math.abs(totalWarmth) > 3) {
    ctx.save();
    if (totalWarmth > 0) {
      ctx.fillStyle = `rgba(255, 175, 50, ${Math.min(0.28, totalWarmth / 350)})`;
      ctx.globalCompositeOperation = "color";
      ctx.fillRect(0, 0, outW, outH);
    } else {
      ctx.fillStyle = `rgba(70, 140, 255, ${Math.min(0.28, Math.abs(totalWarmth) / 350)})`;
      ctx.globalCompositeOperation = "color";
      ctx.fillRect(0, 0, outW, outH);
    }
    ctx.restore();
  }

  // Apply Vignette if vignette > 0
  const totalVignette = Math.max(0, filterPreset.vignette * normIntensity + adjustments.vignette);
  if (totalVignette > 5) {
    ctx.save();
    const radius = Math.max(outW, outH) * 0.7;
    const gradient = ctx.createRadialGradient(
      outW / 2,
      outH / 2,
      radius * 0.35,
      outW / 2,
      outH / 2,
      radius
    );
    const alpha = Math.min(0.85, (totalVignette / 100) * 0.9);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${alpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, outW, outH);
    ctx.restore();
  }

  // Apply Fade if fade > 0
  const totalFade = Math.max(0, filterPreset.fade * normIntensity + adjustments.fade);
  if (totalFade > 5) {
    ctx.save();
    const alpha = Math.min(0.35, (totalFade / 100) * 0.35);
    ctx.fillStyle = `rgba(240, 235, 230, ${alpha})`;
    ctx.globalCompositeOperation = "screen";
    ctx.fillRect(0, 0, outW, outH);
    ctx.restore();
  }

  // Draw Text Overlays
  for (const overlay of textOverlays) {
    if (!overlay.text.trim()) continue;
    drawTextOverlay(ctx, overlay, outW, outH);
  }

  // Watermark if requested
  if (watermark) {
    ctx.save();
    ctx.font = "600 24px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.textAlign = "right";
    ctx.fillText("NINA KURAIN", outW - 32, outH - 32);
    ctx.restore();
  }

  return true;
}

function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  overlay: TextOverlay,
  canvasW: number,
  canvasH: number
) {
  ctx.save();

  const scaleFactor = canvasW / 1080;
  const scaledSize = Math.max(18, Math.round(overlay.size * scaleFactor));

  let fontFamily = "sans-serif";
  let fontStyle = "";
  if (overlay.font === "modern") {
    fontFamily = "'Inter', system-ui, sans-serif";
    fontStyle = "bold ";
  } else if (overlay.font === "editorial") {
    fontFamily = "'Playfair Display', Georgia, serif";
    fontStyle = "italic 600 ";
  } else if (overlay.font === "neon") {
    fontFamily = "'Inter', sans-serif";
    fontStyle = "bold ";
  } else if (overlay.font === "typewriter") {
    fontFamily = "'Courier New', monospace";
    fontStyle = "600 ";
  } else if (overlay.font === "script") {
    fontFamily = "cursive, 'Brush Script MT', sans-serif";
    fontStyle = "italic ";
  }

  ctx.font = `${fontStyle}${scaledSize}px ${fontFamily}`;
  ctx.textAlign = overlay.align;
  ctx.textBaseline = "middle";

  const x = overlay.x * canvasW;
  const y = overlay.y * canvasH;

  const lines = overlay.text.split("\n");
  const lineHeight = scaledSize * 1.35;
  const totalTextHeight = lines.length * lineHeight;

  if (overlay.backgroundColor && overlay.backgroundColor !== "transparent") {
    const paddingX = scaledSize * 0.7;
    const paddingY = scaledSize * 0.35;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const metrics = ctx.measureText(line);
      const lineW = metrics.width;
      const lineY = y - totalTextHeight / 2 + i * lineHeight + lineHeight / 2;

      let pillX = x - lineW / 2;
      if (overlay.align === "left") pillX = x;
      else if (overlay.align === "right") pillX = x - lineW;

      ctx.save();
      ctx.fillStyle = overlay.backgroundColor;
      const radius = 8 * scaleFactor;
      roundRect(
        ctx,
        pillX - paddingX,
        lineY - lineHeight / 2 - paddingY,
        lineW + paddingX * 2,
        lineHeight + paddingY * 2,
        radius
      );
      ctx.fill();
      ctx.restore();
    }
  }

  if (overlay.font === "neon") {
    ctx.shadowColor = overlay.color;
    ctx.shadowBlur = 15 * scaleFactor;
  }

  if (!overlay.backgroundColor || overlay.backgroundColor === "transparent") {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
    ctx.lineWidth = Math.max(2, 3 * scaleFactor);
    for (let i = 0; i < lines.length; i++) {
      const lineY = y - totalTextHeight / 2 + i * lineHeight + lineHeight / 2;
      ctx.strokeText(lines[i], x, lineY);
    }
  }

  ctx.fillStyle = overlay.color;
  for (let i = 0; i < lines.length; i++) {
    const lineY = y - totalTextHeight / 2 + i * lineHeight + lineHeight / 2;
    ctx.fillText(lines[i], x, lineY);
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Capture high-res frame from video element at current timestamp.
 */
export function captureVideoFrame(
  video: HTMLVideoElement,
  format: "image/jpeg" | "image/webp" = "image/jpeg",
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Cannot get canvas 2d context for video frame"));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export video frame to blob"));
      }, format, quality);
    } catch (err) {
      reject(err);
    }
  });
}
