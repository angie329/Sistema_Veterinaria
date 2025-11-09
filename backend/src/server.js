import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { router } from "./routes/index.js";

const app = express();

// ✅ Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Permitir todos los orígenes (o especifica tu frontend)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    
  })
);
app.use(express.json());
app.use("/v1", router);

// ✅ Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Fatal error!" });
});

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);  // ← Corregí los backticks
});