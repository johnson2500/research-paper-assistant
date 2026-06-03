import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = process.env.VITE_API_BASE_URL || "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/ingest": API_TARGET,
      "/search": API_TARGET,
      "/sessions": API_TARGET,
      "/draft": API_TARGET,
      "/health": API_TARGET,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test-setup.ts",
  },
});
