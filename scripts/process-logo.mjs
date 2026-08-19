#!/usr/bin/env node
/**
 * One-off asset-prep script: makes the approved MeeTheDoc brand mark
 * (an opaque RGB PNG, colorType 2, with a near-white studio background)
 * usable on the app's light-blue background by producing an RGBA copy
 * with the background made transparent.
 *
 * This does NOT redraw, recompose, or reinterpret the artwork in any way.
 * It only classifies existing pixels as background/foreground and adjusts
 * their alpha channel. Every foreground pixel keeps its exact original RGB
 * value.
 *
 * Approach (safe-by-construction against eating into internal white
 * details, e.g. the white calendar glyph inside the blue speech bubble):
 *   1. Decode the PNG by hand (zlib inflate + PNG scanline unfiltering).
 *      No new dependency — only Node's built-in `zlib`.
 *   2. Flood-fill from the four image borders through pixels close to
 *      white. Only background connected to an edge is ever touched — the
 *      calendar glyph's white pixels are enclosed by blue on all sides,
 *      so they are never reached by the flood fill and are left fully
 *      opaque, no matter how close to white they are.
 *   3. Feather a thin ring immediately outside that flood-filled region
 *      (pixels adjacent to it whose color falls in a wider near-white
 *      band) down to partial alpha, so the hard-edged background cut
 *      doesn't leave an opaque white/light halo at the icon's silhouette.
 *   4. Re-encode as an RGBA PNG (colorType 6) with the same dimensions.
 *
 * Usage: node scripts/process-logo.mjs
 * Verify the result visually before trusting it — see README note in
 * public/assets/branding/ and the implementer's report for the
 * Playwright screenshot check this script's output was judged against.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(
  __dirname,
  "..",
  "public",
  "assets",
  "branding",
  "אייקון.png"
);
const OUTPUT = path.join(
  __dirname,
  "..",
  "public",
  "assets",
  "branding",
  "logo.png"
);

// Distance-to-white thresholds (Euclidean, per channel 0-255 space).
// HARD_T: pixels this close to white are candidates for the flood fill.
// SOFT_T: pixels up to this far from white, sitting directly adjacent to
//         the flood-filled region, get a proportionally reduced alpha
//         instead of being left fully opaque (removes the halo).
const HARD_T = 18;
const SOFT_T = 70;

// ---------------------------------------------------------------------
// PNG chunk reading
// ---------------------------------------------------------------------

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readChunks(buffer) {
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("Not a PNG file (bad signature)");
  }
  const chunks = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += 8 + length + 4; // length + type + data + crc
  }
  return chunks;
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/** Unfilter PNG scanlines (colorType 2 / RGB, bitDepth 8, no interlace). */
function unfilter(raw, width, height) {
  const bpp = 3; // bytes per pixel for RGB8
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  let rawOffset = 0;

  for (let y = 0; y < height; y++) {
    const filterType = raw[rawOffset];
    rawOffset += 1;
    const rowIn = raw.subarray(rawOffset, rawOffset + stride);
    rawOffset += stride;
    const rowOut = out.subarray(y * stride, (y + 1) * stride);
    const prevRow =
      y === 0 ? null : out.subarray((y - 1) * stride, y * stride);

    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? rowOut[x - bpp] : 0;
      const b = prevRow ? prevRow[x] : 0;
      const c = prevRow && x >= bpp ? prevRow[x - bpp] : 0;
      const raw8 = rowIn[x];

      let value;
      switch (filterType) {
        case 0:
          value = raw8;
          break;
        case 1:
          value = raw8 + a;
          break;
        case 2:
          value = raw8 + b;
          break;
        case 3:
          value = raw8 + Math.floor((a + b) / 2);
          break;
        case 4:
          value = raw8 + paethPredictor(a, b, c);
          break;
        default:
          throw new Error(`Unsupported PNG filter type ${filterType}`);
      }
      rowOut[x] = value & 0xff;
    }
  }

  return out;
}

// ---------------------------------------------------------------------
// PNG chunk writing
// ---------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function writeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6 = RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter type None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idatData = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    PNG_SIGNATURE,
    writeChunk("IHDR", ihdr),
    writeChunk("IDAT", idatData),
    writeChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------
// Background removal
// ---------------------------------------------------------------------

function distanceToWhite(r, g, b) {
  const dr = 255 - r;
  const dg = 255 - g;
  const db = 255 - b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function removeBackground(rgb, width, height) {
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, p = 0; i < width * height; i++, p += 3) {
    rgba[i * 4] = rgb[p];
    rgba[i * 4 + 1] = rgb[p + 1];
    rgba[i * 4 + 2] = rgb[p + 2];
    rgba[i * 4 + 3] = 255;
  }

  const isBackground = new Uint8Array(width * height); // flood-filled set
  const visited = new Uint8Array(width * height);
  const queue = [];

  const pixelDistance = (idx) =>
    distanceToWhite(rgba[idx * 4], rgba[idx * 4 + 1], rgba[idx * 4 + 2]);

  const pushIfCandidate = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    if (pixelDistance(idx) <= HARD_T) {
      isBackground[idx] = 1;
      queue.push(idx);
    }
  };

  for (let x = 0; x < width; x++) {
    pushIfCandidate(x, 0);
    pushIfCandidate(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfCandidate(0, y);
    pushIfCandidate(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx / width) | 0;
    pushIfCandidate(x - 1, y);
    pushIfCandidate(x + 1, y);
    pushIfCandidate(x, y - 1);
    pushIfCandidate(x, y + 1);
  }

  let backgroundCount = 0;
  let featheredCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (isBackground[idx]) {
        rgba[idx * 4 + 3] = 0;
        backgroundCount++;
        continue;
      }

      // Feather ring: only pixels 4-adjacent to the flood-filled region,
      // and themselves still fairly close to white, get partial alpha.
      const neighbors = [
        x > 0 ? idx - 1 : -1,
        x < width - 1 ? idx + 1 : -1,
        y > 0 ? idx - width : -1,
        y < height - 1 ? idx + width : -1,
      ];
      const touchesBackground = neighbors.some(
        (n) => n >= 0 && isBackground[n]
      );
      if (!touchesBackground) continue;

      const d = pixelDistance(idx);
      if (d < SOFT_T) {
        const alphaFraction = d / SOFT_T; // 0 at white, 1 at the soft threshold
        rgba[idx * 4 + 3] = Math.round(255 * alphaFraction);
        featheredCount++;
      }
    }
  }

  return { rgba, backgroundCount, featheredCount };
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

function main() {
  const source = readFileSync(SOURCE);
  const chunks = readChunks(source);

  const ihdrChunk = chunks.find((c) => c.type === "IHDR");
  const width = ihdrChunk.data.readUInt32BE(0);
  const height = ihdrChunk.data.readUInt32BE(4);
  const bitDepth = ihdrChunk.data[8];
  const colorType = ihdrChunk.data[9];
  const interlace = ihdrChunk.data[12];

  if (bitDepth !== 8 || colorType !== 2 || interlace !== 0) {
    throw new Error(
      `Unsupported source PNG: bitDepth=${bitDepth} colorType=${colorType} interlace=${interlace}. ` +
        "This script only handles 8-bit RGB, non-interlaced PNGs."
    );
  }

  const idatData = Buffer.concat(
    chunks.filter((c) => c.type === "IDAT").map((c) => c.data)
  );
  const raw = zlib.inflateSync(idatData);
  const rgb = unfilter(raw, width, height);

  const { rgba, backgroundCount, featheredCount } = removeBackground(
    rgb,
    width,
    height
  );

  const out = encodePng(width, height, rgba);
  writeFileSync(OUTPUT, out);

  const total = width * height;
  console.log(`Source: ${SOURCE}`);
  console.log(`Output: ${OUTPUT}`);
  console.log(`Dimensions: ${width}x${height}`);
  console.log(
    `Background pixels made transparent: ${backgroundCount} (${((backgroundCount / total) * 100).toFixed(1)}%)`
  );
  console.log(`Feathered edge pixels: ${featheredCount}`);
}

main();
