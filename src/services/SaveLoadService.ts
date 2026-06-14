import type { MapData, MapState } from '../types';
import { mapDataToState, mapStateToData } from '../types';

const MAP_FILE_VERSION = 1;

interface MapFilePayload extends MapData {
  version?: number;
}

export class SaveLoadService {
  static serialize(map: MapState): string {
    const payload: MapFilePayload = {
      version: MAP_FILE_VERSION,
      ...mapStateToData(map),
    };
    return JSON.stringify(payload, null, 2);
  }

  static deserialize(json: string): MapState {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('Invalid JSON file');
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid map file format');
    }

    const data = parsed as MapFilePayload;

    if (
      typeof data.width !== 'number' ||
      typeof data.height !== 'number' ||
      !Array.isArray(data.cells)
    ) {
      throw new Error('Map file is missing required fields (width, height, cells)');
    }

    if (data.width < 1 || data.height < 1 || data.width > 200 || data.height > 200) {
      throw new Error('Map dimensions must be between 1 and 200');
    }

    return mapDataToState({
      width: data.width,
      height: data.height,
      cells: data.cells,
    });
  }

  static downloadMap(map: MapState, filename = 'map.json'): void {
    const blob = new Blob([this.serialize(map)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  static async loadFromFile(file: File): Promise<MapState> {
    const text = await file.text();
    return this.deserialize(text);
  }
}
