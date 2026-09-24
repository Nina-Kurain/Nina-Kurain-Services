export type ProjectType = "photo" | "carousel" | "reel" | "story" | "video";
export type AspectRatioType = "original" | "1:1" | "4:5" | "9:16" | "16:9";

export interface ToneAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  warmth: number; // -100 to 100
  tint: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  vignette: number; // 0 to 100
  fade: number; // 0 to 100
  sharpen: number; // 0 to 100
  clarity: number; // -100 to 100
  vibrance: number; // -100 to 100
  grain: number; // 0 to 100
  exposure: number; // -100 to 100
}

export const DEFAULT_TONE_ADJUSTMENTS: ToneAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  tint: 0,
  highlights: 0,
  shadows: 0,
  vignette: 0,
  fade: 0,
  sharpen: 0,
  clarity: 0,
  vibrance: 0,
  grain: 0,
  exposure: 0,
};

export interface TransformState {
  aspectRatio: AspectRatioType;
  zoom: number; // 1 to 3
  x: number; // pan offset X (-1 to 1)
  y: number; // pan offset Y (-1 to 1)
  rotation: number; // 0, 90, 180, 270
  straighten: number; // -45 to 45 deg
  flipH: boolean;
  flipV: boolean;
}

export const DEFAULT_TRANSFORM_STATE: TransformState = {
  aspectRatio: "original",
  zoom: 1,
  x: 0,
  y: 0,
  rotation: 0,
  straighten: 0,
  flipH: false,
  flipV: false,
};

export interface EditorTextLayer {
  id: string;
  text: string;
  fontFamily: "classic" | "modern" | "editorial" | "neon" | "typewriter" | "script";
  fontSize: number; // 14 to 80
  color: string;
  backgroundColor: string; // hex or "transparent"
  textAlign: "left" | "center" | "right";
  x: number; // 0-1 canvas relative
  y: number; // 0-1 canvas relative
  rotation?: number;
  scale?: number;
}

export interface VideoTimelineState {
  duration: number; // seconds
  trimStart: number; // seconds
  trimEnd: number; // seconds
  playbackRate: number; // 0.5 to 2.0
  muted: boolean;
  volume: number; // 0 to 1
  audioFadeIn: boolean;
  audioFadeOut: boolean;
  coverTimestamp: number; // seconds
  coverBlob?: Blob;
  coverDataUrl?: string;
}

export const DEFAULT_VIDEO_TIMELINE: VideoTimelineState = {
  duration: 0,
  trimStart: 0,
  trimEnd: 0,
  playbackRate: 1,
  muted: false,
  volume: 1,
  audioFadeIn: false,
  audioFadeOut: false,
  coverTimestamp: 0,
};

export interface SlideItem {
  id: string;
  file?: File;
  mediaId?: string; // If already uploaded
  sourceUrl: string; // object URL or signed URL
  name: string;
  type: "image" | "video";
  filterId: string;
  filterIntensity: number; // 0 to 100
  adjustments: ToneAdjustments;
  transform: TransformState;
  textLayers: EditorTextLayer[];
  fabricJson?: string; // serialized Fabric.js canvas
  videoTimeline?: VideoTimelineState;
  renderedBlob?: Blob;
  renderedUrl?: string;
  coverBlob?: Blob;
  coverUrl?: string;
}

export interface StudioProjectDraft {
  id: string;
  projectType: ProjectType;
  title: string;
  aspectRatio: AspectRatioType;
  items: SlideItem[];
  currentSlideIndex: number;
  lastSavedAt: number;
  // Publishing config
  caption: string;
  accessMode: "free" | "level" | "specific";
  minimumLevel: number;
  planIds: string[];
  commentLevel: number;
  status: "draft" | "published" | "scheduled";
  publishedAt?: number;
  isStory?: boolean;
  isHighlight?: boolean;
}

export interface ExportProgress {
  status: "idle" | "preparing" | "rendering" | "encoding" | "uploading" | "completed" | "failed";
  progress: number; // 0 to 100
  stageText: string;
  error?: string;
}
