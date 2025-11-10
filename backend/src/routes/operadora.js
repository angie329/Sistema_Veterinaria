import express from "express";
import {
  obtenerOperadoras,
  obtenerOperadora,
  crearOperadora,
  actualizarOperadora,
  eliminarOperadora,
} from "../controllers/operadora.controller.js";

export const operadoraRouter = express.Router();

operadoraRouter.get("/", obtenerOperadoras);
operadoraRouter.get("/:id", obtenerOperadora);
operadoraRouter.post("/", crearOperadora);
operadoraRouter.put("/:id", actualizarOperadora);
operadoraRouter.delete("/:id", eliminarOperadora);

