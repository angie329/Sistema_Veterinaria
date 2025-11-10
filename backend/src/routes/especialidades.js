import express from "express";

import {
  obtenerEspecialidades,
  agregarEspecialidades
} from "../controllers/especialidades.controller.js";

export const especialidadesRouter = express.Router();

especialidadesRouter.get("/", obtenerEspecialidades);
especialidadesRouter.post("/", agregarEspecialidades);

