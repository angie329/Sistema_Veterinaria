import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import vanilla from "vite-plugin-vanilla";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "src", // indica que el HTML está dentro de /src
  plugins: [
    vanilla({
      include: "src/pages/**/*.html",
      base: "src/pages",
    }),
  ],
  server: {
    port: 5173,
    open: "/pages/citas_agendas.html", // abre automáticamente tu HTML principal
  },
  envPrefix: "VITE_", // permite usar import.meta.env.VITE_BACKEND_URL
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/pages/index.html"),
        clients: resolve(__dirname, "src/pages/clients.html"),
        configuracion: resolve(__dirname, "src/pages/configuracion.html"),
        datosPersonales: resolve(__dirname, "src/pages/datos-personales.html"),
        ubicaciones: resolve(__dirname, "src/pages/ubicaciones.html"),
        veterinarios: resolve(__dirname, "src/pages/veterinarios.html"),
        citasAgendas: resolve(__dirname, "src/pages/citas_agendas.html"), // añadida tu página
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});

