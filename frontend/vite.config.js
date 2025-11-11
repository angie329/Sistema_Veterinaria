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
        configuracion: resolve(__dirname, "src/pages/configuracion.html"),
        datosPersonales: resolve(__dirname, "src/pages/datos-personales.html"),
        ubicaciones: resolve(__dirname, "src/pages/ubicaciones.html"),
        veterinarios: resolve(__dirname, "src/pages/veterinarios.html"),
        pets: resolve(__dirname, "src/pages/pets.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
