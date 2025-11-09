import express from "express";
import {
  obtenerProvincias,
  obtenerProvincia,
  crearProvincia,
  actualizarProvincia,
  eliminarProvincia,
} from "../controllers/provincia.controller.js";

export const provinciaRouter = express.Router();

provinciaRouter.get("/", obtenerProvincias);
provinciaRouter.get("/:id", obtenerProvincia);
provinciaRouter.post("/", crearProvincia);
provinciaRouter.put("/:id", actualizarProvincia);
provinciaRouter.delete("/:id", eliminarProvincia);
