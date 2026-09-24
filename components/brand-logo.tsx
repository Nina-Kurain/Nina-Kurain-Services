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
  return (
    <span className={`brand-logo-wrap ${className}`}>
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
