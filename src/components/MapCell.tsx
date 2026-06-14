import { TileService } from '../services/TileService';
import type { CellTile } from '../types';

interface MapCellProps {
  tile: CellTile;
  cellSize: number;
  enableDragPaint: boolean;
  onInteract: () => void;
}

export function MapCell({ tile, cellSize, enableDragPaint, onInteract }: MapCellProps) {
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
        onInteract();
      }}
      onPointerEnter={(event) => {
        if (!enableDragPaint || event.buttons !== 1) {
          return;
        }
        onInteract();
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
