import { useCallback, useEffect } from 'react';
import { BASE_CELL_SIZE } from '../hooks/useMapEditor';
import type { MapEditorActions, MapEditorState } from '../hooks/useMapEditor';
import { MapCell } from './MapCell';

interface MapGridProps {
  state: MapEditorState;
  actions: MapEditorActions;
  showGridLines: boolean;
}

export function MapGrid({ state, actions, showGridLines }: MapGridProps) {
  const cellSize = Math.round(BASE_CELL_SIZE * state.zoom);
  const enableDragPaint = state.tool === 'paint' || state.tool === 'erase';

  const handlePointerUp = useCallback(() => {
    actions.endStroke();
  }, [actions]);

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerUp]);

  return (
    <div className="map-viewport">
      <div className="map-grid-wrapper">
        <div
          className={`map-grid map-grid--tool-${state.tool}`}
          style={{
            gridTemplateColumns: `repeat(${state.map.width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${state.map.height}, ${cellSize}px)`,
          }}
          onPointerDownCapture={(event) => {
            if (event.button === 0 && enableDragPaint) {
              actions.beginStroke();
            }
          }}
          onPointerLeave={() => {
            actions.endStroke();
          }}
          role="grid"
          aria-label={`Map grid ${state.map.width} by ${state.map.height}`}
        >
          {state.map.cells.map((row, rowIndex) =>
            row.map((tile, colIndex) => (
              <MapCell
                key={`${rowIndex}-${colIndex}`}
                tile={tile}
                cellSize={cellSize}
                enableDragPaint={enableDragPaint}
                onInteract={() => actions.interactCell(rowIndex, colIndex)}
              />
            )),
          )}
        </div>
        {showGridLines && (
          <div
            className="map-grid__lines"
            style={{ backgroundSize: `${cellSize}px ${cellSize}px` }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
