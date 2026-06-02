import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env['VITE_BASE'] ?? '/',
  plugins: [
    solid({
      typescript: { onlyRemoveTypeImports: true },
    }),
  ],
  resolve: {
    alias: { '~': resolve(import.meta.dirname, 'src') },
  },
  build: {
    target: 'esnext',
    minify: 'oxc',
    cssCodeSplit: true,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 300,
    sourcemap: false,
    reportCompressedSize: true,
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
