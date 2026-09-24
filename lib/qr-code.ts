/**
 * Pure TypeScript Zero-Dependency QR Code Generator
 * Compatible with Node.js, Web Browsers, and Cloudflare Workers.
 * Generates Model 2 QR codes with Error Correction Level M or L.
 */

const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);

(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_EXP[i + 255] = x;
    GF256_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function polyMul(p1: Uint8Array, p2: Uint8Array): Uint8Array {
  const result = new Uint8Array(p1.length + p2.length - 1);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

const generatorCache: Record<number, any> = {};
function getGeneratorPoly(numEC: number): any {
  if (generatorCache[numEC]) return generatorCache[numEC];
  let g: any = new Uint8Array([1]);
  for (let i = 0; i < numEC; i++) {
    g = polyMul(g, new Uint8Array([1, GF256_EXP[i]]));
  }
  generatorCache[numEC] = g;
  return g;
}

function calculateEC(data: Uint8Array, numEC: number): Uint8Array {
  const gen = getGeneratorPoly(numEC);
  const msg = new Uint8Array(data.length + numEC);
  msg.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return new Uint8Array(msg.slice(data.length));
}

interface VersionInfo {
  version: number;
  total: number;
  data: number;
  ec: number;
  blocks: number;
  align: number[];
}

const VERSION_TABLE_M: (VersionInfo | null)[] = [
  null,
  { version: 1, total: 26, data: 16, ec: 10, blocks: 1, align: [] },
  { version: 2, total: 44, data: 28, ec: 16, blocks: 1, align: [6, 18] },
  { version: 3, total: 70, data: 44, ec: 26, blocks: 1, align: [6, 22] },
  { version: 4, total: 100, data: 64, ec: 18, blocks: 2, align: [6, 26] },
  { version: 5, total: 134, data: 86, ec: 24, blocks: 2, align: [6, 30] },
  { version: 6, total: 172, data: 108, ec: 16, blocks: 4, align: [6, 34] },
  { version: 7, total: 196, data: 124, ec: 18, blocks: 4, align: [6, 22, 38] },
  { version: 8, total: 242, data: 154, ec: 22, blocks: 4, align: [6, 24, 42] },
  { version: 9, total: 292, data: 182, ec: 22, blocks: 5, align: [6, 26, 46] },
  { version: 10, total: 346, data: 216, ec: 26, blocks: 5, align: [6, 28, 50] },
  { version: 11, total: 404, data: 252, ec: 30, blocks: 5, align: [6, 30, 54] },
  { version: 12, total: 466, data: 290, ec: 22, blocks: 8, align: [6, 32, 58] },
  { version: 13, total: 532, data: 332, ec: 22, blocks: 9, align: [6, 34, 62] },
  { version: 14, total: 581, data: 365, ec: 24, blocks: 9, align: [6, 26, 46, 66] },
];

function selectVersion(byteCount: number): VersionInfo {
  for (let v = 1; v < VERSION_TABLE_M.length; v++) {
    const info = VERSION_TABLE_M[v];
    if (!info) continue;
    const lengthBits = v < 10 ? 8 : 16;
    const requiredBits = 4 + lengthBits + byteCount * 8;
    const availableBits = info.data * 8;
    if (requiredBits <= availableBits) {
      return info;
    }
  }
  throw new Error("Data payload too long for QR generator (max ~350 bytes)");
}

class BitBuffer {
  buffer: number[] = [];
  length: number = 0;

  put(num: number, length: number) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }
}

/**
 * Encodes text into a 2D boolean matrix of QR modules
 */
export function encodeQRCode(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const versionInfo = selectVersion(bytes.length);
  const size = versionInfo.version * 4 + 17;

  // 1. Data bits
  const bb = new BitBuffer();
  // Mode: Byte (0100)
  bb.put(0b0100, 4);
  // Character count
  const countBits = versionInfo.version < 10 ? 8 : 16;
  bb.put(bytes.length, countBits);
  // Data bytes
  for (let i = 0; i < bytes.length; i++) {
    bb.put(bytes[i], 8);
  }
  // Terminator
  const maxBits = versionInfo.data * 8;
  const termBits = Math.min(4, maxBits - bb.length);
  if (termBits > 0) bb.put(0, termBits);
  // Pad to byte
  while (bb.length % 8 !== 0) {
    bb.putBit(false);
  }
  // Pad bytes 0xEC, 0x11
  let padToggle = true;
  while (bb.length < maxBits) {
    bb.put(padToggle ? 0xec : 0x11, 8);
    padToggle = !padToggle;
  }

  const rawData = new Uint8Array(bb.buffer);

  // 2. Error correction
  const numBlocks = versionInfo.blocks;
  const blockTotalData = Math.floor(versionInfo.data / numBlocks);
  const ecLen = versionInfo.ec;
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];

  let offset = 0;
  for (let b = 0; b < numBlocks; b++) {
    const blockData = rawData.slice(offset, offset + blockTotalData);
    offset += blockTotalData;
    dataBlocks.push(blockData);
    ecBlocks.push(calculateEC(blockData, ecLen));
  }

  // Interleave
  const finalCodewords: number[] = [];
  for (let i = 0; i < blockTotalData; i++) {
    for (let b = 0; b < numBlocks; b++) {
      finalCodewords.push(dataBlocks[b][i]);
    }
  }
  for (let i = 0; i < ecLen; i++) {
    for (let b = 0; b < numBlocks; b++) {
      finalCodewords.push(ecBlocks[b][i]);
    }
  }

  // 3. Matrix placement
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setFunc(r: number, c: number, val: boolean) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      isFunction[r][c] = true;
    }
  }

  // Finder patterns
  function addFinder(top: number, left: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = top + r;
        const col = left + c;
        if (row < 0 || row >= size || col < 0 || col >= size) continue;
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          setFunc(row, col, false); // separator
        } else if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          setFunc(row, col, true);
        } else {
          setFunc(row, col, false);
        }
      }
    }
  }
  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setFunc(6, i, i % 2 === 0);
    setFunc(i, 6, i % 2 === 0);
  }

  // Alignment patterns
  const alignCoords = versionInfo.align;
  if (alignCoords && alignCoords.length >= 2) {
    for (const r of alignCoords) {
      for (const c of alignCoords) {
        if (isFunction[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            setFunc(r + dr, c + dc, isBorder || isCenter);
          }
        }
      }
    }
  }

  // Dark module
  setFunc(4 * versionInfo.version + 9, 8, true);

  // Reserve format information areas
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) setFunc(8, i, false);
    if (i !== 6) setFunc(i, 8, false);
  }
  for (let i = 0; i < 8; i++) {
    setFunc(8, size - 1 - i, false);
    setFunc(size - 1 - i, 8, false);
  }

  // Place data bits in zig-zag
  let bitIndex = 0;
  const totalBits = finalCodewords.length * 8;
  const getBit = (idx: number) => {
    if (idx >= totalBits) return false;
    const byte = finalCodewords[Math.floor(idx / 8)];
    return ((byte >>> (7 - (idx % 8))) & 1) === 1;
  };

  let upwards = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // skip vertical timing line
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of [right, right - 1]) {
        if (!isFunction[r][c]) {
          const bit = getBit(bitIndex++);
          // Apply mask 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = mask ? !bit : bit;
        }
      }
    }
    upwards = !upwards;
  }

  // Format info (Level M = 00, Mask 0 = 000 -> 00000, BCH = 10100110111 -> format bits: 101010000010010)
  // Masked with 0x5412 (101010000010010)
  const formatBits = [true, false, true, false, true, false, false, false, false, false, true, false, false, true, false];
  for (let i = 0; i < 15; i++) {
    const bit = formatBits[i];
    // around top-left
    if (i <= 5) matrix[8][i] = bit;
    else if (i === 6) matrix[8][7] = bit;
    else if (i === 7) matrix[8][8] = bit;
    else if (i === 8) matrix[7][8] = bit;
    else matrix[14 - i][8] = bit;

    // second copy
    if (i < 8) matrix[size - 1 - i][8] = bit;
    else matrix[8][size - 15 + i] = bit;
  }

  return matrix.map(row => row.map(cell => Boolean(cell)));
}

/**
 * Converts a QR matrix to a scalable SVG string
 */
export function qrMatrixToSvg(
  matrix: boolean[][],
  options: {
    size?: number;
    color?: string;
    bgColor?: string;
    padding?: number;
  } = {}
): string {
  const {
    size = 280,
    color = "#110811",
    bgColor = "#ffffff",
    padding = 3,
  } = options;

  const count = matrix.length;
  const viewBoxSize = count + padding * 2;
  let paths = "";

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (matrix[r][c]) {
        const x = c + padding;
        const y = r + padding;
        paths += `M${x},${y}h1v1h-1z `;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}" shape-rendering="crispEdges">
    <rect width="${viewBoxSize}" height="${viewBoxSize}" fill="${bgColor}" rx="2" />
    <path d="${paths.trim()}" fill="${color}" />
  </svg>`;
}

/**
 * Draws the QR matrix to an HTML5 Canvas with rounded luxury styling
 */
export function drawQrToCanvas(
  canvas: HTMLCanvasElement,
  matrix: boolean[][],
  options: {
    size?: number;
    color?: string;
    bgColor?: string;
    padding?: number;
    centerLogoText?: string;
  } = {}
) {
  const {
    size = 320,
    color = "#140814",
    bgColor = "#ffffff",
    padding = 3,
    centerLogoText = "NK",
  } = options;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const count = matrix.length;
  const totalCells = count + padding * 2;
  const cellSize = size / totalCells;

  canvas.width = size;
  canvas.height = size;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Draw QR Cells
  ctx.fillStyle = color;
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (matrix[r][c]) {
        const x = (c + padding) * cellSize;
        const y = (r + padding) * cellSize;
        ctx.fillRect(x, y, cellSize + 0.3, cellSize + 0.3);
      }
    }
  }

  // Draw Center Luxury Badge (if enabled)
  if (centerLogoText) {
    const centerSize = cellSize * 7;
    const centerX = (size - centerSize) / 2;
    const centerY = (size - centerSize) / 2;

    // White badge background with rose border
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(centerX - 3, centerY - 3, centerSize + 6, centerSize + 6, 8);
    ctx.fill();

    // Dark Rose inner pill
    ctx.fillStyle = "#a92f49";
    ctx.beginPath();
    ctx.roundRect(centerX, centerY, centerSize, centerSize, 6);
    ctx.fill();

    // Text in center
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.round(centerSize * 0.44)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(centerLogoText, size / 2, size / 2);
  }
}

/**
 * Draws a complete, luxurious Nina Kurain branded payment card
 * that can be downloaded as a PNG or shared on WhatsApp / AirDrop / Email.
 */
export function drawPaymentReceiptCard(
  canvas: HTMLCanvasElement,
  options: {
    amountDisplay: string;
    description?: string;
    customerName?: string;
    payeeName?: string;
    upiId?: string;
    matrix: boolean[][];
    orderRef?: string;
  }
) {
  const {
    amountDisplay,
    description = "Official Payment",
    customerName,
    payeeName = "Nina Kurain",
    upiId,
    matrix,
    orderRef = `NK-${Date.now().toString(36).toUpperCase()}`,
  } = options;

  const width = 640;
  const height = 860;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Luxury Dark Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#190b18");
  bgGrad.addColorStop(0.5, "#100610");
  bgGrad.addColorStop(1, "#080308");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Glowing Rose Border
  ctx.strokeStyle = "rgba(224, 96, 134, 0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(16, 16, width - 32, height - 32, 24);
  ctx.stroke();

  // Subtle ambient radial glow behind QR
  const radGlow = ctx.createRadialGradient(width / 2, 420, 20, width / 2, 420, 260);
  radGlow.addColorStop(0, "rgba(224, 96, 134, 0.18)");
  radGlow.addColorStop(1, "rgba(224, 96, 134, 0)");
  ctx.fillStyle = radGlow;
  ctx.fillRect(0, 200, width, 440);

  // 2. Header: Brand Wordmark & Tag
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(224, 96, 134, 0.9)";
  ctx.font = "bold 12px sans-serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("OFFICIAL PAYMENT REQUEST", width / 2, 58);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Georgia, serif";
  ctx.letterSpacing = "1px";
  ctx.fillText("NINA KURAIN", width / 2, 94);

  // Divider line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 116);
  ctx.lineTo(width - 80, 116);
  ctx.stroke();

  // 3. Amount Section
  ctx.fillStyle = "#f595b2";
  ctx.font = "bold 11px sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("TOTAL AMOUNT TO PAY", width / 2, 146);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px Georgia, serif";
  ctx.letterSpacing = "0px";
  ctx.fillText(amountDisplay, width / 2, 204);

  // Purpose / Description
  ctx.fillStyle = "#cbb3c0";
  ctx.font = "14px sans-serif";
  const descText = customerName ? `${description} · For ${customerName}` : description;
  ctx.fillText(descText, width / 2, 234);

  // 4. Center QR Card Box
  const qrBoxSize = 310;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = 264;

  // White Card behind QR
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20);
  ctx.fill();

  // Draw QR Modules inside
  const count = matrix.length;
  const padding = 3;
  const totalCells = count + padding * 2;
  const cellSize = (qrBoxSize - 24) / totalCells;
  const qrStartX = qrBoxX + 12;
  const qrStartY = qrBoxY + 12;

  ctx.fillStyle = "#110712";
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (matrix[r][c]) {
        const x = qrStartX + (c + padding) * cellSize;
        const y = qrStartY + (r + padding) * cellSize;
        ctx.fillRect(x, y, cellSize + 0.3, cellSize + 0.3);
      }
    }
  }

  // Center logo badge on QR
  const centerSize = cellSize * 7;
  const centerX = qrStartX + (qrBoxSize - 24 - centerSize) / 2;
  const centerY = qrStartY + (qrBoxSize - 24 - centerSize) / 2;

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(centerX - 3, centerY - 3, centerSize + 6, centerSize + 6, 8);
  ctx.fill();

  ctx.fillStyle = "#a92f49";
  ctx.beginPath();
  ctx.roundRect(centerX, centerY, centerSize, centerSize, 6);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${Math.round(centerSize * 0.44)}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NK", qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize / 2);

  // Reset baseline
  ctx.textBaseline = "alphabetic";

  // 5. Instruction & Supported Apps
  ctx.fillStyle = "rgba(224, 96, 134, 0.95)";
  ctx.font = "bold 13px sans-serif";
  ctx.letterSpacing = "1.5px";
  ctx.fillText("SCAN WITH ANY UPI APP OR CAMERA", width / 2, 616);

  ctx.fillStyle = "#9f8696";
  ctx.font = "12px sans-serif";
  ctx.letterSpacing = "0.5px";
  ctx.fillText("Google Pay  •  PhonePe  •  Paytm  •  BHIM  •  Cred  •  Cards", width / 2, 642);

  if (upiId) {
    ctx.fillStyle = "#e56b83";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`UPI ID: ${upiId}`, width / 2, 668);
  }

  // 6. Security Footer & Verification Bar
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.moveTo(60, 704);
  ctx.lineTo(width - 60, 704);
  ctx.stroke();

  ctx.fillStyle = "#8a7382";
  ctx.font = "11.5px sans-serif";
  ctx.fillText(`Ref: ${orderRef}  •  Issued by ${payeeName}`, width / 2, 738);

  ctx.fillStyle = "#5c4955";
  ctx.font = "10.5px sans-serif";
  ctx.fillText("Verified & Secured via Nina Kurain Digital Platform", width / 2, 762);
}

