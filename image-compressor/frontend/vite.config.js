import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Proxy API calls to local backend during development
  server: {
    proxy: {
      "/compress": "http://localhost:3001",
    },
  },
});
