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
        contentScript: resolve(__dirname, "src/contentScript.tsx"),
        background: resolve(__dirname, "src/background.ts"),
        chatgptInjector: resolve(__dirname, "src/chatgptInjector.ts"),
        popup: resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (["contentScript", "background", "chatgptInjector"].includes(chunkInfo.name)) {
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
