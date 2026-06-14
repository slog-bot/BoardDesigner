import type { EditorTool } from '../types';

interface ToolPaletteProps {
  tool: EditorTool;
  onSelectFill: () => void;
  onSelectEraser: () => void;
}

export function ToolPalette({ tool, onSelectFill, onSelectEraser }: ToolPaletteProps) {
  return (
    <>
      <h2 className="sidebar__heading">Tools</h2>
      <div className="sidebar-panel__scroll">
        <div className="tool-palette">
          <button
            type="button"
            className={`tool-palette__item${tool === 'fill' ? ' tool-palette__item--selected' : ''}`}
            onClick={onSelectFill}
            title="Fill connected tiles of the same type"
          >
            Fill
          </button>
          <button
            type="button"
            className={`tool-palette__item${tool === 'erase' ? ' tool-palette__item--selected' : ''}`}
            onClick={onSelectEraser}
            title="Eraser"
          >
            Eraser
          </button>
        </div>
      </div>
    </>
  );
}
