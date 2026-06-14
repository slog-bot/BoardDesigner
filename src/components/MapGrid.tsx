import { useCallback, useEffect } from 'react';
import { BASE_CELL_SIZE } from '../hooks/useMapEditor';
import type { MapEditorActions, MapEditorState } from '../hooks/useMapEditor';
import { MapCell } from './MapCell';

interface MapGridProps {
  state: MapEditorState;
  actions: MapEditorActions;
}

export function MapGrid({ state, actions }: MapGridProps) {
  const cellSize = Math.round(BASE_CELL_SIZE * state.zoom);

  const handlePointerUp = useCallback(() => {
    actions.endStroke();
  }, [actions]);

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerUp]);

  return (
    <div className="map-viewport">
      <div
        className="map-grid"
        style={{
          gridTemplateColumns: `repeat(${state.map.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${state.map.height}, ${cellSize}px)`,
        }}
        onPointerDownCapture={(event) => {
          if (event.button === 0) {
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
              onPaint={() => actions.paintCell(rowIndex, colIndex)}
            />
          )),
        )}
      </div>
    </div>
  );
}
