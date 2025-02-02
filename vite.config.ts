import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        contentScript: resolve(__dirname, "src/contentScript.tsx"),
        claudeInjector: resolve(__dirname, "src/utils/claudeInjector.ts"),
        background: resolve(__dirname, "src/background.ts"),
        logs: resolve(__dirname, "src/logs.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (["contentScript", "claudeInjector", "background", "logs"].includes(chunkInfo.name)) {
            return "[name].js";
          }
          return "assets/[name].[hash].js";
        },
      },
    },
    sourcemap: true,
  },
  publicDir: "public",
});
