import express from "express";
import {
  obtenerEstadoCiviles,
  obtenerEstadoCivil,
  crearEstadoCivil,
  actualizarEstadoCivil,
  eliminarEstadoCivil,
} from "../controllers/estado-civil.controller.js";

export const estadoCivilRouter = express.Router();

estadoCivilRouter.get("/", obtenerEstadoCiviles);
estadoCivilRouter.get("/:id", obtenerEstadoCivil);
estadoCivilRouter.post("/", crearEstadoCivil);
estadoCivilRouter.put("/:id", actualizarEstadoCivil);
estadoCivilRouter.delete("/:id", eliminarEstadoCivil);

