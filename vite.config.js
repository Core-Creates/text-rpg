import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ********************************** Vite Config **********************************
// base matches the GitHub Pages project path. If the repository is renamed, this
// and the homepage field in package.json both have to change or the deployed
// bundle will request its assets from the wrong path.
export default defineConfig({
  base: '/text-rpg/',
  plugins: [react()],
  build: {
    outDir: 'build',
    sourcemap: false
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: false,
    restoreMocks: true
  }
});
