import express from "express";
import {
  obtenerMetodoPagos,
  obtenerMetodoPago,
  crearMetodoPago,
  actualizarMetodoPago,
  eliminarMetodoPago,
} from "../controllers/metodo-pago.controller.js";

export const metodoPagoRouter = express.Router();

metodoPagoRouter.get("/", obtenerMetodoPagos);
metodoPagoRouter.get("/:id", obtenerMetodoPago);
metodoPagoRouter.post("/", crearMetodoPago);
metodoPagoRouter.put("/:id", actualizarMetodoPago);
metodoPagoRouter.delete("/:id", eliminarMetodoPago);