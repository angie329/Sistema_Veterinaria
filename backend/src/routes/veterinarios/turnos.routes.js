import express from "express";
import { query } from "../../config/database.js";


import {
  obtenerTurnosPorVeterinario,

} from "../../controllers/veterinarios/turnos.controller.js";

export const turnosRouter = express.Router();

turnosRouter.get("/:id", obtenerTurnosPorVeterinario);

