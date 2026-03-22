import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    strictPort: true, // Fails if 5173 is taken, preventing CORS breaks with backend
    host: true,       // Listen on all local IPs (useful for testing on your phone)
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disables sourcemaps in production for smaller bundle sizes
  }
});