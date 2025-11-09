import { defineConfig } from "vite";

export default defineConfig({
  root: "src", // indica que el HTML está dentro de /src
  server: {
    port: 5173,
    open: "/pages/citas_agendas.html", // abre tu HTML automáticamente
  },
  envPrefix: "VITE_", // para que funcione import.meta.env.VITE_BACKEND_URL
});
