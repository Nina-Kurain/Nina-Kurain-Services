"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Crop,
  Sparkles,
  Sliders,
  Type,
  Video as VideoIcon,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Grid3X3,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Check,
  Eye,
  Camera,
  Image as ImageIcon,
  Loader2,
  Upload,
  ArrowLeft,
  ArrowRight,
  Paintbrush,
  RotateCcw,
  FastForward,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  Save,
  Share2,
  Move,
  ZoomIn,
  Crosshair,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Film,
} from "lucide-react";
import {
  type ProjectType,
  type AspectRatioType,
  type ToneAdjustments,
  type TransformState,
  type EditorTextLayer,
  type VideoTimelineState,
  type SlideItem,
  type StudioProjectDraft,
  DEFAULT_TONE_ADJUSTMENTS,
  DEFAULT_TRANSFORM_STATE,
  DEFAULT_VIDEO_TIMELINE,
} from "./editor-types";
import {
  FILTER_PRESETS,
  getFilterPreset,
  ASPECT_RATIOS,
} from "./filter-presets";
import { FabricPhotoCanvas } from "./fabric-photo-canvas";
import {
  getVideoMetadata,
  captureFrameAtTimestamp,
  processVideoWithMediabunny,
  buildVideoFilterString,
} from "./video-engine";
import {
  saveDraftToIndexedDB,
  getLatestDraftFromIndexedDB,
  clearAllDraftsFromIndexedDB,
  deleteDraftFromIndexedDB,
} from "./editor-indexeddb";
import "./media-editor.css";

export interface NinaStudioEditorProps {
  open: boolean;
  onClose: () => void;
  onDone: (result: {
    assets: Array<{ id: string; name: string; mime: string; url: string }>;
    coverId?: string;
    projectId?: string;
  }) => void;
  onSkip?: (rawFiles: File[]) => void;
  initialFiles?: File[];
  initialMedia?: Array<{ id?: string; name: string; mime: string; url: string; editRecipe?: string }>;
  existingProjectId?: string;
  defaultAspect?: AspectRatioType;
  projectType?: ProjectType;
  title?: string;
}

export function NinaStudioEditor({
  open,
  onClose,
  onDone,
  onSkip,
  initialFiles = [],
  initialMedia = [],
  existingProjectId,
  defaultAspect = "4:5",
  projectType: initialProjectType,
  title = "Nina Studio Editor",
}: NinaStudioEditorProps) {
  // Master project state
  const [projectId, setProjectId] = useState<string>("");
  const [projectTitle, setProjectTitle] = useState<string>("New Studio Drop");
  const [projectType, setProjectType] = useState<ProjectType>(
    initialProjectType || "photo"
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>(defaultAspect);
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<
    "crop" | "filter" | "adjust" | "text" | "draw" | "video"
  >("crop");

  // Canvas / Video interactive controls
  const [comparing, setComparing] = useState<boolean>(false);
  const [showSafeGuides, setShowSafeGuides] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>("#e56b83");
  const [brushSize, setBrushSize] = useState<number>(6);

  // Video playback & interactive stage
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [isDraggingVideo, setIsDraggingVideo] = useState<boolean>(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initX: number; initY: number } | null>(null);

  const formatTimecode = (sec: number) => {
    if (!Number.isFinite(sec) || sec < 0) return "00:00.0";
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(1);
    return `${m.toString().padStart(2, "0")}:${Number(s) < 10 ? "0" : ""}${s}`;
  };

  // Crash recovery banner
  const [recoveredDraft, setRecoveredDraft] = useState<StudioProjectDraft | null>(
    null
  );
  const [showRecoveryBanner, setShowRecoveryBanner] = useState<boolean>(false);

  // Export & Processing
  const [busy, setBusy] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [progressPct, setProgressPct] = useState<number>(0);

  // Function reference for high-res photo canvas export
  const exportPhotoRef = useRef<(() => Promise<Blob>) | null>(null);
  const handleExportReady = useCallback((fn: () => Promise<Blob>) => {
    exportPhotoRef.current = fn;
  }, []);

  // Current active slide
  const currentSlide = slides[activeSlideIndex];

  // Helper to create a SlideItem from a File
  const createSlideFromFile = useCallback(
    async (file: File): Promise<SlideItem> => {
      const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|mkv)$/i.test(file.name);
      const sourceUrl = URL.createObjectURL(file);

      let videoTimeline: VideoTimelineState | undefined;
      let coverBlob: Blob | undefined;
      let coverUrl: string | undefined;

      if (isVideo) {
        try {
          const meta = await getVideoMetadata(file);
          const safeDuration = Number.isFinite(meta.duration) && meta.duration > 0 ? meta.duration : 15;
          const initialCoverSec = Math.min(0.2, Math.max(0.05, safeDuration - 0.05));
          try {
            coverBlob = await captureFrameAtTimestamp(file, initialCoverSec, 720, 1280);
            coverUrl = URL.createObjectURL(coverBlob);
          } catch (covErr) {
            console.warn("[Studio Video] Immediate cover capture fallback:", covErr);
          }

          videoTimeline = {
            duration: safeDuration,
            trimStart: 0,
            trimEnd: safeDuration,
            playbackRate: 1,
            muted: false,
            volume: 1,
            audioFadeIn: false,
            audioFadeOut: false,
            coverTimestamp: initialCoverSec,
            coverBlob,
            coverDataUrl: coverUrl,
          };
        } catch {
          videoTimeline = { ...DEFAULT_VIDEO_TIMELINE };
        }
      }

      // Auto-classify videos as Reels (9:16 vertical) by default
      const itemAspect: AspectRatioType = isVideo ? "9:16" : defaultAspect;

      return {
        id: Math.random().toString(36).slice(2, 9),
        file,
        sourceUrl,
        name: file.name,
        type: isVideo ? "video" : "image",
        coverBlob,
        coverUrl,
        filterId: "normal",
        filterIntensity: 100,
        adjustments: { ...DEFAULT_TONE_ADJUSTMENTS },
        transform: {
          ...DEFAULT_TRANSFORM_STATE,
          aspectRatio: itemAspect,
        },
        textLayers: [],
        videoTimeline,
      };
    },
    [defaultAspect]
  );

  // Check for IndexedDB unsaved drafts upon opening
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    getLatestDraftFromIndexedDB().then((draft) => {
      if (cancelled || !draft) return;
      // If draft was saved within the last 48 hours and has slides
      if (Date.now() - draft.lastSavedAt < 48 * 3600 * 1000 && draft.items.length > 0) {
        setRecoveredDraft(draft);
        setShowRecoveryBanner(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Restore recovered draft
  const handleRestoreDraft = () => {
    if (!recoveredDraft) return;
    setProjectId(recoveredDraft.id);
    setProjectTitle(recoveredDraft.title || "Restored Draft");
    setProjectType(recoveredDraft.projectType || "photo");
    setAspectRatio(recoveredDraft.aspectRatio || "4:5");
    setSlides(recoveredDraft.items);
    setActiveSlideIndex(recoveredDraft.currentSlideIndex || 0);
    setShowRecoveryBanner(false);
  };

  // Discard recovered draft
  const handleDiscardDraft = async () => {
    if (recoveredDraft) {
      await deleteDraftFromIndexedDB(recoveredDraft.id);
    }
    setRecoveredDraft(null);
    setShowRecoveryBanner(false);
  };

  // Helper to load video metadata, extract cover frame, and fetch real video bytes
  const loadExistingVideoSlide = useCallback((
    slideIdx: number,
    sourceUrl: string,
    mediaId?: string,
    slideName?: string,
    customCoverUrl?: string
  ) => {
    // 1. Fetch metadata & extract cover
    getVideoMetadata(sourceUrl)
      .then(async (meta) => {
        const safeDuration = Number.isFinite(meta.duration) && meta.duration > 0 ? meta.duration : 15;
        let coverBlob: Blob | undefined;
        let coverUrl = customCoverUrl;
        try {
          if (!coverUrl) {
            coverBlob = await captureFrameAtTimestamp(sourceUrl, Math.min(0.2, Math.max(0.05, safeDuration - 0.05)), 720, 1280);
            coverUrl = URL.createObjectURL(coverBlob);
          }
        } catch (covErr) {
          console.warn("[Studio Editor] Cover capture notice:", covErr);
        }

        setSlides((prev) => {
          const next = [...prev];
          if (next[slideIdx] && next[slideIdx].type === "video") {
            const currentVt = next[slideIdx].videoTimeline || { ...DEFAULT_VIDEO_TIMELINE };
            const currentTrimEnd = currentVt.trimEnd && currentVt.trimEnd > 0 && currentVt.trimEnd <= safeDuration
              ? currentVt.trimEnd
              : safeDuration;
            next[slideIdx] = {
              ...next[slideIdx],
              coverBlob: coverBlob || next[slideIdx].coverBlob,
              coverUrl: coverUrl || next[slideIdx].coverUrl,
              videoTimeline: {
                ...currentVt,
                duration: safeDuration,
                trimStart: currentVt.trimStart || 0,
                trimEnd: currentTrimEnd,
                coverBlob: coverBlob || currentVt.coverBlob,
                coverDataUrl: coverUrl || currentVt.coverDataUrl,
              },
            };
          }
          return next;
        });
      })
      .catch((err) => {
        console.warn("[Studio Editor] Video metadata warning:", err);
      });

    // 2. Fetch actual video bytes
    const retrieveBytes = async () => {
      let activeUrl = sourceUrl;
      try {
        let res = await fetch(activeUrl, { credentials: "include" });
        if (!res.ok && res.status === 403 && mediaId) {
          // Token expired, refresh URL
          const refreshed = await fetch(`/api/studio/media-url?id=${mediaId}`, { credentials: "include" }).then(r => r.json() as Promise<{ url?: string }>);
          if (refreshed?.url) {
            activeUrl = refreshed.url;
            res = await fetch(activeUrl, { credentials: "include" });
          }
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        if (!blob || blob.size === 0) throw new Error("Empty video file");
        const file = new File([blob], slideName || `reel_${slideIdx + 1}.mp4`, { type: blob.type || "video/mp4" });

        setSlides((prev) => {
          const next = [...prev];
          if (next[slideIdx] && next[slideIdx].type === "video") {
            next[slideIdx] = {
              ...next[slideIdx],
              file,
              sourceUrl: activeUrl,
              isMediaLoading: false,
              isMediaReady: true,
              mediaError: undefined,
            };
          }
          return next;
        });
      } catch (err) {
        console.warn("[Studio Editor] Failed to pre-fetch video bytes:", err);
        setSlides((prev) => {
          const next = [...prev];
          if (next[slideIdx] && next[slideIdx].type === "video") {
            next[slideIdx] = {
              ...next[slideIdx],
              isMediaLoading: false,
              isMediaReady: false,
              mediaError: "Could not load video bytes from private storage. Tap Retry to reload.",
            };
          }
          return next;
        });
      }
    };

    retrieveBytes();
  }, []);

  // Initialize slides when modal opens with initialFiles
  useEffect(() => {
    if (!open) {
      // Clean up object URLs
      slides.forEach((s) => {
        if (s.sourceUrl && s.sourceUrl.startsWith("blob:")) {
          URL.revokeObjectURL(s.sourceUrl);
        }
      });
      return;
    }

    if (existingProjectId && initialFiles.length === 0 && !recoveredDraft) {
      setBusy(true);
      setProgressMsg("Loading project recipe…");
      fetch(`/api/studio/project/${existingProjectId}`)
        .then(async (res) => {
          if (!res.ok) return;
          const data = (await res.json()) as {
            project?: {
              id: string;
              title?: string;
              project_type?: ProjectType;
              aspect_ratio?: AspectRatioType;
              items?: Array<{
                id?: string;
                name?: string;
                mime?: string;
                bytes?: number;
                output_url?: string;
                source_url?: string;
                cover_url?: string;
                source_media_id?: string;
                output_media_id?: string;
                cover_media_id?: string;
                edit_recipe_json?: string;
              }>;
            };
          };
          if (data?.project) {
            const p = data.project;
            const isVideoProj = p.project_type === "reel" || p.project_type === "video";
            setProjectId(p.id);
            setProjectTitle(p.title || "Studio Project");
            setProjectType(p.project_type || "photo");
            setAspectRatio(isVideoProj ? "9:16" : (p.aspect_ratio as AspectRatioType) || "4:5");
            if (p.items?.length) {
              const loadedSlides: SlideItem[] = p.items.map((it, i) => {
                let recipe: Record<string, unknown> = {};
                try {
                  recipe = it.edit_recipe_json ? JSON.parse(it.edit_recipe_json) : {};
                } catch {
                  // ignore
                }
                const isVid = Boolean(
                  isVideoProj ||
                  it.mime?.startsWith("video/") ||
                  it.name?.match(/\.(mp4|mov|webm|m4v|mkv)$/i) ||
                  it.output_url?.match(/\.(mp4|mov|webm|m4v|mkv)(\?.*)?$/i) ||
                  it.source_url?.match(/\.(mp4|mov|webm|m4v|mkv)(\?.*)?$/i) ||
                  Boolean(recipe.videoTimeline)
                );

                let initialVt: VideoTimelineState | undefined = undefined;
                if (isVid) {
                  const recVt = recipe.videoTimeline as Partial<VideoTimelineState> | undefined;
                  const safeDur = recVt?.duration && recVt.duration > 0 ? recVt.duration : 15;
                  initialVt = {
                    ...DEFAULT_VIDEO_TIMELINE,
                    duration: safeDur,
                    trimStart: recVt?.trimStart || 0,
                    trimEnd: recVt?.trimEnd && recVt.trimEnd > 0 ? recVt.trimEnd : safeDur,
                    playbackRate: recVt?.playbackRate || 1,
                    muted: recVt?.muted ?? false,
                    volume: recVt?.volume ?? 1,
                    audioFadeIn: recVt?.audioFadeIn ?? false,
                    audioFadeOut: recVt?.audioFadeOut ?? false,
                    coverTimestamp: recVt?.coverTimestamp || 0.1,
                    coverDataUrl: recVt?.coverDataUrl || it.cover_url,
                  };
                }

                const slideUrl = it.output_url || it.source_url || "";
                return {
                  id: it.id || String(i),
                  mediaId: it.source_media_id || it.output_media_id || it.id,
                  file: undefined,
                  sourceUrl: slideUrl,
                  name: it.name || `Slide ${i + 1}`,
                  type: isVid ? "video" : "image",
                  filterId: (recipe.filterId as string) || "normal",
                  filterIntensity: (recipe.filterIntensity as number) ?? 100,
                  adjustments: (recipe.adjustments as ToneAdjustments) || { ...DEFAULT_TONE_ADJUSTMENTS },
                  transform: (recipe.transform as TransformState) || {
                    ...DEFAULT_TRANSFORM_STATE,
                    aspectRatio: isVid ? "9:16" : (p.aspect_ratio as AspectRatioType) || "4:5",
                  },
                  textLayers: (recipe.textLayers as EditorTextLayer[]) || [],
                  videoTimeline: initialVt,
                  coverUrl: it.cover_url || initialVt?.coverDataUrl,
                  isMediaLoading: isVid,
                  isMediaReady: !isVid,
                  mediaError: undefined,
                };
              });

              setSlides(loadedSlides);
              setActiveSlideIndex(0);
              if (loadedSlides[0]?.type === "video") {
                setActiveTab("video");
              } else {
                setActiveTab("crop");
              }

              // Preload video bytes and frame cover for all video slides
              p.items.forEach((it, i) => {
                const s = loadedSlides[i];
                if (s && s.type === "video" && s.sourceUrl) {
                  loadExistingVideoSlide(
                    i,
                    s.sourceUrl,
                    it.source_media_id || it.output_media_id || it.id,
                    it.name,
                    it.cover_url
                  );
                }
              });
            }
          }
        })
        .catch((err) => {
          console.error("Failed to load project:", err);
        })
        .finally(() => {
          setBusy(false);
          setProgressMsg("");
        });
      return;
    }

    if (initialMedia && initialMedia.length > 0 && !recoveredDraft) {
      const pid = existingProjectId || crypto.randomUUID();
      setProjectId(pid);

      const hasVideo = initialMedia.some(
        (m) =>
          m.mime?.startsWith("video/") ||
          m.name?.match(/\.(mp4|mov|webm|m4v|mkv)$/i) ||
          m.url?.match(/\.(mp4|mov|webm|m4v|mkv)(\?.*)?$/i)
      );
      const isMulti = initialMedia.length > 1;
      const detectedType: ProjectType = hasVideo
        ? "reel"
        : isMulti
        ? "carousel"
        : "photo";

      setProjectType(initialProjectType || detectedType);
      if (hasVideo) {
        setAspectRatio("9:16");
      }

      const mediaSlides: SlideItem[] = initialMedia.map((m, idx) => {
        let recipe: Record<string, unknown> = {};
        if (m.editRecipe) {
          try {
            recipe = JSON.parse(m.editRecipe);
          } catch {
            // ignore
          }
        }
        const isVid = Boolean(
          m.mime?.startsWith("video/") ||
          m.name?.match(/\.(mp4|mov|webm|m4v|mkv)$/i) ||
          m.url?.match(/\.(mp4|mov|webm|m4v|mkv)(\?.*)?$/i) ||
          Boolean(recipe.videoTimeline)
        );

        let initialVt: VideoTimelineState | undefined = undefined;
        if (isVid) {
          const recVt = recipe.videoTimeline as Partial<VideoTimelineState> | undefined;
          const safeDur = recVt?.duration && recVt.duration > 0 ? recVt.duration : 15;
          initialVt = {
            ...DEFAULT_VIDEO_TIMELINE,
            duration: safeDur,
            trimStart: recVt?.trimStart || 0,
            trimEnd: recVt?.trimEnd && recVt.trimEnd > 0 ? recVt.trimEnd : safeDur,
            playbackRate: recVt?.playbackRate || 1,
            muted: recVt?.muted ?? false,
            volume: recVt?.volume ?? 1,
            audioFadeIn: recVt?.audioFadeIn ?? false,
            audioFadeOut: recVt?.audioFadeOut ?? false,
            coverTimestamp: recVt?.coverTimestamp || 0.1,
            coverDataUrl: recVt?.coverDataUrl,
          };
        }

        return {
          id: m.id || Math.random().toString(36).slice(2, 9),
          mediaId: m.id,
          file: undefined,
          sourceUrl: m.url,
          name: m.name || `Media ${idx + 1}`,
          type: isVid ? "video" : "image",
          filterId: (recipe.filterId as string) || "normal",
          filterIntensity: (recipe.filterIntensity as number) ?? 100,
          adjustments: (recipe.adjustments as ToneAdjustments) || {
            ...DEFAULT_TONE_ADJUSTMENTS,
          },
          transform: (recipe.transform as TransformState) || {
            ...DEFAULT_TRANSFORM_STATE,
            aspectRatio: isVid ? "9:16" : defaultAspect,
          },
          textLayers: (recipe.textLayers as EditorTextLayer[]) || [],
          videoTimeline: initialVt,
          coverUrl: initialVt?.coverDataUrl,
          isMediaLoading: isVid,
          isMediaReady: !isVid,
          mediaError: undefined,
        };
      });

      setSlides(mediaSlides);
      setActiveSlideIndex(0);
      if (mediaSlides[0]?.type === "video") {
        setActiveTab("video");
      } else {
        setActiveTab("crop");
      }

      // Preload video bytes and frame cover for all imported videos
      initialMedia.forEach((m, idx) => {
        const s = mediaSlides[idx];
        if (s && s.type === "video" && m.url) {
          loadExistingVideoSlide(idx, m.url, m.id, m.name);
        }
      });

      return;
    }

    if (initialFiles.length > 0 && !recoveredDraft) {
      const pid = existingProjectId || crypto.randomUUID();
      setProjectId(pid);

      // Auto-classify project type
      const hasVideo = initialFiles.some((f) => f.type.startsWith("video/"));
      const isMulti = initialFiles.length > 1;
      const detectedType: ProjectType = hasVideo
        ? "reel"
        : isMulti
        ? "carousel"
        : "photo";

      setProjectType(initialProjectType || detectedType);

      // Auto set 9:16 for Reels
      if (hasVideo) {
        setAspectRatio("9:16");
      }

      Promise.all(initialFiles.map((f) => createSlideFromFile(f))).then((newSlides) => {
        setSlides(newSlides);
        setActiveSlideIndex(0);
        if (newSlides[0]?.type === "video") {
          setActiveTab("video");
        } else {
          setActiveTab("crop");
        }
      });
    }
  }, [open, initialFiles, initialMedia, existingProjectId, initialProjectType, defaultAspect, createSlideFromFile, loadExistingVideoSlide]);

  // Periodic autosave to IndexedDB
  useEffect(() => {
    if (!open || slides.length === 0) return;

    const timer = setTimeout(() => {
      const draft: StudioProjectDraft = {
        id: projectId || crypto.randomUUID(),
        projectType,
        title: projectTitle,
        aspectRatio,
        items: slides,
        currentSlideIndex: activeSlideIndex,
        lastSavedAt: Date.now(),
        caption: "",
        accessMode: "free",
        minimumLevel: 1,
        planIds: [],
        commentLevel: 0,
        status: "draft",
      };
      saveDraftToIndexedDB(draft);
    }, 1200);

    return () => clearTimeout(timer);
  }, [open, projectId, projectType, projectTitle, aspectRatio, slides, activeSlideIndex]);

  // Update current slide properties
  const updateCurrentSlide = useCallback(
    (updater: (prev: SlideItem) => SlideItem) => {
      setSlides((prev) => {
        const next = [...prev];
        if (next[activeSlideIndex]) {
          next[activeSlideIndex] = updater(next[activeSlideIndex]);
        }
        return next;
      });
    },
    [activeSlideIndex]
  );

  // Apply current filter & crop to ALL slides in carousel
  const handleApplyToAllSlides = () => {
    if (!currentSlide) return;
    setSlides((prev) =>
      prev.map((s) => ({
        ...s,
        filterId: currentSlide.filterId,
        filterIntensity: currentSlide.filterIntensity,
        adjustments: { ...currentSlide.adjustments },
        transform: {
          ...s.transform,
          aspectRatio: currentSlide.transform.aspectRatio,
          zoom: currentSlide.transform.zoom,
          rotation: currentSlide.transform.rotation,
        },
      }))
    );
  };

  // Add extra slide from file input
  const handleAddSlideFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    try {
      const fileArr = Array.from(files);
      const newItems = await Promise.all(
        fileArr.map((f) => createSlideFromFile(f))
      );
      if (newItems.length === 0) return;

      setSlides((prev) => {
        const next = [...prev, ...newItems];
        if (prev.length === 0) {
          // If starting from empty editor, auto-configure project type and active tab
          const hasVideo = newItems.some((s) => s.type === "video");
          const isMulti = newItems.length > 1;
          const detectedType: ProjectType = hasVideo ? "reel" : isMulti ? "carousel" : "photo";
          setProjectType(detectedType);
          if (hasVideo) {
            setAspectRatio("9:16");
            setActiveTab("video");
          } else {
            setActiveTab("crop");
          }
          setActiveSlideIndex(0);
        } else if (next.length > 1 && projectType === "photo") {
          setProjectType("carousel");
        }
        return next;
      });
    } catch (err) {
      console.error("[Studio Editor] Failed to add media slides:", err);
    }
  };

  // Move slide position (reorder)
  const handleMoveSlide = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    setActiveSlideIndex(toIdx);
  };

  // Delete slide
  const handleDeleteSlide = (idx: number) => {
    if (slides.length <= 1) return; // Keep at least one
    setSlides((prev) => prev.filter((_, i) => i !== idx));
    if (activeSlideIndex >= idx) {
      setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
    }
  };

  // Handle capture cover frame for video
  const handleCaptureCover = async (sec?: number) => {
    if (!currentSlide || currentSlide.type !== "video" || !currentSlide.file) return;
    const targetSec = sec ?? videoCurrentTime;

    try {
      const coverBlob = await captureFrameAtTimestamp(
        currentSlide.file,
        targetSec,
        1080,
        1920
      );
      const coverUrl = URL.createObjectURL(coverBlob);

      updateCurrentSlide((prev) => ({
        ...prev,
        coverBlob,
        coverUrl,
        videoTimeline: prev.videoTimeline
          ? {
              ...prev.videoTimeline,
              coverTimestamp: targetSec,
              coverBlob,
              coverDataUrl: coverUrl,
            }
          : undefined,
      }));
    } catch (err) {
      console.warn("[Video] Cover capture error:", err);
    }
  };

  // Upload helper to /api/studio/upload with categorized Google Drive folder
  const uploadAssetToDrive = async (
    file: File | Blob,
    filename: string,
    category: string,
    onProgress?: (pct: number) => void
  ): Promise<{ id: string; name: string; mime: string; url: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/studio/upload");
      xhr.timeout = 180000; // 3 minute network timeout

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.ontimeout = () => reject(new Error("Upload timed out. Please check your network and retry."));
      xhr.onerror = () => reject(new Error("Network error during upload"));
      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) resolve(res);
          else reject(new Error(res.message || "Upload rejected"));
        } catch {
          reject(new Error("Failed to parse upload response"));
        }
      };

      if (!file) {
        reject(new Error("No file content provided for upload."));
        return;
      }

      const form = new FormData();
      const actualFile =
        file instanceof File
          ? file
          : new File([file], filename, { type: (file as Blob).type || "application/octet-stream" });

      form.set("file", actualFile);
      form.set("category", category);
      xhr.send(form);
    });
  };

  // Save Project Recipe to D1 SQLite database
  const saveProjectToDatabase = async (
    pid: string,
    uploadedItems: Array<{ sourceId?: string; outputId?: string; coverId?: string }>
  ) => {
    try {
      await fetch("/api/studio/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pid,
          project_type: projectType,
          title: projectTitle,
          status: "ready",
          aspect_ratio: aspectRatio,
          width: 1080,
          height: aspectRatio === "9:16" ? 1920 : aspectRatio === "1:1" ? 1080 : 1350,
          duration_ms: Math.round(
            (currentSlide?.videoTimeline?.duration || 0) * 1000
          ),
          items: slides.map((s, idx) => ({
            source_media_id: uploadedItems[idx]?.sourceId || null,
            output_media_id: uploadedItems[idx]?.outputId || null,
            cover_media_id: uploadedItems[idx]?.coverId || null,
            position: idx,
            edit_recipe_json: JSON.stringify({
              filterId: s.filterId,
              filterIntensity: s.filterIntensity,
              adjustments: s.adjustments,
              transform: s.transform,
              textLayers: s.textLayers,
              videoTimeline: s.videoTimeline,
            }),
            version: 1,
          })),
        }),
      });
    } catch (e) {
      console.warn("[Studio DB] Could not record project in D1:", e);
    }
  };

  // Execute Master Export & Finish
  const handleReviewAndPublish = async () => {
    if (slides.length === 0 || busy) return;

    setBusy(true);
    setProgressPct(5);
    setProgressMsg("Preparing media layers for export…");

    const exportedAssets: Array<{
      id: string;
      name: string;
      mime: string;
      url: string;
    }> = [];
    let mainCoverId: string | undefined;
    const dbItemLinks: Array<{ sourceId?: string; outputId?: string; coverId?: string }> = [];

    try {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        setProgressMsg(`Processing slide ${i + 1} of ${slides.length}…`);
        setProgressPct(Math.round(((i + 0.1) / slides.length) * 80));

        const sourceMediaId: string | undefined = slide.mediaId;

        // 1. Render edited output
        let outputBlob: Blob;
        let outputFilename: string;
        let targetCategory: string;

        if (slide.type === "video") {
          targetCategory = "Reels";
          outputFilename = `edited_${slide.name.replace(/\.[^.]+$/, "")}.mp4`;

          let videoFile = slide.file;
          if (!videoFile || videoFile.size === 0) {
            if (slide.sourceUrl) {
              setProgressMsg(`Retrieving video file for "${slide.name}"…`);
              try {
                let res = await fetch(slide.sourceUrl, { credentials: "include" });
                if (!res.ok && res.status === 403 && slide.mediaId) {
                  const refreshed = await fetch(`/api/studio/media-url?id=${slide.mediaId}`, { credentials: "include" }).then(r => r.json() as Promise<{ url?: string }>);
                  if (refreshed?.url) {
                    res = await fetch(refreshed.url, { credentials: "include" });
                  }
                }
                if (res.ok) {
                  const blob = await res.blob();
                  if (blob && blob.size > 0) {
                    videoFile = new File([blob], slide.name || "video.mp4", { type: blob.type || "video/mp4" });
                  }
                }
              } catch (e) {
                console.warn("Could not fetch remote video file:", e);
              }
            }
          }

          if (!videoFile || videoFile.size === 0) {
            throw new Error(`Video file for "${slide.name}" could not be retrieved from storage. Please verify connection and retry.`);
          }

          const timeline: VideoTimelineState = slide.videoTimeline || {
            ...DEFAULT_VIDEO_TIMELINE,
            duration: 15,
            trimStart: 0,
            trimEnd: 15,
          };

          const hasUserEdits = Boolean(
            (timeline.trimStart && timeline.trimStart > 0.1) ||
            (timeline.duration > 0 && timeline.trimEnd > 0 && (timeline.duration - timeline.trimEnd) > 0.3) ||
            (timeline.playbackRate !== undefined && timeline.playbackRate !== 1) ||
            timeline.muted ||
            (timeline.volume !== undefined && timeline.volume !== 1) ||
            (slide.filterId && slide.filterId !== "normal" && slide.filterId !== "original") ||
            (slide.adjustments && (
              Math.abs((slide.adjustments.brightness || 0) + (slide.adjustments.exposure || 0)) > 1 ||
              Math.abs(slide.adjustments.contrast || 0) > 1 ||
              Math.abs(slide.adjustments.saturation || 0) > 1 ||
              Math.abs(slide.adjustments.warmth || 0) > 1 ||
              Math.abs(slide.adjustments.fade || 0) > 1
            )) ||
            (slide.transform && (
              (slide.transform.aspectRatio && slide.transform.aspectRatio !== "original") ||
              (slide.transform.zoom && slide.transform.zoom > 1.02) ||
              (slide.transform.rotation && slide.transform.rotation !== 0) ||
              (slide.transform.straighten && Math.abs(slide.transform.straighten) > 0.5) ||
              slide.transform.flipH ||
              slide.transform.flipV ||
              (slide.transform.x && Math.abs(slide.transform.x) > 0.02) ||
              (slide.transform.y && Math.abs(slide.transform.y) > 0.02)
            ))
          );

          setProgressMsg(`Processing video reel…`);
          try {
            outputBlob = await processVideoWithMediabunny(
              videoFile,
              timeline,
              (p) => {
                setProgressPct(Math.round(((i + p / 100) / slides.length) * 80));
              },
              slide.adjustments,
              slide.filterId,
              slide.filterIntensity,
              slide.transform
            );
          } catch (videoErr) {
            console.warn("[Studio Editor] Video processing error:", videoErr);
            if (hasUserEdits) {
              const confirmFallback = window.confirm(
                `Video processing could not apply edits (${videoErr instanceof Error ? videoErr.message : "Media encoding issue"}).\n\nClick OK to upload the original video without edits, or Cancel to return to the editor.`
              );
              if (!confirmFallback) {
                throw new Error("Video export cancelled by creator after processing error.");
              }
            }
            outputBlob = videoFile;
          }

          if (!outputBlob || outputBlob.size === 0) {
            throw new Error("Generated video file is empty. Export stopped to prevent corrupt upload.");
          }

          // Frame-accurate cover thumbnail
          let coverBlob = slide.coverBlob;
          if (!coverBlob && ((videoFile && videoFile.size > 0) || slide.sourceUrl)) {
            try {
              coverBlob = await captureFrameAtTimestamp(
                (videoFile && videoFile.size > 0) ? videoFile : slide.sourceUrl,
                timeline.coverTimestamp || 0.1,
                1080,
                1920
              );
            } catch (err) {
              console.warn("Cover frame capture fallback:", err);
            }
          }

          let coverAssetId: string | undefined;
          if (coverBlob && coverBlob.size > 0) {
            try {
              setProgressMsg("Uploading video cover thumbnail…");
              const coverAsset = await uploadAssetToDrive(
                coverBlob,
                `cover_${slide.name.replace(/\.[^.]+$/, "")}.jpg`,
                "Covers"
              );
              coverAssetId = coverAsset.id;
              if (!mainCoverId) mainCoverId = coverAsset.id;
            } catch (covErr) {
              console.warn("Cover upload fallback:", covErr);
            }
          }

          // 2. Upload video output
          setProgressMsg(`Uploading reel to private vault…`);
          const uploadedEdited = await uploadAssetToDrive(
            outputBlob,
            outputFilename,
            targetCategory,
            (pct) => {
              setProgressPct(Math.round(((i + 0.8 + pct * 0.002) / slides.length) * 90));
            }
          );

          exportedAssets.push(uploadedEdited);
          dbItemLinks.push({
            sourceId: sourceMediaId || uploadedEdited.id,
            outputId: uploadedEdited.id,
            ...(coverAssetId ? { coverId: coverAssetId } : {}),
          });
        } else {
          // Photo slide export via Fabric
          targetCategory = projectType === "story" ? "Stories" : "Edited";
          outputFilename = `edited_${slide.name.replace(/\.[^.]+$/, "")}.jpg`;

          if (activeSlideIndex === i && exportPhotoRef.current) {
            outputBlob = await exportPhotoRef.current();
          } else if (slide.renderedBlob && slide.renderedBlob.size > 0) {
            outputBlob = slide.renderedBlob;
          } else if (slide.file && slide.file.size > 0) {
            outputBlob = slide.file;
          } else if (slide.sourceUrl) {
            try {
              const res = await fetch(slide.sourceUrl);
              outputBlob = await res.blob();
            } catch {
              outputBlob = new Blob([]);
            }
          } else {
            outputBlob = new Blob([]);
          }

          setProgressMsg(`Uploading edited media to private vault (${targetCategory})…`);
          const uploadedEdited = await uploadAssetToDrive(
            outputBlob,
            outputFilename,
            targetCategory,
            (pct) => {
              setProgressPct(Math.round(((i + 0.8 + pct * 0.002) / slides.length) * 90));
            }
          );

          exportedAssets.push(uploadedEdited);
          dbItemLinks.push({
            sourceId: sourceMediaId || uploadedEdited.id,
            outputId: uploadedEdited.id,
          });
        }
      }

      setProgressPct(95);
      setProgressMsg("Saving project recipe to database…");

      const finalPid = projectId || crypto.randomUUID();
      await saveProjectToDatabase(finalPid, dbItemLinks);
      await clearAllDraftsFromIndexedDB();

      setProgressPct(100);
      setProgressMsg("Complete! Ready to configure details.");

      // Hand off to parent for explicit confirmation before publishing
      onDone({
        assets: exportedAssets,
        coverId: mainCoverId || exportedAssets[0]?.id,
        projectId: finalPid,
      });
    } catch (err) {
      console.error("[Nina Studio Editor] Export error:", err);
      alert(err instanceof Error ? err.message : "Export failed. Please retry.");
    } finally {
      setBusy(false);
    }
  };

  // Skip editing button: bypasses directly to publishing with raw files
  const handleSkipEditing = () => {
    if (onSkip && initialFiles.length > 0) {
      onSkip(initialFiles);
      onClose();
    } else {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="media-editor-dialog" showCloseButton={false}>
        {/* Top Header */}
        <div className="media-editor-header">
          <div className="media-editor-header-title">
            <Sparkles size={16} style={{ color: "#e56b83", flexShrink: 0 }} />
            <span className="editor-title-text">{title}</span>
            <span className="badge">
              {projectType.toUpperCase()} · {aspectRatio}
            </span>
          </div>

          <div className="media-editor-header-actions">
            {/* Skip Editing Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={handleSkipEditing}
              className="btn-skip-editor"
              style={{ color: "#aaa" }}
            >
              Skip
            </Button>

            {/* Hold to compare */}
            {currentSlide?.type === "image" && (
              <button
                type="button"
                className="btn-compare"
                onMouseDown={() => setComparing(true)}
                onMouseUp={() => setComparing(false)}
                onTouchStart={() => setComparing(true)}
                onTouchEnd={() => setComparing(false)}
                title="Hold to see original"
              >
                <Eye size={14} />
                <span className="btn-compare-label">{comparing ? "Orig" : "Hold"}</span>
              </button>
            )}

            {/* Safe Guides Toggle */}
            <button
              type="button"
              className={`btn-guide ${showSafeGuides ? "active" : ""}`}
              onClick={() => setShowSafeGuides((v) => !v)}
              title="Toggle safe area & grid guides"
            >
              <Grid3X3 size={15} />
            </button>

            {/* Close */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={onClose}
              className="btn-editor-cancel"
            >
              Cancel
            </Button>

            {/* Next / Review & Publish */}
            <button
              type="button"
              className="btn-done"
              disabled={
                busy ||
                slides.length === 0 ||
                slides.some(
                  (s) =>
                    s.isMediaLoading ||
                    !!s.mediaError ||
                    (s.type === "video" && s.isMediaReady === false)
                )
              }
              onClick={handleReviewAndPublish}
              title={
                slides.some((s) => s.isMediaLoading)
                  ? "Waiting for media to load..."
                  : slides.some((s) => s.mediaError)
                  ? "Fix or retry failed media before continuing"
                  : undefined
              }
            >
              {busy ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{progressPct}%</span>
                </>
              ) : slides.some((s) => s.isMediaLoading) ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Crash Recovery Banner */}
        {showRecoveryBanner && recoveredDraft && (
          <div className="media-editor-recovery-banner">
            <div className="banner-text">
              <AlertTriangle size={16} className="text-amber-400" />
              <span>
                Unsaved project draft found (
                {new Date(recoveredDraft.lastSavedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                ). Would you like to restore your edits?
              </span>
            </div>
            <div className="banner-actions">
              <button
                type="button"
                className="btn-banner-restore"
                onClick={handleRestoreDraft}
              >
                Restore draft
              </button>
              <button
                type="button"
                className="btn-banner-discard"
                onClick={handleDiscardDraft}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Workspace Body */}
        <div className="media-editor-body">
          {/* Main Stage / Viewport (Left / Center) */}
          <div className="media-editor-viewport">
            {currentSlide ? (
              currentSlide.type === "video" ? (
                /* Video Player Stage */
                <div className="video-player-stage">
                  {currentSlide.isMediaLoading && (
                    <div className="video-player-loading-overlay">
                      <Loader2 size={36} className="animate-spin text-rose-500" />
                      <p>Loading video stream & metadata...</p>
                    </div>
                  )}

                  {currentSlide.mediaError && (
                    <div className="video-player-error-banner">
                      <AlertTriangle size={24} className="text-amber-400" />
                      <p>{currentSlide.mediaError}</p>
                      <button
                        type="button"
                        className="btn-retry-video"
                        onClick={() => {
                          loadExistingVideoSlide(
                            activeSlideIndex,
                            currentSlide.sourceUrl,
                            currentSlide.mediaId,
                            currentSlide.name,
                            currentSlide.coverUrl
                          );
                          if (videoPlayerRef.current) {
                            videoPlayerRef.current.load();
                          }
                        }}
                      >
                        Retry Video
                      </button>
                    </div>
                  )}

                  {/* Main Video Crop Stage Viewport */}
                  <div className="video-crop-stage-viewport">
                    <div
                      className="video-aspect-mask"
                      onMouseDown={(e) => {
                        if (e.button !== 0) return;
                        dragStartRef.current = {
                          clientX: e.clientX,
                          clientY: e.clientY,
                          initX: currentSlide.transform?.x || 0,
                          initY: currentSlide.transform?.y || 0,
                        };
                        setIsDraggingVideo(true);
                      }}
                      onMouseMove={(e) => {
                        if (!dragStartRef.current) return;
                        const dx = (e.clientX - dragStartRef.current.clientX) / 300;
                        const dy = (e.clientY - dragStartRef.current.clientY) / 300;
                        const newX = Math.max(-1, Math.min(1, Number((dragStartRef.current.initX + dx).toFixed(3))));
                        const newY = Math.max(-1, Math.min(1, Number((dragStartRef.current.initY + dy).toFixed(3))));
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          transform: { ...prev.transform, x: newX, y: newY },
                        }));
                      }}
                      onMouseUp={() => {
                        dragStartRef.current = null;
                        setIsDraggingVideo(false);
                      }}
                      onMouseLeave={() => {
                        dragStartRef.current = null;
                        setIsDraggingVideo(false);
                      }}
                      onTouchStart={(e) => {
                        if (e.touches.length !== 1) return;
                        const t = e.touches[0];
                        dragStartRef.current = {
                          clientX: t.clientX,
                          clientY: t.clientY,
                          initX: currentSlide.transform?.x || 0,
                          initY: currentSlide.transform?.y || 0,
                        };
                      }}
                      onTouchMove={(e) => {
                        if (!dragStartRef.current || e.touches.length !== 1) return;
                        const t = e.touches[0];
                        const dx = (t.clientX - dragStartRef.current.clientX) / 260;
                        const dy = (t.clientY - dragStartRef.current.clientY) / 260;
                        const newX = Math.max(-1, Math.min(1, Number((dragStartRef.current.initX + dx).toFixed(3))));
                        const newY = Math.max(-1, Math.min(1, Number((dragStartRef.current.initY + dy).toFixed(3))));
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          transform: { ...prev.transform, x: newX, y: newY },
                        }));
                      }}
                      onTouchEnd={() => {
                        dragStartRef.current = null;
                      }}
                      onWheel={(e) => {
                        e.preventDefault();
                        const delta = e.deltaY < 0 ? 0.05 : -0.05;
                        const currentZ = currentSlide.transform?.zoom || 1;
                        const nextZ = Math.min(3, Math.max(1, Number((currentZ + delta).toFixed(2))));
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          transform: { ...prev.transform, zoom: nextZ },
                        }));
                      }}
                      style={{
                        aspectRatio:
                          aspectRatio === "9:16" ? "9 / 16" :
                          aspectRatio === "1:1" ? "1 / 1" :
                          aspectRatio === "4:5" ? "4 / 5" :
                          aspectRatio === "16:9" ? "16 / 9" : undefined,
                        width: aspectRatio === "original" ? "auto" : (aspectRatio === "16:9" ? "100%" : "auto"),
                        height: aspectRatio === "original" ? "100%" : (aspectRatio === "16:9" ? "auto" : "100%"),
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    >
                      <video
                        ref={videoPlayerRef}
                        src={currentSlide.sourceUrl}
                        playsInline
                        crossOrigin="anonymous"
                        preload="auto"
                        muted={currentSlide.videoTimeline?.muted}
                        onLoadedMetadata={(e) => {
                          const vid = e.currentTarget;
                          const dur = vid.duration;
                          if (dur && Number.isFinite(dur) && dur > 0) {
                            updateCurrentSlide((prev) => {
                              const vt = prev.videoTimeline || { ...DEFAULT_VIDEO_TIMELINE };
                              const isDefaultDuration = !vt.duration || vt.duration <= 0 || vt.duration === 15;
                              const newDuration = isDefaultDuration ? dur : vt.duration;
                              const newTrimEnd = (isDefaultDuration || vt.trimEnd > dur) ? dur : vt.trimEnd;
                              return {
                                ...prev,
                                videoTimeline: {
                                  ...vt,
                                  duration: newDuration,
                                  trimEnd: newTrimEnd,
                                },
                              };
                            });
                          }
                        }}
                        onLoadedData={() => {
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            isMediaLoading: false,
                            isMediaReady: true,
                            mediaError: undefined,
                          }));
                        }}
                        onCanPlay={() => {
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            isMediaLoading: false,
                            isMediaReady: true,
                            mediaError: undefined,
                          }));
                        }}
                        onError={(e) => {
                          const mediaErr = (e.currentTarget as HTMLVideoElement).error;
                          const msg = mediaErr
                            ? `Video playback error (${mediaErr.code}): ${mediaErr.message || "Failed to decode or play video stream"}`
                            : "Video stream failed to load or decode.";
                          console.error("[Studio Editor] Video element error:", mediaErr, e);
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            isMediaLoading: false,
                            isMediaReady: false,
                            mediaError: msg,
                          }));
                        }}
                        onTimeUpdate={() => {
                          if (videoPlayerRef.current) {
                            const cur = videoPlayerRef.current.currentTime;
                            setVideoCurrentTime(cur);
                            const trimStart = currentSlide.videoTimeline?.trimStart || 0;
                            const trimEnd = currentSlide.videoTimeline?.trimEnd || currentSlide.videoTimeline?.duration || 99999;
                            if (trimEnd > trimStart + 0.1 && cur >= trimEnd) {
                              videoPlayerRef.current.currentTime = trimStart;
                            }
                          }
                        }}
                        onEnded={() => setIsPlaying(false)}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: aspectRatio === "original" ? "contain" : "cover",
                          transform: `translate(${(currentSlide.transform?.x || 0) * 100}%, ${(currentSlide.transform?.y || 0) * 100}%) scale(${currentSlide.transform?.zoom || 1}) rotate(${((currentSlide.transform?.rotation || 0) + (currentSlide.transform?.straighten || 0))}deg) scaleX(${currentSlide.transform?.flipH ? -1 : 1}) scaleY(${currentSlide.transform?.flipV ? -1 : 1})`,
                          transformOrigin: "center center",
                          transition: isDraggingVideo ? "none" : "transform 0.08s ease-out, filter 0.15s ease",
                          filter: buildVideoFilterString(
                            currentSlide.adjustments,
                            currentSlide.filterId,
                            currentSlide.filterIntensity
                          ),
                          pointerEvents: "none",
                        }}
                      />

                      {/* 3x3 Rule-of-Thirds Grid Guides */}
                      {showSafeGuides && (
                        <div className="grid-overlay visible" style={{ pointerEvents: "none" }}>
                          <div className="grid-cell" />
                          <div className="grid-cell" />
                          <div className="grid-cell" />
                          <div className="grid-cell" />
                          <div className="grid-cell" />
                          <div className="grid-cell" />
                          <div className="grid-cell" />
                          <div className="grid-cell" />
                          <div className="grid-cell" />
                        </div>
                      )}

                      {/* Reels / Story Safe Margins */}
                      {showSafeGuides && aspectRatio === "9:16" && (
                        <div className="video-reel-guides">
                          <div className="reel-guide-top">
                            <span>Profile Header Safe</span>
                          </div>
                          <div className="reel-guide-right">
                            <span>Actions</span>
                          </div>
                          <div className="reel-guide-bottom">
                            <span>Captions &amp; Audio Safe Zone</span>
                          </div>
                        </div>
                      )}

                      {/* Center Play / Pause trigger */}
                      {!currentSlide.mediaError && !currentSlide.isMediaLoading && (
                        <div
                          className={`video-center-play-trigger ${!isPlaying ? "is-paused" : ""}`}
                          onClick={() => {
                            if (!videoPlayerRef.current) return;
                            if (isPlaying) {
                              videoPlayerRef.current.pause();
                              setIsPlaying(false);
                            } else {
                              videoPlayerRef.current.play()
                                .then(() => setIsPlaying(true))
                                .catch((err) => {
                                  console.warn("[Studio Editor] Play interrupted:", err);
                                  setIsPlaying(false);
                                });
                            }
                          }}
                        >
                          <div className="btn-center-play-circle">
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Floating Viewport Position & Alignment Pill */}
                  <div className="viewport-position-badge" style={{ margin: "2px 0 0" }}>
                    <div className="badge-item">
                      <Move size={12} />
                      <span>Drag video to reposition</span>
                    </div>
                    <span className="badge-bullet">•</span>
                    <div className="badge-item">
                      <ZoomIn size={12} />
                      <span>Scroll to zoom ({(currentSlide.transform?.zoom || 1).toFixed(2)}x)</span>
                    </div>
                    {((currentSlide.transform?.zoom || 1) > 1.01 ||
                      (currentSlide.transform?.x && Math.abs(currentSlide.transform.x) > 0.01) ||
                      (currentSlide.transform?.y && Math.abs(currentSlide.transform.y) > 0.01) ||
                      (currentSlide.transform?.rotation && currentSlide.transform.rotation !== 0)) && (
                      <>
                        <span className="badge-bullet">•</span>
                        <button
                          type="button"
                          className="badge-btn-reset"
                          onClick={() => {
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              transform: {
                                ...prev.transform,
                                x: 0,
                                y: 0,
                                zoom: 1,
                                rotation: 0,
                                straighten: 0,
                                flipH: false,
                                flipV: false,
                              },
                            }));
                          }}
                        >
                          Reset Framing
                        </button>
                      </>
                    )}
                  </div>

                  {/* Professional Video Playback Suite Bar */}
                  <div className="video-suite-playback-bar">
                    {/* Scrubber Timeline */}
                    <div
                      className="video-scrubber-track-wrap"
                      onClick={(e) => {
                        if (!videoPlayerRef.current) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        const dur = currentSlide.videoTimeline?.duration || videoPlayerRef.current.duration || 15;
                        const targetTime = pos * dur;
                        videoPlayerRef.current.currentTime = targetTime;
                        setVideoCurrentTime(targetTime);
                      }}
                    >
                      <div className="video-scrubber-track">
                        {/* Trim range indicator */}
                        <div
                          className="video-scrubber-trim-range"
                          style={{
                            left: `${((currentSlide.videoTimeline?.trimStart || 0) / (currentSlide.videoTimeline?.duration || 15)) * 100}%`,
                            width: `${(((currentSlide.videoTimeline?.trimEnd || currentSlide.videoTimeline?.duration || 15) - (currentSlide.videoTimeline?.trimStart || 0)) / (currentSlide.videoTimeline?.duration || 15)) * 100}%`,
                          }}
                        />
                        {/* Playhead progress */}
                        <div
                          className="video-scrubber-progress"
                          style={{
                            width: `${((videoCurrentTime || 0) / (currentSlide.videoTimeline?.duration || 15)) * 100}%`,
                          }}
                        />
                        <div
                          className="video-scrubber-playhead"
                          style={{
                            left: `${((videoCurrentTime || 0) / (currentSlide.videoTimeline?.duration || 15)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Playback Controls Row */}
                    <div className="video-playback-controls-row">
                      <div className="playback-controls-left">
                        <button
                          type="button"
                          className="btn-suite-play"
                          onClick={() => {
                            if (!videoPlayerRef.current) return;
                            if (isPlaying) {
                              videoPlayerRef.current.pause();
                              setIsPlaying(false);
                            } else {
                              videoPlayerRef.current.play()
                                .then(() => setIsPlaying(true))
                                .catch(() => setIsPlaying(false));
                            }
                          }}
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                          <span>{isPlaying ? "Pause" : "Play"}</span>
                        </button>

                        <span className="timecode-display">
                          {formatTimecode(videoCurrentTime)} / {formatTimecode(currentSlide.videoTimeline?.duration || 15)}
                        </span>
                      </div>

                      <div className="playback-controls-center">
                        <div className="speed-pills-group">
                          {[0.5, 1, 1.5, 2].map((spd) => (
                            <button
                              key={spd}
                              type="button"
                              className={`speed-pill ${(currentSlide.videoTimeline?.playbackRate || 1) === spd ? "active" : ""}`}
                              onClick={() => {
                                if (videoPlayerRef.current) {
                                  videoPlayerRef.current.playbackRate = spd;
                                }
                                updateCurrentSlide((prev) => ({
                                  ...prev,
                                  videoTimeline: {
                                    ...(prev.videoTimeline || DEFAULT_VIDEO_TIMELINE),
                                    playbackRate: spd,
                                  },
                                }));
                              }}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="playback-controls-right">
                        <button
                          type="button"
                          className={`btn-suite-icon ${currentSlide.videoTimeline?.muted ? "active" : ""}`}
                          title={currentSlide.videoTimeline?.muted ? "Unmute" : "Mute"}
                          onClick={() => {
                            const newMuted = !currentSlide.videoTimeline?.muted;
                            if (videoPlayerRef.current) {
                              videoPlayerRef.current.muted = newMuted;
                            }
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              videoTimeline: {
                                ...(prev.videoTimeline || DEFAULT_VIDEO_TIMELINE),
                                muted: newMuted,
                              },
                            }));
                          }}
                        >
                          {currentSlide.videoTimeline?.muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                        </button>

                        <button
                          type="button"
                          className={`btn-suite-icon ${showSafeGuides ? "active" : ""}`}
                          title="Toggle Safe Framing Guides"
                          onClick={() => setShowSafeGuides(!showSafeGuides)}
                        >
                          <Grid3X3 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Fabric Photo Canvas Stage */
                <>
                  <FabricPhotoCanvas
                    sourceUrl={currentSlide.sourceUrl}
                    aspectRatio={aspectRatio}
                    transform={currentSlide.transform}
                    filterId={currentSlide.filterId}
                    filterIntensity={currentSlide.filterIntensity}
                    adjustments={currentSlide.adjustments}
                    textLayers={currentSlide.textLayers}
                    isDrawing={isDrawing}
                    brushColor={brushColor}
                    brushSize={brushSize}
                    comparing={comparing}
                    showSafeGuides={showSafeGuides}
                    onExportReady={handleExportReady}
                    onTransformChange={(newT) => {
                      updateCurrentSlide((prev) => ({
                        ...prev,
                        transform: {
                          ...prev.transform,
                          ...newT,
                        },
                      }));
                    }}
                  />

                  {/* Floating Viewport Interaction & Alignment Pill */}
                  <div className="viewport-position-badge">
                    <div className="badge-item">
                      <Move size={12} />
                      <span>Drag to position</span>
                    </div>
                    <span className="badge-bullet">•</span>
                    <div className="badge-item">
                      <span>Scroll to zoom</span>
                    </div>
                    {((currentSlide.transform.zoom || 1) > 1.01 ||
                      (currentSlide.transform.x || 0) !== 0 ||
                      (currentSlide.transform.y || 0) !== 0) && (
                      <>
                        <span className="badge-bullet">•</span>
                        <span className="badge-stat">
                          {(currentSlide.transform.zoom || 1).toFixed(1)}x
                          {(currentSlide.transform.x || 0) !== 0
                            ? ` · X ${Math.round((currentSlide.transform.x || 0) * 100)}%`
                            : ""}
                          {(currentSlide.transform.y || 0) !== 0
                            ? ` · Y ${Math.round((currentSlide.transform.y || 0) * 100)}%`
                            : ""}
                        </span>
                        <button
                          type="button"
                          className="badge-center-btn"
                          title="Center photo framing"
                          onClick={() => {
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              transform: { ...prev.transform, x: 0, y: 0 },
                            }));
                          }}
                        >
                          Center
                        </button>
                      </>
                    )}
                  </div>
                </>
              )
            ) : (
              <div
                className="stage-empty"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.length) {
                    void handleAddSlideFiles(e.dataTransfer.files);
                  }
                }}
                style={{ textAlign: "center", padding: "40px 20px" }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(229, 107, 131, 0.12)",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 16px",
                    color: "var(--ag-rose, #e56b83)",
                    border: "1px solid rgba(229, 107, 131, 0.3)",
                  }}
                >
                  <Sparkles size={30} />
                </div>
                <h4 style={{ fontSize: 18, color: "#fff", margin: "0 0 8px", fontWeight: 600 }}>
                  Open Media in Studio Editor
                </h4>
                <p style={{ fontSize: 13, color: "var(--ag-muted, #aaa)", maxWidth: 360, margin: "0 auto 20px", lineHeight: 1.5 }}>
                  Drop photos or videos here, or select files to start cropping, filtering, and refining your drops.
                </p>
                <label
                  className="button"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #e54b7c, #982f55)",
                    color: "#fff",
                    fontWeight: 700,
                    padding: "0 22px",
                    minHeight: 42,
                    borderRadius: 8,
                  }}
                >
                  <Upload size={16} /> Choose Photos or Videos
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.mp4,.mov,.webm,.m4v,.jpeg,.jpg,.png,.webp"
                    style={{ display: "none" }}
                    onClick={(e) => {
                      (e.target as HTMLInputElement).value = "";
                    }}
                    onChange={(e) => {
                      if (e.target.files) void handleAddSlideFiles(e.target.files);
                    }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Right Tool Sidebar */}
          <div className="media-editor-sidebar">
            {/* Tool Category Tabs */}
            <div className="media-editor-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === "crop" ? "active" : ""}`}
                onClick={() => {
                  setIsDrawing(false);
                  setActiveTab("crop");
                }}
              >
                <Crop size={16} />
                <span>Crop</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === "filter" ? "active" : ""}`}
                onClick={() => {
                  setIsDrawing(false);
                  setActiveTab("filter");
                }}
              >
                <Sparkles size={16} />
                <span>Filter</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === "adjust" ? "active" : ""}`}
                onClick={() => {
                  setIsDrawing(false);
                  setActiveTab("adjust");
                }}
              >
                <Sliders size={16} />
                <span>Adjust</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === "text" ? "active" : ""}`}
                onClick={() => {
                  setIsDrawing(false);
                  setActiveTab("text");
                }}
              >
                <Type size={16} />
                <span>Text</span>
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === "draw" ? "active" : ""}`}
                onClick={() => {
                  setIsDrawing(true);
                  setActiveTab("draw");
                }}
              >
                <Paintbrush size={16} />
                <span>Draw</span>
              </button>

              {currentSlide?.type === "video" && (
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "video" ? "active" : ""}`}
                  onClick={() => {
                    setIsDrawing(false);
                    setActiveTab("video");
                  }}
                >
                  <VideoIcon size={16} />
                  <span>Reel / Video</span>
                </button>
              )}
            </div>

            {/* Tool Panel Contents */}
            <div className="media-editor-panel">
              {/* TAB 1: CROP & TRANSFORM */}
              {activeTab === "crop" && (
                <div className="panel-section">
                  <h4>Aspect Ratio Presets</h4>
                  <div className="ratio-grid">
                    {(Object.entries(ASPECT_RATIOS) as Array<[AspectRatioType, { label: string; ratio: number | null; icon: string }]>).map(([key, r]) => (
                      <button
                        key={key}
                        type="button"
                        className={`ratio-btn ${aspectRatio === key ? "active" : ""}`}
                        onClick={() => {
                          setAspectRatio(key);
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            transform: { ...prev.transform, aspectRatio: key },
                          }));
                        }}
                      >
                        <span className="ratio-label">{r.label}</span>
                        <span className="ratio-sub">{key === "original" ? "Original Bounds" : key}</span>
                      </button>
                    ))}
                  </div>

                  <h4 style={{ marginTop: 20 }}>Transform & Orientation</h4>
                  <div className="transform-actions">
                    <button
                      type="button"
                      className="transform-btn"
                      onClick={() =>
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          transform: {
                            ...prev.transform,
                            rotation: ((prev.transform.rotation || 0) + 90) % 360,
                          },
                        }))
                      }
                    >
                      <RotateCw size={16} />
                      <span>Rotate 90°</span>
                    </button>

                    <button
                      type="button"
                      className="transform-btn"
                      onClick={() =>
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          transform: {
                            ...prev.transform,
                            flipH: !prev.transform.flipH,
                          },
                        }))
                      }
                    >
                      <FlipHorizontal size={16} />
                      <span>Flip H</span>
                    </button>

                    <button
                      type="button"
                      className="transform-btn"
                      onClick={() =>
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          transform: {
                            ...prev.transform,
                            flipV: !prev.transform.flipV,
                          },
                        }))
                      }
                    >
                      <FlipVertical size={16} />
                      <span>Flip V</span>
                    </button>
                  </div>

                  {/* Zoom Presets & Slider */}
                  <div className="slider-group" style={{ marginTop: 16 }}>
                    <div className="slider-header">
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <ZoomIn size={14} />
                        <span>Zoom & Scale</span>
                      </span>
                      <span className="slider-val-badge">
                        {(currentSlide?.transform.zoom || 1).toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.01}
                      value={currentSlide?.transform.zoom || 1}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          transform: { ...prev.transform, zoom: val },
                        }));
                      }}
                    />
                    <div className="zoom-preset-pills">
                      {[
                        { label: "1.0x (Fit)", value: 1 },
                        { label: "1.25x", value: 1.25 },
                        { label: "1.5x", value: 1.5 },
                        { label: "2.0x", value: 2 },
                        { label: "3.0x", value: 3 },
                      ].map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          className={`pill-preset ${
                            Math.abs((currentSlide?.transform.zoom || 1) - preset.value) < 0.04 ? "active" : ""
                          }`}
                          onClick={() => {
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              transform: { ...prev.transform, zoom: preset.value },
                            }));
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Positioning & Framing Alignment Section */}
                  <div className="framing-header" style={{ marginTop: 22 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13 }}>
                      <Move size={14} />
                      <span>Positioning & Framing</span>
                    </span>
                    <div className="framing-quick-actions">
                      <button
                        type="button"
                        className="btn-text-action"
                        title="Center photo framing"
                        onClick={() => {
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            transform: { ...prev.transform, x: 0, y: 0 },
                          }));
                        }}
                      >
                        <Crosshair size={12} />
                        <span>Center</span>
                      </button>
                      <button
                        type="button"
                        className="btn-text-action"
                        title="Reset crop, zoom & positioning"
                        onClick={() => {
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            transform: {
                              ...prev.transform,
                              zoom: 1,
                              x: 0,
                              y: 0,
                              straighten: 0,
                            },
                          }));
                        }}
                      >
                        <RotateCcw size={12} />
                        <span>Reset</span>
                      </button>
                    </div>
                  </div>

                  {/* D-Pad Micro-Nudge Pad & Precision Adjustment */}
                  <div className="nudge-section">
                    <div className="nudge-dpad">
                      <button
                        type="button"
                        className="dpad-btn dpad-up"
                        title="Nudge Up (5%)"
                        onClick={() => {
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            transform: {
                              ...prev.transform,
                              y: Math.max(-1, Math.min(1, Number(((prev.transform.y || 0) - 0.05).toFixed(3)))),
                            },
                          }));
                        }}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <div className="dpad-middle">
                        <button
                          type="button"
                          className="dpad-btn dpad-left"
                          title="Nudge Left (5%)"
                          onClick={() => {
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              transform: {
                                ...prev.transform,
                                x: Math.max(-1, Math.min(1, Number(((prev.transform.x || 0) - 0.05).toFixed(3)))),
                              },
                            }));
                          }}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          className="dpad-btn dpad-center"
                          title="Center Framing"
                          onClick={() => {
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              transform: { ...prev.transform, x: 0, y: 0 },
                            }));
                          }}
                        >
                          <Crosshair size={13} />
                        </button>
                        <button
                          type="button"
                          className="dpad-btn dpad-right"
                          title="Nudge Right (5%)"
                          onClick={() => {
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              transform: {
                                ...prev.transform,
                                x: Math.max(-1, Math.min(1, Number(((prev.transform.x || 0) + 0.05).toFixed(3)))),
                              },
                            }));
                          }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="dpad-btn dpad-down"
                        title="Nudge Down (5%)"
                        onClick={() => {
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            transform: {
                              ...prev.transform,
                              y: Math.max(-1, Math.min(1, Number(((prev.transform.y || 0) + 0.05).toFixed(3)))),
                            },
                          }));
                        }}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <div className="nudge-info">
                      <div className="nudge-hint">
                        <strong>Drag photo</strong> directly on canvas to reposition, or use micro-nudge buttons
                      </div>
                      <div className="nudge-readout-row">
                        <span>Horiz (X):</span>
                        <strong>
                          {Math.round((currentSlide?.transform.x || 0) * 100)}%
                          {(currentSlide?.transform.x || 0) === 0
                            ? " (Center)"
                            : (currentSlide?.transform.x || 0) < 0
                            ? " (Left)"
                            : " (Right)"}
                        </strong>
                      </div>
                      <div className="nudge-readout-row">
                        <span>Vert (Y):</span>
                        <strong>
                          {Math.round((currentSlide?.transform.y || 0) * 100)}%
                          {(currentSlide?.transform.y || 0) === 0
                            ? " (Center)"
                            : (currentSlide?.transform.y || 0) < 0
                            ? " (Top)"
                            : " (Bottom)"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Pan X Slider */}
                  <div className="slider-group" style={{ marginTop: 12 }}>
                    <div className="slider-header">
                      <span>Horizontal Pan (X)</span>
                      <span className="slider-val-badge">
                        {(currentSlide?.transform.x || 0) > 0 ? "+" : ""}
                        {Math.round((currentSlide?.transform.x || 0) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      step={1}
                      value={Math.round((currentSlide?.transform.x || 0) * 100)}
                      onChange={(e) => {
                        const val = Number(e.target.value) / 100;
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          transform: { ...prev.transform, x: val },
                        }));
                      }}
                    />
                    <div className="slider-sub-labels">
                      <span>Left</span>
                      <span>Center</span>
                      <span>Right</span>
                    </div>
                  </div>

                  {/* Vertical Pan Y Slider */}
                  <div className="slider-group">
                    <div className="slider-header">
                      <span>Vertical Pan (Y)</span>
                      <span className="slider-val-badge">
                        {(currentSlide?.transform.y || 0) > 0 ? "+" : ""}
                        {Math.round((currentSlide?.transform.y || 0) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      step={1}
                      value={Math.round((currentSlide?.transform.y || 0) * 100)}
                      onChange={(e) => {
                        const val = Number(e.target.value) / 100;
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          transform: { ...prev.transform, y: val },
                        }));
                      }}
                    />
                    <div className="slider-sub-labels">
                      <span>Top</span>
                      <span>Center</span>
                      <span>Bottom</span>
                    </div>
                  </div>

                  {/* Straighten Slider */}
                  <div className="slider-group" style={{ marginTop: 12 }}>
                    <div className="slider-header">
                      <span>Straighten & Level</span>
                      <span className="slider-val-badge">{(currentSlide?.transform.straighten || 0)}°</span>
                    </div>
                    <input
                      type="range"
                      min={-45}
                      max={45}
                      step={1}
                      value={currentSlide?.transform.straighten || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          transform: { ...prev.transform, straighten: val },
                        }));
                      }}
                    />
                  </div>

                  {/* Global Apply to all */}
                  {slides.length > 1 && (
                    <button
                      type="button"
                      className="btn-apply-all"
                      onClick={handleApplyToAllSlides}
                    >
                      <Layers size={14} />
                      <span>Apply crop & aspect to all slides</span>
                    </button>
                  )}
                </div>
              )}

              {/* TAB 2: FILTERS */}
              {activeTab === "filter" && (
                <div className="panel-section">
                  <h4>Instagram Filter Presets</h4>
                  <div className="filters-carousel-grid">
                    {FILTER_PRESETS.map((fp) => (
                      <button
                        key={fp.id}
                        type="button"
                        className={`filter-card ${
                          currentSlide?.filterId === fp.id ? "active" : ""
                        }`}
                        onClick={() => {
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            filterId: fp.id,
                            filterIntensity: 100,
                          }));
                        }}
                      >
                        <div
                          className="filter-preview-thumb"
                          style={{
                            background:
                              fp.id === "normal"
                                ? "#333"
                                : fp.id === "clarendon"
                                ? "linear-gradient(135deg, #1a365d, #702459)"
                                : fp.id === "juno"
                                ? "linear-gradient(135deg, #742a2a, #2b6cb0)"
                                : fp.id === "moon"
                                ? "linear-gradient(135deg, #4a5568, #1a202c)"
                                : "linear-gradient(135deg, #975a16, #2d3748)",
                          }}
                        >
                          <span>{fp.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <span className="filter-name">{fp.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Filter Intensity Slider */}
                  {currentSlide && currentSlide.filterId !== "normal" && (
                    <div className="slider-group" style={{ marginTop: 20 }}>
                      <div className="slider-header">
                        <span>Intensity</span>
                        <span>{currentSlide.filterIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={currentSlide.filterIntensity}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            filterIntensity: val,
                          }));
                        }}
                      />
                    </div>
                  )}

                  {slides.length > 1 && (
                    <button
                      type="button"
                      className="btn-apply-all"
                      onClick={handleApplyToAllSlides}
                    >
                      <Layers size={14} />
                      <span>Apply filter to all slides</span>
                    </button>
                  )}
                </div>
              )}

              {/* TAB 3: ADJUSTMENTS (14 SLIDERS) */}
              {activeTab === "adjust" && (
                <div className="panel-section">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <h4>Tone & Lighting Adjustments</h4>
                    <button
                      type="button"
                      className="btn-reset-adjustments"
                      onClick={() =>
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          adjustments: { ...DEFAULT_TONE_ADJUSTMENTS },
                        }))
                      }
                    >
                      <RotateCcw size={12} />
                      <span>Reset</span>
                    </button>
                  </div>

                  {[
                    { key: "brightness", label: "Brightness", min: -100, max: 100 },
                    { key: "exposure", label: "Exposure", min: -100, max: 100 },
                    { key: "contrast", label: "Contrast", min: -100, max: 100 },
                    { key: "saturation", label: "Saturation", min: -100, max: 100 },
                    { key: "warmth", label: "Warmth", min: -100, max: 100 },
                    { key: "tint", label: "Tint", min: -100, max: 100 },
                    { key: "vibrance", label: "Vibrance", min: -100, max: 100 },
                    { key: "highlights", label: "Highlights", min: -100, max: 100 },
                    { key: "shadows", label: "Shadows", min: -100, max: 100 },
                    { key: "sharpen", label: "Sharpen", min: 0, max: 100 },
                    { key: "vignette", label: "Vignette", min: 0, max: 100 },
                    { key: "fade", label: "Fade", min: 0, max: 100 },
                    { key: "clarity", label: "Clarity", min: -100, max: 100 },
                    { key: "grain", label: "Film Grain", min: 0, max: 100 },
                  ].map(({ key, label, min, max }) => {
                    const val = ((currentSlide?.adjustments as unknown) as Record<string, number>)?.[key] ?? 0;
                    return (
                      <div key={key} className="slider-group">
                        <div className="slider-header">
                          <span>{label}</span>
                          <span>{val}</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={1}
                          value={val}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              adjustments: {
                                ...prev.adjustments,
                                [key]: v,
                              },
                            }));
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 4: TEXT & BADGES */}
              {activeTab === "text" && (
                <div className="panel-section">
                  <h4>Typography & VIP Badges</h4>
                  <p style={{ fontSize: 12, color: "#999", margin: "4px 0 14px" }}>
                    Add member watermarks, titles, or luxury badges directly to your canvas.
                  </p>

                  <div className="badge-quick-add">
                    {[
                      { text: "VIP MEMBER EXCLUSIVE", bg: "#e56b83", color: "#fff" },
                      { text: "NINA KURAIN PRIVATE COLLECTION", bg: "#1a1618", color: "#f5b8cc" },
                      { text: "DROP #01 · DEMO", bg: "rgba(255,255,255,0.15)", color: "#fff" },
                    ].map((badge, bIdx) => (
                      <button
                        key={bIdx}
                        type="button"
                        className="btn-quick-badge"
                        onClick={() => {
                          const newLayer: EditorTextLayer = {
                            id: Math.random().toString(36).slice(2, 9),
                            text: badge.text,
                            fontFamily: "editorial",
                            fontSize: 22,
                            color: badge.color,
                            backgroundColor: badge.bg,
                            textAlign: "center",
                            x: 0.5,
                            y: 0.85,
                          };
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            textLayers: [...prev.textLayers, newLayer],
                          }));
                        }}
                      >
                        + {badge.text}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-add-custom-text"
                    onClick={() => {
                      const newLayer: EditorTextLayer = {
                        id: Math.random().toString(36).slice(2, 9),
                        text: "Add your text here",
                        fontFamily: "modern",
                        fontSize: 28,
                        color: "#ffffff",
                        backgroundColor: "transparent",
                        textAlign: "center",
                        x: 0.5,
                        y: 0.5,
                      };
                      updateCurrentSlide((prev) => ({
                        ...prev,
                        textLayers: [...prev.textLayers, newLayer],
                      }));
                    }}
                  >
                    <Plus size={16} />
                    <span>Add Custom Text Layer</span>
                  </button>

                  {/* List of text layers */}
                  <div className="layers-list">
                    {currentSlide?.textLayers.map((layer, lIdx) => (
                      <div key={layer.id} className="layer-item">
                        <input
                          type="text"
                          value={layer.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              textLayers: prev.textLayers.map((l, i) =>
                                i === lIdx ? { ...l, text: val } : l
                              ),
                            }));
                          }}
                        />
                        <button
                          type="button"
                          className="btn-del-layer"
                          onClick={() => {
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              textLayers: prev.textLayers.filter((_, i) => i !== lIdx),
                            }));
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: DRAWING BRUSH */}
              {activeTab === "draw" && (
                <div className="panel-section">
                  <h4>Freehand Brush Drawing</h4>
                  <p style={{ fontSize: 12, color: "#999", margin: "4px 0 14px" }}>
                    Draw signatures, accents, or flourishes directly on the photo.
                  </p>

                  <div className="brush-colors">
                    {["#e56b83", "#ffffff", "#000000", "#ffd166", "#06d6a0", "#118ab2"].map(
                      (c) => (
                        <button
                          key={c}
                          type="button"
                          className={`color-dot ${brushColor === c ? "selected" : ""}`}
                          style={{ backgroundColor: c }}
                          onClick={() => setBrushColor(c)}
                        />
                      )
                    )}
                  </div>

                  <div className="slider-group" style={{ marginTop: 20 }}>
                    <div className="slider-header">
                      <span>Brush Size</span>
                      <span>{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={30}
                      step={1}
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                    />
                  </div>
                </div>
              )}

              {/* TAB 6: REEL / VIDEO TOOLS */}
              {activeTab === "video" && currentSlide?.type === "video" && (
                <div className="panel-section">
                  <h4>Video & Reel Trimming</h4>

                  {/* Trim Sliders & Timing Controls */}
                  <div className="video-trim-controls" style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#e5b9cb" }}>
                      <span>Selected Duration:</span>
                      <strong style={{ color: "#ff85a1" }}>
                        {(
                          (currentSlide.videoTimeline?.trimEnd || currentSlide.videoTimeline?.duration || 0) -
                          (currentSlide.videoTimeline?.trimStart || 0)
                        ).toFixed(1)}s / {(currentSlide.videoTimeline?.duration || 0).toFixed(1)}s
                      </strong>
                    </div>

                    {/* Quick Trim Preset Pills */}
                    <div className="zoom-preset-pills">
                      {[
                        { label: "Full Video", start: 0, end: currentSlide.videoTimeline?.duration || 999 },
                        { label: "15s Story", start: 0, end: Math.min(15, currentSlide.videoTimeline?.duration || 15) },
                        { label: "30s Reel", start: 0, end: Math.min(30, currentSlide.videoTimeline?.duration || 30) },
                        { label: "60s Clip", start: 0, end: Math.min(60, currentSlide.videoTimeline?.duration || 60) },
                      ].map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          className="pill-preset"
                          onClick={() => {
                            const newStart = preset.start;
                            const newEnd = preset.end;
                            if (videoPlayerRef.current) {
                              videoPlayerRef.current.currentTime = newStart;
                            }
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              videoTimeline: {
                                ...(prev.videoTimeline || DEFAULT_VIDEO_TIMELINE),
                                trimStart: newStart,
                                trimEnd: newEnd,
                              },
                            }));
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Trim Start Slider */}
                    <div className="slider-group">
                      <div className="slider-header">
                        <span>Trim Start: {(currentSlide.videoTimeline?.trimStart || 0).toFixed(1)}s</span>
                        <button
                          type="button"
                          className="btn-text-action"
                          style={{ fontSize: 11, color: "#ff85a1", cursor: "pointer", background: "none", border: "none" }}
                          onClick={() => {
                            const cur = videoPlayerRef.current?.currentTime || 0;
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              videoTimeline: {
                                ...(prev.videoTimeline || DEFAULT_VIDEO_TIMELINE),
                                trimStart: cur,
                              },
                            }));
                          }}
                        >
                          Set to current frame
                        </button>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(0, (currentSlide.videoTimeline?.trimEnd || currentSlide.videoTimeline?.duration || 10) - 0.5)}
                        step={0.1}
                        value={currentSlide.videoTimeline?.trimStart || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (videoPlayerRef.current && videoPlayerRef.current.currentTime < val) {
                            videoPlayerRef.current.currentTime = val;
                          }
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            videoTimeline: {
                              ...(prev.videoTimeline || DEFAULT_VIDEO_TIMELINE),
                              trimStart: val,
                            },
                          }));
                        }}
                      />
                    </div>

                    {/* Trim End Slider */}
                    <div className="slider-group">
                      <div className="slider-header">
                        <span>Trim End: {(currentSlide.videoTimeline?.trimEnd || currentSlide.videoTimeline?.duration || 0).toFixed(1)}s</span>
                        <button
                          type="button"
                          className="btn-text-action"
                          style={{ fontSize: 11, color: "#ff85a1", cursor: "pointer", background: "none", border: "none" }}
                          onClick={() => {
                            const cur = videoPlayerRef.current?.currentTime || (currentSlide.videoTimeline?.duration || 0);
                            updateCurrentSlide((prev) => ({
                              ...prev,
                              videoTimeline: {
                                ...(prev.videoTimeline || DEFAULT_VIDEO_TIMELINE),
                                trimEnd: cur,
                              },
                            }));
                          }}
                        >
                          Set to current frame
                        </button>
                      </div>
                      <input
                        type="range"
                        min={Math.min(currentSlide.videoTimeline?.duration || 10, (currentSlide.videoTimeline?.trimStart || 0) + 0.5)}
                        max={currentSlide.videoTimeline?.duration || 10}
                        step={0.1}
                        value={currentSlide.videoTimeline?.trimEnd || currentSlide.videoTimeline?.duration || 10}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            videoTimeline: {
                              ...(prev.videoTimeline || DEFAULT_VIDEO_TIMELINE),
                              trimEnd: val,
                            },
                          }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Playback speed selector */}
                  <div className="speed-selector" style={{ marginTop: 16 }}>
                    <span style={{ fontSize: 12, color: "#ccc" }}>Speed:</span>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        className={`btn-speed ${
                          (currentSlide.videoTimeline?.playbackRate || 1) === sp
                            ? "active"
                            : ""
                        }`}
                        onClick={() => {
                          if (videoPlayerRef.current) {
                            videoPlayerRef.current.playbackRate = sp;
                          }
                          updateCurrentSlide((prev) => ({
                            ...prev,
                            videoTimeline: {
                              ...(prev.videoTimeline || DEFAULT_VIDEO_TIMELINE),
                              playbackRate: sp,
                            },
                          }));
                        }}
                      >
                        {sp}x
                      </button>
                    ))}
                  </div>

                  {/* Audio Controls */}
                  <div className="audio-controls-box" style={{ marginTop: 14 }}>
                    <button
                      type="button"
                      className={`btn-mute ${
                        currentSlide.videoTimeline?.muted ? "muted" : ""
                      }`}
                      onClick={() => {
                        const nextMuted = !currentSlide.videoTimeline?.muted;
                        if (videoPlayerRef.current) {
                          videoPlayerRef.current.muted = nextMuted;
                        }
                        updateCurrentSlide((prev) => ({
                          ...prev,
                          videoTimeline: {
                            ...(prev.videoTimeline || DEFAULT_VIDEO_TIMELINE),
                            muted: nextMuted,
                          },
                        }));
                      }}
                    >
                      {currentSlide.videoTimeline?.muted ? (
                        <VolumeX size={16} />
                      ) : (
                        <Volume2 size={16} />
                      )}
                      <span>
                        {currentSlide.videoTimeline?.muted ? "Unmute audio" : "Mute audio"}
                      </span>
                    </button>
                  </div>

                  {/* Capture Frame Cover */}
                  <div className="cover-selector-box" style={{ marginTop: 20 }}>
                    <h4>Select Cover Frame</h4>
                    <p style={{ fontSize: 12, color: "#999", margin: "4px 0 10px" }}>
                      Scrub through the video to pick the exact thumbnail image.
                    </p>

                    <div className="slider-group">
                      <div className="slider-header">
                        <span>Cover Timestamp</span>
                        <span>{videoCurrentTime.toFixed(1)}s</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={currentSlide.videoTimeline?.duration || 10}
                        step={0.1}
                        value={videoCurrentTime}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setVideoCurrentTime(val);
                          if (videoPlayerRef.current) {
                            videoPlayerRef.current.currentTime = val;
                          }
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      className="btn-capture-cover"
                      onClick={() => handleCaptureCover(videoCurrentTime)}
                    >
                      <Camera size={14} />
                      <span>Set current frame as cover</span>
                    </button>

                    {currentSlide.coverUrl && (
                      <div className="cover-preview-badge">
                        <img src={currentSlide.coverUrl} alt="Cover preview" />
                        <span>Cover frame locked</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Slide Strip (Bottom) */}
        <div className="media-editor-carousel-bar">
          <div className="carousel-strip">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                className={`carousel-thumb-box ${
                  idx === activeSlideIndex ? "selected" : ""
                }`}
                onClick={() => setActiveSlideIndex(idx)}
              >
                {s.type === "video" ? (
                  <div className="carousel-thumb-video-wrap">
                    {s.coverUrl ? (
                      <img
                        src={s.coverUrl}
                        alt={s.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="carousel-thumb-placeholder">
                        <VideoIcon size={20} />
                      </div>
                    )}
                    <div className="thumb-video-icon-badge">
                      <VideoIcon size={11} />
                    </div>
                  </div>
                ) : (
                  <img
                    src={s.sourceUrl}
                    alt={s.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                )}

                <span className="slide-num">{idx + 1}</span>

                {/* Move Left/Right Controls */}
                {slides.length > 1 && (
                  <div className="thumb-reorder-actions">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, idx - 1);
                        }}
                      >
                        ‹
                      </button>
                    )}
                    {idx < slides.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSlide(idx, idx + 1);
                        }}
                      >
                        ›
                      </button>
                    )}
                    <button
                      type="button"
                      className="del-thumb"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(idx);
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Slide Button */}
            <label className="btn-add-slide">
              <Plus size={18} />
              <span>Add</span>
              <input
                type="file"
                multiple
                accept="image/*,video/*,.mp4,.mov,.webm,.m4v,.jpeg,.jpg,.png,.webp"
                style={{ display: "none" }}
                onClick={(e) => {
                  (e.target as HTMLInputElement).value = "";
                }}
                onChange={(e) => {
                  if (e.target.files) void handleAddSlideFiles(e.target.files);
                }}
              />
            </label>
          </div>
        </div>

        {/* Progress Overlay */}
        {busy && (
          <div className="media-editor-progress-overlay">
            <div className="progress-modal-card">
              <Loader2 size={36} className="animate-spin text-rose-400" />
              <h4>Processing Studio Export</h4>
              <p>{progressMsg}</p>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="progress-pct">{progressPct}%</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { MediaStudioTriggerBanner, type MediaStudioTriggerBannerProps } from "./trigger-banner";

// Backward-compatible alias for existing imports
export const MediaEditorModal = NinaStudioEditor;

