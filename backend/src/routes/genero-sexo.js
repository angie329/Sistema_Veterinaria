import express from "express";
import {
  obtenerGeneroSexos,
  obtenerGeneroSexo,
  crearGeneroSexo,
  actualizarGeneroSexo,
  eliminarGeneroSexo,
} from "../controllers/genero-sexo.controller.js";

export const generoSexoRouter = express.Router();

generoSexoRouter.get("/", obtenerGeneroSexos);
generoSexoRouter.get("/:id", obtenerGeneroSexo);
generoSexoRouter.post("/", crearGeneroSexo);
generoSexoRouter.put("/:id", actualizarGeneroSexo);
generoSexoRouter.delete("/:id", eliminarGeneroSexo);

