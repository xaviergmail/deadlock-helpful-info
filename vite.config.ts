import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

declare const process: {
  env: {
    VITE_BASE?: string;
  };
};

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    solid({
      typescript: { onlyRemoveTypeImports: true },
    } as any),
  ],
  resolve: {
    alias: { '~': new URL('./src', import.meta.url).pathname },
  },
  build: {
    target: 'esnext',
    minify: 'oxc' as any,
    cssCodeSplit: true,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 300,
    sourcemap: false,
    reportCompressedSize: true,
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
