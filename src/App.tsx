import { useMemo, useState } from 'react';
import { MapGrid } from './components/MapGrid';
import { NewMapDialog } from './components/NewMapDialog';
import { TilePalette } from './components/TilePalette';
import { Toolbar } from './components/Toolbar';
import { useMapEditor } from './hooks/useMapEditor';
import { TileService } from './services/TileService';
import './App.css';

function App() {
  const { state, actions } = useMapEditor(15, 15);
  const [showNewMapDialog, setShowNewMapDialog] = useState(false);

  const tiles = useMemo(() => TileService.getAllTiles(), []);

  return (
    <div className="app">
      <Toolbar
        state={state}
        actions={actions}
        onNewMap={() => setShowNewMapDialog(true)}
      />

      <div className="app__body">
        <TilePalette
          tiles={tiles}
          selectedTile={state.selectedTile}
          tool={state.tool}
          onSelectTile={actions.selectTile}
          onSelectEraser={actions.selectEraser}
          onClearMap={actions.clearMap}
          mapWidth={state.map.width}
          mapHeight={state.map.height}
        />

        <main className="app__main">
          <MapGrid state={state} actions={actions} />
        </main>
      </div>

      {showNewMapDialog && (
        <NewMapDialog
          onCreate={actions.createMap}
          onClose={() => setShowNewMapDialog(false)}
        />
      )}
    </div>
  );
}

export default App;
