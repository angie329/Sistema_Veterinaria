import express from "express";

import { dashboardRouter } from "./dashboard.js";
import { veterinariosRouter } from "./veterinarios.routes.js";
import { especialidadesRouter } from "./especialidades.routes.js";
import { turnosRouter } from "./turnos.routes.js";
import  reporteRoutes from "./reportes.routes.js";

export const router = express.Router();

router.get("/health", (_, res) => res.send("OK"));
router.use(dashboardRouter);
router.use("/veterinarios", veterinariosRouter);
router.use("/especialidades", especialidadesRouter);
router.use("/turnos", turnosRouter);
router.use("/reportes", reporteRoutes);

console.log("Routes loaded successfully");