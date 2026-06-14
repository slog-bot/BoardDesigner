import { useCallback, useEffect, useRef, useState } from 'react';
import { SaveLoadService } from '../services/SaveLoadService';
import type { MapEditorActions, MapEditorState } from '../hooks/useMapEditor';
import { MAX_ZOOM, MIN_ZOOM } from '../hooks/useMapEditor';

interface ToolbarProps {
  state: MapEditorState;
  actions: MapEditorActions;
  onNewMap: () => void;
  showGridLines: boolean;
  onToggleGridLines: () => void;
}

export function Toolbar({
  state,
  actions,
  onNewMap,
  showGridLines,
  onToggleGridLines,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleSave = useCallback(() => {
    SaveLoadService.downloadMap(state.map);
  }, [state.map]);

  const handleLoadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) {
        return;
      }

      try {
        const loadedMap = await SaveLoadService.loadFromFile(file);
        actions.loadMap(loadedMap);
        setLoadError(null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Failed to load map');
      }
    },
    [actions],
  );

  useEffect(() => {
    if (!loadError) {
      return;
    }
    const timer = window.setTimeout(() => setLoadError(null), 4000);
    return () => window.clearTimeout(timer);
  }, [loadError]);

  const zoomPercent = Math.round(state.zoom * 100);

  return (
    <header className="toolbar">
      <div className="toolbar__group">
        <h1 className="toolbar__title">Tile Map Editor</h1>
      </div>

      <div className="toolbar__group">
        <button type="button" className="btn" onClick={onNewMap}>
          New Map
        </button>
        <button type="button" className="btn" onClick={handleSave}>
          Save
        </button>
        <button type="button" className="btn" onClick={handleLoadClick}>
          Load
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={handleFileChange}
        />
      </div>

      <div className="toolbar__group">
        <button
          type="button"
          className="btn"
          onClick={actions.undo}
          disabled={!state.canUndo}
          title="Undo"
        >
          Undo
        </button>
        <button
          type="button"
          className="btn"
          onClick={actions.redo}
          disabled={!state.canRedo}
          title="Redo"
        >
          Redo
        </button>
      </div>

      <div className="toolbar__group">
        <button
          type="button"
          className={`btn${showGridLines ? ' btn--active' : ''}`}
          onClick={onToggleGridLines}
        >
          Grid Lines {showGridLines ? 'On' : 'Off'}
        </button>
      </div>

      <div className="toolbar__group toolbar__zoom">
        <button
          type="button"
          className="btn btn--icon"
          onClick={actions.zoomOut}
          disabled={state.zoom <= MIN_ZOOM}
          title="Zoom out"
        >
          −
        </button>
        <span className="toolbar__zoom-label">{zoomPercent}%</span>
        <button
          type="button"
          className="btn btn--icon"
          onClick={actions.zoomIn}
          disabled={state.zoom >= MAX_ZOOM}
          title="Zoom in"
        >
          +
        </button>
      </div>

      {loadError && <div className="toolbar__error">{loadError}</div>}
    </header>
  );
}
