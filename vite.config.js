/*
  Filename: vite.config.js
  V 1.00
*/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite-Konfiguration für Frontend
 */
export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../dist'
  }
});

// EOF
