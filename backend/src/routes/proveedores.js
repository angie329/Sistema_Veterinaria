import express from "express";
import {
  obtenerProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from "../controllers/proveedor.controller.js";

export const proveedoresRouter = express.Router();

proveedoresRouter.get("/", obtenerProveedores);
proveedoresRouter.get("/:id", obtenerProveedor);
proveedoresRouter.post("/", crearProveedor);
proveedoresRouter.put("/:id", actualizarProveedor);
proveedoresRouter.delete("/:id", eliminarProveedor);

