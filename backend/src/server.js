import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { router } from "./routes/index.js";

const app = express();

// ✅ Configuración de CORS mejorada
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir peticiones sin origin (como Postman, Thunder Client)
      if (!origin) return callback(null, true);
      
      // Lista de orígenes permitidos
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        // Agrega aquí el puerto de tu frontend si es diferente
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // Durante desarrollo, permitir todos los orígenes localhost
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
      "Accept"
    ],
    credentials: true
  })
);

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use("/v1", router);

// ✅ Manejo global de errores
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ 
    error: "Error interno del servidor",
    message: err.message 
  });
});

// Inicia el servidor
app.listen(config.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}`);
  console.log(`📍 API Base URL: http://localhost:${config.PORT}/v1`);
  console.log(`✅ CORS habilitado para desarrollo`);
});
