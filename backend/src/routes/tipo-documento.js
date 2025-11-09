import express from "express";
import {
  obtenerTipoDocumentos,
  obtenerTipoDocumento,
  crearTipoDocumento,
  actualizarTipoDocumento,
  eliminarTipoDocumento,
} from "../controllers/tipo-documento.controller.js";

export const tipoDocumentoRouter = express.Router();

tipoDocumentoRouter.get("/", obtenerTipoDocumentos);
tipoDocumentoRouter.get("/:id", obtenerTipoDocumento);
tipoDocumentoRouter.post("/", crearTipoDocumento);
tipoDocumentoRouter.put("/:id", actualizarTipoDocumento);
tipoDocumentoRouter.delete("/:id", eliminarTipoDocumento);