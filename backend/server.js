import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import veterinarioRoutes from "./routes/veterinarios.routes.js";
import especialidadRoutes from "./routes/especialidades.routes.js";
import turnoRoutes from "./routes/turnos.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/veterinarios", veterinarioRoutes);
app.use("/api/especialidades", especialidadRoutes);
app.use("/api/turnos", turnoRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));
