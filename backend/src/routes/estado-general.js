import express from "express";
import {
  obtenerEstadosGenerales,
  obtenerEstadoGeneral,
  crearEstadoGeneral,
  actualizarEstadoGeneral,
  eliminarEstadoGeneral,
} from "../controllers/estado-general.controller.js";

export const estadoGeneralRouter = express.Router();

estadoGeneralRouter.get("/", obtenerEstadosGenerales);
estadoGeneralRouter.get("/:id", obtenerEstadoGeneral);
estadoGeneralRouter.post("/", crearEstadoGeneral);
estadoGeneralRouter.put("/:id", actualizarEstadoGeneral);
estadoGeneralRouter.delete("/:id", eliminarEstadoGeneral);

