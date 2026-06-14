import { useCallback, useMemo, useRef, useState } from 'react';
import type { CellTile, EditorTool, MapState } from '../types';
import { createEmptyMap } from '../types';
import { floodFillRegion } from '../services/FloodFillService';
import type { CellChange } from '../services/FloodFillService';

export const MAX_HISTORY = 50;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3;
export const ZOOM_STEP = 0.25;
export const BASE_CELL_SIZE = 48;

interface HistoryEntry {
  changes: CellChange[];
}
function cloneMap(map: MapState): MapState {
  return {
    width: map.width,
    height: map.height,
    cells: map.cells.map((row) => [...row]),
  };
}

function applyChanges(map: MapState, changes: CellChange[]): MapState {
  const next = cloneMap(map);
  for (const change of changes) {
    next.cells[change.row][change.col] = change.next;
  }
  return next;
}

function revertChanges(map: MapState, changes: CellChange[]): MapState {
  const next = cloneMap(map);
  for (const change of changes) {
    next.cells[change.row][change.col] = change.previous;
  }
  return next;
}

export interface MapEditorState {
  map: MapState;
  selectedTile: string | null;
  tool: EditorTool;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
}

export interface MapEditorActions {
  createMap: (width: number, height: number) => void;
  loadMap: (map: MapState) => void;
  selectTile: (filename: string) => void;
  selectEraser: () => void;
  selectFill: () => void;
  clearMap: () => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  undo: () => void;
  redo: () => void;
  beginStroke: () => void;
  endStroke: () => void;
  interactCell: (row: number, col: number) => void;
}

export function useMapEditor(initialWidth = 15, initialHeight = 15) {
  const [map, setMap] = useState<MapState>(() =>
    createEmptyMap(initialWidth, initialHeight),
  );
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [tool, setTool] = useState<EditorTool>('paint');
  const [zoom, setZoomState] = useState(1);

  const undoStack = useRef<HistoryEntry[]>([]);
  const redoStack = useRef<HistoryEntry[]>([]);
  const strokeChanges = useRef<CellChange[]>([]);
  const strokeActive = useRef(false);
  const [historyVersion, setHistoryVersion] = useState(0);

  const bumpHistory = useCallback(() => {
    setHistoryVersion((version) => version + 1);
  }, []);

  const resetHistory = useCallback(() => {
    undoStack.current = [];
    redoStack.current = [];
    bumpHistory();
  }, [bumpHistory]);

  const commitEntry = useCallback(
    (entry: HistoryEntry) => {
      if (entry.changes.length === 0) {
        return;
      }

      undoStack.current = [...undoStack.current, entry].slice(-MAX_HISTORY);
      redoStack.current = [];
      bumpHistory();
    },
    [bumpHistory],
  );

  const createMap = useCallback(
    (width: number, height: number) => {
      setMap(createEmptyMap(width, height));
      setSelectedTile(null);
      setTool('paint');
      resetHistory();
    },
    [resetHistory],
  );

  const loadMap = useCallback(
    (nextMap: MapState) => {
      setMap(cloneMap(nextMap));
      resetHistory();
    },
    [resetHistory],
  );

  const selectTile = useCallback((filename: string) => {
    setSelectedTile(filename);
    setTool('paint');
  }, []);

  const selectEraser = useCallback(() => {
    setTool('erase');
  }, []);

  const selectFill = useCallback(() => {
    setTool('fill');
  }, []);

  const clearMap = useCallback(() => {
    setMap((current) => {
      const changes: CellChange[] = [];
      current.cells.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== null) {
            changes.push({
              row: rowIndex,
              col: colIndex,
              previous: cell,
              next: null,
            });
          }
        });
      });

      if (changes.length === 0) {
        return current;
      }

      commitEntry({ changes });
      return applyChanges(current, changes);
    });
  }, [commitEntry]);

  const setZoom = useCallback((value: number) => {
    setZoomState(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)));
  }, []);

  const zoomIn = useCallback(() => {
    setZoomState((current) =>
      Math.min(MAX_ZOOM, Math.round((current + ZOOM_STEP) * 100) / 100),
    );
  }, []);

  const zoomOut = useCallback(() => {
    setZoomState((current) =>
      Math.max(MIN_ZOOM, Math.round((current - ZOOM_STEP) * 100) / 100),
    );
  }, []);

  const undo = useCallback(() => {
    const entry = undoStack.current.at(-1);
    if (!entry) {
      return;
    }

    undoStack.current = undoStack.current.slice(0, -1);
    redoStack.current = [...redoStack.current, entry];
    setMap((current) => revertChanges(current, entry.changes));
    bumpHistory();
  }, [bumpHistory]);

  const redo = useCallback(() => {
    const entry = redoStack.current.at(-1);
    if (!entry) {
      return;
    }

    redoStack.current = redoStack.current.slice(0, -1);
    undoStack.current = [...undoStack.current, entry];
    setMap((current) => applyChanges(current, entry.changes));
    bumpHistory();
  }, [bumpHistory]);

  const beginStroke = useCallback(() => {
    strokeActive.current = true;
    strokeChanges.current = [];
  }, []);

  const endStroke = useCallback(() => {
    if (!strokeActive.current) {
      return;
    }

    strokeActive.current = false;
    commitEntry({ changes: [...strokeChanges.current] });
    strokeChanges.current = [];
  }, [commitEntry]);

  const paintCell = useCallback(
    (row: number, col: number) => {
      const nextTile: CellTile = tool === 'erase' ? null : selectedTile;

      if (tool === 'paint' && !selectedTile) {
        return;
      }

      setMap((current) => {
        const currentTile = current.cells[row]?.[col] ?? null;
        if (currentTile === nextTile) {
          return current;
        }

        const change: CellChange = {
          row,
          col,
          previous: currentTile,
          next: nextTile,
        };

        if (strokeActive.current) {
          const existingIndex = strokeChanges.current.findIndex(
            (item) => item.row === row && item.col === col,
          );

          if (existingIndex >= 0) {
            strokeChanges.current[existingIndex] = {
              ...strokeChanges.current[existingIndex],
              next: nextTile,
            };
          } else {
            strokeChanges.current.push(change);
          }
        } else {
          commitEntry({ changes: [change] });
        }

        return applyChanges(current, [change]);
      });
    },
    [tool, selectedTile, commitEntry],
  );

  const fillCell = useCallback(
    (row: number, col: number) => {
      if (!selectedTile) {
        return;
      }

      setMap((current) => {
        const changes = floodFillRegion(current, row, col, selectedTile);
        if (changes.length === 0) {
          return current;
        }

        commitEntry({ changes });
        return applyChanges(current, changes);
      });
    },
    [selectedTile, commitEntry],
  );

  const interactCell = useCallback(
    (row: number, col: number) => {
      if (tool === 'fill') {
        fillCell(row, col);
        return;
      }

      paintCell(row, col);
    },
    [tool, fillCell, paintCell],
  );

  const state: MapEditorState = useMemo(
    () => ({
      map,
      selectedTile,
      tool,
      zoom,
      canUndo: undoStack.current.length > 0,
      canRedo: redoStack.current.length > 0,
    }),
    [map, selectedTile, tool, zoom, historyVersion],
  );

  const actions: MapEditorActions = {
    createMap,
    loadMap,
    selectTile,
    selectEraser,
    selectFill,
    clearMap,
    setZoom,
    zoomIn,
    zoomOut,
    undo,
    redo,
    beginStroke,
    endStroke,
    interactCell,
  };

  return { state, actions };
}
