import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        // target: "https://decase.skala25a.project.skala-ai.com",
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
