export interface TileData {
  /** Filename only, e.g. "grass.png" */
  filename: string;
  /** Public URL served from /tiles */
  url: string;
}

export type EditorTool = 'paint' | 'erase' | 'fill';
