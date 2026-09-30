"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface HeaderNavDropdownProps {
  label: React.ReactNode;
  btnClassName?: string;
  align?: "start" | "end";
  children: React.ReactNode;
  ariaLabel?: string;
}

export function HeaderNavDropdown({
  label,
  btnClassName = "header-nav-dropdown-btn",
  align = "start",
  children,
  ariaLabel = "Navigation menu",
}: HeaderNavDropdownProps) {
  const [open, setOpen] = useState(false);
  const [resolvedAlign, setResolvedAlign] = useState<"start" | "end">(align);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect safe alignment whenever opened
  useEffect(() => {
    if (!open) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      // If end-aligning would push menu off the left screen edge (< 260px)
      if (align === "end" && rect.right < 270) {
        setResolvedAlign("start");
      } else if (align === "start" && (screenWidth - rect.left) < 270) {
        setResolvedAlign("end");
      } else {
        setResolvedAlign(align);
      }
    }
  }, [open, align]);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="custom-nav-dropdown-container"
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
    >
      <button
        type="button"
        className={btnClassName}
        aria-label={ariaLabel}
        aria-expanded={open}
        data-state={open ? "open" : "closed"}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <span className="nav-dropdown-active-label">{label}</span>
        <ChevronDown
          size={14}
          className="nav-dropdown-chevron"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {open && (
        <div
          className={`header-nav-dropdown-content custom-dropdown-open ${resolvedAlign === "end" ? "align-end" : "align-start"}`}
          onClick={(e) => {
            // Close when any link or action item inside is clicked
            const target = e.target as HTMLElement;
            if (target.closest("a") || target.closest("button") || target.getAttribute("role") === "menuitem") {
              setOpen(false);
            }
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
