import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const MANIFEST_MODULE_ID = 'virtual:tile-manifest';
const RESOLVED_MANIFEST_ID = '\0' + MANIFEST_MODULE_ID;

function scanTiles(tilesDir: string): string[] {
  if (!fs.existsSync(tilesDir)) {
    fs.mkdirSync(tilesDir, { recursive: true });
    return [];
  }

  return fs
    .readdirSync(tilesDir)
    .filter((file) => file.toLowerCase().endsWith('.png'))
    .sort((a, b) => a.localeCompare(b));
}

function buildManifestSource(filenames: string[]): string {
  return `export const TILE_MANIFEST = ${JSON.stringify(filenames)};\n`;
}

export function tilesManifestPlugin(): Plugin {
  let tilesDir = '';
  let manifestSource = buildManifestSource([]);

  const refreshManifest = () => {
    const filenames = scanTiles(tilesDir);
    manifestSource = buildManifestSource(filenames);
  };

  return {
    name: 'tiles-manifest',
    configResolved(config) {
      tilesDir = path.resolve(config.root, 'public/tiles');
      refreshManifest();
    },
    resolveId(id) {
      if (id === MANIFEST_MODULE_ID) {
        return RESOLVED_MANIFEST_ID;
      }
      return null;
    },
    load(id) {
      if (id === RESOLVED_MANIFEST_ID) {
        return manifestSource;
      }
      return null;
    },
    configureServer(server) {
      refreshManifest();

      if (fs.existsSync(tilesDir)) {
        fs.watch(tilesDir, { persistent: true }, () => {
          refreshManifest();
          const module = server.moduleGraph.getModuleById(RESOLVED_MANIFEST_ID);
          if (module) {
            server.moduleGraph.invalidateModule(module);
          }
          server.ws.send({ type: 'full-reload' });
        });
      }
    },
    buildStart() {
      refreshManifest();
    },
  };
}
