import express from "express";
import {
  obtenerVeterinarios,
  obtenerEstadosCita,
  obtenerAgendaVeterinario,
  obtenerCitas,
  agregarCita,
  actualizarCita,
  eliminarCita,
} from "../controllers/citas_agendas.js";

export const citasRouter = express.Router();

// ========== RUTAS VETERINARIOS ==========
citasRouter.get("/veterinarians", obtenerVeterinarios);

// ========== RUTAS ESTADOS DE CITA ==========
citasRouter.get("/appointment-states", obtenerEstadosCita);

// ========== RUTAS AGENDA ==========
citasRouter.get("/veterinarians/:veterinarianId/schedule", obtenerAgendaVeterinario);

// ========== RUTAS CITAS ==========
citasRouter.get("/appointments", obtenerCitas);
citasRouter.post("/appointments", agregarCita);
citasRouter.put("/appointments/:id", actualizarCita);
citasRouter.delete("/appointments/:id", eliminarCita);