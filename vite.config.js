import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  logLevel: "error",
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        target: "https://decase.skala25a.project.skala-ai.com",
        // target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/ai": {
        target: "https://decase.skala25a.project.skala-ai.com",
        // target: "http://localhost:8001",
        changeOrigin: true,
      },
    },
  },
});
