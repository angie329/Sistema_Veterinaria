import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import vanilla from "vite-plugin-vanilla";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// eslint-disable-next-line no-unused-vars
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
        inventario: resolve(__dirname,"src/pages/inventario.html")
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      // Cualquier petición que empiece con /v1 será redirigida
      '/v1': {
        // La URL de tu servidor backend
        target: 'http://localhost:3008',
        // Necesario para que el backend reciba el host correcto
        changeOrigin: true,
      }
    }
  }
});
