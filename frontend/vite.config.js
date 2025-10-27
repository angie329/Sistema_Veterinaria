import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import vanilla from "vite-plugin-vanilla";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    vanilla({
      include: "src/pages/**/*.html",
      base: "src/pages",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
