"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  Canvas,
  FabricImage,
  Textbox,
  PencilBrush,
  filters,
} from "fabric";
import type {
  AspectRatioType,
  ToneAdjustments,
  TransformState,
  EditorTextLayer,
} from "./editor-types";
import { getFilterPreset } from "./filter-presets";

export interface FabricPhotoCanvasProps {
  sourceUrl: string;
  aspectRatio: AspectRatioType;
  transform: TransformState;
  filterId: string;
  filterIntensity: number;
  adjustments: ToneAdjustments;
  textLayers: EditorTextLayer[];
  isDrawing: boolean;
  brushColor: string;
  brushSize: number;
  comparing: boolean;
  showSafeGuides?: boolean;
  onCanvasReady?: (canvas: Canvas) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  onExportReady?: (exportFn: () => Promise<Blob>) => void;
  onTransformChange?: (newTransform: Partial<TransformState>) => void;
}

export function FabricPhotoCanvas({
  sourceUrl,
  aspectRatio,
  transform,
  filterId,
  filterIntensity,
  adjustments,
  textLayers,
  isDrawing,
  brushColor,
  brushSize,
  comparing,
  showSafeGuides = false,
  onCanvasReady,
  onHistoryChange,
  onExportReady,
  onTransformChange,
}: FabricPhotoCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const fabricImageRef = useRef<FabricImage | null>(null);
  const originalImageRef = useRef<FabricImage | null>(null);

  // Dynamic interaction and dimension tracking
  const [isInteracting, setIsInteracting] = useState(false);
  const [stageDims, setStageDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Refs for drag / zoom / touch handling to prevent stale closures
  const isDraggingRef = useRef(false);
  const dragStartPointerRef = useRef({ x: 0, y: 0 });
  const dragStartTransformRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef(1);
  const interactionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const transformRef = useRef(transform);
  transformRef.current = transform;

  const onTransformChangeRef = useRef(onTransformChange);
  onTransformChangeRef.current = onTransformChange;

  const isDrawingRef = useRef(isDrawing);
  isDrawingRef.current = isDrawing;

  const maxPanRef = useRef({
    maxPanX: 0,
    maxPanY: 0,
    stageWidth: 0,
    stageHeight: 0,
  });

  // Calculate target aspect ratio numeric proportion
  const getNumericRatio = useCallback((ratio: AspectRatioType, imgWidth: number, imgHeight: number): number => {
    switch (ratio) {
      case "1:1":
        return 1;
      case "4:5":
        return 4 / 5;
      case "9:16":
        return 9 / 16;
      case "16:9":
        return 16 / 9;
      case "original":
      default:
        return imgWidth && imgHeight ? imgWidth / imgHeight : 4 / 5;
    }
  }, []);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasElRef.current || !containerRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      selection: true,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      backgroundColor: "#000000",
    });

    fabricCanvasRef.current = canvas;
    onCanvasReady?.(canvas);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      fabricImageRef.current = null;
      originalImageRef.current = null;
    };
  }, [onCanvasReady]);

  // Load Main Image
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !sourceUrl) return;

    let isCancelled = false;

    FabricImage.fromURL(sourceUrl, { crossOrigin: "anonymous" })
      .then((img) => {
        if (isCancelled || !canvas) return;

        fabricImageRef.current = img;
        originalImageRef.current = img;

        img.set({
          selectable: false,
          evented: false,
          originX: "center",
          originY: "center",
        });

        canvas.clear();
        canvas.add(img);
        canvas.sendObjectToBack(img);

        applyFilters();
        applyTransform();
      })
      .catch((err) => {
        console.warn("[FabricPhotoCanvas] Image load error:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [sourceUrl]);

  // Filter application (only re-computes on filter / adjustment changes)
  const applyFilters = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const img = fabricImageRef.current;
    if (!canvas || !img) return;

    if (comparing) {
      img.filters = [];
      img.applyFilters();
      canvas.requestRenderAll();
      return;
    }

    const activeFilters: any[] = [];

    // Brightness + Exposure
    const netBrightness = (adjustments.brightness + adjustments.exposure * 0.4) / 100;
    if (netBrightness !== 0) {
      activeFilters.push(new filters.Brightness({ brightness: netBrightness }));
    }

    // Contrast
    if (adjustments.contrast !== 0) {
      activeFilters.push(new filters.Contrast({ contrast: adjustments.contrast / 100 }));
    }

    // Saturation
    if (adjustments.saturation !== 0) {
      activeFilters.push(new filters.Saturation({ saturation: adjustments.saturation / 100 }));
    }

    // Vibrance
    if (adjustments.vibrance !== 0) {
      activeFilters.push(new filters.Vibrance({ vibrance: adjustments.vibrance / 100 }));
    }

    // Tint (Hue rotation)
    if (adjustments.tint !== 0) {
      activeFilters.push(new filters.HueRotation({ rotation: (adjustments.tint / 100) * Math.PI }));
    }

    // Warmth (Blend with warm amber or cool blue)
    if (adjustments.warmth !== 0) {
      const warmthColor = adjustments.warmth > 0 ? "#ff8800" : "#0088ff";
      activeFilters.push(
        new filters.BlendColor({
          color: warmthColor,
          mode: "tint",
          alpha: Math.abs(adjustments.warmth) / 350,
        })
      );
    }

    // Instagram Presets
    const preset = getFilterPreset(filterId);
    if (preset && preset.id !== "normal" && filterIntensity > 0) {
      const intensityFactor = filterIntensity / 100;

      if (preset.id === "clarendon") {
        activeFilters.push(new filters.Contrast({ contrast: 0.15 * intensityFactor }));
        activeFilters.push(new filters.Saturation({ saturation: 0.2 * intensityFactor }));
      } else if (preset.id === "juno") {
        activeFilters.push(new filters.Contrast({ contrast: 0.12 * intensityFactor }));
        activeFilters.push(new filters.Vibrance({ vibrance: 0.25 * intensityFactor }));
      } else if (preset.id === "ludwig") {
        activeFilters.push(new filters.Contrast({ contrast: 0.1 * intensityFactor }));
        activeFilters.push(new filters.Brightness({ brightness: 0.05 * intensityFactor }));
      } else if (preset.id === "gingham" || preset.id === "vintage") {
        activeFilters.push(new filters.Vintage());
      } else if (preset.id === "valencia") {
        activeFilters.push(new filters.Sepia());
        activeFilters.push(new filters.Brightness({ brightness: 0.08 * intensityFactor }));
      } else if (preset.id === "moon" || preset.id === "inkwell" || preset.id === "willow") {
        activeFilters.push(new filters.Grayscale());
        activeFilters.push(new filters.Contrast({ contrast: 0.2 * intensityFactor }));
      } else if (preset.id === "reyes" || preset.id === "crema") {
        activeFilters.push(new filters.Sepia());
        activeFilters.push(new filters.Contrast({ contrast: -0.1 * intensityFactor }));
      } else if (preset.id === "kodachrome") {
        activeFilters.push(new filters.Kodachrome());
      } else if (preset.id === "polaroid") {
        activeFilters.push(new filters.Polaroid());
      } else if (preset.id === "technicolor") {
        activeFilters.push(new filters.Technicolor());
      } else if (preset.sepia > 0) {
        activeFilters.push(new filters.Sepia());
      }
    }

    // Sharpen / Blur
    if (adjustments.sharpen > 0) {
      activeFilters.push(
        new filters.Convolute({
          matrix: [
            0, -1, 0,
            -1, 5 + adjustments.sharpen / 25, -1,
            0, -1, 0,
          ],
        })
      );
    }

    img.filters = activeFilters;
    img.applyFilters();
    canvas.requestRenderAll();
  }, [filterId, filterIntensity, adjustments, comparing]);

  // Synchronize filters when adjustments change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Transform calculation with Instagram-grade boundary clamping
  const applyTransform = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const img = fabricImageRef.current;
    if (!canvas || !img || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth || 600;
    const containerHeight = containerRef.current.clientHeight || 600;

    const imgWidth = img.width || 1080;
    const imgHeight = img.height || 1080;

    const targetRatio = getNumericRatio(aspectRatio, imgWidth, imgHeight);

    // Compute stage display dimensions within container
    let stageWidth = containerWidth;
    let stageHeight = stageWidth / targetRatio;

    if (stageHeight > containerHeight) {
      stageHeight = containerHeight;
      stageWidth = stageHeight * targetRatio;
    }

    // Round for crisp pixel boundaries
    stageWidth = Math.round(stageWidth);
    stageHeight = Math.round(stageHeight);

    canvas.setDimensions({ width: stageWidth, height: stageHeight });
    setStageDims((prev) => {
      if (prev.width === stageWidth && prev.height === stageHeight) return prev;
      return { width: stageWidth, height: stageHeight };
    });

    if (comparing) {
      // Show pristine original
      img.set({
        scaleX: Math.max(stageWidth / imgWidth, stageHeight / imgHeight),
        scaleY: Math.max(stageWidth / imgWidth, stageHeight / imgHeight),
        left: stageWidth / 2,
        top: stageHeight / 2,
        angle: 0,
        flipX: false,
        flipY: false,
      });
      canvas.requestRenderAll();
      return;
    }

    // Effective image dimensions accounting for 90-degree rotations
    const isRotated90 = Math.round(Math.abs(transform.rotation || 0) / 90) % 2 === 1;
    const effectiveImgW = isRotated90 ? imgHeight : imgWidth;
    const effectiveImgH = isRotated90 ? imgWidth : imgHeight;

    // Aspect Fill base scale ensures image completely covers crop frame at 1.0x zoom
    const baseScale = Math.max(stageWidth / effectiveImgW, stageHeight / effectiveImgH);
    const currentZoom = Math.max(1, Math.min(3, transform.zoom || 1));
    const finalScale = baseScale * currentZoom;

    // Rendered footprint of the photo
    const displayW = effectiveImgW * finalScale;
    const displayH = effectiveImgH * finalScale;

    // Maximum pan slack in each direction from exact center
    const maxPanX = Math.max(0, (displayW - stageWidth) / 2);
    const maxPanY = Math.max(0, (displayH - stageHeight) / 2);

    maxPanRef.current = { maxPanX, maxPanY, stageWidth, stageHeight };

    // Set cursor based on pan availability
    if (!isDrawing) {
      const canPan = maxPanX > 0.5 || maxPanY > 0.5;
      canvas.defaultCursor = isDraggingRef.current ? "grabbing" : canPan ? "grab" : "default";
      canvas.hoverCursor = isDraggingRef.current ? "grabbing" : canPan ? "grab" : "default";
    }

    // Instagram boundary clamping: transform.x and transform.y in [-1, 1]
    const clampedX = Math.max(-1, Math.min(1, transform.x || 0));
    const clampedY = Math.max(-1, Math.min(1, transform.y || 0));

    const centerX = stageWidth / 2 + clampedX * maxPanX;
    const centerY = stageHeight / 2 + clampedY * maxPanY;
    const netAngle = (transform.rotation || 0) + (transform.straighten || 0);

    img.set({
      scaleX: finalScale,
      scaleY: finalScale,
      left: centerX,
      top: centerY,
      angle: netAngle,
      flipX: Boolean(transform.flipH),
      flipY: Boolean(transform.flipV),
    });

    canvas.requestRenderAll();
  }, [
    aspectRatio,
    transform,
    comparing,
    isDrawing,
    getNumericRatio,
  ]);

  // Re-run transform when transform or ratio changes
  useEffect(() => {
    applyTransform();
  }, [applyTransform]);

  // Resize handler for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      applyTransform();
    };
    window.addEventListener("resize", handleResize);

    let observer: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        applyTransform();
      });
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [applyTransform]);

  // Interactive direct pan & mouse-wheel / touch pinch zoom
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const triggerInteracting = () => {
      setIsInteracting(true);
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
      interactionTimerRef.current = setTimeout(() => {
        setIsInteracting(false);
      }, 500);
    };

    const handleMouseDown = (opt: any) => {
      if (isDrawingRef.current) return;
      // If user clicked an interactive textbox layer, let Fabric handle it
      if (opt.target && opt.target.type === "textbox") return;

      const e = opt.e;
      if (!e) return;

      if (e.touches && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDistRef.current = Math.hypot(dx, dy);
        pinchStartZoomRef.current = transformRef.current.zoom || 1;
        setIsInteracting(true);
        return;
      }

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      isDraggingRef.current = true;
      dragStartPointerRef.current = { x: clientX, y: clientY };
      dragStartTransformRef.current = {
        x: transformRef.current.x || 0,
        y: transformRef.current.y || 0,
      };

      setIsInteracting(true);
      canvas.defaultCursor = "grabbing";
      canvas.hoverCursor = "grabbing";
    };

    const handleMouseMove = (opt: any) => {
      const e = opt.e;
      if (!e) return;

      // Handle touch pinch-to-zoom
      if (e.touches && e.touches.length === 2 && pinchStartDistRef.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const ratio = currentDist / (pinchStartDistRef.current || 1);
        const nextZoom = Math.max(1, Math.min(3, Number((pinchStartZoomRef.current * ratio).toFixed(2))));

        onTransformChangeRef.current?.({ zoom: nextZoom });
        triggerInteracting();
        return;
      }

      if (!isDraggingRef.current) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - dragStartPointerRef.current.x;
      const dy = clientY - dragStartPointerRef.current.y;

      const { maxPanX, maxPanY, stageWidth, stageHeight } = maxPanRef.current;

      let nextX = dragStartTransformRef.current.x;
      let nextY = dragStartTransformRef.current.y;

      if (maxPanX > 0) {
        nextX = Math.max(-1, Math.min(1, dragStartTransformRef.current.x + dx / maxPanX));
      } else {
        nextX = 0;
      }

      if (maxPanY > 0) {
        nextY = Math.max(-1, Math.min(1, dragStartTransformRef.current.y + dy / maxPanY));
      } else {
        nextY = 0;
      }

      // Instant 60/120fps visual positioning on Fabric image
      const img = fabricImageRef.current;
      if (img && stageWidth > 0) {
        const cx = stageWidth / 2 + nextX * maxPanX;
        const cy = stageHeight / 2 + nextY * maxPanY;
        img.set({ left: cx, top: cy });
        canvas.requestRenderAll();
      }

      onTransformChangeRef.current?.({
        x: Number(nextX.toFixed(3)),
        y: Number(nextY.toFixed(3)),
      });
    };

    const handleMouseUp = () => {
      pinchStartDistRef.current = null;
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        const canPan = maxPanRef.current.maxPanX > 0.5 || maxPanRef.current.maxPanY > 0.5;
        canvas.defaultCursor = canPan ? "grab" : "default";
        canvas.hoverCursor = canPan ? "grab" : "default";
        triggerInteracting();
      }
    };

    const handleMouseWheel = (opt: any) => {
      if (!opt.e) return;
      opt.e.preventDefault();
      opt.e.stopPropagation();

      const currentZoom = transformRef.current.zoom || 1;
      const delta = -opt.e.deltaY * 0.0012;
      const nextZoom = Math.max(1, Math.min(3, Number((currentZoom + delta).toFixed(2))));

      if (nextZoom !== currentZoom) {
        onTransformChangeRef.current?.({ zoom: nextZoom });
        triggerInteracting();
      }
    };

    // Attach to Fabric canvas events
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    canvas.on("mouse:wheel", handleMouseWheel);

    // Global listener to ensure drag releases if pointer exits canvas
    const handleGlobalPointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        const canPan = maxPanRef.current.maxPanX > 0.5 || maxPanRef.current.maxPanY > 0.5;
        canvas.defaultCursor = canPan ? "grab" : "default";
        canvas.hoverCursor = canPan ? "grab" : "default";
        triggerInteracting();
      }
      pinchStartDistRef.current = null;
    };
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("touchend", handleGlobalPointerUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      canvas.off("mouse:wheel", handleMouseWheel);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("touchend", handleGlobalPointerUp);
      if (interactionTimerRef.current) {
        clearTimeout(interactionTimerRef.current);
      }
    };
  }, []);

  // Drawing mode handler
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = isDrawing;
    if (isDrawing) {
      const brush = new PencilBrush(canvas);
      brush.color = brushColor || "#e56b83";
      brush.width = brushSize || 5;
      canvas.freeDrawingBrush = brush;
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
    } else {
      const canPan = maxPanRef.current.maxPanX > 0.5 || maxPanRef.current.maxPanY > 0.5;
      canvas.defaultCursor = canPan ? "grab" : "default";
      canvas.hoverCursor = canPan ? "grab" : "default";
    }
  }, [isDrawing, brushColor, brushSize]);

  // Sync Text Layers
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Remove existing text layers
    const existingTextboxes = canvas.getObjects("textbox");
    existingTextboxes.forEach((tb) => canvas.remove(tb));

    const stageWidth = canvas.width || 600;
    const stageHeight = canvas.height || 600;

    textLayers.forEach((layer) => {
      const tb = new Textbox(layer.text, {
        left: (layer.x ?? 0.5) * stageWidth,
        top: (layer.y ?? 0.5) * stageHeight,
        originX: "center",
        originY: "center",
        fontSize: layer.fontSize || 28,
        fill: layer.color || "#ffffff",
        backgroundColor: layer.backgroundColor !== "transparent" ? layer.backgroundColor : undefined,
        fontFamily: getFontFamily(layer.fontFamily),
        textAlign: layer.textAlign || "center",
        padding: 8,
        cornerColor: "#e56b83",
        cornerSize: 10,
        transparentCorners: false,
      });

      canvas.add(tb);
      canvas.bringObjectToFront(tb);
    });

    canvas.requestRenderAll();
  }, [textLayers]);

  // Export high-res image blob (matches screen view exactly at 1080p target)
  const exportHighResImage = useCallback(async (): Promise<Blob> => {
    const canvas = fabricCanvasRef.current;
    const img = fabricImageRef.current;
    if (!canvas || !img) {
      throw new Error("Canvas is not ready for export");
    }

    const targetWidth = 1080;
    const numericRatio = getNumericRatio(aspectRatio, img.width || 1080, img.height || 1080);
    const targetHeight = Math.round(targetWidth / numericRatio);

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = targetWidth;
    offscreenCanvas.height = targetHeight;

    const dataUrl = canvas.toDataURL({
      format: "jpeg",
      quality: 0.95,
      multiplier: targetWidth / (canvas.width || targetWidth),
    });

    return new Promise((resolve, reject) => {
      const exportImg = new Image();
      exportImg.onload = () => {
        const ctx = offscreenCanvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get 2d context for export"));
          return;
        }

        ctx.drawImage(exportImg, 0, 0, targetWidth, targetHeight);

        // Add vignette if present in adjustments
        if (adjustments.vignette > 0) {
          const gradient = ctx.createRadialGradient(
            targetWidth / 2,
            targetHeight / 2,
            targetWidth * 0.3,
            targetWidth / 2,
            targetHeight / 2,
            targetWidth * 0.75
          );
          gradient.addColorStop(0, "rgba(0,0,0,0)");
          gradient.addColorStop(1, `rgba(0,0,0,${(adjustments.vignette / 100) * 0.7})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        offscreenCanvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to produce image blob"));
          },
          "image/jpeg",
          0.95
        );
      };
      exportImg.onerror = () => reject(new Error("Failed to render export image"));
      exportImg.src = dataUrl;
    });
  }, [aspectRatio, adjustments, getNumericRatio]);

  // Provide export function to parent
  useEffect(() => {
    onExportReady?.(exportHighResImage);
  }, [onExportReady, exportHighResImage]);

  const showGrid = isInteracting || showSafeGuides;

  return (
    <div
      ref={containerRef}
      className="fabric-stage-wrapper"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#060608",
      }}
    >
      <canvas ref={canvasElRef} />

      {/* Dynamic Instagram 3x3 Rule-of-Thirds Grid & Corner Brackets */}
      <div
        className={`crop-grid-overlay ${showGrid ? "active" : ""}`}
        style={{
          position: "absolute",
          width: stageDims.width || "100%",
          height: stageDims.height || "100%",
          pointerEvents: "none",
          opacity: showGrid ? 1 : 0,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: showGrid ? "0 0 0 1px rgba(255, 255, 255, 0.4) inset" : "none",
        }}
      >
        {/* 3x3 Rule of Thirds Lines */}
        <div className="crop-grid-line crop-grid-h1" />
        <div className="crop-grid-line crop-grid-h2" />
        <div className="crop-grid-line crop-grid-v1" />
        <div className="crop-grid-line crop-grid-v2" />

        {/* Instagram Framing Corner Brackets */}
        <div className="crop-bracket top-left" />
        <div className="crop-bracket top-right" />
        <div className="crop-bracket bottom-left" />
        <div className="crop-bracket bottom-right" />
      </div>

      {/* Safe Area Guides (Story/Feed UI boundaries) */}
      {showSafeGuides && aspectRatio === "9:16" && (
        <div
          className="safe-guides-overlay"
          style={{
            position: "absolute",
            width: stageDims.width || "100%",
            height: stageDims.height || "100%",
            pointerEvents: "none",
            border: "1px dashed rgba(255, 255, 255, 0.3)",
          }}
        >
          {/* Top safe zone (header) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "14%",
              backgroundColor: "rgba(229, 107, 131, 0.1)",
              borderBottom: "1px dashed rgba(229, 107, 131, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 10,
              letterSpacing: 1,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Top Story UI Safe Area
          </div>
          {/* Bottom safe zone (message bar) */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "20%",
              backgroundColor: "rgba(229, 107, 131, 0.1)",
              borderTop: "1px dashed rgba(229, 107, 131, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: 10,
              letterSpacing: 1,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Bottom Story UI Safe Area
          </div>
        </div>
      )}
    </div>
  );
}

function getFontFamily(font: EditorTextLayer["fontFamily"]): string {
  switch (font) {
    case "modern":
      return "system-ui, -apple-system, sans-serif";
    case "editorial":
      return "'Playfair Display', Georgia, serif";
    case "neon":
      return "'Impact', sans-serif";
    case "typewriter":
      return "'Courier New', Courier, monospace";
    case "script":
      return "'Brush Script MT', cursive";
    case "classic":
    default:
      return "'Inter', -apple-system, sans-serif";
  }
}
