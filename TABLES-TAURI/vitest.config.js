import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    include: ['src/**/*.{test,spec}.{js,ts,svelte}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,svelte}'],
      exclude: ['node_modules', 'dist', '**/*.config.js', '**/test-setup.js']
    },
    transformMode: {
      web: [/\.svelte$/, /\.css$/]
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
