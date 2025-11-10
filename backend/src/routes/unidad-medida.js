import express from "express";
import {
  obtenerUnidadMedidas,
  obtenerUnidadMedida,
  crearUnidadMedida,
  actualizarUnidadMedida,
  eliminarUnidadMedida,
} from "../controllers/unidad-medida.controller.js";

export const unidadMedidaRouter = express.Router();

unidadMedidaRouter.get("/", obtenerUnidadMedidas);
unidadMedidaRouter.get("/:id", obtenerUnidadMedida);
unidadMedidaRouter.post("/", crearUnidadMedida);
unidadMedidaRouter.put("/:id", actualizarUnidadMedida);
unidadMedidaRouter.delete("/:id", eliminarUnidadMedida);

