import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '$lib': path.resolve('./src/lib'),
    },
  },
  build: {
    outDir: '../dist-website',
    emptyOutDir: true,
  },
  server: {
    fs: {
      // Allow serving files from the parent public directory
      allow: ['..']
    },
    proxy: {
      '/cms': {
        target: 'http://localhost:5173', // Fallback to CMS dev server if needed
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/cms/, '/cms')
      }
    }
  }
});
