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
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/pages/index.html"),
        clients: resolve(__dirname, "src/pages/clients.html"),
        usuarios: resolve(__dirname, "src/pages/usuarios.html"),
        roles: resolve(__dirname, "src/pages/roles.html"),
        permisos: resolve(__dirname, "src/pages/permisos.html"),
        reportes: resolve(__dirname, "src/pages/reportes.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});