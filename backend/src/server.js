import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { router } from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // tu frontend en Vite
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware para procesar JSON
app.use(express.json());

// ✅ Tus rutas principales
app.use("/v1", router);

// ✅ Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Fatal error!");
});

// ✅ Inicia el servidor
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
