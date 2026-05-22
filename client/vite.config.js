import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5001,
    allowedHosts: [".up.railway.app"], // Moved this up out of the duplicate block
  },
});