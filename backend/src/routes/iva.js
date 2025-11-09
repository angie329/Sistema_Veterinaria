import express from "express";
import {
  obtenerIVAs,
  obtenerIVA,
  crearIVA,
  actualizarIVA,
  eliminarIVA,
} from "../controllers/iva.controller.js";

export const ivaRouter = express.Router();

ivaRouter.get("/", obtenerIVAs);
ivaRouter.get("/:id", obtenerIVA);
ivaRouter.post("/", crearIVA);
ivaRouter.put("/:id", actualizarIVA);
ivaRouter.delete("/:id", eliminarIVA);