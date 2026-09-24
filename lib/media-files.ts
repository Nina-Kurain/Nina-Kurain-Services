export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function detectMedia(bytes: Uint8Array): { mime: string; type: "image" | "video" } | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
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
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
    return { mime: "image/webp", type: "image" };
  }
  if (
    ascii(4, 8) === "ftyp" &&
    ["isom", "iso2", "mp41", "mp42", "avc1", "M4V "].includes(ascii(8, 12))
  ) {
    return { mime: "video/mp4", type: "video" };
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
