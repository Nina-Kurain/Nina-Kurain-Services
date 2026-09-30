export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function detectMedia(
  bytes: Uint8Array,
  fallbackHint?: string
): { mime: string; type: "image" | "video" } | null {
  if (bytes && bytes.length >= 4) {
    const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
    const headerStr = String.fromCharCode(...bytes.slice(0, Math.min(bytes.length, 512)));

    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return { mime: "image/jpeg", type: "image" };
    }
    if (
      bytes[0] === 0x89 &&
      ascii(1, 4) === "PNG" &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    ) {
      return { mime: "image/png", type: "image" };
    }
    if (headerStr.startsWith("RIFF") && headerStr.includes("WEBP")) {
      return { mime: "image/webp", type: "image" };
    }
    if (
      ascii(4, 8) === "ftyp" ||
      ascii(4, 8) === "moov" ||
      ascii(4, 8) === "wide" ||
      ascii(4, 8) === "mdat" ||
      headerStr.includes("ftyp") ||
      headerStr.includes("moov") ||
      headerStr.includes("mdat") ||
      headerStr.includes("wide") ||
      headerStr.includes("qt  ") ||
      headerStr.includes("isom") ||
      headerStr.includes("mp41") ||
      headerStr.includes("mp42") ||
      (ascii(0, 4) === "\x00\x00\x00\x18" && ascii(4, 8) === "ftyp")
    ) {
      return { mime: "video/mp4", type: "video" };
    }
    // WebM / Matroska EBML signature
    if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
      return { mime: "video/webm", type: "video" };
    }
  }

  // Fallback check based on filename or mime type hint
  if (fallbackHint) {
    const hint = fallbackHint.toLowerCase();
    if (hint.endsWith(".mp4") || hint.endsWith(".m4v") || hint.includes("video/mp4")) {
      return { mime: "video/mp4", type: "video" };
    }
    if (hint.endsWith(".mov") || hint.includes("video/quicktime")) {
      return { mime: "video/mp4", type: "video" };
    }
    if (hint.endsWith(".webm") || hint.includes("video/webm")) {
      return { mime: "video/webm", type: "video" };
    }
    if (hint.endsWith(".jpg") || hint.endsWith(".jpeg") || hint.includes("image/jpeg")) {
      return { mime: "image/jpeg", type: "image" };
    }
    if (hint.endsWith(".png") || hint.includes("image/png")) {
      return { mime: "image/png", type: "image" };
    }
    if (hint.endsWith(".webp") || hint.includes("image/webp")) {
      return { mime: "image/webp", type: "image" };
    }
  }

  return null;
}

export function parseRange(
  range: string | null,
  total: number
): { offset: number; length: number } | null {
  if (!range) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match || (!match[1] && !match[2]) || total <= 0) {
    throw new Error("Invalid byte range");
  }
  const offset = match[1] ? Number(match[1]) : Math.max(0, total - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
  if (
    !Number.isSafeInteger(offset) ||
    !Number.isSafeInteger(end) ||
    offset >= total ||
    offset > end ||
    offset < 0
  ) {
    throw new Error("Invalid byte range");
  }
  return { offset, length: end - offset + 1 };
}
