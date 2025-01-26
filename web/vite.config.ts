import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@lilbunnyrabbit/task-manager": path.resolve(__dirname, "../src/index.ts"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/task-manager/"
});
