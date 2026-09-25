"use client";

import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  height?: number;
  width?: number;
  priority?: boolean;
}

export function BrandLogo({
  className = "",
  height = 54,
  width = 81,
  priority = false,
}: BrandLogoProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (
        host.startsWith("vip.") ||
        path.startsWith("/feed") ||
        path.startsWith("/reels") ||
        path.startsWith("/saved") ||
        path.startsWith("/account") ||
        path.startsWith("/memberships")
      ) {
        window.location.href = "https://ninakurainservices.in";
      }
    }
  };

  return (
    <span
      className={`brand-logo-wrap ${className}`}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      title="Nina Kurain Official Website"
    >
      <Image
        src="/logo.png"
        alt="Nina Kurain"
        width={width}
        height={height}
        priority={priority}
        className="brand-logo-img"
      />
    </span>
  );
}

export default BrandLogo;
