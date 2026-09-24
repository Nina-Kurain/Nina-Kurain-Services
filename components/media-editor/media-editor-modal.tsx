"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
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
} from "lucide-react";
import {
  type MediaEditorItem,
  type FilterPreset,
  type AspectRatioType,
  type TextOverlay,
  ASPECT_RATIOS,
  FILTER_PRESETS,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_TRANSFORM,
  getFilterPreset,
  renderCanvasImage,
  captureVideoFrame,
  buildCompositeCssFilter,
} from "./filter-presets";

export interface Asset {
  id: string;
  name: string;
  mime: string;
  url: string;
  bytes?: number;
}

export interface MediaEditorModalProps {
  open: boolean;
  onClose: () => void;
  onDone: (assets: Asset[], coverId?: string) => void;
  initialFiles?: File[];
  defaultAspect?: AspectRatioType;
  title?: string;
}

function uploadAsset(file: File, onProgress: (pct: number) => void): Promise<Asset> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/studio/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Connection lost."));
    xhr.onload = () => {
      try {
        const result = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(result);
        else reject(new Error(result.message ?? "Upload rejected."));
      } catch {
        reject(new Error("Upload failed. Please retry."));
      }
    };
    const form = new FormData();
    form.set("file", file);
    xhr.send(form);
  });
}

export function MediaEditorModal({
  open,
  onClose,
  onDone,
  initialFiles = [],
  defaultAspect = "original",
  title = "Instagram Media Studio",
}: MediaEditorModalProps) {
  const [items, setItems] = useState<MediaEditorItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"crop" | "filter" | "adjust" | "text" | "video">("crop");
  const [comparing, setComparing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);

  // Dragging state for canvas pan
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  // Elements refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentImageRef = useRef<HTMLImageElement | null>(null);

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  // Initialize or update items from incoming initialFiles
  useEffect(() => {
    if (!open) {
      setItems([]);
      setActiveIdx(0);
      return;
    }
    if (initialFiles.length > 0) {
      const newItems: MediaEditorItem[] = initialFiles.map((file) => {
        const isVideo = file.type.startsWith("video/");
        return {
          id: Math.random().toString(36).slice(2, 9),
          file,
          type: isVideo ? "video" : "image",
          url: URL.createObjectURL(file),
          name: file.name,
          filterId: "normal",
          filterIntensity: 100,
          adjustments: { ...DEFAULT_ADJUSTMENTS },
          transform: {
            ...DEFAULT_TRANSFORM,
            aspectRatio: defaultAspect,
          },
          textOverlays: [],
          videoMeta: isVideo
            ? {
                duration: 0,
                trimStart: 0,
                trimEnd: 0,
                muted: false,
                volume: 1,
                coverTimestamp: 0,
              }
            : undefined,
        };
      });
      setItems(newItems);
      setActiveIdx(0);
      if (newItems[0]?.type === "video") {
        setActiveTab("video");
      } else {
        setActiveTab("crop");
      }
    }
  }, [open, initialFiles, defaultAspect]);

  // Clean up ObjectURLs when component unmounts
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        URL.revokeObjectURL(item.url);
        if (item.videoMeta?.coverDataUrl) {
          URL.revokeObjectURL(item.videoMeta.coverDataUrl);
        }
      });
    };
  }, [items]);

  const currentItem = items[activeIdx];

  // Load image object whenever current active item changes
  useEffect(() => {
    if (!currentItem || currentItem.type !== "image") {
      currentImageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      currentImageRef.current = img;
      redrawCanvas();
    };
    img.src = currentItem.url;
  }, [currentItem?.id, currentItem?.url, currentItem?.type]);

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || !currentImageRef.current || !currentItem) return;

    if (comparing) {
      // Draw untouched original image
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = currentImageRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      return;
    }

    renderCanvasImage({
      targetCanvas: canvasRef.current,
      sourceImage: currentImageRef.current,
      transform: currentItem.transform,
      filterPreset: getFilterPreset(currentItem.filterId),
      filterIntensity: currentItem.filterIntensity,
      adjustments: currentItem.adjustments,
      textOverlays: currentItem.textOverlays,
    });
  }, [currentItem, comparing]);

  // Redraw on updates
  useEffect(() => {
    if (currentItem?.type === "image") {
      redrawCanvas();
    }
  }, [
    currentItem?.transform,
    currentItem?.filterId,
    currentItem?.filterIntensity,
    currentItem?.adjustments,
    currentItem?.textOverlays,
    comparing,
    redrawCanvas,
  ]);

  // Handle pointer drag for pan/crop
  const beginDrag = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!currentItem || currentItem.transform.zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const moveDrag = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!dragging || !dragRef.current || !currentItem) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };

    const rect = e.currentTarget.getBoundingClientRect();
    const factor = 1 / Math.max(0.1, currentItem.transform.zoom - 1);

    const newX = Math.min(1, Math.max(0, currentItem.transform.x - (dx / rect.width) * factor));
    const newY = Math.min(1, Math.max(0, currentItem.transform.y - (dy / rect.height) * factor));

    updateActiveItem({
      transform: {
        ...currentItem.transform,
        x: newX,
        y: newY,
      },
    });
  };

  const endDrag = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleWheel = (e: ReactWheelEvent<HTMLCanvasElement>) => {
    if (!currentItem) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newZoom = Math.min(3, Math.max(1, currentItem.transform.zoom + delta));
    updateActiveItem({
      transform: {
        ...currentItem.transform,
        zoom: newZoom,
      },
    });
  };

  // Helper to update current item in queue
  function updateActiveItem(patch: Partial<MediaEditorItem>) {
    setItems((prev) => {
      const next = [...prev];
      if (!next[activeIdx]) return prev;
      next[activeIdx] = { ...next[activeIdx], ...patch };
      return next;
    });
  }

  // Add more files from disk into carousel
  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newItems: MediaEditorItem[] = files.map((file) => {
      const isVideo = file.type.startsWith("video/");
      return {
        id: Math.random().toString(36).slice(2, 9),
        file,
        type: isVideo ? "video" : "image",
        url: URL.createObjectURL(file),
        name: file.name,
        filterId: "normal",
        filterIntensity: 100,
        adjustments: { ...DEFAULT_ADJUSTMENTS },
        transform: {
          ...DEFAULT_TRANSFORM,
          aspectRatio: defaultAspect,
        },
        textOverlays: [],
        videoMeta: isVideo
          ? {
              duration: 0,
              trimStart: 0,
              trimEnd: 0,
              muted: false,
              volume: 1,
              coverTimestamp: 0,
            }
          : undefined,
      };
    });
    setItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next;
    });
    if (activeIdx >= idx && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  // Apply current filter & adjustments to all slides
  const applyAdjustmentsToAll = () => {
    if (!currentItem) return;
    const { filterId, filterIntensity, adjustments } = currentItem;
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        filterId,
        filterIntensity,
        adjustments: { ...adjustments },
      }))
    );
  };

  // Video playback listeners
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (!videoRef.current || !currentItem?.videoMeta) return;
    const time = videoRef.current.currentTime;
    setVideoCurrentTime(time);

    // Loop within trim range
    if (currentItem.videoMeta.trimEnd > 0 && time >= currentItem.videoMeta.trimEnd) {
      videoRef.current.currentTime = currentItem.videoMeta.trimStart;
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (!videoRef.current || !currentItem) return;
    const duration = videoRef.current.duration;
    updateActiveItem({
      videoMeta: {
        ...(currentItem.videoMeta ?? {
          muted: false,
          volume: 1,
          coverTimestamp: 0,
        }),
        duration,
        trimStart: 0,
        trimEnd: duration,
        coverTimestamp: Math.min(1, duration / 2),
      },
    });
  };

  // Capture cover frame from video
  const handleCaptureCover = async () => {
    if (!videoRef.current || !currentItem?.videoMeta) return;
    try {
      const blob = await captureVideoFrame(videoRef.current, "image/jpeg", 0.95);
      const coverUrl = URL.createObjectURL(blob);
      updateActiveItem({
        videoMeta: {
          ...currentItem.videoMeta,
          coverTimestamp: videoRef.current.currentTime,
          coverDataUrl: coverUrl,
        },
      });
    } catch (err) {
      console.error("Failed to capture cover frame:", err);
    }
  };

  // Add text sticker
  const handleAddTextOverlay = () => {
    if (!currentItem) return;
    const newOverlay: TextOverlay = {
      id: Math.random().toString(36).slice(2, 9),
      text: "EXCLUSIVE",
      font: "modern",
      color: "#ffffff",
      backgroundColor: "rgba(229, 107, 131, 0.85)",
      size: 32,
      align: "center",
      x: 0.5,
      y: 0.5,
    };
    updateActiveItem({
      textOverlays: [...currentItem.textOverlays, newOverlay],
    });
  };

  // Add sticker preset
  const handleAddStickerPreset = (text: string, bgColor: string, color = "#fff") => {
    if (!currentItem) return;
    const newOverlay: TextOverlay = {
      id: Math.random().toString(36).slice(2, 9),
      text,
      font: "modern",
      color,
      backgroundColor: bgColor,
      size: 28,
      align: "center",
      x: 0.5,
      y: 0.8,
    };
    updateActiveItem({
      textOverlays: [...currentItem.textOverlays, newOverlay],
    });
  };

  // Process and Upload All Items
  const handleExportAndUpload = async () => {
    if (!items.length) return;
    setBusy(true);
    setProgressPct(0);
    setProgressMsg("Preparing creative assets…");

    const uploadedAssets: Asset[] = [];
    let mainCoverId: string | undefined = undefined;

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setProgressMsg(`Exporting item ${i + 1} of ${items.length}…`);
        setProgressPct(Math.round(((i + 0.3) / items.length) * 100));

        if (item.type === "image") {
          // Render final canvas output
          const offscreenCanvas = document.createElement("canvas");
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load ${item.name}`));
            img.src = item.url;
          });

          renderCanvasImage({
            targetCanvas: offscreenCanvas,
            sourceImage: img,
            transform: item.transform,
            filterPreset: getFilterPreset(item.filterId),
            filterIntensity: item.filterIntensity,
            adjustments: item.adjustments,
            textOverlays: item.textOverlays,
          });

          // Convert to blob
          const blob = await new Promise<Blob>((resolve, reject) => {
            offscreenCanvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error("Failed to export canvas"))),
              "image/jpeg",
              0.92
            );
          });

          const exportedFile = new File(
            [blob],
            item.name.replace(/\.[^/.]+$/, "") + "-edited.jpg",
            { type: "image/jpeg" }
          );

          setProgressMsg(`Uploading ${exportedFile.name}…`);
          const asset = await uploadAsset(exportedFile, (pct) => {
            setProgressPct(Math.round(((i + pct / 100) / items.length) * 100));
          });
          uploadedAssets.push(asset);

          if (!mainCoverId) mainCoverId = asset.id;
        } else {
          // Video Item
          // If video has a captured cover frame, upload the cover image first!
          if (item.videoMeta?.coverDataUrl) {
            try {
              const coverRes = await fetch(item.videoMeta.coverDataUrl);
              const coverBlob = await coverRes.blob();
              const coverFile = new File(
                [coverBlob],
                item.name.replace(/\.[^/.]+$/, "") + "-cover.jpg",
                { type: "image/jpeg" }
              );
              const coverAsset = await uploadAsset(coverFile, () => {});
              uploadedAssets.push(coverAsset);
              if (!mainCoverId) mainCoverId = coverAsset.id;
            } catch (err) {
              console.warn("Could not upload cover image:", err);
            }
          }

          // Upload video file
          setProgressMsg(`Uploading video: ${item.name}…`);
          const videoAsset = await uploadAsset(item.file, (pct) => {
            setProgressPct(Math.round(((i + pct / 100) / items.length) * 100));
          });
          uploadedAssets.push(videoAsset);
        }
      }

      setProgressMsg("Complete!");
      setProgressPct(100);
      onDone(uploadedAssets, mainCoverId);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Export and upload failed. Please try again.");
    } finally {
      setBusy(false);
      setProgressMsg("");
    }
  };

  if (!open || !currentItem) {
    return null;
  }

  // Active aspect ratio spec
  const currentRatioSpec = ASPECT_RATIOS[currentItem.transform.aspectRatio];
  const videoCssFilter = buildCompositeCssFilter(
    getFilterPreset(currentItem.filterId),
    currentItem.filterIntensity,
    currentItem.adjustments
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !busy && onClose()}>
      <DialogContent className="live-dialog media-editor-dialog">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Instagram-style media editor</DialogDescription>
        </DialogHeader>

        {/* Top Navigation Bar */}
        <header className="media-editor-header">
          <h3>
            <Sparkles size={16} color="#e56b83" />
            {title}
            <span className="badge">
              {currentItem.type === "video" ? "Film Studio" : "Photo Studio"}
            </span>
            <span style={{ fontSize: 12, color: "#a58597", fontWeight: 500, marginLeft: 8 }}>
              {activeIdx + 1} / {items.length}
            </span>
          </h3>
          <div className="media-editor-header-actions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={onClose}
              style={{ color: "#d1b1c2", borderColor: "rgba(229,107,131,0.25)" }}
            >
              Cancel
            </Button>
            <button
              type="button"
              className="btn-done"
              disabled={busy}
              onClick={handleExportAndUpload}
            >
              {busy ? (
                <>
                  <Loader2 size={14} className="spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Check size={14} />
                  Use Edited Media
                </>
              )}
            </button>
          </div>
        </header>

        {/* Main Work Area */}
        <div className="media-editor-body">
          {/* Left / Center: Interactive Preview Stage */}
          <section className="media-editor-viewport">
            {/* Compare Badge when user is holding compare button */}
            {comparing && <div className="compare-badge">ORIGINAL (UNTOUCHED)</div>}

            <div
              className={`media-editor-stage ${dragging ? "is-dragging" : ""}`}
              style={{
                aspectRatio: currentRatioSpec.ratio ? `${currentRatioSpec.ratio}` : undefined,
              }}
            >
              {currentItem.type === "image" ? (
                <canvas
                  ref={canvasRef}
                  className="media-editor-canvas"
                  aria-label="Interactive photo preview"
                  onPointerDown={beginDrag}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  onWheel={handleWheel}
                />
              ) : (
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <video
                    ref={videoRef}
                    src={currentItem.url}
                    className="media-editor-video-preview"
                    playsInline
                    muted={currentItem.videoMeta?.muted ?? false}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    style={{
                      filter: videoCssFilter !== "none" ? videoCssFilter : undefined,
                      width: "100%",
                      height: "100%",
                      objectFit: currentRatioSpec.ratio ? "cover" : "contain",
                    }}
                  />
                  {/* Play / Pause overlay click */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {!isPlaying && (
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.65)",
                          backdropFilter: "blur(6px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                        }}
                      >
                        <Play size={24} fill="#fff" />
                      </div>
                    )}
                  </button>
                </div>
              )}

              {/* 3x3 Rule-of-Thirds Grid */}
              <div className={`grid-overlay ${showGrid && activeTab === "crop" ? "visible" : ""}`}>
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
            </div>

            {/* Hold to Compare button (Instagram style) */}
            {currentItem.type === "image" && (
              <button
                type="button"
                className="compare-btn"
                onPointerDown={() => setComparing(true)}
                onPointerUp={() => setComparing(false)}
                onPointerLeave={() => setComparing(false)}
              >
                <Eye size={13} />
                Hold to Compare
              </button>
            )}
          </section>

          {/* Right: Sidebar Controls with Tabs */}
          <aside className="media-editor-controls">
            <nav className="media-editor-tabs" role="tablist">
              <button
                type="button"
                className={`media-editor-tab-btn ${activeTab === "crop" ? "active" : ""}`}
                onClick={() => setActiveTab("crop")}
              >
                <Crop size={16} />
                <span>Crop</span>
              </button>
              <button
                type="button"
                className={`media-editor-tab-btn ${activeTab === "filter" ? "active" : ""}`}
                onClick={() => setActiveTab("filter")}
              >
                <Sparkles size={16} />
                <span>Filters</span>
              </button>
              <button
                type="button"
                className={`media-editor-tab-btn ${activeTab === "adjust" ? "active" : ""}`}
                onClick={() => setActiveTab("adjust")}
              >
                <Sliders size={16} />
                <span>Adjust</span>
              </button>
              <button
                type="button"
                className={`media-editor-tab-btn ${activeTab === "text" ? "active" : ""}`}
                onClick={() => setActiveTab("text")}
              >
                <Type size={16} />
                <span>Text</span>
              </button>
              {currentItem.type === "video" && (
                <button
                  type="button"
                  className={`media-editor-tab-btn ${activeTab === "video" ? "active" : ""}`}
                  onClick={() => setActiveTab("video")}
                >
                  <VideoIcon size={16} />
                  <span>Video</span>
                </button>
              )}
            </nav>

            <div className="media-editor-panel-scroll">
              {/* TAB: CROP & TRANSFORM */}
              {activeTab === "crop" && (
                <>
                  <div>
                    <h4 className="editor-section-title">
                      <span>Aspect Ratio</span>
                      <small>Feed / Story presets</small>
                    </h4>
                    <div className="ratio-selector-grid">
                      {(Object.keys(ASPECT_RATIOS) as AspectRatioType[]).map((key) => {
                        const spec = ASPECT_RATIOS[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`ratio-btn ${
                              currentItem.transform.aspectRatio === key ? "active" : ""
                            }`}
                            onClick={() =>
                              updateActiveItem({
                                transform: {
                                  ...currentItem.transform,
                                  aspectRatio: key,
                                },
                              })
                            }
                          >
                            <span
                              className={`ratio-shape ratio-${key.replace(":", "-")}`}
                            />
                            {spec.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Zoom Control */}
                  <div className="control-slider-group">
                    <div className="slider-label-row">
                      <span>Zoom Frame</span>
                      <strong>{currentItem.transform.zoom.toFixed(2)}×</strong>
                    </div>
                    <input
                      type="range"
                      className="slider-input"
                      min="1"
                      max="3"
                      step="0.02"
                      value={currentItem.transform.zoom}
                      onChange={(e) =>
                        updateActiveItem({
                          transform: {
                            ...currentItem.transform,
                            zoom: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  {/* Straighten Control */}
                  <div className="control-slider-group">
                    <div className="slider-label-row">
                      <span>Straighten / Angle</span>
                      <strong>{currentItem.transform.straighten}°</strong>
                    </div>
                    <input
                      type="range"
                      className="slider-input"
                      min="-45"
                      max="45"
                      step="1"
                      value={currentItem.transform.straighten}
                      onChange={(e) =>
                        updateActiveItem({
                          transform: {
                            ...currentItem.transform,
                            straighten: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  {/* Rotate & Flip Tools */}
                  <div>
                    <h4 className="editor-section-title">Orientation</h4>
                    <div className="transform-action-row">
                      <button
                        type="button"
                        className="transform-tool-btn"
                        onClick={() =>
                          updateActiveItem({
                            transform: {
                              ...currentItem.transform,
                              rotation: (currentItem.transform.rotation + 90) % 360,
                            },
                          })
                        }
                      >
                        <RotateCw size={14} /> Rotate
                      </button>
                      <button
                        type="button"
                        className={`transform-tool-btn ${
                          currentItem.transform.flipH ? "active" : ""
                        }`}
                        onClick={() =>
                          updateActiveItem({
                            transform: {
                              ...currentItem.transform,
                              flipH: !currentItem.transform.flipH,
                            },
                          })
                        }
                      >
                        <FlipHorizontal size={14} /> Flip H
                      </button>
                      <button
                        type="button"
                        className={`transform-tool-btn ${
                          currentItem.transform.flipV ? "active" : ""
                        }`}
                        onClick={() =>
                          updateActiveItem({
                            transform: {
                              ...currentItem.transform,
                              flipV: !currentItem.transform.flipV,
                            },
                          })
                        }
                      >
                        <FlipVertical size={14} /> Flip V
                      </button>
                    </div>
                  </div>

                  {/* Toggle Grid & Reset */}
                  <div className="transform-action-row">
                    <button
                      type="button"
                      className={`transform-tool-btn ${showGrid ? "active" : ""}`}
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      <Grid3X3 size={14} /> 3×3 Grid
                    </button>
                    <button
                      type="button"
                      className="transform-tool-btn"
                      onClick={() =>
                        updateActiveItem({
                          transform: {
                            ...DEFAULT_TRANSFORM,
                            aspectRatio: currentItem.transform.aspectRatio,
                          },
                        })
                      }
                    >
                      Reset Framing
                    </button>
                  </div>
                </>
              )}

              {/* TAB: FILTERS */}
              {activeTab === "filter" && (
                <>
                  {/* Intensity slider if filter is not normal */}
                  <div className="filter-intensity-box">
                    <div className="slider-label-row" style={{ marginBottom: 8 }}>
                      <span>Filter Strength</span>
                      <strong>{currentItem.filterIntensity}%</strong>
                    </div>
                    <input
                      type="range"
                      className="slider-input"
                      min="0"
                      max="100"
                      value={currentItem.filterIntensity}
                      onChange={(e) =>
                        updateActiveItem({ filterIntensity: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div>
                    <h4 className="editor-section-title">
                      <span>Filter Presets</span>
                      <small>{FILTER_PRESETS.length} available</small>
                    </h4>
                    <div className="filter-cards-grid">
                      {FILTER_PRESETS.map((preset) => {
                        const isActive = currentItem.filterId === preset.id;
                        const previewFilter = preset.cssFilter(1);
                        return (
                          <div
                            key={preset.id}
                            className={`filter-card ${isActive ? "active" : ""}`}
                            onClick={() =>
                              updateActiveItem({
                                filterId: preset.id,
                                filterIntensity: 100,
                              })
                            }
                          >
                            <div className="filter-card-thumb">
                              <img
                                src={currentItem.url}
                                alt={preset.name}
                                style={{
                                  filter: previewFilter !== "none" ? previewFilter : undefined,
                                }}
                              />
                            </div>
                            <span className="filter-card-name">{preset.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* TAB: ADJUSTMENTS */}
              {activeTab === "adjust" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 className="editor-section-title" style={{ margin: 0 }}>
                      Pro Adjustments
                    </h4>
                    <button
                      type="button"
                      className="transform-tool-btn"
                      style={{ padding: "4px 8px", fontSize: 11 }}
                      onClick={() =>
                        updateActiveItem({ adjustments: { ...DEFAULT_ADJUSTMENTS } })
                      }
                    >
                      Reset All
                    </button>
                  </div>

                  {/* Brightness */}
                  <div className="adjustment-slider-card">
                    <div className="slider-label-row">
                      <span>Brightness</span>
                      <strong>
                        {currentItem.adjustments.brightness > 0 ? "+" : ""}
                        {currentItem.adjustments.brightness}
                      </strong>
                    </div>
                    <input
                      type="range"
                      className="slider-input"
                      min="-100"
                      max="100"
                      value={currentItem.adjustments.brightness}
                      onChange={(e) =>
                        updateActiveItem({
                          adjustments: {
                            ...currentItem.adjustments,
                            brightness: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  {/* Contrast */}
                  <div className="adjustment-slider-card">
                    <div className="slider-label-row">
                      <span>Contrast</span>
                      <strong>
                        {currentItem.adjustments.contrast > 0 ? "+" : ""}
                        {currentItem.adjustments.contrast}
                      </strong>
                    </div>
                    <input
                      type="range"
                      className="slider-input"
                      min="-100"
                      max="100"
                      value={currentItem.adjustments.contrast}
                      onChange={(e) =>
                        updateActiveItem({
                          adjustments: {
                            ...currentItem.adjustments,
                            contrast: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  {/* Saturation */}
                  <div className="adjustment-slider-card">
                    <div className="slider-label-row">
                      <span>Saturation</span>
                      <strong>
                        {currentItem.adjustments.saturation > 0 ? "+" : ""}
                        {currentItem.adjustments.saturation}
                      </strong>
                    </div>
                    <input
                      type="range"
                      className="slider-input"
                      min="-100"
                      max="100"
                      value={currentItem.adjustments.saturation}
                      onChange={(e) =>
                        updateActiveItem({
                          adjustments: {
                            ...currentItem.adjustments,
                            saturation: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  {/* Warmth / Temperature */}
                  <div className="adjustment-slider-card">
                    <div className="slider-label-row">
                      <span>Warmth / Temperature</span>
                      <strong>
                        {currentItem.adjustments.warmth > 0 ? "+" : ""}
                        {currentItem.adjustments.warmth}
                      </strong>
                    </div>
                    <input
                      type="range"
                      className="slider-input"
                      min="-100"
                      max="100"
                      value={currentItem.adjustments.warmth}
                      onChange={(e) =>
                        updateActiveItem({
                          adjustments: {
                            ...currentItem.adjustments,
                            warmth: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  {/* Vignette */}
                  <div className="adjustment-slider-card">
                    <div className="slider-label-row">
                      <span>Vignette</span>
                      <strong>+{currentItem.adjustments.vignette}</strong>
                    </div>
                    <input
                      type="range"
                      className="slider-input"
                      min="0"
                      max="100"
                      value={currentItem.adjustments.vignette}
                      onChange={(e) =>
                        updateActiveItem({
                          adjustments: {
                            ...currentItem.adjustments,
                            vignette: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  {/* Fade */}
                  <div className="adjustment-slider-card">
                    <div className="slider-label-row">
                      <span>Fade / Matte</span>
                      <strong>+{currentItem.adjustments.fade}</strong>
                    </div>
                    <input
                      type="range"
                      className="slider-input"
                      min="0"
                      max="100"
                      value={currentItem.adjustments.fade}
                      onChange={(e) =>
                        updateActiveItem({
                          adjustments: {
                            ...currentItem.adjustments,
                            fade: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      className="transform-tool-btn"
                      onClick={applyAdjustmentsToAll}
                      style={{ marginTop: 8 }}
                    >
                      <Sparkles size={14} /> Apply Look to All {items.length} Slides
                    </button>
                  )}
                </>
              )}

              {/* TAB: TEXT & STICKERS */}
              {activeTab === "text" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 className="editor-section-title" style={{ margin: 0 }}>
                      Text Overlays
                    </h4>
                    <button
                      type="button"
                      className="btn-done"
                      style={{ padding: "4px 10px", fontSize: 11 }}
                      onClick={handleAddTextOverlay}
                    >
                      <Plus size={13} /> Add Text
                    </button>
                  </div>

                  {/* Quick Sticker Presets */}
                  <div>
                    <h5 style={{ fontSize: 11, color: "#d1b1c2", margin: "10px 0 6px" }}>
                      Quick Creator Badges
                    </h5>
                    <div className="sticker-presets-grid">
                      <button
                        type="button"
                        className="sticker-preset-btn"
                        onClick={() =>
                          handleAddStickerPreset("👑 VIP ONLY", "rgba(223, 177, 91, 0.9)", "#150a11")
                        }
                      >
                        👑 VIP ONLY
                      </button>
                      <button
                        type="button"
                        className="sticker-preset-btn"
                        onClick={() =>
                          handleAddStickerPreset("🔒 MEMBERS ONLY", "rgba(229, 107, 131, 0.85)")
                        }
                      >
                        🔒 MEMBERS ONLY
                      </button>
                      <button
                        type="button"
                        className="sticker-preset-btn"
                        onClick={() =>
                          handleAddStickerPreset("✨ EXCLUSIVE DROP", "rgba(168, 85, 247, 0.85)")
                        }
                      >
                        ✨ EXCLUSIVE
                      </button>
                      <button
                        type="button"
                        className="sticker-preset-btn"
                        onClick={() =>
                          handleAddStickerPreset("🔥 NEW REEL", "rgba(239, 68, 68, 0.85)")
                        }
                      >
                        🔥 NEW REEL
                      </button>
                    </div>
                  </div>

                  {/* Active Text Layers */}
                  <div className="text-layers-list">
                    {currentItem.textOverlays.map((layer, idx) => (
                      <div key={layer.id} className="text-layer-card">
                        <div className="text-layer-header">
                          <strong style={{ fontSize: 12, color: "#ff9cb3" }}>
                            Layer #{idx + 1}
                          </strong>
                          <button
                            type="button"
                            className="transform-tool-btn"
                            style={{ padding: 4 }}
                            onClick={() =>
                              updateActiveItem({
                                textOverlays: currentItem.textOverlays.filter(
                                  (l) => l.id !== layer.id
                                ),
                              })
                            }
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <input
                          type="text"
                          className="text-layer-input"
                          value={layer.text}
                          placeholder="Type overlay text…"
                          onChange={(e) => {
                            const newOverlays = [...currentItem.textOverlays];
                            newOverlays[idx] = { ...layer, text: e.target.value };
                            updateActiveItem({ textOverlays: newOverlays });
                          }}
                        />

                        {/* Font Style */}
                        <div className="font-style-chips">
                          {(
                            [
                              "classic",
                              "modern",
                              "editorial",
                              "neon",
                              "typewriter",
                              "script",
                            ] as const
                          ).map((font) => (
                            <button
                              key={font}
                              type="button"
                              className={`font-chip ${layer.font === font ? "active" : ""}`}
                              onClick={() => {
                                const newOverlays = [...currentItem.textOverlays];
                                newOverlays[idx] = { ...layer, font };
                                updateActiveItem({ textOverlays: newOverlays });
                              }}
                            >
                              {font}
                            </button>
                          ))}
                        </div>

                        {/* Color Selector */}
                        <div className="color-picker-row">
                          {[
                            "#ffffff",
                            "#000000",
                            "#e56b83",
                            "#dfb15b",
                            "#38bdf8",
                            "#a855f7",
                            "#10b981",
                          ].map((col) => (
                            <div
                              key={col}
                              className={`color-dot ${layer.color === col ? "active" : ""}`}
                              style={{ backgroundColor: col }}
                              onClick={() => {
                                const newOverlays = [...currentItem.textOverlays];
                                newOverlays[idx] = { ...layer, color: col };
                                updateActiveItem({ textOverlays: newOverlays });
                              }}
                            />
                          ))}
                        </div>

                        {/* Background Highlight Style */}
                        <div className="slider-label-row">
                          <span>Highlight Background</span>
                          <select
                            value={layer.backgroundColor}
                            onChange={(e) => {
                              const newOverlays = [...currentItem.textOverlays];
                              newOverlays[idx] = {
                                ...layer,
                                backgroundColor: e.target.value,
                              };
                              updateActiveItem({ textOverlays: newOverlays });
                            }}
                            style={{
                              background: "#180b15",
                              border: "1px solid rgba(229,107,131,0.3)",
                              color: "#fff",
                              borderRadius: 6,
                              padding: "3px 6px",
                              fontSize: 11,
                            }}
                          >
                            <option value="transparent">None (Transparent)</option>
                            <option value="rgba(0,0,0,0.7)">Dark Translucent</option>
                            <option value="rgba(255,255,255,0.85)">Light Translucent</option>
                            <option value="rgba(229,107,131,0.85)">Nina Rose</option>
                            <option value="rgba(223,177,91,0.9)">Royal Gold</option>
                          </select>
                        </div>

                        {/* Size & Position */}
                        <div className="slider-label-row">
                          <span>Font Size: {layer.size}px</span>
                          <input
                            type="range"
                            min="16"
                            max="72"
                            value={layer.size}
                            onChange={(e) => {
                              const newOverlays = [...currentItem.textOverlays];
                              newOverlays[idx] = { ...layer, size: Number(e.target.value) };
                              updateActiveItem({ textOverlays: newOverlays });
                            }}
                          />
                        </div>

                        <div className="slider-label-row">
                          <span>Vertical Position</span>
                          <input
                            type="range"
                            min="0.1"
                            max="0.9"
                            step="0.02"
                            value={layer.y}
                            onChange={(e) => {
                              const newOverlays = [...currentItem.textOverlays];
                              newOverlays[idx] = { ...layer, y: Number(e.target.value) };
                              updateActiveItem({ textOverlays: newOverlays });
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    {!currentItem.textOverlays.length && (
                      <p style={{ fontSize: 12, color: "#8d6d7e", textAlign: "center", margin: "20px 0" }}>
                        No text stickers yet. Click “Add Text” or choose a creator badge above.
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* TAB: VIDEO TOOLS */}
              {activeTab === "video" && currentItem.type === "video" && (
                <>
                  <div className="video-timeline-card">
                    <h4 className="editor-section-title">
                      <span>Timeline & Scrubbing</span>
                      <small>
                        {videoCurrentTime.toFixed(1)}s /{" "}
                        {(currentItem.videoMeta?.duration ?? 0).toFixed(1)}s
                      </small>
                    </h4>

                    {/* Timeline Scrubber */}
                    <input
                      type="range"
                      className="slider-input video-scrub-bar"
                      min="0"
                      max={currentItem.videoMeta?.duration || 10}
                      step="0.1"
                      value={videoCurrentTime}
                      onChange={(e) => {
                        const t = Number(e.target.value);
                        setVideoCurrentTime(t);
                        if (videoRef.current) videoRef.current.currentTime = t;
                      }}
                    />

                    {/* Play / Pause and Audio Controls */}
                    <div className="transform-action-row" style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="transform-tool-btn"
                        onClick={togglePlay}
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        {isPlaying ? "Pause" : "Play"}
                      </button>
                      <button
                        type="button"
                        className={`transform-tool-btn ${
                          currentItem.videoMeta?.muted ? "active" : ""
                        }`}
                        onClick={() => {
                          const isMuted = !currentItem.videoMeta?.muted;
                          updateActiveItem({
                            videoMeta: {
                              ...currentItem.videoMeta!,
                              muted: isMuted,
                            },
                          });
                          if (videoRef.current) videoRef.current.muted = isMuted;
                        }}
                      >
                        {currentItem.videoMeta?.muted ? (
                          <VolumeX size={14} />
                        ) : (
                          <Volume2 size={14} />
                        )}
                        {currentItem.videoMeta?.muted ? "Muted" : "Audio On"}
                      </button>
                    </div>
                  </div>

                  {/* Video Trim Controls */}
                  <div className="video-timeline-card">
                    <h4 className="editor-section-title">
                      <span>Trim Video Clip</span>
                      <small>
                        Duration:{" "}
                        {(
                          (currentItem.videoMeta?.trimEnd ?? 0) -
                          (currentItem.videoMeta?.trimStart ?? 0)
                        ).toFixed(1)}
                        s
                      </small>
                    </h4>

                    <div className="video-trim-controls">
                      <div>
                        <span style={{ fontSize: 11, color: "#d1b1c2" }}>
                          Start: {(currentItem.videoMeta?.trimStart ?? 0).toFixed(1)}s
                        </span>
                        <input
                          type="range"
                          className="slider-input"
                          min="0"
                          max={currentItem.videoMeta?.trimEnd || 10}
                          step="0.1"
                          value={currentItem.videoMeta?.trimStart ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateActiveItem({
                              videoMeta: {
                                ...currentItem.videoMeta!,
                                trimStart: val,
                              },
                            });
                            if (videoRef.current) videoRef.current.currentTime = val;
                          }}
                        />
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: "#d1b1c2" }}>
                          End: {(currentItem.videoMeta?.trimEnd ?? 0).toFixed(1)}s
                        </span>
                        <input
                          type="range"
                          className="slider-input"
                          min={currentItem.videoMeta?.trimStart || 0}
                          max={currentItem.videoMeta?.duration || 10}
                          step="0.1"
                          value={currentItem.videoMeta?.trimEnd ?? 10}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            updateActiveItem({
                              videoMeta: {
                                ...currentItem.videoMeta!,
                                trimEnd: val,
                              },
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Instagram Video Cover Picker */}
                  <div className="video-timeline-card">
                    <h4 className="editor-section-title">
                      <span>Post Cover Thumbnail</span>
                      <small>Instagram Cover Picker</small>
                    </h4>
                    <p style={{ fontSize: 12, color: "#b592a4", margin: "0 0 10px" }}>
                      Scrub the video to your favorite moment and capture it as the cover thumbnail.
                    </p>

                    <div className="video-cover-picker-box">
                      {currentItem.videoMeta?.coverDataUrl ? (
                        <img
                          src={currentItem.videoMeta.coverDataUrl}
                          alt="Video Cover"
                          className="video-cover-thumb"
                        />
                      ) : (
                        <div
                          className="video-cover-thumb"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9d7a8d",
                          }}
                        >
                          <Camera size={20} />
                        </div>
                      )}
                      <div>
                        <button
                          type="button"
                          className="btn-done"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          onClick={handleCaptureCover}
                        >
                          <Camera size={14} /> Set Current Frame as Cover
                        </button>
                        {currentItem.videoMeta?.coverDataUrl && (
                          <small
                            style={{
                              display: "block",
                              marginTop: 6,
                              color: "#4ade80",
                              fontWeight: 600,
                            }}
                          >
                            ✓ Cover selected ({videoCurrentTime.toFixed(1)}s)
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>

        {/* Bottom Multi-Item Carousel Bar */}
        <footer className="media-editor-carousel-bar">
          <div className="carousel-tray-items">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`carousel-tray-item ${activeIdx === idx ? "active" : ""}`}
                onClick={() => {
                  setActiveIdx(idx);
                  if (item.type === "video") setActiveTab("video");
                }}
              >
                {item.type === "image" ? (
                  <img src={item.url} alt={item.name} />
                ) : (
                  <video src={item.url} />
                )}
                {items.length > 1 && (
                  <button
                    type="button"
                    className="carousel-tray-item-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(idx);
                    }}
                    title="Remove slide"
                  >
                    ×
                  </button>
                )}
                <span className="carousel-tray-item-type">
                  {item.type === "video" ? "REEL" : `${idx + 1}`}
                </span>
              </div>
            ))}

            {/* Add more files button */}
            <label className="carousel-add-btn" title="Add photo or video to carousel">
              <Plus size={20} />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4"
                multiple
                onChange={handleAddFiles}
              />
            </label>
          </div>
        </footer>

        {/* Export / Upload Progress Overlay */}
        {busy && (
          <div className="media-editor-progress-overlay">
            <Loader2 size={36} className="spin" color="#e56b83" />
            <h3 style={{ margin: 0, fontSize: 17, color: "#fff", fontWeight: 700 }}>
              {progressMsg}
            </h3>
            <progress value={progressPct} max={100} />
            <span style={{ fontSize: 13, color: "#ff9cb3", fontWeight: 600 }}>
              {progressPct}%
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Creative Studio Dropzone Banner component to be placed inside PostEditor, StoryManager, and MediaLibrary.
 */
export function MediaStudioTriggerBanner({
  onOpen,
  label = "Open Media Studio & Creative Editor",
  subtitle = "Crop, apply Instagram filters, tune brightness/warmth, add stickers, and trim reels before uploading.",
}: {
  onOpen: (files?: File[]) => void;
  label?: string;
  subtitle?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      onOpen(files);
    }
    e.target.value = "";
  };

  return (
    <div
      className="media-studio-trigger-banner"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length) onOpen(files);
      }}
    >
      <div className="media-studio-trigger-info">
        <div className="media-studio-trigger-icon">
          <Sparkles size={22} />
        </div>
        <div className="media-studio-trigger-text">
          <h4>{label}</h4>
          <p>{subtitle}</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4"
          multiple
          style={{ display: "none" }}
          onChange={handleFiles}
        />
        <button
          type="button"
          className="media-studio-trigger-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={15} /> Select & Edit Media
        </button>
      </div>
    </div>
  );
}
