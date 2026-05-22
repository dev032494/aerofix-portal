import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 1. Development Server Settings (npm run dev)
  server: {
    port: 5001,
    strictPort: true, // Prevents falling back to a random port if 5001 is busy
    host: true,       // Exposes server to network/routing for cloud platforms
    allowedHosts: [".up.railway.app"],
    hmr: {
      clientPort: 443, // Forces secure WebSocket connection for HMR over HTTPS
    },
  },

  // 2. Production Preview Settings (npm run preview)
  preview: {
    port: 5001,
    strictPort: true,
    host: true,
    allowedHosts: [".up.railway.app"],
  },

  // 3. Complete Production Build Settings (npm run build)
  build: {
    outDir: "dist",          // The directory where production assets will be deployed
    assetsDir: "assets",     // Directory under outDir to nest generated assets
    sourcemap: true,         // Generates source maps (crucial for debugging errors in production/cloud)
    emptyOutDir: true,       // Clears the dist folder before every build cycle
    assetsInlineLimit: 4096, // Inlines small assets under 4KB as base64 data URLs to reduce HTTP requests

    // Advanced Rollup bundling options
    rollupOptions: {
      output: {
        // Code-splitting: Splits your node_modules dependencies into a separate chunk (vendor)
        // This dramatically optimizes caching, as your code updates won't force users to re-download React.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
        // Standardizes output file naming conventions with cache-busting hashes
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },

    // Performance warning thresholds
    chunkSizeWarningLimit: 1000, // Raises warning limit to 1000KB before throwing a warning in the console
  },
});