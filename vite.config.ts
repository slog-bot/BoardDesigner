import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tilesManifestPlugin } from './plugins/tilesManifestPlugin';

export default defineConfig({
  plugins: [react(), tilesManifestPlugin()],
});
