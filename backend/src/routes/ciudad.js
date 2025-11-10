import express from "express";
import {
  obtenerCiudades,
  obtenerCiudad,
  crearCiudad,
  actualizarCiudad,
  eliminarCiudad,
} from "../controllers/ciudad.controller.js";

export const ciudadRouter = express.Router();

ciudadRouter.get("/", obtenerCiudades);
ciudadRouter.get("/:id", obtenerCiudad);
ciudadRouter.post("/", crearCiudad);
ciudadRouter.put("/:id", actualizarCiudad);
ciudadRouter.delete("/:id", eliminarCiudad);