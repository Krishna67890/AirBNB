import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true // automatically open browser
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  preview: {
    port: 4173
  }
});