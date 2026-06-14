import { TileService } from '../services/TileService';
import type { CellTile } from '../types';

interface MapCellProps {
  tile: CellTile;
  cellSize: number;
  onPaint: () => void;
}

export function MapCell({ tile, cellSize, onPaint }: MapCellProps) {
  const tileUrl = tile ? TileService.getTileUrl(tile) : null;

  return (
    <button
      type="button"
      className="map-cell"
      style={{ width: cellSize, height: cellSize }}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return;
        }
        event.preventDefault();
        onPaint();
      }}
      onPointerEnter={(event) => {
        if (event.buttons !== 1) {
          return;
        }
        onPaint();
      }}
      aria-label={tile ? `Cell with ${tile}` : 'Empty cell'}
    >
      {tileUrl && (
        <img
          src={tileUrl}
          alt=""
          className="map-cell__tile"
          draggable={false}
        />
      )}
    </button>
  );
}
