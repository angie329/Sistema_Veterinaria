import express from "express";

import { dashboardRouter } from "./dashboard.js";
import { veterinariosRouter } from "./veterinarios/veterinarios.routes.js";
import { especialidadesRouter } from "./veterinarios/especialidades.routes.js";
import { turnosRouter } from "./veterinarios/turnos.routes.js";

export const router = express.Router();

router.get("/health", (_, res) => res.send("OK"));
router.use(dashboardRouter);
router.use("/veterinarios", veterinariosRouter);
router.use("/especialidades", especialidadesRouter);
router.use("/turnos", turnosRouter);

console.log("Routes loaded successfully");