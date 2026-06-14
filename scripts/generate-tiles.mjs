import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tilesDir = path.resolve(__dirname, '../public/tiles');

const TILES = [
  { name: 'grass.png', color: [76, 153, 60] },
  { name: 'water.png', color: [45, 106, 196] },
  { name: 'stone.png', color: [130, 130, 130] },
  { name: 'sand.png', color: [210, 180, 100] },
  { name: 'forest.png', color: [34, 85, 34] },
  { name: 'lava.png', color: [220, 70, 30] },
];

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function createSolidPng(width, height, rgb) {
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;
    for (let x = 0; x < width; x++) {
      const offset = 1 + x * 4;
      row[offset] = rgb[0];
      row[offset + 1] = rgb[1];
      row[offset + 2] = rgb[2];
      row[offset + 3] = 255;

      const checker = ((x + y) % 8 < 4 ? 12 : -8);
      row[offset] = Math.min(255, Math.max(0, row[offset] + checker));
      row[offset + 1] = Math.min(255, Math.max(0, row[offset + 1] + checker));
      row[offset + 2] = Math.min(255, Math.max(0, row[offset + 2] + checker));
    }
    rows.push(row);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(Buffer.concat(rows));

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(tilesDir, { recursive: true });

for (const tile of TILES) {
  const png = createSolidPng(64, 64, tile.color);
  fs.writeFileSync(path.join(tilesDir, tile.name), png);
}

console.log(`Generated ${TILES.length} sample tiles in public/tiles/`);
