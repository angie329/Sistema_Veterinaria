import express from "express";

import {
  obtenerTurnosPorVeterinario,
} from "../controllers/turnos.controller.js";

export const turnosRouter = express.Router();

turnosRouter.get("/:id", obtenerTurnosPorVeterinario);

