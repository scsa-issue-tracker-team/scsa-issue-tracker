import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 백엔드(localhost:8081)로 /api 프록시. 프론트에서는 항상 상대경로 /api/... 로 호출한다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
});
