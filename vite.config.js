import { defineConfig } from 'vite';

// base: './' makes the build work on GitHub Pages sub-paths, Netlify, Vercel, S3, etc.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 800 }, // three.js alone is ~600 kB
});
