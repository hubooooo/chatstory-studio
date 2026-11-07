import { defineConfig } from "vite";
export default defineConfig({
  server: {
    host: "127.0.0.1",
    watch: {
      ignored: ["**/.cache/**", "**/.venv/**", "**/outputs/**", "**/data/**"],
    },
  },
  build: { outDir: "dist" },
});
