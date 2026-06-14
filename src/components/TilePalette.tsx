import type { EditorTool, TileData } from '../types';
import { ToolPalette } from './ToolPalette';

interface TilePaletteProps {
  tiles: TileData[];
  selectedTile: string | null;
  tool: EditorTool;
  onSelectTile: (filename: string) => void;
  onSelectFill: () => void;
  onSelectEraser: () => void;
  onClearMap: () => void;
  mapWidth: number;
  mapHeight: number;
}

export function TilePalette({
  tiles,
  selectedTile,
  tool,
  onSelectTile,
  onSelectFill,
  onSelectEraser,
  onClearMap,
  mapWidth,
  mapHeight,
}: TilePaletteProps) {
  return (
    <div className="sidebar-panels">
      <aside className="sidebar-panel sidebar-panel--tiles">
        <h2 className="sidebar__heading">Tile Palette</h2>
        <div className="sidebar-panel__scroll">
          {tiles.length === 0 ? (
            <p className="sidebar__empty">
              No tiles found. Add PNG files to the <code>public/tiles</code> folder.
            </p>
          ) : (
            <ul className="tile-palette">
              {tiles.map((tile) => {
                const isSelected = tool === 'paint' && selectedTile === tile.filename;
                return (
                  <li key={tile.filename}>
                    <button
                      type="button"
                      className={`tile-palette__item${isSelected ? ' tile-palette__item--selected' : ''}`}
                      onClick={() => onSelectTile(tile.filename)}
                      title={tile.filename}
                    >
                      <img
                        src={tile.url}
                        alt={tile.filename}
                        className="tile-palette__thumb"
                        draggable={false}
                      />
                      <span className="tile-palette__name">{tile.filename}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <aside className="sidebar-panel sidebar-panel--tools">
        <ToolPalette tool={tool} onSelectFill={onSelectFill} onSelectEraser={onSelectEraser} />

        <section className="sidebar-panel__footer">
          <h2 className="sidebar__heading">Map Controls</h2>
          <p className="sidebar__info">
            Size: {mapWidth} × {mapHeight}
          </p>
          <button
            type="button"
            className="btn btn--block btn--danger"
            onClick={onClearMap}
          >
            Clear Map
          </button>
        </section>
      </aside>
    </div>
  );
}
