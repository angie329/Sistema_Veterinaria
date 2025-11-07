import express from "express";
import { query } from "../../config/database.js";


import {
  obtenerVeterinarios,
  agregarVeterinario,
  eliminarVeterinario,
  editarVeterinario
} from "../../controllers/veterinarios/veterinarios.controller.js";

export const veterinariosRouter = express.Router();

veterinariosRouter.get("/", obtenerVeterinarios);
veterinariosRouter.post("/", agregarVeterinario);
veterinariosRouter.delete("/:id", eliminarVeterinario);
veterinariosRouter.put("/:id", editarVeterinario);
