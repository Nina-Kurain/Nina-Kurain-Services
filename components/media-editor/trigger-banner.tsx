"use client";

import React, { useRef } from "react";
import { Sparkles, Upload } from "lucide-react";

export interface MediaStudioTriggerBannerProps {
  label?: string;
  subtitle?: string;
  onOpen: (files?: File[]) => void;
}

export function MediaStudioTriggerBanner({
  label = "Nina Studio Editor",
  subtitle = "Crop, filter, enhance, and watermark photos, carousels, and video reels before publishing.",
  onOpen,
}: MediaStudioTriggerBannerProps) {
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
