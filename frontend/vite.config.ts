import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/firebase-backend-typescript/",
  plugins: [react()],
  server: {
    port: 5173
  }
});
