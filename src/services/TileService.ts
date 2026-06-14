import type { TileData } from '../types';
import { TILE_MANIFEST } from 'virtual:tile-manifest';

const TILES_BASE_URL = '/tiles';

export class TileService {
  static getAllTiles(): TileData[] {
    return TILE_MANIFEST.map((filename) => ({
      filename,
      url: `${TILES_BASE_URL}/${filename}`,
    }));
  }

  static getTileUrl(filename: string): string {
    return `${TILES_BASE_URL}/${filename}`;
  }
}
