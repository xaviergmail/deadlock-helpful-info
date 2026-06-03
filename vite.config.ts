import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [solid()],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
      'solid-js/web': resolve(__dirname, 'node_modules/solid-js/web/dist/web.js'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 300,
    sourcemap: false,
    reportCompressedSize: true,
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
